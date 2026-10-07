import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/api";

// next/image only loads hosts listed in next.config.ts, so only real
// Cloudinary photos go through it. Anything else gets the placeholder.
function isLoadable(url: string | null): url is string {
  return !!url && url.startsWith("https://res.cloudinary.com/");
}

type Props = {
  product: ProductListItem;
  // Set when the size filter is active, so we can grey out shoes
  // that have the size but not in stock.
  selectedSize?: string;
  // True for the first cards on the page (above the fold): load their photo now
  eager?: boolean;
};

export default function ProductCard({ product, selectedSize, eager = false }: Props) {
  const sizeOutOfStock =
    !!selectedSize &&
    product.variants.some((v) => v.size === selectedSize && v.stock === 0);
  const unavailable = product.sold_out || sizeOutOfStock;

  return (
    // "group" lets the photo react when you hover anywhere on the card
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-square overflow-hidden rounded-sm border border-transparent bg-surface transition-colors group-hover:border-white/40">
        {isLoadable(product.cover_image) ? (
          <Image
            src={product.cover_image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            loading={eager ? "eager" : "lazy"}
            className={`object-cover transition-transform duration-300 motion-safe:group-hover:scale-[1.03] ${
              unavailable ? "opacity-60 grayscale" : ""
            }`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            No photo
          </div>
        )}

        {unavailable && (
          <span className="absolute left-2 top-2 rounded-xs bg-white px-2 py-1 text-xs font-semibold text-black">
            {product.sold_out ? "Sold out" : `Size ${selectedSize} sold out`}
          </span>
        )}
      </div>

      <div className="px-0.5 pt-3">
        {product.brand && <p className="text-sm text-muted">{product.brand}</p>}
        <p className={`font-medium ${unavailable ? "text-muted" : ""}`}>
          {product.name}
        </p>
        <p className={`text-sm ${unavailable ? "text-muted" : ""}`}>
          KES {product.price.toLocaleString("en-KE")}
        </p>
      </div>
    </Link>
  );
}