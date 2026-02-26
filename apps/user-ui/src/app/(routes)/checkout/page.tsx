'use client'
import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { XCircle } from 'lucide-react'
import Image from 'next/image'

declare global {
    interface Window {
        Razorpay: any
    }
}

type Coupon = {
  code?: string
  discountAmount?: number
  discountPercent?: number
  discountedProductId?: string
}

const page = () => {
    const [cartItems, setCartItems] = useState<any[]>([])
    const [coupon, setCoupon] = useState<Coupon | null>(null)
    const [totalAmount, setTotalAmount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()

    const sessionId = searchParams.get("sessionId")

    useEffect(() => {
        const loadScript = () => {
            return new Promise((resolve) => {
                if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
                    resolve(true)
                    return
                }
                const script = document.createElement("script")
                script.src = 'https://checkout.razorpay.com/v1/checkout.js'
                script.onload = () => resolve(true)
                script.onerror = () => resolve(false)
                document.body.appendChild(script)
            })
        }
        loadScript()
    }, [])

    // fetch session (cart, total, coupon) to display to user
    useEffect(() => {
      const initializePayment = async () => {
        if(!sessionId){
            setError("Invalid session. Please try again.")
            setLoading(false)
            return
        }

        try {
            // verify-payment-session endpoint should return session shape as in your backend redis payload
            const verifyRes = await axiosInstance.get(`/order/api/verifying-payment-session?sessionId=${sessionId}`)
            const session = verifyRes.data.session
            if(!session){
                throw new Error("Payment session not found or expired")
            }

            setCartItems(session.cart || [])
            setCoupon(session.coupon || null)
            setTotalAmount(session.totalAmount ?? null)
        } catch (err: any) {
            console.error(err)
            setError(err?.response?.data?.error || err?.message || "Something went wrong while preparing your payment.")
        } finally {
            setLoading(false)
        }
      }

      initializePayment();
    }, [sessionId])

    const handlePayCLick = async () => {
    if(!sessionId){
        setError("Invalid session. Please try again.")
        return
    }
    setLoading(true)

    try {
        // 1 : create razorpay order :
        const res = await axiosInstance.post("/order/api/create-razorpay-order", { sessionId })

        const {orderId, amount, keyId } = res.data

        // open razorpay
        const options = {
            key: keyId,
            amount,
            currency: "INR",
            name: "TradePort",
            description: "Order Payment",
            order_id: orderId,
            handler: async function (response : any) {
                try {
                    await axiosInstance.post(
                        "/order/api/verify-razorpay-payment",
                        {
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                            sessionId
                        }
                    )

                    router.push(`payment-success?sessionId=${sessionId}`)
                } catch (error) {
                    console.error(error)
                    setError("Payment verification failed.")
                }
            },
            prefill: {},
            theme: {
                color: "#2563eb"
            }
        }
        const rzp = new window.Razorpay(options)
        rzp.open()

    } catch (error:any) {
        console.log(error)
        setError(error?.response?.data?.message || error?.message || "Failed to initialize payment.")
    } finally {
        setLoading(false)
    }       
    }

    if(loading){
        return (
            <div className='flex justify-center items-center min-h-[70vh]'>
                <div className='animate-spin rounded-full h-12 w-12 border-4 border-blue-600 '></div>
            </div>
        )
    }

    if(error){
        return (
            <div className='flex justify-center items-center min-h-[70vh]'>
                <div className='w-full text-center' >
                    <div className='flex justify-center mb-4'>
                        <XCircle className='text-red-500 w-10 h-10' />
                    </div>
                    <h2 className='text-xl font-semibold text-red-600 mb-2'>
                        Payment Failed
                    </h2>
                    <p className='text-sm text-gray-600 mb-6'>
                        {error} <br className='hidden sm:block' /> Please go back and try 
                        checking out again.
                    </p>
                    <button onClick={() => router.push("/cart")} className='bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700'>
                        Back to Cart
                    </button>
                </div>
            </div>
        )
    }

    const computedTotal = cartItems.reduce((sum, item) => sum + (item.quantity ?? 1) * (item.sale_price ?? 0), 0)
    const displayedTotal = typeof totalAmount === "number" ? totalAmount : computedTotal

  return (
        <div className='min-h-[70vh] flex justify-center items-start p-6'>
            <div className='w-full max-w-3xl bg-white p-6 rounded shadow'>
                <h2 className='text-2xl font-semibold mb-4'>Order Summary</h2>

                <div className='space-y-3'>
                    {cartItems.map((item:any) => (
                        <div key={item.id} className='flex items-center gap-4 border-b pb-3'>
                            <div className='w-16 h-16 relative'>
                                {item?.images?.[0]?.url ? (
                                    <Image src={item.images[0].url} alt={item.title} fill style={{ objectFit: 'cover' }} className='rounded' />
                                ) : (
                                    <div className='w-16 h-16 bg-gray-100 rounded' />
                                )}
                            </div>
                            <div className='flex-1'>
                                <div className='font-medium'>{item.title}</div>
                                <div className='text-sm text-gray-500'>
                                    {item.selectedOptions && (
                                        <>
                                            {item.selectedOptions.color && <span>Color: {item.selectedOptions.color} </span>}
                                            {item.selectedOptions.size && <span className='ml-2'>Size: {item.selectedOptions.size}</span>}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className='text-right'>
                                <div>₹{(item.sale_price * (item.quantity ?? 1)).toFixed(2)}</div>
                                <div className='text-sm text-gray-500'>{item.quantity} x ₹{item.sale_price.toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className='mt-4 border-t pt-4'>
                    {!!coupon?.discountAmount && (
                        <div className='flex justify-between text-sm text-gray-700 pb-1'>
                            <span>Discount</span>
                            <span>- ₹{coupon.discountAmount.toFixed(2)}</span>
                        </div>
                    )}

                    <div className='flex justify-between text-lg font-semibold'>
                        <span>Total</span>
                        <span>₹{displayedTotal.toFixed(2)}</span>
                    </div>

                    <div className='mt-6'>
                        <button
                            onClick={handlePayCLick}
                            className='w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700'
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Pay Securely with Razorpay"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default page