'use client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import DeleteDiscountModal from 'apps/seller-ui/src/shared/components/DeleteDiscountModal';
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance';
import { AxiosError } from 'axios';
import { ChevronRight, Plus, Trash, X } from 'lucide-react'
import Link from 'next/link';
import Input from 'packages/components/input';
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form';
import toast from 'react-hot-toast'

const page = () => {

    const [showModal, setShowModal] = useState(false); 
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState<any>();

    const queyClient = useQueryClient();

    const {data: discountCodes = [], isLoading} = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async() => {
            const res = await axiosInstance.get("/product/api/get-discount-codes")
            return res?.data?.discount_codes || [];
        }
    })

    const {register, handleSubmit, control, reset, formState: {errors}} = useForm({
        defaultValues: {
            public_name: "",
            discountType: "percentage",
            discountValue: "",
            discountCode: "",
        }
    })

    const createDiscountCodeMutation = useMutation({
        mutationFn: async(data) => {
            await axiosInstance.post("/product/api/create-discount-code", data)
        },
        onSuccess: () => {
            queyClient.invalidateQueries({ queryKey: ["shop-discounts"] });
            // this forces to refetch the updated discount data where this new ly added discount code is present
            reset();    
            setShowModal(false);
        }
    })

    const deleteDiscountCodeMutation = useMutation({
        mutationFn: async(discountId) => {
            await axiosInstance.delete(`/product/api/delete-discount-code/${discountId}`)
        },
        onSuccess: () => {
            queyClient.invalidateQueries({ queryKey: ["shop-discounts"] })
            setShowDeleteModal(false);
        }
    })

    const handleDeleteClick = async(discount:any) => {
        setSelectedDiscount(discount);
        setShowDeleteModal(true);
    }

    const onSubmit = (data: any) => {
        if(discountCodes.length >= 8){
            toast.error("You can only create upto 8 discount codes.")
            return;
        }
        createDiscountCodeMutation.mutate(data)
    }

  return (
    <div className='w-full min-h-screen p-8'>
        <div className='flex justify-between items-center mb-1'>
            <h2 className='text-2xl text-white font-semibold'>
                Discount Codes
            </h2>
            <button onClick={() => setShowModal(true)} className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
                <Plus size={18}/> Create Discount Code
            </button>
        </div>

        {/* breadcrumbs */}
        <div className='flex items-center text-white'>
            <Link href={"/dashboard"} className='text-[#80DEEA] cursor-pointer'>Dashboard</Link>
            <ChevronRight className='opacity-[0.8]' size={20}/>
            <span>Discount Codes</span>
        </div>

        {/* list of discount codes */}
        <div className='mt-8 bg-gray-900 p-6 rounded-lg drop-shadow-lg'>
            <h3 className='text-lg font-semibold text-white mb-4'>
                Your Discount Codes 
            </h3>
            {isLoading ? (
                <p className='text-gray-400 text-center'>
                    Loading discounts...
                </p>
            ) : (
                <table className='w-full text-white'>
                    <thead>
                        <tr className='border-b border-gray-800'>
                            <th className='p-3 text-left'>Title</th>
                            <th className='p-3 text-left'>Type</th>
                            <th className='p-3 text-left'>Value</th>
                            <th className='p-3 text-left'>Code</th>
                            <th className='p-3 text-left'>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {discountCodes.map((discount:any) => (
                            <tr key={discount?.id} className='border-b border-gray-800 hover:bg-gray-800 transition'>
                                <td className='p-3'>{discount.public_name}</td>
                                <td className='p-3 capitalize'>
                                    {discount.discountType === "percentage" ? "Percentage (%)" : "Flat (₹)"}
                                </td>
                                <td className='p-3'>
                                    {discount.discountValue}
                                </td>
                                <td className='p-3'>{discount.discountCode}</td>
                                <td className='p-3'>
                                    <button onClick={() => handleDeleteClick(discount)} className='text-red-400 hover:text-red-300 transition'>
                                        <Trash size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {!isLoading && discountCodes?.length === 0 && (
                <p className='text-gray-400 w-full block pt-4 text-center'>
                    No Discount Codes available
                </p>
            )}
        </div>

        {/* create discount modal */}
        {showModal && (
            <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'>
                <div className='bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg'>
                    <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                        <h3 className='text-xl text-white'>Create Discount Code</h3>
                        <button onClick={() => setShowModal(false)} className='text-gray-400 hover:text-white'>
                            <X size={22}/>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className='mt-4'>
                        {/* title*/}
                        <Input 
                            label='Title (Public Name)'
                            {...register("public_name", {required: "Title is required"})}
                        />
                        {errors.public_name && (
                            <p className='text-red-500 text-xs mt-1'>
                                {errors.public_name.message as string}
                            </p>
                        )}

                        {/* discount type */}
                        <div className='mt-4'>
                            <label className='block font-semibold text-gray-300 mb-1'>
                                Discount Type
                            </label>
                            <Controller
                                control={control}
                                name='discountType'
                                render={({ field }) => (
                                    <select {...field} className='w-full border outline-none border-gray-700 bg-transparent text-gray-200'>
                                        <option value="percentage" className='text-black'>Percentage (%)</option>
                                        <option value="flat" className='text-black'>Flat Amount (₹)</option>
                                    </select>
                                )}
                            />
                        </div>

                        {/* discount value */}
                        <div className='mt-4'>
                            <Input 
                                label='Discount Value'
                                type='number'
                                min={1}
                                {...register("discountValue", {
                                    required: "Discount value is required", 
                                })}
                            />
                        </div>

                        {/* discount code */}
                        <div className='mt-4'>
                            <Input 
                                label='Discount Code'
                                {...register("discountCode", {
                                    required: "Discount Code is required", 
                                })}
                            />
                        </div>

                        <button 
                            type='submit' 
                            className='mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-semibold flex items-center justify-center gap-2'
                            disabled={createDiscountCodeMutation.isPending}
                        >
                            <Plus size={18} /> {createDiscountCodeMutation.isPending ? "Creating..." : "Create"}
                        </button>
                        {createDiscountCodeMutation.error && (
                            <p className='text-red-500 text-xs mt-1'>
                                {(createDiscountCodeMutation.error as AxiosError<{message: string}>)?.response?.data?.message || "Something went wrong"}
                            </p>
                        )}
                    </form>
                </div>
            </div>
        )}

        {/* delete discount modal*/}
        {showDeleteModal && selectedDiscount && (
            <DeleteDiscountModal 
                discount={selectedDiscount} 
                onClose={() => setShowDeleteModal(false) } 
                onConfirm={() => deleteDiscountCodeMutation.mutate(selectedDiscount?.id)}
            />
        )}
    </div>
  )
}

export default page