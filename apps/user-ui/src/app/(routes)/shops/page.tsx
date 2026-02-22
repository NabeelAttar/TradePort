'use client'
import { categories } from 'apps/user-ui/src/configs/Categories'
import ShopsCard from 'apps/user-ui/src/shared/components/cards/ShopsCard'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { countries } from 'apps/user-ui/src/utils/Countries'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'


const page = () => {

    const [shopLoading, setShopLoading] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedCountires, setSelectedCountries] = useState<string[]>([])
    const [page, setPage] = useState(1);
    const [shops, setShops] = useState<any[]>([])
    const [totalPages, setTotalPages] = useState(1);

    const router = useRouter();

    const updateURL = () => {
        const params = new URLSearchParams();
        if(selectedCategories.length > 0){
            params.set("categories", selectedCategories.join(","))
        }
        if(selectedCountires.length > 0){
            params.set("categories", selectedCountires.join(","))
        }
        params.set("page", page.toString());
        router.replace(`/shops?${decodeURIComponent(params.toString())}`)
    }

    const fetchFilteredProducts = async () => {
        setShopLoading(true)
        try {
            const query = new URLSearchParams()

            if(selectedCategories.length > 0){
                query.set("categories", selectedCategories.join(","))
            }
            if(selectedCountires.length > 0){
                query.set("categories", selectedCountires.join(","))
            }
            query.set("page", page.toString());
            query.set("limit", "12");

            const res = await axiosInstance.get(`/product/api/get-filtered-shops?${query.toString()}`)
            setShops(res.data.shops)
            setTotalPages(res.data.pagination.totalPages)

        } catch (error) {
            console.error("Failed to fetch filtered Shops", error)
        } finally {
            setShopLoading(false)
        }
    }
 
    useEffect(() => {
        updateURL();
        fetchFilteredProducts();
    }, [selectedCategories, page])

    const toggleCategory = (label:string) => {
        setSelectedCategories((prev) => prev.includes(label) ? prev.filter((cat) => cat !== label) : [...prev, label])
    }    

    const toggleCountry = (country:string) => {
        setSelectedCountries((prev) => prev.includes(country) ? prev.filter((cou) => cou !== country) : [...prev, country])
    }   

  return (
    <div className='w-full bg-[#f5f5f5] pb-10'>
        <div className='w-[90%] lg:w-[80%] m-auto'>
            <div className='pb-[50px]'>
                <h1 className='md:pt-[40px] font-medium text-[44px] leading-1 mb-[14px] font-jost'>
                    All Shops
                </h1>
                <Link href='/' className='text-[#55585b] hover:underline'>
                    Home
                </Link>
                <span className='inline-block p-[1.5px] mx-1 bg-[#a8acb0] rounded-full'></span>
                <span className='text-[#55585b]'>All Shops</span>
            </div>

            <div className='w-full flex flex-col lg:flex-row gap-8'>
                {/* sidebar */}
                <aside className='w-full lg:w-[270px] !rounded bg-white p-4 space-y-6 shadow-md'>
                    {/* categories */}
                    <h3 className='text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1'>
                        Categories
                    </h3>
                    <ul className='space-y-2 !mt-3'>
                        {categories?.map((category : any) => (
                            <li key={category.label} className='flex items-center justify-between '>
                                <label className='flex items-center gap-3 text-sm text-gray-700'>
                                    <input type="checkbox" checked={selectedCategories.includes(category.value)} onChange={() => toggleCategory(category.value)} className='accent-blue-600' />
                                    {category.value}
                                </label>
                            </li>
                        ))}
                    </ul>

                    {/* countires */}
                    <h3 className='text-xl font-Poppins font-medium border-b border-b-slate-300 pb-1'>
                        Countries
                    </h3>
                    <ul className='space-y-2 !mt-3'>
                        {countries?.map((country : any) => (
                            <li key={country} className='flex items-center justify-between '>
                                <label className='flex items-center gap-3 text-sm text-gray-700 cursor-pointer'>
                                    <input type="checkbox" checked={selectedCountires.includes(country)} onChange={() => toggleCountry(country)} className='accent-blue-600' />
                                    {country}
                                </label>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* products */}
                <div className='flex-1 px-2 lg:px-3 '>
                    {shopLoading ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-fr'>
                            {Array.from({ length : 10 }).map((_, index) => (
                                <div className='h-[250px] bg-gray-300 animate-pulse rounded-xl' key={index}></div>
                            ))}
                        </div>
                    ) : shops.length > 0 ? (
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 auto-rows-fr'>
                            {shops.map((shop) => (
                                <ShopsCard key={shop.id} shop={shop} /> 
                            ))}
                        </div>
                    ) : (
                        <p>No Shops found!</p>
                    )}

                    {totalPages > 1 && (
                        <div className='flex justify-center mt-8 gap-2'>
                            {Array.from({ length : totalPages }).map((_, index) => (
                                <button 
                                    key={index+1} 
                                    onClick={() => setPage(index+1)} 
                                    className={`px-3 py-1 !rounded border border-gray-200 text-sm ${page === index + 1 ? "bg-blue-600 text-white" : "bg-white text-black"}`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  )
}

export default page 