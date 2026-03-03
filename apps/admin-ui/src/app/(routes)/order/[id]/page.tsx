"use client";
import React, { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";

const deliverySteps = [
    "Ordered",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
];

const AdminOrderPage = () => {
    const params = useParams();
    const orderId = params.id as string;
    const router = useRouter();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrder = async () => {
        try {
            const res = await axiosInstance.get(
                `/order/api/get-order-details/${orderId}`
            );
            setOrder(res.data.order);
        } catch (err) {
            console.error("Failed to fetch order", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderId) fetchOrder();
    }, [orderId]);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-[40vh]">
                <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
            </div>
        );
    }

    if (!order) {
        return <p className="text-center text-red-500">Order not found</p>;
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 text-gray-200">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <div
                        className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 hover:text-white"
                        onClick={() => router.push("/dashboard/orders")}
                    >
                        <ArrowLeft size={16} />
                        Back
                    </div>
                    <h1 className="text-2xl font-bold mt-2">
                        Order #{order.id.slice(-6)}
                    </h1>
                </div>
            </div>

            {/* Delivery Progress */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-xs font-medium text-gray-500 mb-2">
                    {deliverySteps.map((step, idx) => {
                        const currentIndex = deliverySteps.indexOf(order.deliveryStatus);
                        const passed = deliverySteps.indexOf(order.deliveryStatus) >= idx
                        return (
                            <div key={step} className={`flex-1 text-left ${currentIndex > deliverySteps.indexOf(order.deliveryStatus) ? "text-blue-600" : passed ? "text-green-600" : "text-gray-400"} `}>
                                {step}
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center">
                    {deliverySteps.map((step, idx) => {
                        const reached = idx <= deliverySteps.indexOf(order.deliveryStatus)
                        return (
                            <div key={step} className="flex-1 flex items-center">
                                <div
                                    className={`w-4 h-4 rounded-full ${reached
                                        ? "bg-blue-600"
                                        : "bg-gray-300"
                                    }`}
                                />
                                {idx !== deliverySteps.length - 1 && (
                                    <div className={`flex-1 h-1 ${reached ? "bg-blue-500" : "bg-gray-200"}`} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Order Info Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8 grid md:grid-cols-2 gap-6">
                <div className="space-y-2 text-sm">
                    <p>
                        <span className="text-gray-400">Payment Status:</span>{" "}
                        <span
                            className={`font-medium ${order.status === "Paid"
                                ? "text-green-400"
                                : order.status === "Failed"
                                    ? "text-red-400"
                                    : "text-yellow-400"
                                }`}
                        >
                            {order.status}
                        </span>
                    </p>
                    <p>
                        <span className="text-gray-400">Total:</span>{" "}
                        ₹{order.total.toFixed(2)}
                    </p>
                    <p>
                        <span className="text-gray-400">Date:</span>{" "}
                        {new Date(order.createdAt).toLocaleString()}
                    </p>
                    <p>
                        <span className="text-gray-400">User ID:</span>{" "}
                        {order.userId}
                    </p>
                </div>
            </div>

            {/* Items */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold mb-4">Order Items</h2>
                <div className="space-y-4">
                    {order.items.map((item: any) => (
                        <div
                            key={item.productId}
                            className="flex items-center gap-4 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition"
                        >
                            <img
                                src={item.product?.images[0]?.url || "/placeholder.png"}
                                className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div className="flex-1">
                                <p className="font-medium">
                                    {item.product?.title || "Unnamed Product"}
                                </p>
                                <p className="text-xs text-gray-400">
                                    Quantity: {item.quantity}
                                </p>
                            </div>
                            <p className="font-medium text-sm">
                                ₹{item.price.toFixed(2)}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminOrderPage;