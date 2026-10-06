import Link from "next/link";
import { whatsappUrl } from "@/lib/contact";

// These point at sections of the home page (we add their ids when we rebuild it)
const links = [
  { href: "/#shoes", label: "Shoes" },
  { href: "/#how", label: "How to order" },
  { href: "/#contact", label: "Delivery and contact" },
];

export default function SiteHeader() {
  const whatsapp = whatsappUrl("Hi! I'd like to order a shoe.");

  return (
    <header className="sticky top-0 z-20 border-b bg-black/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display text-3xl leading-none">
          Kicks JJ
        </Link>

        {/* On a phone the links are hidden; the WhatsApp button stays */}
        <nav aria-label="Main" className="hidden gap-7 text-sm text-muted md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xs border border-white/40 px-4 py-2.5 text-sm font-medium hover:border-white"
          >
            Order on WhatsApp
          </a>
        )}
      </div>
    </header>
  );
}