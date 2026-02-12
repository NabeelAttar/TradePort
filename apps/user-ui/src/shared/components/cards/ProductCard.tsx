import Link from 'next/link';
import React from 'react'

const ProductCard = ({product, isEvent}:{product:any; isEvent?: boolean}) => {
  return (
    <div className='w-full min-h-[350px] h-max bg-white rounded-lg relative'>
        {isEvent && (
            <div className='absolute top-2 left-2 bg-red-600 text-white text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md'>
                OFFER
            </div>
        )}

        {product?.stock <= 5 && (
            <div className='absolute top-2 right-2 bg-yellow-400 text-slate-700 text-[10px] font-semibold px-2 py-1 rounded-sm shadow-md'>
                Limited Stock
            </div>
        )}
        <Link href={`/product/${product?.slug}`}>
            <img 
                src={product?.images[0]?.url || 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=cro'} 
                alt={product?.title} 
                width={300}
                height={300}
                className='w-full h-[200px] mx-auto object-cover rounded-t-md'
            />
        </Link>
    </div>
  )
}

export default ProductCard