'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axiosInstance from '../../utils/axiosInstance'

const ChangePassword = () => {
    const {register, handleSubmit, watch, reset, formState: {errors, isSubmitting}} = useForm()
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")

    const onSubmit = async (data: any) => {
        setError("")
        setMessage("")
        try {
            await axiosInstance.post("/api/change-password", {
                currentPassword: data.currentPassword,
                newPassword: data.newPassword,
                confirmPassword: data?.confirmPassword
            })
            setMessage("Password updated successfully.")
            reset()
        } catch (error:any) {
            setError(error?.response?.data?.message)
        }
    }

  return (
    <div className='max-w-md mx-auto space-y-6'>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
            <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                    Current Password
                </label> 
                <input 
                    type="password"
                    {...register("currentPassword", {
                        required: "Curent Password is required",
                        minLength: {
                            value: 8,
                            message: "Must be at least 8 characters"
                        },
                        validate: {
                            hasLower: (value) => 
                                /[a-z]/.test(value) || "must include a lowercase letter",
                            hasUpper: (value) => 
                                /[A-Z]/.test(value) || "must include a uppercase letter",
                            hasNumber: (value) => 
                                /\d/.test(value) || "must include a number",
                        }
                    })}
                    className='form-input px-2 py-1 border border-gray-400 rounded-md w-full'
                    placeholder='Enter current password'
                />
                {errors.currentPassword?.message && (
                    <p className='text-red-500 text-xs mt-1'>{String(errors.currentPassword.message)}</p>
                )}

            </div>
            <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                    New Password
                </label> 
                <input 
                    type="password"
                    {...register("newPassword", {
                        required: "New Password is required",
                        minLength: {
                            value: 8,
                            message: "Must be at least 8 characters"
                        },
                        validate: {
                            hasLower: (value) => 
                                /[a-z]/.test(value) || "must include a lowercase letter",
                            hasUpper: (value) => 
                                /[A-Z]/.test(value) || "must include a uppercase letter",
                            hasNumber: (value) => 
                                /\d/.test(value) || "must include a number",
                        }
                    })}
                    className='form-input px-2 py-1 border border-gray-400 rounded-md w-full'
                    placeholder='Enter new password'
                />
                {errors.newPassword?.message && (
                    <p className='text-red-500 text-xs mt-1'>{String(errors.newPassword.message)}</p>
                )}
            </div>
            <div>
                <label className='block mb-1 text-sm font-medium text-gray-700'>
                    Confirm Password
                </label> 
                <input 
                    type="password"
                    {...register("confirmPassword", {
                        required: "Confirm your password",
                        validate: (value) => 
                            value === watch("newPassword") || "Passwords do not match"
                    })}
                    className='form-input px-2 py-1 border border-gray-400 rounded-md w-full'
                    placeholder='Re-enter new password'
                />
                {errors.confirmPassword?.message && (
                    <p className='text-red-500 text-xs mt-1'>{String(errors.confirmPassword.message)}</p>
                )}
            </div>

            <button type='submit' disabled={isSubmitting} className='w-full mt-1 bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600'>
                {isSubmitting ? "Updating..." : "Update Password"}
            </button>
        </form>

        {error && (
            <p className='text-red-500 text-center text-sm'>{error}</p>
        )}
        {message && (
            <p className='text-green-500 text-center text-sm'>{message}</p>
        )}
    </div>
  )
}

export default ChangePassword