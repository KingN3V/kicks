import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/api";
import BuyPanel from "@/components/BuyPanel";

// Same guard as ProductCard: next/image only loads hosts listed in next.config.ts.
function isLoadable(url: string): boolean {
  return url.startsWith("https://res.cloudinary.com/");
}

// Numeric sizes in numeric order ("9" < "10" < "42.5"), anything else after
function sizeKey(size: string): [number, number, string] {
  const n = parseFloat(size);
  return Number.isNaN(n) ? [1, 0, size] : [0, n, size];
}

const SITE_URL = process.env.SITE_URL ?? "";

// Cloudinary resizes on the fly if you add a transformation after "/upload/".
// Here: crop to 1200x630 (the shape link previews use), auto quality, JPEG.
function ogImage(url: string): string {
  return url.replace("/upload/", "/upload/c_fill,w_1200,h_630,q_auto,f_jpg/");
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (product === null) return { title: "Shoe not found | Kicks JJ" };

  const price = `KES ${product.price.toLocaleString("en-KE")}`;
  const details = [product.brand, product.category].filter(Boolean).join(" · ");
  const description = [price, details, product.sold_out ? "Sold out" : null]
    .filter(Boolean)
    .join(" · ");

  // Same rule as the gallery: only Cloudinary photos
  const cover = product.images.find((img) => isLoadable(img.url));
  const title = `${product.name} | Kicks JJ`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Kicks JJ",
      url: `${SITE_URL}/products/${product.slug}`,
      images: cover
        ? [{ url: ogImage(cover.url), width: 1200, height: 630, alt: product.name }]
        : [],
    },
  };
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
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-6">
      <Link
        href="/#shoes"
        className="mb-6 inline-block text-sm text-muted hover:text-foreground"
      >
        ← All shoes
      </Link>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        {/* Gallery: swipe sideways on a phone, no JavaScript needed.
            With several photos, each is a little narrower than the screen,
            so the edge of the next one peeks out and hints at swiping. */}
        <div className="flex snap-x snap-mandatory gap-2 overflow-x-auto">
          {images.length > 0 ? (
            images.map((img, i) => (
              <div
                key={img.id}
                className="relative aspect-square w-full shrink-0 snap-center overflow-hidden rounded-sm bg-surface"
              >
                <Image
                  src={img.url}
                  alt={`${product.name} photo ${i + 1}`}
                  fill
                  sizes="(min-width: 768px) 44vw, 100vw"
                  loading={i === 0 ? "eager" : "lazy"}
                  className={`object-cover ${
                    product.sold_out ? "opacity-70 grayscale" : ""
                  }`}
                />
                {images.length > 1 && (
                  <span className="absolute bottom-3 right-3 rounded-xs bg-black/70 px-2 py-1 text-xs">
                    {i + 1} / {images.length}
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-sm bg-surface text-muted">
              No photo
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="text-sm text-muted">
              {product.brand}
              {product.category ? ` · ${product.category}` : ""}
            </p>
          )}
          <h1 className="mt-1 font-display text-4xl leading-tight md:text-5xl">
            {product.name}
          </h1>
          <p className="mt-2 text-xl">
            KES {product.price.toLocaleString("en-KE")}
          </p>

          {product.sold_out && (
            <p className="mt-3 inline-block rounded-xs bg-white px-2 py-1 text-xs font-semibold text-black">
              Sold out
            </p>
          )}

          {/* The size chips and buy buttons live in one client component.
              The env vars are server-only, so we read them here and pass them down. */}
          <BuyPanel
            name={product.name}
            pageUrl={`${SITE_URL}/products/${product.slug}`}
            soldOut={product.sold_out}
            variants={sizes}
            whatsapp={process.env.WHATSAPP_NUMBER}
            instagram={process.env.INSTAGRAM_HANDLE}
          />

          {product.description && (
            <p className="mt-8 whitespace-pre-line text-foreground/75">
              {product.description}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}