'use client'
import React, { useMemo } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
} from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/user-ui/src/utils/axiosInstance";
import Link from "next/link";

const fetchOrders = async () => {   
    const res = await axiosInstance.get("/order/api/get-user-orders");
    return res.data.orders;
};

const OrdersTable = () => {
    const { data: orders = [], isLoading } = useQuery({
        queryKey: ["user-orders"],
        queryFn: fetchOrders,
        staleTime: 1000 * 60 * 5
    });

    const columns = useMemo(
        () => [
            {
                accessorKey: "id",
                header: "Order ID",
                cell: ({ row }: any) => (
                    <span className="text-sm text-gray-700">
                        #{row.original.id.slice(-6).toUpperCase()}
                    </span>
                )
            },
            {
                accessorKey: "status",
                header: "Status",
                cell: ({ row }: any) => (
                    <span
                        className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            row.original.status === "Paid"
                                ? "bg-green-100 text-green-600"
                                : "bg-yellow-100 text-yellow-600"
                        }`}
                    >
                        {row.original.status}
                    </span>
                )
            },
            {
                accessorKey: "total",
                header: "Total (₹)",
                cell: ({ row }: any) => (
                    <span className="text-sm text-gray-700">
                        ₹{row.original.total}
                    </span>
                )
            },
            {
                accessorKey: "createdAt",
                header: "Date",
                cell: ({ row }: any) => {
                    const date = new Date(
                        row.original.createdAt
                    ).toLocaleDateString();
                    return (
                        <span className="text-sm text-gray-500">
                            {date}
                        </span>
                    );
                }
            },
            {
                header: "Actions",
                cell: ({ row }: any) => (
                    <Link
                        href={`/order/${row.original.id}`}
                        className="text-gray-500 hover:text-gray-700 transition"
                    >
                        <Eye size={18} />
                    </Link>
                )
            }
        ],
        []
    );

    const table = useReactTable({
        data: orders,
        columns,
        getCoreRowModel: getCoreRowModel()
    });

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {isLoading ? (
                <p className="text-center py-6 text-gray-500">
                    Loading Orders...
                </p>
            ) : orders.length === 0 ? (
                <p className="text-center py-10 text-gray-500">
                    No orders available yet!
                </p>
            ) : (
                <table className="w-full text-sm">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr
                                key={headerGroup.id}
                                className="border-b border-gray-200"
                            >
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className="py-3 text-left font-medium text-gray-600"
                                    >
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
                        {table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td
                                        key={cell.id}
                                        className="py-4 text-gray-700"
                                    >
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
            )}
        </div>
    );
};

export default OrdersTable;