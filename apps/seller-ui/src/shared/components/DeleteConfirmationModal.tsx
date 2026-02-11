import { X } from 'lucide-react'
import React from 'react'

const DeleteConfirmationModal = ({product, onClose, onConfirm, onRestore}:any) => {
  return (
    <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex items-center justify-center'>
        <div className='bg-gray-800 p-6 rounded-lg w-[450px] shadow-lg'>
            {/* header */}
            <div className='flex justify-between items-center border-b border-gray-700 pb-3'>
                <h3 className='text-xl text-white'>Delete Product</h3>
                <button className='text-gray-400 hover:text-white' onClick={onClose}>
                    <X size={22} />
                </button>
            </div>

            {/* warning message */}
            <p className='text-gray-300 mt-4'>
                Are you sure you want to delete{" "}
                <span className='font-semibold text-white'>{product.title}</span>
                ?
                <br/>
                This product will be moved to **delete state** and permanently
                removed **after 24 hours**. You can recover it within this time. 
            </p>

            {/* action buttons */}
            <div className='flex justify-end gap-3 mt-6'>
                <button className='bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-md text-white transition' onClick={onClose}>
                    Cancel
                </button>
                <button 
                    onClick={!product?.isDeleted ? onConfirm : onRestore} 
                    className={`${product?.isDeleted ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} p-4 py-2 rounded-md text-white font-semibold transition`}
                >
                    {product?.isDeleted ? "Restore" : "Delete"}
                </button>
            </div>
        </div>
    </div>
  )
}

export default DeleteConfirmationModal