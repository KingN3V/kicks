import Link from "next/link";
import MobileMenu from "@/components/MobileMenu";
import { whatsappUrl } from "@/lib/contact";

// These point at sections of the home page and the footer
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

        {/* Wide screens: the links sit in the header */}
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

        <div className="flex items-center gap-2">
          {whatsapp && (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xs border border-white/40 px-3 py-2 text-sm font-medium hover:border-white md:px-4 md:py-2.5"
            >
              Order on WhatsApp
            </a>
          )}
          {/* Phones: the three lines open a panel with the same links */}
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}