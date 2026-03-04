'use client';

import React, { useMemo, useState, useDeferredValue } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import Link from "next/link";
import { Search, ChevronRight } from "lucide-react";


const fetchSellers = async (page = 1, limit = 20) => {
  const res = await axiosInstance.get(`/admin/api/get-all-sellers?page=${page}&limit=${limit}`);
  return res.data;
};


const AdminSellersPage: React.FC = () => {

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [globalFilter, setGlobalFilter] = useState("");

  const deferredFilter = useDeferredValue(globalFilter);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["all-sellers", page, limit],
    queryFn: () => fetchSellers(page, limit),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 30,
  });

  const allSellers = data?.data || [];
  const meta = data?.meta;

  const sellers = useMemo(() => {

    let result = allSellers;

    if (deferredFilter) {

      const search = deferredFilter.toLowerCase();

      result = result.filter((s: any) =>
        s.name?.toLowerCase().includes(search) ||
        s.email?.toLowerCase().includes(search) ||
        s.shop?.name?.toLowerCase().includes(search)
      );

    }

    return result;

  }, [allSellers, deferredFilter]);


  const columns = useMemo(() => [

    {
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }: any) => {

        const avatar = row.original.shop?.avatar?.url;

        return (
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-800 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs text-gray-400">N</span>
            )}
          </div>
        );
      }
    },

    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }: any) => (
        <span className="text-white text-sm">
          {row.original.name}
        </span>
      )
    },

    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: any) => (
        <span className="text-gray-300 text-sm">
          {row.original.email}
        </span>
      )
    },

    {
      accessorKey: "shop",
      header: "Shop Name",
      cell: ({ row }: any) => {
        const shop = row.original.shop;

        if (!shop) return <span>-</span>;
        return (
            <Link
              href={`${process.env.NEXT_PUBLIC_USER_UI_LINK}/shops/${shop.id}`}
              className="text-blue-400 hover:underline text-sm"
            >
              {shop.name}
            </Link>
        )
      }
    },

    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }: any) => (
        <span className="text-gray-300 text-sm">
          {row.original.shop?.address || "-"}
        </span>
      )
    },

    {
      accessorKey: "createdAt",
      header: "Joined",
      cell: ({ row }: any) => (
        <span className="text-gray-300 text-sm">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      )
    }

  ], []);


  const table = useReactTable({
    data: sellers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });


  return (

    <div className="w-full min-h-screen p-8">

      {/* Header */}

      <div className="flex items-center justify-between mb-2">

        <h2 className="text-2xl text-white font-semibold">
          All Sellers
        </h2>

        <button
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
          onClick={() => {

            const exportData = sellers.map((s: any) => ({
              name: s.name,
              email: s.email,
              shop: s.shop?.name,
              address: s.shop?.address,
              joined: new Date(s.createdAt).toLocaleDateString()
            }));

            const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;

            const header = ["Name","Email","Shop","Address","Joined"];

            const csv = [header, ...exportData.map((r: any) =>
              [r.name, r.email, r.shop, r.address, r.joined].map(escape)
            )]
              .map(row => row.join(","))
              .join("\n");

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");

            a.href = url;
            a.download = `sellers-page-${page}.csv`;
            a.click();

            URL.revokeObjectURL(url);

          }}
        >
          Export CSV
        </button>

      </div>


      {/* Breadcrumb */}

      <div className="flex items-center mb-4">

        <Link href="/dashboard" className="text-blue-400">
          Dashboard
        </Link>

        <ChevronRight className="text-gray-400" size={18} />

        <span className="text-white">
          All Sellers
        </span>

      </div>


      {/* Search */}

      <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md">

        <Search size={18} className="text-gray-400 mr-2" />

        <input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="w-full bg-transparent text-white outline-none"
          placeholder="Search sellers..."
        />

      </div>


      {/* Table */}

      <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">

        {isLoading || isFetching ? (

          <p className="text-white text-center">
            Loading sellers...
          </p>

        ) : sellers.length === 0 ? (

          <p className="text-center text-gray-400">
            No sellers found.
          </p>

        ) : (

          <>
            <table className="w-full text-white">

              <thead>

                {table.getHeaderGroups().map(hg => (

                  <tr key={hg.id} className="border-b border-gray-800">

                    {hg.headers.map(h => (

                      <th key={h.id} className="p-3 text-left text-sm text-gray-300">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                      </th>

                    ))}

                  </tr>

                ))}

              </thead>

              <tbody>

                {table.getRowModel().rows.map(row => (

                  <tr key={row.id} className="border-b border-gray-800 hover:bg-gray-800 transition">

                    {row.getVisibleCells().map(cell => (

                      <td key={cell.id} className="p-3 text-sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>

                    ))}

                  </tr>

                ))}

              </tbody>

            </table>


            {/* Pagination */}

            <div className="flex items-center justify-between mt-4 text-white">

              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-blue-600 disabled:opacity-50 px-4 py-2 rounded"
              >
                Previous
              </button>

              <span>
                Page {meta?.currentPage || page} of {meta?.totalPages || 1}
              </span>

              <button
                onClick={() => setPage(p => (meta && p < meta.totalPages ? p + 1 : p))}
                disabled={meta ? page === meta.totalPages : false}
                className="bg-blue-600 disabled:opacity-50 px-4 py-2 rounded"
              >
                Next
              </button>

            </div>

          </>

        )}

      </div>

    </div>

  );
};


export default AdminSellersPage;