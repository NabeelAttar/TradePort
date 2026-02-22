import { ArrowUpRight, MapPin, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface ShopsCardProps {
    shop: {
        id: string,
        name: string,
        description?: string,
        avatar: string,
        coverBanner?: string,
        address?: string,
        followers?: [],
        ratings?: number,
        category?: string
    }
}

const ShopsCard: React.FC<ShopsCardProps> = ({ shop }) => {
  return (
    <div className='w-full rounded-md cursor-pointer bg-white border border-gray-200 shadow-sm overflow-hidden transition '>
        {/* cover photo */}
        <div className='h-[120px] w-full relative'>
            <Image src={shop?.coverBanner || "https://ik.imagekit.io/shahriarbecodemy/cover/3_vC8riiU8W.png"} alt='Cover' fill className='object-cover w-full h-full' />
        </div>

        {/* avatar */}
        <div className='relative flex justify-center -mt-8 '>
            <div className='w-16 h-16 rounded-full border-4 border-white overflow-hidden '>
                <Image src={shop.avatar || "https://ik.imagekit.io/fz0xzwtey/avatar/6_N7eMmuAvl.png?updatedAt=1742269698784"} alt='shop.name' width={64} height={64} className='object-cover' />
            </div>
        </div>

        {/* shop information */}
        <div className='px-4 pb-4 pt-2 text-center'>
            <h3 className='text-base font-semibold text-gray-800'>{shop.name}</h3>
            <p className='text-xs text-gray-500 mt-[0.5px]'>{shop.followers?.length ?? 0} Followers</p>
            {/* address + ratings */}
            <div className='flex items-center justify-center text-xs text-gray-500 mt-2 gap-4 flex-wrap '>
                {shop.address &&  (
                    <span className='flex items-center gap-1 max-w-[120px]'>
                        <MapPin className='w-4 h-4 shrink-0' />
                        <span className='truncate'>{shop.address}</span>
                    </span>
                )}

                <span className='flex items-center gap-1'>
                    <Star className='w-4 h-4 text-yellow-400 fill-yellow-400' />
                    {shop.ratings ?? "N/A"}
                </span>
            </div>

            {/* category */}
            {shop?.category && (
                <div className='mt-3 flex flex-wrap justify-center gap-2 text-xs '>
                    <span className='bg-blue-50 capitalize text-blue-600 px-2 py-0.5 rounded-full font-medium'>
                        {shop.category}
                    </span>
                </div>
            )}

            {/* visit shop */}
            <div className='mt-4'>
                <Link href={`shop/${shop.id}`} className='inline-flex items-center text-sm text-blue-600 font-medium hover:underline hover:text-blue-700 transition' >
                    Visit Shop
                    <ArrowUpRight className='w-4 h-4 ml-1' />
                </Link>
            </div>
        </div>
    </div>
  )
}

export default ShopsCard