'use client'
import React, { useMemo, useState } from 'react'
import {useReactTable, getCoreRowModel, getFilteredRowModel, flexRender} from '@tanstack/react-table'
import axiosInstance from 'apps/seller-ui/src/utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import Link from 'next/link'
import { BarChart, ChevronRight, Eye, Pencil, Plus, Search, Star, Trash } from 'lucide-react'
import DeleteConfirmationModal from 'apps/seller-ui/src/shared/components/DeleteConfirmationModal'

const fetchProducts = async() => {
    const res = await axiosInstance.get("/product/api/get-shop-products");
    return res?.data?.products;
}

const deleteProduct = async(productId:string) => {
    await axiosInstance.delete(`/product/api/delete-product/${productId}`)
}

const restoreProduct = async(productId:string) => {
    await axiosInstance.put(`/product/api/restore-product/${productId}`)
}

const ProductList = () => {
    const [globalFilter, setGlobalFilter] = useState("");
    const [analyticsData, setAnalyticsData] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>();

    const queryClient = useQueryClient();

    const {data: products =[], isLoading} = useQuery({
        queryKey: ["shop-products"],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 5,
    })

    const deleteMutation = useMutation({
        mutationFn: deleteProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-products"] })
            setShowDeleteModal(false);
        }
    })
    
    const restoreMutation = useMutation({
        mutationFn: restoreProduct,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["shop-products"] })
            setShowDeleteModal(false);
        }
    })

    const columns = useMemo(() => [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({row}:any) => (
                <Image 
                    src={row.original.images[0]?.url} 
                    alt={row.original.images[0]?.url} 
                    className='w-12 h-12 rounded-md object-cover'
                    width={200}
                    height={200}
                />)
        },
        {
            accessorKey: "name",
            header: "Product Name",
            cell: ({row}:any) => {
                const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0,25)}...` : row.original.title

                return (
                    <Link 
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                        className='text-blue-400 hover:underline'
                        title={row.original.title}
                    >
                        {truncatedTitle}
                    </Link>
                )
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({row}:any) => <span>{row.original.sale_price}</span>
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({row}:any) => <span className={row.original.stock < 10 ? "text-red-500" : "text-white"}>{row.original.stock} left</span>
        },
        {
            accessorKey: "category",
            header: "Category",
        },
        {
            accessorKey: "rating",
            header: "Rating",
            cell: ({row}:any) => (
                <div className='flex items-center gap-1 text-yellow-400'>
                    <Star size={18} fill='#fde047'/>
                    <span className='text-white'>{row.original.ratings || 5}</span>
                </div>
            )
        },
        {
            header: "Actions",
            cell: ({ row } : any) => (
                <div className='flex gap-3'>
                    <Link href={`/product/${row.original.id}`} className='text-blue-400 hover:text-blue-300 transition'>
                        <Eye size={18}/> 
                    </Link>
                    <Link className='text-yellow-400 hover:text-yellow-300 transition' href={`/product/edit/${row.original.id}`}>
                        <Pencil size={18} />
                    </Link>
                    <button type="button" className='text-green-400 hover:text-green-300 transition'>
                        <BarChart size={18} />
                    </button>
                    <button type="button" className='text-red-400 hover:text-red-300 transition' onClick={() => openDeleteModal(row.original)}>
                        <Trash size={18} />
                    </button>
                </div>
            )
        }
    ], [])

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    })

    const openDeleteModal = (product:any) => {
        setSelectedProduct(product);
        setShowDeleteModal(true)
    }

  return (
    <div className='w-full min-h-screen p-8'>
        {/* header */}
        <div className='flex justify-between items-center mb-1'>
            <h2 className='text-2xl text-white font-semibold'>
                All Products
            </h2>
            <Link href='/dashboard/create-product' className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'>
                <Plus size={18}/> Add Product
            </Link>
        </div>

        {/* breadcrumbs */}
        <div className='flex items-center mb-4'>
            <Link href={"/dashboard"} className='text-blue-400 cursor-pointer'>Dashboard</Link>
            <ChevronRight className='text-gray-200' size={20}/>
            <span className='text-white'>All Products</span>
        </div>

        {/* search bar */}
        <div className='mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1'>
            <Search size={18} className='text-gray-400 mr-2'/>
            <input 
                type="text"  
                placeholder='Search Products...'
                className='w-full bg-transparent text-white outline-none'
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
            />
        </div>

        {/* table */}
        <div className='overflow-x-auto bg-gray-900 rounded-lg p-4'>
            {isLoading ? (
                <p className='text-center text-white'>Loading Products...</p>
            ) : (
                <table className='w-full text-white'>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr className='border-b border-gray-800' key={headerGroup.id}> 
                                {headerGroup.headers.map((header) => (
                                    <th className='p-3 text-left' key={header.id}>
                                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr className='border-b border-gray-800 hover:border-gray-900 transition' key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td className='p-3' key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            {showDeleteModal && (
                <DeleteConfirmationModal
                    product={selectedProduct}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={() => deleteMutation.mutate(selectedProduct?.id)}
                    onRestore={() => restoreMutation.mutate(selectedProduct?.id)}
                />
            )}
        </div>
    </div>
  )
}

export default ProductList