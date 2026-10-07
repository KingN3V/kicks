import Filters, { type CurrentFilters } from "@/components/Filters";
import Pagination from "@/components/Pagination";
import ProductCard from "@/components/ProductCard";
import RequestShoe from "@/components/RequestShoe";
import { getFilters, getProducts, type ProductQuery } from "@/lib/api";
import Hero from "@/components/Hero";

const PAGE_SIZE = 12; // shoes per page (the API allows up to 50)

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

// Page must be a whole number >= 1. Anything else (missing, "abc", 0) means page 1.
function toPage(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
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

  let page = toPage(first(sp.page));

  // Both requests are independent, so run them at the same time
  const [result, options] = await Promise.all([
    getProducts({ ...query, page, page_size: PAGE_SIZE }),
    getFilters(),
  ]);

  const total = result.total;
  let items = result.items;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ?page=99 on a 3-page catalog: show the last page instead of an empty one
  if (page > totalPages) {
    page = totalPages;
    items = (await getProducts({ ...query, page, page_size: PAGE_SIZE })).items;
  }

  const hasFilters = Object.values(current).some((v) => !!v);
  const onlySize =
    !!current.size &&
    !current.brand &&
    !current.category &&
    !current.min_price &&
    !current.max_price;

  // The hero only shows on the plain home page (no filters, first page).
  // It features the newest shoe that is in stock and has a photo.
  const showHero = !hasFilters && page === 1;
  const featured = items.find((p) => !p.sold_out && p.cover_image);

  return (
    <main>
      {showHero && <Hero featured={featured} />}

      {/* id="shoes" is where "Browse shoes" and the header link scroll to */}
      <div id="shoes" className="mx-auto w-full max-w-5xl scroll-mt-20 p-4">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-4xl leading-tight">Shoes</h2>
          <p className="text-sm text-muted">
            {total} {total === 1 ? "shoe" : "shoes"}
          </p>
        </div>

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
            {items.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                selectedSize={current.size}
                eager={index < 4}
              />
            ))}
          </div>
        )}

        <Pagination page={page} totalPages={totalPages} current={current} />

        <RequestShoe current={current} />
      </div>
    </main>
  );
}