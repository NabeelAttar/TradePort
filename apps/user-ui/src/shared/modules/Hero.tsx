'use client'
import { MoveRight } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React from 'react'

const Hero = () => {
  const router = useRouter()

  return (
    <section className="bg-[#0e3d49] min-h-[85vh] flex items-center">
      <div className="w-[90%] md:w-[85%] mx-auto grid md:grid-cols-2 gap-10 items-center">

        {/* LEFT CONTENT */}
        <div className="text-white space-y-6">
          <p className="uppercase tracking-widest text-sm text-gray-300">
            Starting from $40
          </p>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            The Best Watch <br />
            Collection 2026
          </h1>

          <p className="text-lg md:text-xl text-gray-200">
            Exclusive Offer <span className="text-yellow-400 font-semibold">10% OFF</span> this week
          </p>

          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/products')}
              className="bg-white text-black px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:bg-gray-200 transition"
            >
              Shop Now <MoveRight size={18} />
            </button>
 
            <button
              onClick={() => router.push('/products')}
              className="border border-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-black transition"
            >
              Explore
            </button>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative flex justify-center">
            <Image
                src="https://ik.imagekit.io/tgk87wamq/products/Screenshot_2026-02-12_173149-removebg-preview.png"
                alt="Luxury Watch"
                width={520}
                height={520}
                priority
                className="relative z-0 object-cover scale-110"
            />
        </div>

      </div>
    </section>
  )
}

export default Hero
