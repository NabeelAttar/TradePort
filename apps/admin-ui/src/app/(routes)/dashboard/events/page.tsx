'use client'

import React, { useMemo, useState, useDeferredValue } from 'react'
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance'
import Image from 'next/image'
import Link from 'next/link'
import { saveAs } from "file-saver";
import {
    ChevronRight,
    Search,
    Download
} from 'lucide-react'

const fetchProducts = async (page: number) => {
    const res = await axiosInstance.get(`/admin/api/get-all-events?page=${page}&limit=10`)
    return res.data
}

const AdminProductsPage = () => {
    const [page, setPage] = useState(1)
    const [globalFilter, setGlobalFilter] = useState("")
    const deferredFilter = useDeferredValue(globalFilter)

    const { data, isLoading } = useQuery({
        queryKey: ["all-products", page],
        queryFn: () => fetchProducts(page),
        placeholderData: (previousData) => previousData
    })

    const products = data?.data || []
    const meta = data?.meta

    const handleExportCSV = () => {
        if (!products || products.length === 0) return;

        const escape = (val: any) =>
            `"${String(val ?? "").replace(/"/g, '""')}"`;

        const header = [
            "Title",
            "Price",
            "Stock",
            "Category",
            "Rating",
            "Shop",
            "Created"
        ];

        const rows = products.map((p: any) => [
            p.title,
            p.sale_price,
            p.stock,
            p.category,
            p.ratings,
            p.Shop?.name,
            new Date(p.createdAt).toLocaleDateString()
        ]);

        const csv =
            [header, ...rows]
                .map(row => row.map(escape).join(","))
                .join("\n");

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        saveAs(blob, "products.csv");
    };


    const columns = useMemo(() => [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }: any) => (
                <Image
                    src={row.original.images[0]?.url || "/placeholder.png"}
                    alt="product"
                    width={50}
                    height={50}
                    className='w-12 h-12 rounded-md object-cover'
                />
            )
        },
        {
            accessorKey: "title",
            header: "Title",
            cell: ({ row }: any) => (
                <Link
                    href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/product/${row.original.slug}`}
                    className='text-blue-400 hover:underline'
                >
                    {row.original.title.length > 25
                        ? row.original.title.slice(0, 25) + "..."
                        : row.original.title}
                </Link>
            )
        },
        {
            accessorKey: "sale_price",
            header: "Price",
            cell: ({ row }: any) => (
                <span>${row.original.sale_price}</span>
            )
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row }: any) => (
                <span className={row.original.stock < 10 ? "text-red-400" : "text-white"}>
                    {row.original.stock} left
                </span>
            )
        },
        {
            accessorKey: "starting_date",
            header: "Start",
            cell: ({ row }: any) => (
                <span className='text-purple-400'>
                    {row.original.starting_date}
                </span>
            )
        },
        {
            accessorKey: "ending_date",
            header: "End",
            cell: ({ row }: any) => (
                <span className='text-purple-400'>
                    {row.original.ending_date}
                </span>
            )
        },
        {
            accessorKey: "Shop.name",
            header: "Shop",
            cell: ({ row }: any) => (
                <span className='text-purple-400'>
                    {row.original.Shop?.name}
                </span>
            )
        },
    ], [])

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter: deferredFilter },
        onGlobalFilterChange: setGlobalFilter
    })

    return (
        <div className='w-full min-h-screen p-8'>
            {/* Header */}
            <div className='flex justify-between items-center mb-1'>
                <h2 className='text-2xl text-white font-semibold'>
                    All Events
                </h2>

                <button
                    onClick={handleExportCSV}
                    className='bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                >
                    <Download size={16} />
                    Export CSV
                </button>
            </div>

            {/* Breadcrumbs */}
            <div className='flex items-center mb-4'>
                <Link href={"/dashboard"} className='text-blue-400'>
                    Dashboard
                </Link>
                <ChevronRight className='text-gray-400' size={18} />
                <span className='text-white'>All Events</span>
            </div>

            {/* Search */}
            <div className='mb-4 flex items-center bg-gray-900 p-2 rounded-md'>
                <Search size={18} className='text-gray-400 mr-2' />
                <input
                    type="text"
                    placeholder='Search events...'
                    className='w-full bg-transparent text-white outline-none'
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className='overflow-x-auto bg-gray-900 rounded-lg p-4'>
                {isLoading ? (
                    <p className='text-center text-white'>Loading products...</p>
                ) : (
                    <>
                        <table className='w-full text-white'>
                            <thead>
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id} className='border-b border-gray-800'>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} className='p-3 text-left'>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className='border-b border-gray-800 hover:bg-gray-800 transition'>
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className='p-3'>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        <div className='flex justify-between items-center mt-4 text-white'>
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(prev => prev - 1)}
                                className='bg-blue-600 disabled:opacity-50 px-4 py-2 rounded'
                            >
                                Previous
                            </button>

                            <span>
                                Page {meta?.currentPage} of {meta?.totalPages}
                            </span>

                            <button
                                disabled={page === meta?.totalPages}
                                onClick={() => setPage(prev => prev + 1)}
                                className='bg-blue-600 disabled:opacity-50 px-4 py-2 rounded'
                            >
                                Next
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default AdminProductsPage