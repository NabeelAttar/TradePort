import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'
import Ratings from '../Ratings'
import { Heart, MapPin, MessageCircle, ShoppingCartIcon, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useStore } from 'apps/user-ui/src/app/stores'
import useUser from 'apps/user-ui/src/hooks/useUser'
import useLocationTracking from 'apps/user-ui/src/hooks/useLocationTracking'
import useDeviceTracking from 'apps/user-ui/src/hooks/useDeviceTracking'

const ProductDetailsCard = ({data, setOpen} : {data:any, setOpen: (open:boolean) => void}) => {
    const [activeImage, setActiveImage] = useState(0)
    const [isSelected, setIsSelected] = useState(data?.colors?.[0] || "");
    const [isSizeSelected, setIsSizeSelected] = useState(data?.sizes?.[0] || "");
    const [quantity, setQuantity] = useState(1);

    const addToCart = useStore((state:any) => state.addToCart);
    const addToWishlist = useStore((state:any) => state.addToWishlist);
    const removeFromWishlist = useStore((state:any) => state.removeFromWishlist);

    const wishlist = useStore((state:any) => state.wishlist);
    const isWishlisted = wishlist.some((item:any) => item.id === data.id);
    
    const cart = useStore((state:any) => state.cart);
    const isInCart = cart.some((item:any) => item.id === data.id);

    const { user } = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();


    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

    const router = useRouter();

  return (
    <div className='fixed flex items-center justify-center top-0 left-0 h-screen w-full bg-[#0000001d] z-50' onClick={() => setOpen(false)}>
        <div className='w-[90%] md:w-[70%] md-mt-14 2xl:mt-0 h-max overflow-scroll min-h-[70vh] p-4 md:p-6 bg-white shadow-md rounded-lg' onClick={(e) => e.stopPropagation()}>
            <div className='w-full flex flex-col md:flex-row'>
                <div className='w-full md:w-1/2 h-full'>
                    <Image src={data?.images?.[activeImage]?.url} alt={data?.images?.[activeImage]?.url} height={400} width={400} className='w-full rounded-lg object-contain' />
                    {/* therecan be multiple pictures so adding thumbnails for others */}
                    <div className='flex gap-2 mt-4'>
                        {data?.images?.map((image:any, index:number) => (
                            <div key={index} className={`cursor-pointer border rounded-md ${activeImage === index ? "border-gray-500 pt-1" : "border-transparent"}`} onClick={() => setActiveImage(index)}>
                                <Image src={image?.url} alt={`Thumbnail ${index}`} height={80} width={80} className='rounded-md' />
                            </div>
                        ))}
                    </div>
                </div>

                <div className='w-full md:w-1/2 md:pl-8 mt-6 md:mt-0 '>
                    {/* seller info */}
                    <div className='border-b relative pb-3 border-gray-200 flex items-center justify-between'>
                        <div className='flex items-start gap-3'>
                            <Image src={data?.Shop?.avatar || "https://ik.imagekit.io/tgk87wamq/default-image.jpg?updatedAt=1770815145635"} alt='Shop logo' width={60} height={60} className='rounded-full w-[60px] h-[60px] object-cover' />
                            <div>
                                <Link href={`/shop/${data?.Shop?.id}`} className='text-lg font-semibold'>
                                    {data?.Shop?.name}
                                </Link>
                                <span className='block mt-1'>
                                    <Ratings rating={data?.Shop?.ratings} />
                                </span>
                                <p className='text-gray-600 mt-1 flex items-center'>
                                    <MapPin size={20}/>{" "}
                                    {data?.Shop?.address || "Location not available"}
                                </p>
                            </div>
                        </div> 
                        <button type="button" className='flex cursor-pointer items-center gap-2 px-4 py-2 font-semibold text-white rounded-lg bg-blue-600 hover:bg-blue-700 hover:scale-110 transition' onClick={() => router.push(`/inbox?shopId=${data?.Shop?.id}`)}>
                            <MessageCircle/> Chat with Seller
                        </button>
                        <button type="button" className='w-full absolute cursor-pointer right-[-5px] top-[-5px] flex justify-end my-2 mt-[-10px]'>
                            <X size={25} onClick={() => setOpen(false)} />
                        </button>
                    </div>

                    {/* product info */}
                    <h3 className='text-xl font-semibold mt-3'>
                        {data?.title}
                    </h3>
                    <p className='mt-2 text-gray-700 whitespace-pre-wrap w-full'>
                        {data?.short_description}{" "}
                    </p>
                    {data?.brand && (
                        <p className='mt-2'>
                            <strong>Brand:</strong> {data.brand}
                        </p>
                    )}

                    {/* color and size selections */}
                    <div className='flex flex-col md:flex-row items-start gap-5 mt-4'>
                        {/* color options */}
                        {data?.colors?.length > 0 && (
                            <div>
                                <strong>Color:</strong>
                                <div className='flex gap-2 mt-1'>
                                    {data?.colors?.map((color:string, index:number) => (
                                        <button key={index} className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${isSelected === color ? "border-gray-400 scale-110 shadow-md" : "border-transparent"}`} onClick={() => setIsSelected(color)} style={{backgroundColor: color}}/>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* sizes options */}
                        {data?.sizes?.length > 0 && (
                            <div>
                                <strong>Size:</strong>
                                <div className='flex gap-2 mt-1'>
                                    {data?.sizes?.map((size:string, index:number) => (
                                        <button key={index} className={`px-4 py-1 cursor-pointer rounded-md ${isSizeSelected === size ? "bg-gray-800 text-white" : "bg-gray-300 text-black"}`} onClick={() => setIsSizeSelected(size)}>
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className='mt-5 flex items-center gap-4'>
                        <h3 className='text-2xl font-semibold text-gray-900'>
                            ₹{data?.sale_price}
                        </h3>
                        {data?.regular_price && (
                            <h3 className='text-lg text-red-600 line-through'>
                                ₹{data.regular_price}
                            </h3>
                        )}
                    </div>

                    <div className='mt-5 flex items-center gap-5'>
                        <div className='flex items-center rounded-md'>
                            <button className='px-3 cursor-pointer py-1 bg-gray-300' onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                                -
                            </button>
                            <span className='px-4 bg-gray-100 py-1'>{quantity}</span>
                            <button className='px-3 py-1 cursor-pointer bg-gray-300' onClick={() => setQuantity((prev) => prev+1)}>
                                +
                            </button>
                        </div>
                        <button disabled={isInCart} onClick={() => addToCart({...data, quantity, selectedOptions: {color: isSelected, size: isSizeSelected}}, user, location, deviceInfo)} className={`flex items-center gap-2 px-4 py-2 bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${isInCart ? "cursor-not-allowed" : "cursor-pointer"}`}>
                            <ShoppingCartIcon size={18} />
                            Add to Cart
                        </button>
                        <button className='opacity-[0.7] cursor-pointer '>
                            <Heart size={30} fill={isWishlisted ? "red" : "transparent"} color={isWishlisted ? "transparent" : "black"} onClick={() => isWishlisted ? removeFromWishlist(data.id, user, location, deviceInfo) : addToWishlist({...data, quantity, selectedOptions: {color: isSelected, size: isSizeSelected}}, user, location, deviceInfo)} />
                        </button>
                    </div>

                    <div className='mt-3'>
                        {data?.stock > 0 ? (
                            <span className='text-green-600 font-semibold'>In Stock</span>
                        ) : (
                            <span className='text-red-600 font-semibold'>Out of Stock</span>
                        )}
                    </div>
                    
                    <div className='mt-3 text-gray-600 text-sm'>
                        Estimated Delivery:{" "}
                        <strong>{estimatedDelivery.toDateString()}</strong>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default ProductDetailsCard