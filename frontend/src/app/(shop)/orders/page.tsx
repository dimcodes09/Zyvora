"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrders } from "@/services/order.service";
import { Order } from "@/types";

const statusStyles: Record<
  "pending" | "paid" | "shipped" | "delivered" | "cancelled",
  string
> = {
  pending: "bg-yellow-100 text-yellow-700",
  paid: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOrders()
      .then(setOrders)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="p-6 text-sm text-gray-500">Loading orders...</p>;

  if (error)
    return <p className="p-6 text-sm text-red-500">Failed to load orders.</p>;

  if (orders.length === 0)
    return (
      <main className="p-6 text-center">
        <p className="text-gray-500 mb-3">No orders yet.</p>
        <Link href="/products" className="text-sm underline">
          Start Shopping
        </Link>
      </main>
    );

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

      <div className="space-y-3">
        {orders.map((order) => (
          <Link
            key={order._id}
            href={`/orders/${order._id}`}
            className="flex items-center justify-between border rounded-lg px-4 py-3 hover:shadow-sm"
          >
            <div>
              <p className="text-xs text-gray-400 font-mono">
                #{order._id.slice(-8).toUpperCase()}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold">
                ₹{order.totalPrice.toLocaleString()}
              </span>

              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  statusStyles[order.status]
                }`}
              >
                {order.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}