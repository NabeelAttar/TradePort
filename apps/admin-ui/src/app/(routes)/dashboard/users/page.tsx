'use client';

import React, { useMemo, useState, useDeferredValue } from "react";
import {
    useReactTable,
    getCoreRowModel,
    flexRender
} from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import Link from "next/link";
import { Search, ChevronRight, UserX, XCircle } from "lucide-react";


// fetcher
const fetchUsers = async (page = 1, limit = 20) => {
    const res = await axiosInstance.get(`/admin/api/get-all-users?page=${page}&limit=${limit}`);
    return res.data; // { success, data, meta }
};

const BanConfirmationModal: React.FC<{
    open: boolean;
    user?: any;
    loading?: boolean;
    onClose: () => void;
    onConfirm: () => void;
}> = ({ open, user, loading, onClose, onConfirm }) => {
    if (!open) return null;
    return (
        // simple centered modal
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60" onClick={onClose} />
            <div className="relative z-10 w-full max-w-md bg-gray-900 border border-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3 text-white">Ban User</h3>
                <p className="text-sm text-gray-300 mb-4">
                    <span className="text-yellow-300 font-medium">⚠ Important:</span>{" "}
                    Are you sure you want to ban{" "}
                    <span className="text-red-400 font-semibold">{user?.name || "this user"}</span>?
                    <br />
                    This action cannot be reverted later.
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded bg-gray-800 border border-gray-700 text-gray-200"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? "Working..." : <><XCircle size={16} /> Confirm Ban</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const AdminUsersPage: React.FC = () => {
    const [page, setPage] = useState(1);
    const [limit] = useState(20);
    const [globalFilter, setGlobalFilter] = useState("");
    const deferredFilter = useDeferredValue(globalFilter);

    const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "user">("all");
    const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ["all-users", page, limit],
        queryFn: () => fetchUsers(page, limit),
        placeholderData: (prev) => prev,
        staleTime: 1000 * 30,
    });

    const allUsers: any[] = data?.data || [];

    const users = useMemo(() => {
        let result = allUsers;

        // role filter
        if (roleFilter !== "all") {
            result = result.filter((u: any) => u.role.toLowerCase() === roleFilter);
        }

        // search filter
        if (deferredFilter) {
            const search = deferredFilter.toLowerCase();

            result = result.filter((u: any) =>
                u.name?.toLowerCase().includes(search) ||
                u.email?.toLowerCase().includes(search)
            );
        }

        return result;
    }, [allUsers, roleFilter, deferredFilter]);

    const meta = data?.meta;

    // ban user mutation
    const banMutation = useMutation({
        mutationFn: async (userId: string) => {
            const res = await axiosInstance.put(`/admin/api/ban-user/${userId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["all-users"] });
            setIsModalOpen(false);
            setSelectedUser(null);
        }
    });

    const columns = useMemo(() => [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }: any) => (
                <div className="flex items-center gap-3">
                    {/* no avatar in API - placeholder circle */}
                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-sm text-gray-300">
                        {row.original.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                        <div className="text-sm text-white font-medium">{row.original.name}</div>
                    </div>
                </div>
            )
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }: any) => (
                <div className="text-sm text-gray-300">{row.original.email}</div>
            )
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }: any) => (
                <div className={`text-sm font-medium ${row.original.role === "admin" ? "text-blue-400" : "text-white"}`}>
                    {String(row.original.role).toUpperCase()}
                </div>
            )
        },
        {
            accessorKey: "createdAt",
            header: "Joined",
            cell: ({ row }: any) => (
                <div className="text-sm text-gray-300">{new Date(row.original.createdAt).toLocaleDateString()}</div>
            )
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }: any) => {
                const u = row.original;

                const isAdmin = u.role === "admin";
                const isBanned = u.isBanned;

                if (isBanned) {
                    return (
                        <span className="text-red-500 text-xs font-semibold">
                            BANNED
                        </span>
                    );
                }

                return (
                    <div className="flex items-center gap-3">
                        <button
                            title={isAdmin ? "Cannot ban admin" : "Ban user"}
                            onClick={() => {
                                if (isAdmin) return;
                                setSelectedUser(u);
                                setIsModalOpen(true);
                            }}
                            className={`p-2 rounded ${isAdmin ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-800"
                                }`}
                        >
                            <UserX size={18} className={isAdmin ? "text-gray-600" : "text-red-400"} />
                        </button>
                    </div>
                );
            }
        }
    ], []);

    // prepare table (client-side filtering using deferredFilter)
    const table = useReactTable({
        data: users,
        columns,
        getCoreRowModel: getCoreRowModel(),
        autoResetPageIndex: true
    });

    const handleConfirmBan = async () => {
        if (!selectedUser) return;
        await banMutation.mutateAsync(selectedUser.id);
    };

    return (
        <div className="w-full min-h-screen p-8">
            {/* header */}
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl text-white font-semibold">All Users</h2>
                <div className="flex items-center gap-3">
                    {/* Export CSV placeholder (optional) */}
                    <button
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded"
                        onClick={() => {
                            // optional: export current page only using client side logic (or call server export)
                            const exportPageUsers = users.map(u => ({
                                name: u.name,
                                email: u.email,
                                role: u.role,
                                joined: new Date(u.createdAt).toLocaleDateString()
                            }));
                            // simple CSV download for current page
                            const escape = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
                            const header = ["Name", "Email", "Role", "Joined"];
                            const csv = [header, ...exportPageUsers.map(r => [r.name, r.email, r.role, r.joined].map(escape))]
                                .map(row => row.join(","))
                                .join("\n");
                            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `users-page-${page}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        Export CSV
                    </button>

                    {/* role filter dropdown placeholder */}
                    <div
                        className="relative"
                    >
                        <button
                            onClick={() => setRoleDropdownOpen((p) => !p)}
                            className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm text-gray-300"
                        >   
                            {roleFilter === "all"
                                ? "All Roles"
                                : roleFilter === "admin"
                                    ? "Admins"
                                    : "Users"}
                        </button>

                        {roleDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-gray-900 border border-gray-800 rounded shadow-lg z-20">
                                <button
                                    onClick={() => {
                                        setRoleFilter("all");
                                        setRoleDropdownOpen(false);
                                    }}
                                    className="block w-full text-gray-300 text-left px-3 py-2 text-sm hover:bg-gray-800"
                                >
                                    All Roles
                                </button>

                                <button
                                    onClick={() => {
                                        setRoleFilter("admin");
                                        setRoleDropdownOpen(false);
                                    }}
                                    className="block w-full text-gray-300 text-left px-3 py-2 text-sm hover:bg-gray-800"
                                >
                                    Admin
                                </button>

                                <button
                                    onClick={() => {
                                        setRoleFilter("user");
                                        setRoleDropdownOpen(false);
                                    }}
                                    className="block w-full text-gray-300 text-left px-3 py-2 text-sm hover:bg-gray-800"
                                >
                                    User
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* breadcrumbs */}
            <div className="flex items-center mb-4">
                <Link href="/dashboard" className="text-blue-400">Dashboard</Link>
                <ChevronRight className="text-gray-400" size={18} />
                <span className="text-white">All Users</span>
            </div>

            {/* search */}
            <div className="mb-4 flex items-center bg-gray-900 p-2 rounded-md">
                <Search size={18} className="text-gray-400 mr-2" />
                <input
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-full bg-transparent text-white outline-none"
                    placeholder="Search users..."
                />
            </div>

            {/* table */}
            <div className="overflow-x-auto bg-gray-900 rounded-lg p-4">
                {isLoading || isFetching ? (
                    <p className="text-white text-center">Loading users...</p>
                ) : users.length === 0 ? (
                    <p className="text-center text-gray-400">No users found.</p>
                ) : (
                    <>
                        <table key={roleFilter + deferredFilter} className="w-full text-white">
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

                        {/* pagination */}
                        <div className="flex items-center justify-between mt-4 text-white">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="bg-blue-600 disabled:opacity-50 px-4 py-2 rounded"
                            >
                                Previous
                            </button>

                            <span>Page {meta?.currentPage || page} of {meta?.totalPages || 1}</span>

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

            {/* Ban modal */}
            <BanConfirmationModal
                open={isModalOpen}
                user={selectedUser || undefined}
                loading={banMutation.isPending}
                onClose={() => { if (!banMutation.isPending) { setIsModalOpen(false); setSelectedUser(null); } }}
                onConfirm={handleConfirmBan}
            />
        </div >
    );
};

export default AdminUsersPage;