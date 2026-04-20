import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/products/${product._id}`} className="group block border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative w-full h-48 bg-gray-100">
  <Image
    src={product.images?.[0] ?? "/placeholder.png"}
    alt={product.name || "Product"}
    fill
    className="object-cover"
  />
</div>
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-900 truncate">{product.name}</h3>
        <p className="mt-1 text-sm font-semibold text-gray-700">₹{product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}