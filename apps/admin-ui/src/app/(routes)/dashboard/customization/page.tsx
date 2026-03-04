'use client'

import React, { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance"
import Link from "next/link"
import { ChevronRight } from "lucide-react"



const fetchCustomizations = async () => {
  const res = await axiosInstance.get("/admin/api/get-all-customizations")
  return res.data
}

const CustomizationPage = () => {

  const [tab, setTab] = useState<"categories" | "logo" | "banner">("categories")

  const [newCategory, setNewCategory] = useState("")
  const [newSubCategory, setNewSubCategory] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ["customizations"],
    queryFn: fetchCustomizations
  })

  const queryClient = useQueryClient()

  const addCategoryMutation = useMutation({

    mutationFn: async (category: string) => {
      const res = await axiosInstance.post(
        "/admin/api/add-category",
        { category }
      )
      return res.data
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customizations"] })
      setNewCategory("")
    }

  })

  const addSubCategoryMutation = useMutation({

    mutationFn: async ({ category, subCategory }: any) => {

      const res = await axiosInstance.post(
        "/admin/api/add-subcategory",
        { category, subCategory }
      )

      return res.data
    },

    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["customizations"] })

      setNewSubCategory("")
    }

  })



  const categories = data?.categories || []
  const subCategories = data?.subCategories || {}

  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {

      const reader = new FileReader()

      reader.readAsDataURL(file)

      reader.onload = () => resolve(reader.result)

      reader.onerror = error => reject(error)

    })

  const uploadLogoMutation = useMutation({

    mutationFn: async (file: File) => {

      const base64 = await toBase64(file)

      const upload = await axiosInstance.post(
        "/admin/api/upload-site-asset",
        {
          file: base64,
          type: "logo"
        }
      )

      await axiosInstance.put(
        "/admin/api/update-site-asset",
        {
          type: "logo",
          url: upload.data.file_url
        }
      )

    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customizations"] })
    }

  })

  const uploadBannerMutation = useMutation({

    mutationFn: async (file: File) => {

      const base64 = await toBase64(file)

      const upload = await axiosInstance.post(
        "/admin/api/upload-site-asset",
        {
          file: base64,
          type: "banner"
        }
      )

      await axiosInstance.put(
        "/admin/api/update-site-asset",
        {
          type: "banner",
          url: upload.data.file_url
        }
      )

    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customizations"] })
    }

  })

  return (
    <div className="w-full min-h-screen p-8">

      {/* HEADER */}

      <h2 className="text-2xl text-white font-semibold mb-2">
        Customization
      </h2>


      {/* BREADCRUMB */}

      <div className="flex items-center mb-6">
        <Link href="/dashboard" className="text-blue-400">
          Dashboard
        </Link>

        <ChevronRight className="text-gray-400" size={18} />

        <span className="text-white">
          Customization
        </span>
      </div>



      {/* TABS */}

      <div className="flex gap-6 border-b border-gray-800 mb-6">

        <button
          onClick={() => setTab("categories")}
          className={`pb-2 ${tab === "categories"
            ? "border-b-2 border-white text-white"
            : "text-gray-400"
            }`}
        >
          Categories
        </button>


        <button
          onClick={() => setTab("logo")}
          className={`pb-2 ${tab === "logo"
            ? "border-b-2 border-white text-white"
            : "text-gray-400"
            }`}
        >
          Logo
        </button>


        <button
          onClick={() => setTab("banner")}
          className={`pb-2 ${tab === "banner"
            ? "border-b-2 border-white text-white"
            : "text-gray-400"
            }`}
        >
          Banner
        </button>

      </div>



      {/* LOADING */}

      {isLoading && (
        <p className="text-white">Loading...</p>
      )}



      {/* ---------------- CATEGORIES TAB ---------------- */}

      {tab === "categories" && (

        <div className="text-white space-y-6">

          {categories.map((cat: string) => (

            <div key={cat}>

              <h3 className="font-semibold text-lg">
                {cat}
              </h3>

              <ul className="ml-5 list-disc text-gray-400">

                {(subCategories[cat] || []).map((sub: string) => (
                  <li key={sub}>
                    {sub}
                  </li>
                ))}

              </ul>

            </div>

          ))}



          {/* ADD CATEGORY */}

          <div className="flex gap-3 mt-6">

            <input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category"
              className="bg-gray-900 border border-gray-700 p-2 rounded-md text-white"
            />

            <button
              onClick={
                () => {
                  if (!newCategory.trim()) return
                  addCategoryMutation.mutate(newCategory)
                }
              }
              className="bg-blue-600 px-4 py-2 rounded-md"
            >
              Add Category
            </button>
          </div>



          {/* ADD SUBCATEGORY */}

          <div className="flex gap-3 mt-4">

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-900 border border-gray-700 p-2 rounded-md text-white"
            >

              <option value="">
                Select category
              </option>

              {categories.map((cat: string) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}

            </select>


            <input
              value={newSubCategory}
              onChange={(e) => setNewSubCategory(e.target.value)}
              placeholder="New subcategory"
              className="bg-gray-900 border border-gray-700 p-2 rounded-md text-white"
            />

            <button
              onClick={() => {
                if (!selectedCategory || !newSubCategory.trim()) return
                addSubCategoryMutation.mutate({
                  category: selectedCategory,
                  subCategory: newSubCategory
                })
              }}
              className="bg-blue-600 px-4 py-2 rounded-md"
            >
              Add Subcategory
            </button>

          </div>

        </div>

      )}



      {/* ---------------- LOGO TAB ---------------- */}

      {tab === "logo" && (

        <div className="text-white">

          {data?.logo && (

            <img
              src={data.logo}
              className="w-32 mb-4 border border-gray-700 rounded-md"
            />

          )}

          <input
            type="file"
            onChange={(e) => {

              const file = e.target.files?.[0]

              if (!file) return

              uploadLogoMutation.mutate(file)

            }}
            className="text-white"
          />

        </div>

      )}



      {/* ---------------- BANNER TAB ---------------- */}

      {tab === "banner" && (

        <div className="text-white">

          {data?.banner && (

            <img
              src={data.banner}
              className="w-[500px] border border-gray-700 rounded-md mb-4"
            />

          )}

          <input
            type="file"
            onChange={(e) => {

              const file = e.target.files?.[0]

              if (!file) return

              uploadBannerMutation.mutate(file)

            }}
            className="text-white"
          />

        </div>

      )}

    </div>
  )
}

export default CustomizationPage