'use client';

import React, { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender
} from "@tanstack/react-table";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import Link from "next/link";
import { ChevronRight } from "lucide-react";



/* ---------------- FETCH ADMINS ---------------- */

const fetchAdmins = async () => {
  const res = await axiosInstance.get("/admin/api/get-all-admins");
  return res.data.admins;
};



/* ---------------- ADD ADMIN MODAL ---------------- */

const AddAdminModal = ({
  open,
  onClose,
  onSubmit,
  loading
}: any) => {

  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-6">

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold text-lg">
            Add New Admin
          </h3>

          <button onClick={onClose} className="text-gray-400">✕</button>
        </div>

        {/* EMAIL */}

        <div className="mb-4">
          <label className="text-sm text-gray-400">Email</label>

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full bg-gray-800 border border-gray-700 p-2 rounded-md text-white"
          />
        </div>


        {/* ROLE */}

        <div className="mb-6">
          <label className="text-sm text-gray-400">Role</label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="mt-1 w-full bg-gray-800 border border-gray-700 rounded-md p-2 text-white"
          >
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>


        {/* ACTIONS */}

        <div className="flex gap-3 justify-end">

          <button
            onClick={onClose}
            className="px-4 py-2 w-full rounded-md bg-gray-700 text-white"
          >
            Cancel
          </button>

          <button
            onClick={() => onSubmit(email, role)}
            className="px-4 py-2 w-full rounded-md bg-blue-600 hover:bg-blue-700 text-white"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Admin"}
          </button>

        </div>

      </div>
    </div>
  );
};



/* ---------------- MAIN PAGE ---------------- */

const ManagementPage = () => {

  const [modalOpen, setModalOpen] = useState(false);

  const queryClient = useQueryClient();



  /* FETCH ADMINS */

  const { data: admins = [], isLoading } = useQuery({
    queryKey: ["admins"],
    queryFn: fetchAdmins
  });



  /* ADD ADMIN MUTATION */

  const addAdminMutation = useMutation({

    mutationFn: async ({ email, role }: any) => {
      const res = await axiosInstance.put(
        "/admin/api/add-new-admin",
        { email, role }
      );
      return res.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
      setModalOpen(false);
    }

  });



  /* TABLE */

  const columns = [

    {
      accessorKey: "name",
      header: "Name"
    },

    {
      accessorKey: "email",
      header: "Email"
    },

    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }: any) => (
        <span className="text-blue-400 font-medium">
          {row.original.role}
        </span>
      )
    }

  ];



  const table = useReactTable({
    data: admins,
    columns,
    getCoreRowModel: getCoreRowModel()
  });



  return (
    <div className="w-full min-h-screen p-8">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-2">

        <h2 className="text-2xl text-white font-semibold">
          Team Management
        </h2>

        <button
          onClick={() => setModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Add Admin
        </button>

      </div>



      {/* BREADCRUMB */}

      <div className="flex items-center mb-6">

        <Link href="/dashboard" className="text-blue-400">
          Dashboard
        </Link>

        <ChevronRight size={18} className="text-gray-400" />

        <span className="text-white">
          Team Management
        </span>

      </div>



      {/* TABLE */}

      <div className="bg-gray-900 rounded-lg p-4">

        {isLoading ? (
          <p className="text-white text-center">
            Loading admins...
          </p>
        ) : (

          <table className="w-full text-white">

            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b border-gray-800">

                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      className="p-3 text-left text-sm text-gray-300"
                    >
                      {flexRender(
                        h.column.columnDef.header,
                        h.getContext()
                      )}
                    </th>
                  ))}

                </tr>
              ))}
            </thead>



            <tbody>

              {table.getRowModel().rows.map(row => (

                <tr
                  key={row.id}
                  className="border-b border-gray-800 hover:bg-gray-800"
                >

                  {row.getVisibleCells().map(cell => (

                    <td key={cell.id} className="p-3 text-sm">

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



      {/* MODAL */}

      <AddAdminModal
        open={modalOpen}
        loading={addAdminMutation.isPending}
        onClose={() => setModalOpen(false)}
        onSubmit={(email: string, role: string) =>
          addAdminMutation.mutate({ email, role })
        }
      />

    </div>
  );
};

export default ManagementPage;