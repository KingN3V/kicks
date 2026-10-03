import ProductCard from "@/components/ProductCard";
import { getProducts } from "@/lib/api";

export default async function Home() {
  const { items, total } = await getProducts();

  return (
    <main className="mx-auto max-w-5xl p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Kicks JJ</h1>
        <p className="text-sm text-gray-500">{total} shoes</p>
      </header>

      {items.length === 0 ? (
        <p className="py-12 text-center text-gray-500">No shoes yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}