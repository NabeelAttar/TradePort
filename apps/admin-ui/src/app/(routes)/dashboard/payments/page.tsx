'use client';
import React, { useMemo, useState } from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Search, Eye, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import Link from "next/link";

const fetchOrders = async () => {
    const res = await axiosInstance.get("/order/api/get-admin-orders");
    return res.data.orders;
};

// Helper to safely pick possible property names
const pick = (obj: any, keys: string[]) => {
    for (const k of keys) {
        if (obj?.[k] != null) return obj[k];
    }
    return undefined;
};

const PaymentsPage = () => {
    const [globalFilter, setGlobalFilter] = useState("");

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["sellers-orders"],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5,
    });

    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "Order ID",
                cell: ({ row }: any) => (
                    <span className="text-white text-sm truncate">
                        #{String(row.original.id ?? "").slice(-6).toUpperCase()}
                    </span>
                ),
            },
            {
                accessorKey: "shop.name",
                header: "Shop",
                cell: ({ row }: any) => (
                    <span className="text-white">
                        {row.original.shop?.name ?? "Unknown shop"}
                    </span>
                ),
            },
            {
                accessorKey: "user.name",
                header: "Buyer",
                cell: ({ row }: any) => (
                    <span className="text-white">
                        {row.original.user?.name ?? "Guest"}
                    </span>
                ),
            },
            {
                accessorKey: "adminFee",
                header: "Admin Fee (10%)",
                cell: ({ row }: any) => {
                    const val = row.original.total * 0.1
                    return <span className="text-green-400 font-medium">{val == null ? "-" : `₹${Number(val).toFixed(2)}`}</span>;
                },
            },
            {
                accessorKey: "sellerEarning",
                header: "Seller Earnings",
                cell: ({ row }: any) => {
                    const val = row.original.total * 0.9
                    return (
                        <span className="text-yellow-500 font-medium">
                            {val == null ? "-" : `₹${Number(val).toFixed(2)}`}
                        </span>
                    );
                },
            },
            {
                accessorKey: "status",
                header: "Payment Status",
                cell: ({ row }: any) => {
                    const status = row.original.status ?? row.original.paymentStatus ?? "Unknown";
                    const isPaid = String(status).toLowerCase() === "paid";
                    return (
                        <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${isPaid ? "bg-green-600 text-white" : "bg-yellow-500 text-white"
                                }`}
                        >
                            {status}
                        </span>
                    );
                },
            },
            {
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ row }: any) => {
                    const d = pick(row.original, ["createdAt", "created_at", "date"]);
                    const date = d ? new Date(d).toLocaleDateString() : "-";
                    return <span className="text-white text-sm">{date}</span>;
                },
            },
            {
                header: "Actions",
                cell: ({ row }: any) => (
                    <Link href={`/order/${row.original.id}`} className="text-blue-400 hover:text-blue-300 transition">
                        <Eye size={18} />
                    </Link>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    });

    return (
        <div className="w-full min-h-screen p-8">
            <h2 className="text-2xl text-white font-semibold mb-2">Payments</h2>

            {/* breadcrumbs */}
            <div className="flex items-center mb-4">
                <Link href={"/dashboard"} className="text-blue-400 cursor-pointer">Dashboard</Link>
                <ChevronRight className="text-gray-200" size={20} />
                <span className="text-white">Payments</span>
            </div>

            {/* search bar */}
            <div className="my-4 flex items-center bg-gray-900 p-2 rounded-md flex-1">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    type="text"
                    placeholder="Search payments..."
                    className="w-full bg-transparent text-white outline-none"
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            {/* table */}
            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
                {isLoading ? (
                    <p className="text-center text-white">Loading Payments...</p>
                ) : (
                    <table className="w-full text-white">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr className="border-b border-gray-800" key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="p-3 text-left text-sm">
                                            {flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.map((row) => (
                                <tr className="border-b border-gray-800 hover:bg-gray-900 transition" key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <td className="p-3 text-sm" key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* no results */}
                {!isLoading && orders.length === 0 && (
                    <p className="text-center py-3 text-white">No Payments Found!</p>
                )}
            </div>
        </div>
    );
};

export default PaymentsPage;