"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById } from "@/services/order.service";
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

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    getOrderById(id)
      .then(setOrder)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <p className="p-6 text-sm text-gray-500">Loading order...</p>;

  if (error || !order) {
    return (
      <main className="p-6 text-center">
        <p className="text-red-500 mb-3">Order not found.</p>
        <button
          onClick={() => router.push("/orders")}
          className="text-sm underline"
        >
          Back to Orders
        </button>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-xs text-gray-400 font-mono">
            #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full h-fit ${
            statusStyles[order.status]
          }`}
        >
          {order.status}
        </span>
      </div>

      <div className="border rounded-lg divide-y">
        {order.items.map(({ product, quantity }) => (
          <div key={product._id} className="flex justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{product.name}</p>
              <p className="text-xs text-gray-500">
                ₹{product.price} × {quantity}
              </p>
            </div>

            <p className="text-sm font-semibold">
              ₹{(product.price * quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between">
        <span className="font-semibold">Total</span>
        <span className="text-lg font-bold">
          ₹{order.totalPrice.toLocaleString()}
        </span>
      </div>
    </main>
  );
}