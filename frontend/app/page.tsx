import Filters, { type CurrentFilters } from "@/components/Filters";
import ProductCard from "@/components/ProductCard";
import { getFilters, getProducts, type ProductQuery } from "@/lib/api";

// In recent Next.js versions searchParams is a Promise, like params.
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

// A query value can be a string, an array (?a=1&a=2) or missing.
// We want one string, and "" counts as missing.
function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "" ? undefined : v;
}

// Prices must be whole numbers >= 0, or the API would answer 422.
function toPrice(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const n = Number(value);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const current: CurrentFilters = {
    brand: first(sp.brand),
    category: first(sp.category),
    size: first(sp.size),
    min_price: first(sp.min_price),
    max_price: first(sp.max_price),
  };

  const query: ProductQuery = {
    brand: current.brand,
    category: current.category,
    size: current.size,
    min_price: toPrice(current.min_price),
    max_price: toPrice(current.max_price),
  };

  // Both requests are independent, so run them at the same time
  const [{ items, total }, options] = await Promise.all([
    getProducts(query),
    getFilters(),
  ]);

  const hasFilters = Object.values(current).some((v) => !!v);
  const onlySize =
    !!current.size &&
    !current.brand &&
    !current.category &&
    !current.min_price &&
    !current.max_price;

  return (
    <main className="mx-auto w-full max-w-5xl p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold">Kicks JJ</h1>
        <p className="text-sm text-gray-500">
          {total} {total === 1 ? "shoe" : "shoes"}
        </p>
      </header>

      <Filters options={options} current={current} />

      {items.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          {!hasFilters
            ? "No shoes yet."
            : onlySize
              ? `We don't have anything in size ${current.size} right now.`
              : "No shoes match these filters."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              selectedSize={current.size}
            />
          ))}
        </div>
      )}
    </main>
  );
}