import { notFound } from "next/navigation";
import { getOrderById } from "@/services/order.service";

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

export default async function OrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let order;

  try {
    order = await getOrderById(params.id);
  } catch {
    return notFound();
  }

  if (!order) return notFound();

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Order Details</h1>
          <p className="text-xs text-gray-400 font-mono">
            #{order._id.slice(-8).toUpperCase()}
          </p>
        </div>

        <span className={`text-xs px-3 py-1 rounded-full ${statusStyles[order.status]}`}>
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