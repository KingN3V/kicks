import { FaInstagram, FaWhatsapp } from "react-icons/fa6";
import type { CurrentFilters } from "@/components/Filters";

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
  const whatsapp = process.env.WHATSAPP_NUMBER;
  const instagram = process.env.INSTAGRAM_HANDLE;

  // No contact details configured: nothing useful to show
  if (!whatsapp && !instagram) return null;

  return (
    <section className="mt-10 rounded-lg border p-4 text-center">
      <h2 className="font-medium">Can&apos;t find your shoe?</h2>
      <p className="mt-1 text-sm text-gray-500">
        Tell us what you&apos;re looking for and we&apos;ll try to get it for you.
      </p>

      <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(buildMessage(current))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white"
          >
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
            Request on WhatsApp
          </a>
        )}
        {instagram && (
          <a
            href={`https://ig.me/m/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium"
          >
            <FaInstagram className="h-5 w-5" aria-hidden="true" />
            Message on Instagram
          </a>
        )}
      </div>
    </section>
  );
}