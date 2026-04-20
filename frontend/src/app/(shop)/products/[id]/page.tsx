import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/services/product.service";
import AddToCartButton from "@/components/product/AddToCartButton";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  let product;

  try {
    product = await getProductById(params.id);
  } catch {
    return notFound();
  }

  if (!product) return notFound();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Image */}
        <div className="relative w-full md:w-1/2 h-80 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.images?.[0] || "/placeholder.png"}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col gap-3 md:w-1/2">
          <h1 className="text-2xl font-bold text-gray-900">
            {product.name}
          </h1>

          <p className="text-xl font-semibold text-gray-800">
            ₹{product.price.toLocaleString()}
          </p>

          <p className="text-sm text-gray-600 leading-relaxed">
            {product.description}
          </p>

          <p
            className={`text-sm font-medium ${
              product.stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {product.stock > 0
              ? `In Stock (${product.stock} left)`
              : "Out of Stock"}
          </p>

          <AddToCartButton
            productId={product._id}
            disabled={product.stock === 0}
          />
        </div>
      </div>
    </main>
  );
}