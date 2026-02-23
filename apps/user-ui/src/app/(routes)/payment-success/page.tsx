'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect } from 'react'
import { useStore } from '../../stores'
import confetti from 'canvas-confetti'
import { CheckCircle, Truck } from 'lucide-react'

const page = () => {
    const searchParams = useSearchParams()
    const sessionId = searchParams.get("sessionId")
    const router = useRouter();

    // clear cart and tigger confetti
    useEffect(() => {
        useStore.setState({ cart : []})

        // confetti burst
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.6}
        })
    }, [])

  return (
    <div className='min-h-[80vh] flex items-center justify-center px-4'>
      <div className='bg-white shadow-sm border border-gray-200 rounded-lg max-w-md'>
        <div className='text-green-500 mb-4'>
          <CheckCircle className='w-16 h-16 mx-auto' />
        </div>
        <h2 className='text-2xl font-semibold text-gray-800 mb-2'>
          Payment Successful
        </h2>
        <p className='text-sm text-gray-700 mb-6'>
          Thank you for your purchase. Your Order has been placed successfully
        </p>

        <button className='inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2' onClick={() => router.push(`/profile?active=My+Orders`)}>
          <Truck className='h-4 w-4' />
          Track Order
        </button>

        <div className='mt-8 text-xs text-gray-400'>
          Payment Session ID: <span className='font-mono'>{sessionId}</span>
        </div>
      </div>
    </div>
  )
}

export default page