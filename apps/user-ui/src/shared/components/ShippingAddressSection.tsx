'use client'
import { MapPin, Plus, Trash2, X } from 'lucide-react'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { countries } from '../../utils/Countries'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axiosInstance from '../../utils/axiosInstance'

const ShippingAddressSection = () => {
    const [showModal, setShowModal] = useState(false)
    const queryClient = useQueryClient();

    const {register, handleSubmit, reset, formState: {errors}} = useForm({
        defaultValues: {
            label: "Home",
            name: "",
            street: "",
            city: "",
            zip: "",
            country: "India",
            isDefault: "true",
        }
    })

    const {mutate: addAddress} = useMutation({
        mutationFn: async (payload:any) => {
            const res = await axiosInstance.post("/api/add-address", payload)
            return res.data.address
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["shipping-addresses"]})
            reset()
            setShowModal(false)
        }
    })

    const {data: addresses, isLoading} = useQuery({
        queryKey: ["shipping-addresses"],
        queryFn: async () => {
            const res = await axiosInstance.get("/api/shipping-addresses")
            return res.data.addresses
        }
    })

    const onsubmit = async (data:any) => {
        addAddress({
            ...data,
            isDefault: data?.isDefault === "true"
        })
    }
    
    const {mutate: deleteAddress} = useMutation({
        mutationFn: async (id:string) => {
            await axiosInstance.delete(`/api/delete-address/${id}`)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey : ["shipping-addresses"]})
        }
    })

    return (
        <div className='space-y-4'>
            {/* header */}
            <div className='flex justify-between items-center'>
                <h2 className='text-lg font-semibold text-gray-800 '>Saved Address</h2>
                <button className='flex items-center gap-1 text-sm text-blue-600 font-medium hover:underline' onClick={() => setShowModal(true)}>
                    <Plus className='w-4 h-4 ' /> Add New Address
                </button>
            </div>

            {/* address list */}
            <div>
                {isLoading ? (
                    <p className='text-sm text-gray-500 '>
                        Loading Addresses...
                    </p>
                ) : !addresses || addresses.length === 0 ? (
                    <p className='text-sm text-gray-500 '>No saved addresses found</p>
                ) : (
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                        {addresses.map((address:any) => (
                            <div key={address.id} className='border border-gray-200 rounded-md p-4 relative'>
                                {address.isDefault && (
                                    <span className='absolute top-2 right-2 bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full'>
                                        Default 
                                    </span>
                                )}
                                <div className='flex items-start gap-2 text-sm text-gray-700 '>
                                    <MapPin className='w-20 h-10 mt-0.5 text-gray-500' />
                                    <div>
                                        <p className='font-medium'>
                                            {address.label} - {address.name}
                                        </p>
                                        <p>
                                            {address.street}, {address.city}, {address.zip}, {" "}
                                            {address.country}  
                                        </p>
                                    </div>
                                </div>
                                <div className='flex gap-3 mt-4'>
                                    <button className='flex items-center gap-1 !cursor-pointer text-xs text-red-500 hover:underline' onClick={() => deleteAddress(address.id)}>
                                        <Trash2 className='w-4 h-4 ' /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* modal  */}
            {showModal && (
                <div className='fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50'>
                    <div className='bg-white w-full max-w-md p-6 rounded-md shadow-md relative '>
                        <button className='absolute top-3 right-3 text-gray-500 hover:text-gray-800' >
                            <X className='w-5 h-5' onClick={() => setShowModal(false)}/>
                        </button>
                        <h3 className='text-lg font-semibold mb-4 text-gray-800 '>Add New Address </h3>

                        <form onSubmit={handleSubmit(onsubmit)} className='space-y-3'>
                            <select {...register("label")} className='form-input w-full p-1.5 border border-gray-400 rounded-md'>
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>

                            <input placeholder='Name' {...register("name", { required: "Name is required"})} className='form-input w-full p-1.5 border border-gray-400 rounded-md' />
                            {errors.name && (
                                <p className='text-red-500 text-xs'>{errors.name.message}</p>
                            )}

                            <input placeholder='Street' {...register("street", { required: "Street is required"})} className='form-input w-full p-1.5 border border-gray-400 rounded-md' />
                            {errors.street && (
                                <p className='text-red-500 text-xs'>{errors.street.message}</p>
                            )}

                            <input placeholder='City' {...register("city", { required: "City is required"})} className='form-input w-full p-1.5 border border-gray-400 rounded-md' />
                            {errors.city && (
                                <p className='text-red-500 text-xs'>{errors.city.message}</p>
                            )}

                            <input placeholder='ZIP code' {...register("zip", { required: "ZIP Code is required"})} className='form-input w-full p-1.5 border border-gray-400 rounded-md' />
                            {errors.zip && (
                                <p className='text-red-500 text-xs'>{errors.zip.message}</p>
                            )}

                            <select {...register("country")} className='form-input w-full h-8 border border-gray-400 rounded-md'>
                                {countries.map((country) => (
                                    <option value="country" key={country}>{country}</option>
                                ))}
                            </select>

                            <select {...register("isDefault")} className='form-input w-full h-8 border border-gray-400 rounded-md' >
                                <option value="true">Set as Default</option>
                                <option value="false">Not Default</option>
                            </select>

                            <button className='w-full bg-blue-600 text-white text-sm py-2 rounded-md hover:bg-blue-700 transition' type='submit'> 
                                Save Address
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShippingAddressSection