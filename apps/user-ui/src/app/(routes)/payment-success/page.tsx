'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useStore } from '../../stores'
import confetti from 'canvas-confetti'
import { CheckCircle, Truck } from 'lucide-react'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'

const page = () => {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("sessionId")
    const router = useRouter();
    const [sessionData, setSessionData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // clear cart and tigger confetti once
    useEffect(() => {
        useStore.setState({ cart : []})

        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6}})
    }, [])

    useEffect(() => {
        const fetchSession = async () => {
            if(!sessionId) {
                setLoading(false)
                return
            }
            try {
                const res = await axiosInstance.get(`/order/api/verifying-payment-session?sessionId=${sessionId}`)
                setSessionData(res.data.session || null)
            } catch (err) {
                // session may already be deleted after order creation — it's okay.
                console.warn("Could not fetch session for receipt", err)
            } finally {
                setLoading(false)
            }
        }
        fetchSession()
    }, [sessionId])

    return (
        <div className='min-h-[80vh] flex items-center justify-center px-4'>
          <div className='bg-white shadow-sm border border-gray-200 rounded-lg max-w-md p-6'>
            <div className='text-green-500 mb-4'>
              <CheckCircle className='w-16 h-16 mx-auto' />
            </div>
            <h2 className='text-2xl font-semibold text-gray-800 mb-2'>Payment Successful</h2>
            <p className='text-sm text-gray-700 mb-4'>Thank you — your order has been placed.</p>

            {loading ? (
                <div className='text-sm text-gray-500'>Loading receipt...</div>
            ) : (
                <>
                    {sessionData ? (
                        <div className='text-sm text-gray-700 mb-4'>
                            <div className='font-medium'>Order Summary</div>
                            <div className='mt-2 space-y-2'>
                                {sessionData.cart.map((item:any) => (
                                    <div key={item.id} className='flex justify-between'>
                                        <div>{item.quantity} x {item.title}</div>
                                        <div>₹{(item.quantity * item.sale_price).toFixed(2)}</div>
                                    </div>
                                ))}
                            </div>

                            <div className='flex justify-between font-semibold mt-3'>
                                <div>Total</div>
                                <div>₹{(sessionData.totalAmount ?? 0).toFixed(2)}</div>
                            </div>
                        </div>
                    ) : (
                        <div className='text-sm text-gray-500 mb-4'>Receipt not available (session expired).</div>
                    )}
                </>
            )}

            <div className='flex gap-2'>
              <button className='inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md' onClick={() => router.push(`/profile?active=My+Orders`)}>
                <Truck className='h-4 w-4' />
                Track Order
              </button>
              <button className='px-4 py-2 border rounded' onClick={() => router.push('/')}>Continue Shopping</button>
            </div>

            <div className='mt-4 text-xs text-gray-400'>
              Payment Session ID: <span className='font-mono'>{sessionId}</span>
            </div>
          </div>
        </div>
    )
}

export default page