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
    <Link
      href={`/products/${product.slug}`}
      className={`block overflow-hidden rounded-lg border ${
        unavailable ? "opacity-60" : ""
      }`}
    >
      <div className="relative aspect-square bg-gray-100">
        {isLoadable(product.cover_image) ? (
          <Image
            src={product.cover_image}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 25vw, 50vw"
            loading={eager ? "eager" : "lazy"}
            className={`object-cover ${unavailable ? "grayscale" : ""}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No photo
          </div>
        )}

        {unavailable && (
          <span className="absolute left-2 top-2 rounded bg-black px-2 py-1 text-xs font-medium text-white">
            {product.sold_out ? "Sold out" : `Size ${selectedSize} sold out`}
          </span>
        )}
      </div>

      <div className="p-3">
        {product.brand && (
          <p className="text-xs uppercase tracking-wide text-gray-500">
            {product.brand}
          </p>
        )}
        <p className="font-medium">{product.name}</p>
        <p className="text-sm">KES {product.price.toLocaleString("en-KE")}</p>
      </div>
    </Link>
  );
}