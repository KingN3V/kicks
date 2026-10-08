"use client";

import { useState } from "react";
import { FaInstagram, FaTruck, FaWhatsapp } from "react-icons/fa6";
import type { Variant } from "@/lib/api";

type Props = {
  name: string;
  pageUrl: string;
  soldOut: boolean;
  variants: Variant[]; // the page sorts them before passing them in
  whatsapp?: string;
  instagram?: string;
};

export default function BuyPanel({
  name,
  pageUrl,
  soldOut,
  variants,
  whatsapp,
  instagram,
}: Props) {
  // null = nothing chosen yet. Changing it re-renders this component.
  const [size, setSize] = useState<string | null>(null);

  const message = soldOut
    ? `Hi! I saw the ${name} is sold out. Can you get it or something similar? ${pageUrl}`
    : `Hi! I'm interested in the ${name}${size ? ` in size ${size}` : ""}. ${pageUrl}`;

  return (
    <div>
      <h2 className="mb-2 mt-6 text-sm font-medium">Sizes</h2>
      {variants.length === 0 ? (
        <p className="text-sm text-muted">No sizes listed.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {variants.map((v) => {
            const outOfStock = v.stock === 0;
            const selected = size === v.size;
            return (
              <li key={v.size}>
                <button
                  type="button"
                  disabled={outOfStock}
                  aria-pressed={selected}
                  // tapping the chosen size again un-selects it
                  onClick={() => setSize(selected ? null : v.size)}
                  className={`min-w-12 rounded-xs border px-3 py-2 text-center text-sm transition-colors ${
                    outOfStock
                      ? "cursor-not-allowed text-muted line-through opacity-50"
                      : selected
                        ? "border-white bg-white font-semibold text-black"
                        : "border-white/40 hover:border-white"
                  }`}
                >
                  {v.size}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {!soldOut && !size && variants.length > 0 && (
        <p className="mt-2 text-xs text-muted">
          Tap a size to include it in your message.
        </p>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {whatsapp && (
          <a
            href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xs bg-white px-6 py-3.5 font-medium text-black hover:bg-white/85"
          >
            <FaWhatsapp className="h-5 w-5" aria-hidden="true" />
            {soldOut ? "Ask about this on WhatsApp" : "Buy on WhatsApp"}
          </a>
        )}
        {instagram && (
          <a
            href={`https://ig.me/m/${instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xs border border-white/40 px-6 py-3.5 font-medium hover:border-white"
          >
            <FaInstagram className="h-5 w-5" aria-hidden="true" />
            Message on Instagram
          </a>
        )}
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm text-muted">
        <FaTruck className="mt-0.5 shrink-0" aria-hidden="true" />
        We deliver countrywide. Tell us where you are and we&apos;ll bring it
        to you.
      </p>
    </div>
  );
}