'use client'

import ImagePLaceHolder from 'apps/seller-ui/src/shared/components/image-placeholder';
import { ChevronRight } from 'lucide-react';
import ColorSelector from 'packages/components/colorselector';
import CustomProperties from 'packages/components/customproperties';
import CustomSpecifications from 'packages/components/customspecifications';
import Input from 'packages/components/input';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'

const page = () => {
    
    const {register, control, watch, setValue, handleSubmit, formState: {errors}} = useForm();
    const [openImageModal, setOpenImageModal] = useState(false);
    const [isChanged, setIsChanged] = useState(false);
    const [images, setImages] = useState<(File | null)[]>([null]);
    const [loading, setLoading] = useState(false);

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
  return (
    <form className='w-full mx-auto p-8 shadow-md rounded-lg text-white'
        onSubmit={handleSubmit(onSubmit)}
    >
        {/* heading and breadcrumbs */}
        <h2 className='text-2xl font-semibold py-2 font-Poppins text-white'>
            Create Product
        </h2>
        <div className='flex items-center '>
            <span className='text-[#80DEEA] cursor-pointer'>Dashboard</span>
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
                    </div>
                </div>
            </div>
        </div>
    </form>
  )
}

export default page