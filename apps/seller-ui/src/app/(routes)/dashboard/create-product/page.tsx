'use client'

import { useQuery } from '@tanstack/react-query';
import ImagePLaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import ColorSelector from 'packages/components/colorselector';
import CustomProperties from 'packages/components/customproperties';
import CustomSpecifications from 'packages/components/customspecifications';
import Input from 'packages/components/input';
import RichTextEditor from 'packages/components/rich-text-editor';
import SizeSelector from 'packages/components/size-selector';
import React, { useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'

const page = () => {
    
    const {register, control, watch, setValue, handleSubmit, formState: {errors}} = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(true);
    const [images, setImages] = useState<(File | null)[]>([null]);
    const [loading, setLoading] = useState(false);

    const {data, isLoading, isError} = useQuery({
        queryKey: ["categories"],
        queryFn: async() => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories");
                return res.data;
            } catch (error) {
                console.log(error);
                throw error
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    })

    const categories = data?.categories || [];
    const subCategories = data?.subCategories || {};
    
    const selectedCategory = watch("category");
    const regularPrice = watch("regular_price");

    const selectedSubcategories = useMemo(() => {
        return selectedCategory ? subCategories[selectedCategory] || [] : [];
    }, [selectedCategory, subCategories]);

    const onSubmit = (data:any) => {
        console.log(data);
    } 
    
    const handleImageChange = (file: File | null, index: number) => {
        const updateImages = [...images]
        updateImages[index] = file;
        if(index === images.length - 1 && images.length < 8){ 
            // allowing 8 images per product
            updateImages.push(null);
        } 
        setImages(updateImages);
        setValue("images", updateImages);
    }

    const handleRemoveImage = (index: number) => {
        setImages((prevImages) => {
            let updatedImages = [...prevImages]
            if(index === -1){
                updatedImages[0] = null;
            }else {
                updatedImages.splice(index, 1);
            }

            if(!updatedImages.includes(null) && updatedImages.length < 8){
                updatedImages.push(null);
            }

            return updatedImages;
        })

        setValue("images", images);
    }

    const handleSaveDraft = () => {

    }

  return (
    <form className='w-full mx-auto p-8 shadow-md rounded-lg text-white'
        onSubmit={handleSubmit(onSubmit)}
    >
        {/* heading and breadcrumbs */}
        <h2 className='text-2xl font-semibold py-2 font-Poppins text-white'>
            Create Product
        </h2>
        <div className='flex items-center '>
            <Link href={"/dashboard"} className='text-[#80DEEA] cursor-pointer'>Dashboard</Link>
            <ChevronRight className='opacity-[0.8]' size={20}/>
            <span>Create Product</span>
        </div>

        {/* content layout */}
        <div className='py-4 w-full flex gap-6 '>
            {/* left side - image upload section */}
            <div className='md:w-[35%]'>
                {images.length > 0 && (
                    <ImagePLaceHolder 
                    setOpenImageModal={setOpenImageModal} 
                    size='765*850' 
                    small={false} 
                    index={0} 
                    onImageChange={handleImageChange} 
                    onRemove={handleRemoveImage}
                    />
                )}
                <div className='grid grid-cols-2 gap-3 mt-4'>
                    {images.slice(1).map((_, index) => (
                        <ImagePLaceHolder 
                        setOpenImageModal={setOpenImageModal} 
                        size='765*850' 
                        small={true} 
                        key={index}
                        index={index + 1} 
                        onImageChange={handleImageChange} 
                        onRemove={handleRemoveImage}
                        />
                    ))}
                </div>
            </div>
            
            {/* right side - form input */}
            <div className='md:w-[65%] '>
                <div className='w-full flex gap-6'>
                    {/* prodcut title input */}
                    <div className='w-2/4'>
                        <div className='mt-2'>
                            <Input
                                label='Product Title *'
                                placeholder='Enter product title'
                                {...register("title", {required: "Title is required"})}
                            />
                            {errors.title && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.title.message as string}
                                </p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <Input 
                                type='textarea'
                                rows={7}
                                cols={10}
                                label='Short Description* (Max 150 words)'
                                placeholder='Enter product description for quick view'
                                {...register("description", {
                                    required: "Description is required",
                                    validate: (value) => {
                                        const wordCount = value.trim().split(/\s+/).length;
                                        return (
                                            wordCount <= 150 || `Description cannot exceed 150 words. (Current:${wordCount})`
                                        )
                                    }
                                })}
                            />
                            {errors.description && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.description.message as string}
                                </p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <Input
                                label='Tags *'
                                placeholder='apple, flagship'
                                {...register("tags", {required: "Separate related products tags with a comma"})}
                            />
                            {errors.tags && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.tags.message as string}
                                </p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <Input
                                label='Warranty *'
                                placeholder='1 year/ No warranty'
                                {...register("Warranty", {required: "Warranty is required!"})}
                            />
                            {errors.warranty && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.warranty.message as string}
                                </p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <Input
                                label='Slug *'
                                placeholder='product_slug'
                                {...register("slug", {
                                    required: "Slug is required!",
                                    pattern: {
                                        value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                                        message: "Invalid Slug format. Use only lowercase letters, numbers, and ?:- "
                                    },
                                    minLength: {
                                        value: 3,
                                        message: "Slug must be atleast 3 characters long."
                                    },
                                    maxLength: {
                                        value: 50, 
                                        message: "Slug cannot be longer than 50 characters"
                                    }
                                })}
                            />
                            {errors.slug && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.slug.message as string}
                                </p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <Input
                                label='Brand *'
                                placeholder='Apple'
                                {...register("Brand")}
                            />
                            {errors.brand && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.brand.message as string}
                                </p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <ColorSelector control={control} errors={errors}/>
                        </div>

                        <div className='mt-2'>
                            <CustomSpecifications control={control} errors={errors} />
                        </div>

                        <div className='mt-2'>
                            <CustomProperties control={control} errors={errors} />
                        </div>

                        <div className='mt-2'>
                            <label className='block font-semibold text-gray-300 mb-1'>
                                Cash on Delivery *
                            </label>
                            <select 
                                {...register("cash_on_delivery", {
                                    required: "Selecting Cash on delivery or not is required"
                                })}
                                defaultValue="yes"
                                className='w-full border outline-none border-gray-700 bg-transparent'
                            >
                                <option value="yes" className='bg-black'>
                                    Yes
                                </option>
                                <option value="no" className='bg-black'>
                                    No
                                </option>
                            </select>
                            {errors.cash_on_delivery && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.cash_on_delivery.message as string}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className='w-2/4'>
                        <label className='block font-semibold text-gray-300 mb-1'>
                            Category *
                        </label>
                        {isLoading ? (
                            <p className='text-gray-400 '>
                                loading categories
                            </p>
                        ) : (
                            isError ? (
                                <p className='text-red-500'>
                                    Failed to load categories
                                </p>
                            ) : (
                                <Controller 
                                    name='category' 
                                    control={control} 
                                    rules={{required: "Category is required"}}
                                    render={({ field }) => (
                                        <select {...field} className='w-full border outline-none border-gray-700 bg-transparent'>
                                            <option value="" className='bg-black'>
                                                Select Category
                                            </option>
                                            {categories.map((category : string) => (
                                                <option value={category} key={category} className='bg-black'>
                                                    {category}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                />
                            )
                        )}
                        {errors.category && (
                            <p className='text-red-500 text-xs mt-1'>
                                {errors.category.message as string}
                            </p>
                        )}

                        {/* subcategories */}
                        <div className='mt-2'>
                            <label className='block font-semibold text-gray-300 mb-1'>
                                Subcategory *
                            </label>
                            <Controller 
                                name='subCategory' 
                                control={control} 
                                rules={{required: "Subcategory is required"}}
                                render={({ field }) => (
                                    <select {...field} className='w-full border outline-none border-gray-700 bg-transparent'>
                                        <option value="" className='bg-black'>
                                            Select Subcategory
                                        </option>
                                        {selectedSubcategories?.map((subcategory : string) => (
                                            <option value={subcategory} key={subcategory} className='bg-black'>
                                                {subcategory}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            />
                            {errors.subCategory && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.subCategory.message as string}
                                </p>
                            )}
                        </div>

                        {/* details */}
                        <div className='mt-2'>
                            <label className='block font-semibold text-gray-300 mb-1'>
                                Detailed Description (min. 100 words) *
                            </label>
                            <Controller
                                name='detailed_description'
                                control={control}
                                rules={{
                                    required: "detailed description is required",
                                    validate: (value) => {
                                        const wordCount = value?.split(/\s+/).filter((word : string) =>word).length
                                        return (
                                            wordCount >= 100 || "Description must be atleast 100 words"
                                        );
                                    },
                                }}
                                render={({ field }) => (
                                    <RichTextEditor value={field.value} onChange={field.onChange} />
                                )}
                            />
                            {errors.detailed_description && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.detailed_description.message as string}
                                </p>
                            )}

                        </div>

                        {/* video url */}
                        <div className='mt-2'>
                            <Input
                                label='Video URL'
                                placeholder='https://www.youtube.com/embed/xyz123'
                                {...register("video_url", {
                                    pattern: {
                                        value: /^https:\/\/(wwww\.)?youtube\.com\/embed\/[a-zA-Z0-9_-]+$/,
                                        message: "Invalid youtube URL. Use format: https://www.youtube.com/embed/xyz123"
                                    } 
                                })}
                            />
                            {errors.video_url && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.video_url.message as string}
                                </p>
                            )}
                        </div>

                        {/* regular price */}
                        <div className='mt-2'>
                            <Input
                                placeholder='500₹'
                                label='Regular Price'
                                {...register("regular_price", {
                                    valueAsNumber: true,
                                    min: { value: 1, message: "Price must be atleast 1₹"},
                                    validate: (value) => !isNaN(value) || "Only Numbers are allowed", 
                                })}
                            />
                            {errors.regular_price && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.regular_price.message as string}
                                </p>
                            )}
                        </div>

                        {/* sale price */}
                        <div className='mt-2'>
                            <Input
                                placeholder='400₹'
                                label='Sale Price *'
                                {...register("sale_price", {
                                    required: "Sale price is required",
                                    valueAsNumber: true,
                                    min: { value: 1, message: "Sale Price must be atleast 1₹"},
                                    validate: (value) => {
                                        if(isNaN(value)) return "Only numbers are allowed";
                                        if(regularPrice && value >= regularPrice){
                                            return "sale price must be less than regular price"
                                        };
                                        return true;
                                    }, 
                                })}
                            />
                            {errors.sale_price && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.sale_price.message as string}
                                </p>
                            )}
                        </div>

                        {/* stock */}
                        <div className='mt-2'>
                            <Input
                                placeholder='100'
                                label='Stock *'
                                {...register("stock", {
                                    required: "Stock is required",
                                    valueAsNumber: true,
                                    min: { value: 1, message: "Stock must be atleast 1"},
                                    max: {value: 1000, message: "Stock cannot exceed 1,000"},
                                    validate: (value) => {
                                        if(isNaN(value)) return "Only numbers are allowed";
                                        if(!Number.isInteger(value)) return "Stock must be a whole number"
                                        return true;
                                    }, 
                                })}
                            />
                            {errors.stock && (
                                <p className='text-red-500 text-xs mt-1'>
                                    {errors.stock.message as string}
                                </p>
                            )}
                        </div>

                        <div className='mt-2'>
                            <SizeSelector control={control} errors={errors} /> 
                        </div>

                        <div className='mt-3'>
                            <label className='block font-semibold text-gray-300 mb-1'>
                                Select Discount Codes (optional)
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div className='mt-6 flex justify-end gap-3'>
            {isChanged && (
                <button type='button' className='px-4 py-2 bg-gray-700 text-white rounded-md' onClick={handleSaveDraft}>
                    Save Draft
                </button>
            )}
            <button type="submit" className='px-4 py-2 bg-blue-600 text-white rounded-md'disabled={loading}>
                {loading ? "Creating..." : "Create"}
            </button>
        </div>
    </form>
  )
}

export default page