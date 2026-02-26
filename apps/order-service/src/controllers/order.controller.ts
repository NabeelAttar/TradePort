import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { NextFunction, Request, Response } from "express";
import crypto from 'crypto'
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/send-email";
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!
});


// create payment session
export const createPaymentSession = async(req: any, res: Response, next: NextFunction) => {
    try {
        const { cart, selectedAddressId, coupon } = req.body;
        const userId = req.user.id

        if(!cart || !Array.isArray(cart) || cart.length === 0){
            return next(new ValidationError("Cart is empty or invalid."))
        }

        const normalizedCart = JSON.stringify(
            cart.map((item:any) => ({
                id: item.id,
                quantity: item.quantity,
                sale_price: item.sale_price,
                shopId: item.shopId ,
                selectedOptions: item.selectedOptions || {},
            })).sort((a, b) => a.id.localeCompare(b.id))
        )
        // normalizing cart cuz we dont want to create multiple sessions for same cart items and their quantities etc etc
        // if such a cart already exists for teh same user then we will not create a new session we will return the same session
        // and a session is valid for 10 minutes
        const keys = await redis.keys("payment-session:*")
        for(const key of keys){
            const data = await redis.get(key)
            if(data){
                const session = JSON.parse(data);
                if(session.userId === userId){
                    const existingCart = JSON.stringify(
                        session.cart.map((item:any) => ({
                            id: item.id,
                            quantity: item.quantity,
                            sale_price: item.sale_price,
                            shopId: item.shopId ,
                            selectedOptions: item.selectedOptions || {},
                        }))
                        .sort((a:any, b:any) => a.id.localeCompare(b.id))
                    )

                    if(existingCart === normalizedCart){
                        return res.status(200).json({ sessionId: key.split(":")[1] })
                    } else {
                        await redis.del(key)
                    }
                }
            }
        }

        // fetch sellers and their stripe accounts
        const uniqueShopIds = [...new Set(cart.map((item:any) => item.shopId))]
        const shops = await prisma.shops.findMany({
            where: {
                id: {in: uniqueShopIds}
            },
            select: {
                id: true,
                sellerId: true,
                sellers: {
                    select: {
                        bankId: true
                    }
                }
            }
        })

        const sellerData = shops.map((shop) => ({
            shopId: shop.id,
            sellerId: shop.sellerId,
            bankId: shop?.sellers?.bankId
        }))

        // calculate total
        const totalAmount = cart.reduce((total:number, item: any) => {
            return total + item.quantity * item.sale_price
        }, 0)

        // create session payload
        const sessionId = crypto.randomUUID();

        const sessionData = {
            userId,
            cart,
            sellers: sellerData,
            totalAmount,
            shippingAddressId: selectedAddressId || null,
            coupon: coupon || null,
        }
        
        await redis.setex(
            `payment-session:${sessionId}`,
            600,
            JSON.stringify(sessionData)
        );

        return res.status(200).json({ sessionId })

    } catch (error) {
        return next(error)
    }
}

export const verifyPaymentSession = async (req: Request, res: Response, next: NextFunction) => { 
    try { 
        const sessionId = req.query.sessionId as string 
        if(!sessionId){ 
            return res.status(400).json({ error : "Session ID is required."}) 
        } 
        
        // fetch session from redis 
        const sessionKey = `payment-session:${sessionId}` 
        const sessionData = await redis.get(sessionKey) 
        if(!sessionData){ 
            return res.status(404).json({ error: "Session not found or expired."}) 
        } 

        // parse and return json 
        const session = JSON.parse(sessionData) 
        
        return res.status(200).json({ 
            success: true, 
            session 
        }) 
    } catch (error) { 
        return next(error) 
    } 
}

// create razorpay order for a payment session
export const createRazorpayOrder = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) return next(new ValidationError("Session ID required"));

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);
    if (!sessionData) return next(new ValidationError("Session not found or expired"));

    const session = JSON.parse(sessionData);
    const amount = session.totalAmount;
    if (typeof amount !== "number") return next(new ValidationError("Invalid session amount"));

    const amountPaise = Math.round(amount * 100);

    const razorOrder = await razorpay.orders.create({
      amount: amountPaise,
      currency: "INR",
      receipt: sessionId,
      payment_capture: true,
    });

    return res.status(201).json({
      success: true,
      orderId: razorOrder.id,
      amount: razorOrder.amount,
      currency: razorOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    return next(error);
  }
};

