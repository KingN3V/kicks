import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa6";
import { whatsappUrl } from "@/lib/contact";

export default function NotFound() {
  const whatsapp = whatsappUrl(
    "Hi! I'm looking for a shoe that isn't listed on your site. Can you get it for me?",
  );

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-start px-4 py-20">
      <h1 className="font-display text-4xl leading-tight md:text-5xl">
        That shoe isn&apos;t here
      </h1>
      <p className="mt-3 max-w-md text-muted">
        It may have been removed, or the link is wrong. Have a look at what we
        have, or tell us what you&apos;re after and we&apos;ll try to get it.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/#shoes"
          className="rounded-xs bg-white px-6 py-3.5 text-center font-medium text-black hover:bg-white/85"
        >
          Browse shoes
        </Link>
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xs border border-white/40 px-6 py-3.5 font-medium hover:border-white"
          >
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
            Ask us on WhatsApp
          </a>
        )}
      </div>
    </main>
  );
}