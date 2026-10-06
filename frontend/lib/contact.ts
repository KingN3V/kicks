// Builds every contact link from the two server-only env variables.
// Import this only from server components (layout, page, footer...), never
// from a "use client" file: the browser can't see WHATSAPP_NUMBER.

// Keep digits only, so "+254 712 345 678" and "254712345678" both work.
const digits = (process.env.WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
// Accept "kicksjj" and "@kicksjj"
const handle = (process.env.INSTAGRAM_HANDLE ?? "").replace(/^@/, "").trim();

// Opens a WhatsApp chat, optionally with a message already typed
export function whatsappUrl(message?: string): string | null {
  if (!digits) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

// Opens the phone's dialer
export function telUrl(): string | null {
  return digits ? `tel:+${digits}` : null;
}

// How the number is shown on the page: "+254 712 345 678" for Kenyan numbers
export function phoneDisplay(): string | null {
  if (!digits) return null;
  if (digits.startsWith("254") && digits.length === 12) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
  }
  return `+${digits}`;
}

// Opens the Instagram profile
export function instagramProfileUrl(): string | null {
  return handle ? `https://instagram.com/${handle}` : null;
}

// Opens a direct message to the account (what the buy buttons use)
export function instagramMessageUrl(): string | null {
  return handle ? `https://ig.me/m/${handle}` : null;
}

export function instagramHandle(): string | null {
  return handle ? `@${handle}` : null;
}