// verifyRazorpayPayment - client posts payment details to this endpoint
export const verifyRazorpayPayment = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      sessionId,
    } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !sessionId) {
      return next(new ValidationError("Missing payment verification fields."));
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return next(new ValidationError("Invalid Payment signature."));
    }

    // Idempotency check
    const existingOrder = await prisma.orders.findFirst({
      where: { razorpayPaymentId: razorpay_payment_id },
    });

    if (existingOrder) {
      return res.status(200).json({ received: true });
    }

    const sessionKey = `payment-session:${sessionId}`;
    const sessionData = await redis.get(sessionKey);

    if (!sessionData) {
      return res.status(400).send("Session expired.");
    }

    const { cart, totalAmount, shippingAddressId, coupon, userId } =
      JSON.parse(sessionData);

    const uid = userId || (req as any).user?.id;

    const user = await prisma.users.findUnique({
      where: { id: uid },
    });

    const name = user?.name || "Customer";
    const email = user?.email || "";

    const shopGrouped = cart.reduce((acc: any, item: any) => {
      if (!acc[item.shopId]) acc[item.shopId] = [];
      acc[item.shopId].push(item);
      return acc;
    }, {});

    // 🔥 Process each shop atomically
    for (const shopId in shopGrouped) {
      const orderItems = shopGrouped[shopId];

      await prisma.$transaction(async (tx) => {
        let orderTotal = orderItems.reduce(
          (sum: number, p: any) => sum + p.quantity * p.sale_price,
          0
        );

        // Apply coupon
        if (
          coupon &&
          coupon.discountedProductId &&
          orderItems.some((item: any) => item.id === coupon.discountedProductId)
        ) {
          const discountedItem = orderItems.find(
            (item: any) => item.id === coupon.discountedProductId
          );

          if (discountedItem) {
            const discount =
              coupon.discountPercent > 0
                ? (discountedItem.sale_price *
                    discountedItem.quantity *
                    coupon.discountPercent) /
                  100
                : coupon.discountAmount;

            orderTotal -= discount;
          }
        }

        // Create order
        const createdOrder = await tx.orders.create({
          data: {
            userId: uid,
            shopId,
            total: orderTotal,
            status: "Paid",
            shippingAddressId: shippingAddressId || null,
            couponCode: coupon?.code || null,
            discountAmount: coupon?.discountAmount || 0,
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            paymentCapturedAt: new Date(),
            deliveryStatus: "Pending",
            items: {
              create: orderItems.map((item: any) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.sale_price,
                selectedOptions: item.selectedOptions,
              })),
            },
          },
        });

        // Update products + analytics
        for (const item of orderItems) {
          await tx.products.update({
            where: { id: item.id },
            data: {
              stock: { decrement: item.quantity },
              totalSales: { increment: item.quantity },
            },
          });

          await tx.productAnalytics.upsert({
            where: { productId: item.id },
            create: {
              productId: item.id,
              shopId,
              purchases: item.quantity,
              lastViewedAt: new Date(),
            },
            update: {
              purchases: { increment: item.quantity },
            },
          });
        }

        // Update user analytics
        const existingAnalytics = await tx.userAnalytics.findUnique({
          where: { userId: uid },
        });

        const newActions = orderItems.map((item: any) => ({
          productId: item.id,
          shopId,
          action: "purchase",
          timeStamp: Date.now(),
        }));

        if (existingAnalytics) {
          const currentActions = Array.isArray(existingAnalytics.actions)
            ? (existingAnalytics.actions as Prisma.JsonArray)
            : [];

          await tx.userAnalytics.update({
            where: { userId: uid },
            data: {
              lastVisited: new Date(),
              actions: [...currentActions, ...newActions],
            },
          });
        } else {
          await tx.userAnalytics.create({
            data: {
              userId: uid,
              lastVisited: new Date(),
              actions: newActions,
            },
          });
        }

        // Get shop
        const shop = await tx.shops.findUnique({
          where: { id: shopId },
          select: { sellerId: true },
        });

        if (!shop) {
          throw new Error(`Shop not found: ${shopId}`);
        }

        const platformFee = Math.round(orderTotal * 0.1 * 100) / 100;
        const sellerAmount = Math.round((orderTotal - platformFee) * 100) / 100;

        // Create payout
        await tx.payouts.create({
          data: {
            sellerId: shop.sellerId,
            orderId: createdOrder.id,
            grossAmount: orderTotal,
            platformFee,
            sellerAmount,
            status: "pending",
            scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        });

        // Seller notification
        await tx.notifications.create({
          data: {
            title: "New Order Received",
            message: `Customer placed an order.`,
            creatorId: uid,
            receiverId: shop.sellerId,
            redirect_link: `https://tradeport.com/order/${sessionId}`,
          },
        });
      });
    }

    // Send email (outside transaction)
    await sendEmail(email, "Your TradePort Order Confirmation", "order-confirmation", {
      name,
      cart,
      totalAmount:
        coupon?.discountAmount
          ? totalAmount - coupon.discountAmount
          : totalAmount,
      trackingURL: `https://tradeport.com/order/${sessionId}`,
    });

    // Admin notification
    await prisma.notifications.create({
      data: {
        title: "Platform order alert",
        message: `New order placed by ${name}`,
        creatorId: uid,
        receiverId: "admin",
        redirect_link: `https://tradeport.com/order/${sessionId}`,
      },
    });

    await redis.del(sessionKey);

    return res.status(200).json({ received: true, message: "Order Created" });
  } catch (error) {
    return next(error);
  }
};