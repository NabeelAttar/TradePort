import isAuthenticated from "@packages/middlewares/isAuthenticated";
import express, {Router} from "express"
import { createPaymentSession, createRazorpayOrder, getAdminOrders, getOrderDetails, getSellersOrders, getUserOrders, updateDeliveryStatus, verifyCouponCode, verifyPaymentSession, verifyRazorpayPayment,  } from "../controllers/order.controller";
import { isAdmin, isSeller } from "@packages/middlewares/authorizedRoles";

const router:Router = express.Router();

router.post("/create-payment-session", isAuthenticated, createPaymentSession);
router.get("/verifying-payment-session", isAuthenticated, verifyPaymentSession);
router.post("/create-razorpay-order", isAuthenticated, createRazorpayOrder);
router.post("/verify-razorpay-payment", isAuthenticated, verifyRazorpayPayment);
router.get("/get-seller-orders", isAuthenticated, isSeller, getSellersOrders);
router.get("/get-order-details/:id", isAuthenticated, getOrderDetails);
router.put("/update-status/:orderId", isAuthenticated, isSeller, updateDeliveryStatus);
router.put("/verify-coupon", isAuthenticated, verifyCouponCode);
router.get("/get-user-orders", isAuthenticated, getUserOrders);
router.get("/get-admin-orders", isAuthenticated, isAdmin, getAdminOrders);

export default router