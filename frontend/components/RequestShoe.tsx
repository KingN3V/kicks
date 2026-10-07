import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import type { CurrentFilters } from "@/components/Filters";
import { instagramMessageUrl, whatsappUrl } from "@/lib/contact";

// "9500" -> "9,500". If it isn't a number, show it as typed.
function kes(value: string): string {
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-KE") : value;
}

// Turn the active filters into a message the customer can send as it is.
function buildMessage(current: CurrentFilters): string {
  const parts: string[] = [];
  if (current.brand) parts.push(current.brand);
  if (current.category) parts.push(current.category);
  if (current.size) parts.push(`size ${current.size}`);

  const { min_price: min, max_price: max } = current;
  if (min && max) parts.push(`KES ${kes(min)} to ${kes(max)}`);
  else if (max) parts.push(`under KES ${kes(max)}`);
  else if (min) parts.push(`from KES ${kes(min)}`);

  if (parts.length === 0) {
    return "Hi! I'm looking for a shoe that isn't listed on your site. Can you get it for me?";
  }
  return `Hi! I'm looking for a shoe: ${parts.join(", ")}. Can you get it for me?`;
}

type Props = {
  current: CurrentFilters;
};

export default function RequestShoe({ current }: Props) {
  const whatsapp = whatsappUrl(buildMessage(current));
  const instagram = instagramMessageUrl();

  // No contact details configured: nothing useful to show
  if (!whatsapp && !instagram) return null;

  return (
    <section className="mt-16 rounded-sm border px-4 py-10 text-center">
      <h2 className="font-display text-3xl leading-tight md:text-4xl">
        Can&apos;t find your shoe?
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-muted">
        Tell us what you&apos;re looking for and we&apos;ll try to get it for
        you.
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {whatsapp && (
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xs bg-white px-6 py-3.5 font-medium text-black hover:bg-white/85"
          >
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
            Request on WhatsApp
          </a>
        )}
        {instagram && (
          <a
            href={instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xs border border-white/40 px-6 py-3.5 font-medium hover:border-white"
          >
            <FaInstagram className="h-5 w-5" aria-hidden="true" />
            Message on Instagram
          </a>
        )}
      </div>
    </section>
  );
}