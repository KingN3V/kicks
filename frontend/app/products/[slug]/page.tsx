import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import BuyButtons from "@/components/BuyButtons";

// Same guard as ProductCard: next/image only loads hosts listed in next.config.ts.
function isLoadable(url: string): boolean {
  return url.startsWith("https://res.cloudinary.com/");
}

// Numeric sizes in numeric order ("9" < "10" < "42.5"), anything else after
function sizeKey(size: string): [number, number, string] {
  const n = parseFloat(size);
  return Number.isNaN(n) ? [1, 0, size] : [0, n, size];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // In recent Next.js versions, params is a Promise and must be awaited.
  const { slug } = await params;

  const product = await getProduct(slug);
  if (product === null) notFound(); // missing or hidden: show the 404 page

  const sizes = [...product.variants].sort((a, b) => {
    const [ga, na, sa] = sizeKey(a.size);
    const [gb, nb, sb] = sizeKey(b.size);
    return ga - gb || na - nb || sa.localeCompare(sb);
  });
  const images = product.images.filter((img) => isLoadable(img.url));

  return (
    <main className="mx-auto w-full max-w-5xl p-4">
      <Link href="/" className="mb-4 inline-block text-sm text-gray-500">
        ← All shoes
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gallery: swipe sideways on a phone, no JavaScript needed */}
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto">
          {images.length > 0 ? (
            images.map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-square w-full shrink-0 snap-center overflow-hidden rounded-lg bg-gray-100"
              >
                <Image
                  src={img.url}
                  alt={`${product.name} photo ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  loading={i === 0 ? "eager" : "lazy"}
                  className={`object-cover ${
                    product.sold_out ? "grayscale" : ""
                  }`}
                />
              </div>
            ))
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-gray-400">
              No photo
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {product.brand}
              {product.category ? ` · ${product.category}` : ""}
            </p>
          )}
          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-1 text-xl">
            KES {product.price.toLocaleString("en-KE")}
          </p>

          {product.sold_out && (
            <p className="mt-2 inline-block rounded bg-black px-2 py-1 text-xs font-medium text-white">
              Sold out
            </p>
          )}

          <h2 className="mb-2 mt-6 text-sm font-medium">Sizes</h2>
          {sizes.length === 0 ? (
            <p className="text-sm text-gray-500">No sizes listed.</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {sizes.map((v) => (
                <li
                  key={v.size}
                  className={`min-w-12 rounded border px-3 py-2 text-center text-sm ${
                    v.stock === 0 ? "text-gray-400 line-through opacity-60" : ""
                  }`}
                >
                  {v.size}
                </li>
              ))}
            </ul>
          )}
          <BuyButtons
            name={product.name}
            slug={product.slug}
            soldOut={product.sold_out}
          />
          {product.description && (
            <p className="mt-6 whitespace-pre-line text-sm text-gray-600">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}