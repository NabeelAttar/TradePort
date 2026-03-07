// we will not fetch this page in client side hence no use client, cuz fetching this type of data that is shops data is important for 
// seo purpose, and for seo purpose we need our components to render on server side 
import SellerProfile from 'apps/user-ui/src/shared/modules/SellerProfile'
import axiosInstance from 'apps/user-ui/src/utils/axiosInstance'
import { Metadata } from 'next'
import React from 'react'

async function fetchSellerDetails(id: string){
    const response = await axiosInstance.get(`/seller/api/get-seller/${id}`)
    return response.data
}

// dynamic metadata generator
export async function generateMetadata ({
    params
} : {
    params: {id: string}
}) : Promise<Metadata> {
    const data = await fetchSellerDetails(params.id)
    return {
        title: `${data?.shop?.name} | TradePort`,
        description: data?.shop?.bio || "Explore product and services from trusted seller on TradePort",
        // due to opengraph jab tu koi shop ki link bhejega whatsapp ya kahi par to apne aap top pe uss shop ka photo, title wagere aa jaayega message me
        openGraph: {
            title: `${data?.shop?.name} | TradePort`,
            description: data?.shop?.bio || "Explore product and services from trusted seller on TradePort",
            type: "website",
            images: [
                {
                    url: data?.shop?.avatar || "/default-shop.png",
                    width: 800,
                    height: 800,
                    alt: data?.shop?.name || "Shop logo"
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: `${data?.shop?.name} | TradePort`,
            description: data?.shop?.bio || "Explore product and services from trusted seller on TradePort",
            images: [data?.shop?.avatar || "/default-shop.png"]
        }
    }
}

const page = async ({params} : {params : {id: string}}) => {
    const data = await fetchSellerDetails(params.id)

  return (
    <div>
        <SellerProfile shop={data?.shop} followersCount={data?.followersCount} />
    </div>
  )
}

export default page