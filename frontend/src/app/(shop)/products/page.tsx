import { getProducts } from "@/services/product.service";
import ProductCard from "@/components/product/ProductCard";

export default async function ProductsPage() {
  let products;

  try {
    products = await getProducts();
  } catch {
    return (
      <main className="p-6">
        <p className="text-red-500">Failed to load products. Please try again.</p>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      {products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}