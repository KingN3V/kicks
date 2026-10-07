import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/api";
import { whatsappUrl } from "@/lib/contact";

// Same rule as everywhere else: next/image only loads Cloudinary photos
function isLoadable(url: string | null): url is string {
  return !!url && url.startsWith("https://res.cloudinary.com/");
}

export default function Hero({ featured }: { featured?: ProductListItem }) {
  const whatsapp = whatsappUrl("Hi! I'd like to order a shoe.");

  return (
    <section className="mx-auto grid w-full max-w-5xl gap-10 px-4 py-12 md:grid-cols-2 md:items-center md:py-20">
      <div>
        <h1 className="font-display text-5xl leading-[1.02] tracking-tight md:text-7xl">
          Clean pairs, brought to your door.
        </h1>
        <p className="mt-5 max-w-sm text-lg text-muted">
          Pick a shoe, send us a message, and we bring it to you. We deliver
          countrywide.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#shoes"
            className="rounded-xs bg-white px-6 py-3.5 font-medium text-black hover:bg-white/85"
          >
            Browse shoes
          </a>
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xs border border-white/40 px-6 py-3.5 font-medium hover:border-white"
            >
              Order on WhatsApp
            </a>
          )}
        </div>
      </div>

      {/* No suitable shoe (none in stock, or no photo)? The hero is just the text. */}
      {featured && isLoadable(featured.cover_image) && (
        <Link href={`/products/${featured.slug}`} className="block">
          <div className="relative aspect-4/3 overflow-hidden rounded-sm bg-surface">
            <Image
              src={featured.cover_image}
              alt={featured.name}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              loading="eager"
              className="object-cover"
            />
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-4">
            <p className="font-medium">{featured.name}</p>
            <p className="text-sm text-muted">
              KES {featured.price.toLocaleString("en-KE")}
            </p>
          </div>
        </Link>
      )}
    </section>
  );
}