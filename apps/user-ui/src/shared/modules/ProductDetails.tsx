'use client';
import { ChevronLeft, ChevronRight, Heart, MapPin, MessageSquareText, Package, ShoppingCartIcon, WalletMinimal } from 'lucide-react';
import Image from 'next/image';
import React, { useRef, useState, useEffect } from 'react';
import Ratings from '../components/Ratings';
import Link from 'next/link';
import { useStore } from '../../app/stores';
import useUser from '../../hooks/useUser';
import useLocationTracking from '../../hooks/useLocationTracking';
import useDeviceTracking from '../../hooks/useDeviceTracking';
import ProductCard from '../components/cards/ProductCard';
import axiosInstance from '../../utils/axiosInstance';

type Props = { productDetails: any };

export default function ProductDetails({ productDetails }: Props) {
    const src =
        productDetails?.images?.[0]?.url ??
        "https://ik.imagekit.io/tgk87wamq/default-image.jpg";

    const imgRef = useRef<HTMLImageElement | null>(null);

    const [isActive, setIsActive] = useState(false);
    const [lensPos, setLensPos] = useState({ x: 0, y: 0 });

    const [imageMeta, setImageMeta] = useState({
        drawWidth: 0,
        drawHeight: 0,
        offsetX: 0,
        offsetY: 0,
    });

    const lensWidth = 100;
    const lensHeight = 100;

    const zoomPaneWidth = 450;
    const zoomPaneHeight = 450;

    // Calculate actual drawn image dimensions inside container
    useEffect(() => {
        if (!imgRef.current) return;

        const img = imgRef.current;

        const containerW = img.parentElement!.clientWidth;
        const containerH = img.parentElement!.clientHeight;

        const naturalW = img.naturalWidth;
        const naturalH = img.naturalHeight;

        const ratio = Math.min(
            containerW / naturalW,
            containerH / naturalH
        );

        const drawWidth = naturalW * ratio;
        const drawHeight = naturalH * ratio;

        const offsetX = (containerW - drawWidth) / 2;
        const offsetY = (containerH - drawHeight) / 2;

        setImageMeta({
            drawWidth,
            drawHeight,
            offsetX,
            offsetY,
        });
    }, [src]);

    function handleMove(e: React.PointerEvent) {
        if (!imgRef.current) return;

        const rect = imgRef.current.parentElement!.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setLensPos({
            x: x - lensWidth / 2,
            y: y - lensHeight / 2,
        });
    }

    const clamp = (val: number, min: number, max: number) =>
        Math.max(min, Math.min(max, val));

    const getVisibleLens = () => {
        const { drawWidth, drawHeight, offsetX, offsetY } = imageMeta;

        const imgLeft = offsetX;
        const imgTop = offsetY;
        const imgRight = offsetX + drawWidth;
        const imgBottom = offsetY + drawHeight;

        const lx = lensPos.x;
        const ly = lensPos.y;
        const lRight = lx + lensWidth;
        const lBottom = ly + lensHeight;

        const ix = clamp(lx, imgLeft, imgRight);
        const iy = clamp(ly, imgTop, imgBottom);

        const iright = clamp(lRight, imgLeft, imgRight);
        const ibottom = clamp(lBottom, imgTop, imgBottom);

        return {
            ix,
            iy,
            iright,
            ibottom,
            visibleW: iright - ix,
            visibleH: ibottom - iy,
            imgLeft,
            imgTop,
            imgRight,
            imgBottom,
        };
    };

    const computeZoomStyles = () => {
        const { visibleW, visibleH, ix, iy, imgLeft, imgTop } =
            getVisibleLens();

        if (visibleW <= 0 || visibleH <= 0)
            return { display: 'none' } as React.CSSProperties;

        const scaleX = zoomPaneWidth / visibleW;
        const scaleY = zoomPaneHeight / visibleH;

        return {
            backgroundImage: `url(${src})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${imageMeta.drawWidth * scaleX}px ${imageMeta.drawHeight * scaleY
                }px`,
            backgroundPosition: `${-(ix - imgLeft) * scaleX
                }px ${-(iy - imgTop) * scaleY}px`,
        } as React.CSSProperties;
    };

    const {
        ix,
        iy,
        iright,
        ibottom,
        imgLeft,
        imgTop,
        imgRight,
        imgBottom,
    } = getVisibleLens();

    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentImage, setCurrentImage] = useState(productDetails?.images[0]?.url);
    const [isSelected, setIsSelected] = useState(productDetails?.images?.[0] || "")
    const [isSizeSelected, setIsSizeSelected] = useState(productDetails?.sizes?.[0] || "")
    const [quantity, setQuantity] = useState(1);
    const [priceRange, setPriceRange] = useState([productDetails?.sale_price, 10000,])
    const [recommendedProducts, setRecommendedProducts] = useState([])
    
    const addToCart = useStore((state:any) => state.addToCart);
    const addToWishlist = useStore((state:any) => state.addToWishlist);
    const removeFromWishlist = useStore((state:any) => state.removeFromWishlist);

    const wishlist = useStore((state:any) => state.wishlist);
    const isWishlisted = wishlist.some((item:any) => item.id === productDetails.id);
    
    const cart = useStore((state:any) => state.cart);
    const isInCart = cart.some((item:any) => item.id === productDetails.id);

    const { user } = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();

    const prevImage = () => {
        if(currentIndex > 0){
            setCurrentIndex(currentIndex - 1);
            setCurrentImage(productDetails?.images[currentIndex - 1]);
        }
    }
    const nextImage = () => {
        if(currentIndex < productDetails?.images.length - 1){
            setCurrentIndex(currentIndex + 1);
            setCurrentImage(productDetails?.images[currentIndex + 1]);
        }
    }

    const discountPercentage = Math.round(
        ((productDetails?.regular_price - productDetails?.sale_price) / productDetails?.regular_price) * 100
    )

    const fetchFilteredProducts = async () => {
        try {
            const query = new URLSearchParams();

            query.set("priceRange", priceRange.join(","));
            query.set("page", "1");
            query.set("limit", "5");

            const res = await axiosInstance.get(`/product/api/get-filtered-products?${query.toString()}`)
            setRecommendedProducts(res.data.products);
        } catch (error) {
            console.error("Failed to fetch filtered products", error);
        }
    }

    useEffect(() => {
      fetchFilteredProducts()
    }, [priceRange])
    

    return (
        <div className="w-full bg-[#f5f5f5] py-5">
            <div className="w-[90%] bg-white lg:w-[80%] mx-auto pt-6 grid grid-cols-1 lg:grid-cols-[28%_44%_28%] gap-6 overflow-hidden">
                {/* left column */}
                <div className='p-4'>
                    <div className='relative w-full'>
                        {/* main  image with zoom*/}
                        <div
                            className="relative"
                            style={{ width: 320, height: 320 }}
                            onPointerEnter={() => setIsActive(true)}
                            onPointerLeave={() => setIsActive(false)}
                            onPointerMove={handleMove}
                        >
                            <img
                                ref={imgRef}
                                src={src}
                                alt="product"
                                className="w-full h-full object-contain select-none"
                                draggable={false}
                            />

                            {isActive && (
                                <>
                                    {/* Top shadow */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: imgLeft,
                                            top: imgTop,
                                            width: imageMeta.drawWidth,
                                            height: iy - imgTop,
                                            background: 'rgba(0,0,0,0.45)',
                                        }}
                                    />
                                    {/* Left shadow */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: imgLeft,
                                            top: iy,
                                            width: ix - imgLeft,
                                            height: ibottom - iy,
                                            background: 'rgba(0,0,0,0.45)',
                                        }}
                                    />
                                    {/* Right shadow */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: iright,
                                            top: iy,
                                            width: imgRight - iright,
                                            height: ibottom - iy,
                                            background: 'rgba(0,0,0,0.45)',
                                        }}
                                    />
                                    {/* Bottom shadow */}
                                    <div
                                        style={{
                                            position: 'absolute',
                                            left: imgLeft,
                                            top: ibottom,
                                            width: imageMeta.drawWidth,
                                            height: imgBottom - ibottom,
                                            background: 'rgba(0,0,0,0.45)',
                                        }}
                                    />
                                </>
                            )}
                        </div>

                        {isActive && (
                            <div
                                className='absolute top-0 left-full ml-4 border bg-white shadow-lg'
                                style={{
                                    width: zoomPaneWidth,
                                    height: zoomPaneHeight,
                                    ...computeZoomStyles(),
                                }}
                            />
                        )}
                    </div>

                    {/* thumbnail images array */}
                    <div className='relative flex items-center gap-2 mt-4 overflow-hidden'>
                        {productDetails?.images?.length > 4 && (
                            <button className='absolute left-0 bg-white p-2 rounded-full shadow-md z-10' onClick={prevImage} disabled={currentIndex === 0}>
                                <ChevronLeft size={24} />
                            </button>
                        )}
                        <div className='flex gap-2 overflow-x-auto'>
                            {productDetails?.images?.map((img:any, index:number) => (
                                <Image 
                                    src={img?.url || "https://ik.imagekit.io/tgk87wamq/default-image.jpg"} 
                                    alt='Thumbnail' 
                                    key={index} 
                                    width={60} 
                                    height={60} 
                                    className={`cursor-pointer border rounded-lg p-1 ${currentImage === img ? "border-blue-500" : "border-gray-300"}`}
                                    onClick={() => {setCurrentIndex(index); setCurrentImage(img)}}
                                />
                            ))}
                        </div>
                        {productDetails?.images?.length > 4 && (
                            <button className='absolute right-0 bg-white p-2 rounded-full shadow-md z-10' onClick={nextImage} disabled={currentIndex === productDetails?.images?.length - 1}>
                                <ChevronRight size={24} />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* middle colum - product details */}
                <div className='p-4'>
                    <h1 className='text-xl mb-2 font-medium'>
                        {productDetails?.title}
                    </h1>
                    <div className='w-full flex items-center justify-between'>
                        <div className='flex gap-2 mt-2 text-yellow-500'>
                            <Ratings rating={productDetails?.ratings} />
                            <Link href={"#reviews"} className='text-blue-500 hover:underline'>(1 review)</Link>
                        </div>
                        <div className=''>
                            <Heart 
                                size={25} 
                                fill={isWishlisted ? "red" : "transparent"} 
                                className='cursor-pointer' color={isWishlisted ? "transparent" : "#777"} 
                                onClick={() => {
                                    isWishlisted 
                                    ? removeFromWishlist(productDetails.id, user, location, deviceInfo)
                                    : addToWishlist({...productDetails, quantity, selectedoptions: {color: isSelected, size: isSelected}}, user, location, deviceInfo)
                                }} 
                            />
                        </div>
                    </div>

                    <div className='py-2 border-b border-gray-200 '>
                        <span className='text-gray-500 '>
                            Brand: {" "}
                            <span className='text-blue-500'>
                                {productDetails?.brand || "No Brand"}
                            </span>
                        </span>
                    </div>

                    <div className="mt-3">
                        <span className='text-3xl font-bold text-orange-500'>
                            ₹{productDetails?.sale_price}
                        </span>
                        <div className='flex gap-2 pb-2 text-lg border-b border-b-slate-200'>
                            <span className='text-gray-400 line-through'>
                                ₹{productDetails?.regular_price}
                            </span>
                            <span className='text-gray-500'>-{discountPercentage}%</span>
                        </div>

                        <div className='mt-2'>
                            <div className='flex flex-col md:flex-row items-start gap-5 mt-4'>
                                {/* color options */}
                                {productDetails?.colors?.length > 0 && (
                                    <div>
                                        <strong>Color:</strong>
                                        <div className='flex gap-2 mt-1'>
                                            {productDetails?.colors?.map((color:string, index:number) => (
                                                <button 
                                                    key={index} 
                                                    className={`w-8 h-8 cursor-pointer rounded-full border-2 transition ${isSelected === color ? "border-gray-400 scale-110 shadow-md" : "border-transparent"}`}
                                                    onClick={() => setIsSelected(color)}
                                                    style={{backgroundColor: color}}
                                                />

                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* size options */}
                                {productDetails?.sizes?.length > 0 && (
                                    <div>
                                        <strong>Size:</strong>
                                        <div className='flex gap-2 mt-1'>
                                            {productDetails?.sizes?.map((size:string, index:number) => (
                                                <button 
                                                    key={index} 
                                                    className={`px-4 py-1 cursor-pointer rounded-md border-2 transition ${isSizeSelected === size ? "bg-gray-800 text-white" : "bg-gray-300 text-black"}`}
                                                    onClick={() => setIsSizeSelected(size)}
                                                >
                                                    {size}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className='mt-6'>
                            <div className='flex items-center gap-3'>
                                <div className='flex items-center rounded-md'>
                                    <button 
                                        className='px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md'
                                        onClick={() => setQuantity((prev) => Math.max(1,prev-1))}
                                    >
                                        -
                                    </button>
                                    <span className='px-4 bg-gray-100 py-1'>{quantity}</span>
                                    <button 
                                        className='px-3 cursor-pointer py-1 bg-gray-300 hover:bg-gray-400 text-black font-semibold rounded-l-md'
                                        onClick={() => setQuantity((prev) => prev+1)}
                                    >
                                        +
                                    </button>
                                </div>
                                {productDetails?.stock > 0 ? (
                                    <span className='text-green-600 font-semibold'>
                                        In Stock{" "}
                                        <span className='text-gray-500 font-medium'>
                                            (Stock {productDetails?.stock})
                                        </span>
                                    </span>
                                ) : (
                                    <span className='text-red-600 font-semibold'>
                                        Out of Stock
                                    </span>
                                )}
                            </div>

                            <button 
                                className={`flex mt-6 items-center gap-2 px-5 py-[10px] bg-[#ff5722] hover:bg-[#e64a19] text-white font-medium rounded-lg transition ${isInCart ? "cursor-not-allowed" : "cursor-pointer"}`}
                                disabled={isInCart || productDetails?.stock === 0}
                                onClick={() => addToCart({...productDetails, quantity, selectedOptions: {color: isSelected, size: isSizeSelected}}, user, location, deviceInfo)}
                            >
                                <ShoppingCartIcon size={18}/>
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>

                {/* right column - seller information */}
                <div className='bg-[#fafafa] -mt-6'>
                    <div className='mb-1 p-3 border-b border-b-gray-100'>
                        <span className='text-sm text-gray-600 '>
                            Delivery Options
                        </span>
                        <div className='flex items-center text-gray-600 gap-1'>
                            <MapPin size={18} className='ml-[-5px]' />
                            <span className='text-lg font-normal'>{location?.city + "," + location?.country}</span>
                        </div>
                    </div>

                    <div className='mb-1 px-3 pb-1 border-b border-b-gray-100'>
                        <span className='text-sm text-gray-600'>
                            Return & Warranty 
                        </span>
                        <div className='flex items-center text-gray-600 gap-1 '>
                            <Package size={18} className='ml-[-5px]' />
                            <span className='text-base font-normal '>7 days return policy</span>
                        </div>
                        <div className='flex items-center py-2 text-gray-600 gap-1'>
                            <WalletMinimal size={18} className='ml-[-5px]' />
                            <span className='text-base font-normal'>Warranty not available</span>
                        </div>
                    </div>

                    <div className='px-3 py-1'>
                        <div className='w-[85%] rounded-lg '>
                            {/* sold by section */}
                            <div className='flex items-center justify-between '>
                                <div>
                                    <span className='text-sm text-gray-600 font-light'>Sold by </span>
                                    <span className='block max-w-[150px] truncate font-medium text-lg'>
                                        {productDetails?.shop?.name}
                                    </span>
                                </div>
                                <Link href={"#"} className='text-blue-500 text-sm flex items-center gap-1' >
                                    <MessageSquareText />
                                    Chat Now
                                </Link>
                            </div>

                            {/* seller performance stats  */}
                            <div className='grid grid-cols-3 gap-2 border-t-gray-200 mt-3 pt-3'>
                                <div>
                                    <p className='text-[12px] text-gray-500'>Positive Seller Ratings</p>
                                    <p className='text-lg font-semibold'>88%</p>
                                </div>
                                <div>
                                    <p className='text-[12px] text-gray-500'>Ship on Time</p>
                                    <p className='text-lg font-semibold'>100%</p>
                                </div>
                                <div>
                                    <p className='text-[12px] text-gray-500'>Chat Response Rate</p>
                                    <p className='text-lg font-semibold'>100%</p>
                                </div>
                            </div>

                            {/* go to store */}
                            <div className='text-center mt-4 border-t border-t-gray-200 pt-2'>
                                <Link href={`/shop/${productDetails?.Shop.id}`} className='text-blue-500 font-medium text-sm hover:underline'>
                                    GO TO STORE
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className='w-[90%] lg:w-[80%] mx-auto mt-5'>
                <div className='bg-white min-h-[60vh] h-full p-5'>
                    <h3 className='text-lg font-semibold'>Product Details of {productDetails?.title}</h3>
                    <div 
                        className='prose prose-sm text-slate-200 max-w-none' 
                        dangerouslySetInnerHTML={{
                            __html: productDetails?.detailed_description
                        }}
                        // styling ke saath detailed description dikhega yaha, ki agar product banate wakt images wagere add kiya tha to waise hi dikhega
                    />
                </div>
            </div>

            <div className='w-[90%] lg:w-[80%] mx-auto '>
                <div className='bg-white min-h-[50vh] h-full mt-5 p-5'>
                    <h3 className='text-lg font-semibold '>Ratings & Reviews of {productDetails?.title}</h3>
                    <p className='text-center pt-14 '>No reviews available yet.</p>
                </div>
            </div>

            <div className='w-[90%] lg:w-[80%] mx-auto'>
                <div className='w-full h-full my-5 p-5 '>
                    <h3 className='text-xl font-semibold mb-2'>You may also like</h3>
                    <div className='m-auto grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5'>
                        {recommendedProducts?.map((i:any) => (
                            <ProductCard key={i.id} product={i} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}