import { FaInstagram, FaWhatsapp } from "react-icons/fa6";

type Props = {
  name: string;
  slug: string;
  soldOut: boolean;
};

export default function BuyButtons({ name, slug, soldOut }: Props) {
  const whatsapp = process.env.WHATSAPP_NUMBER;
  const instagram = process.env.INSTAGRAM_HANDLE;
  const siteUrl = process.env.SITE_URL ?? "";

  const pageUrl = `${siteUrl}/products/${slug}`;
  const message = soldOut
    ? `Hi! I saw the ${name} is sold out. Can you get it or something similar? ${pageUrl}`
    : `Hi! I'm interested in the ${name}. ${pageUrl}`;

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-medium text-white"
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
          className="flex items-center justify-center gap-2 rounded-lg border px-4 py-3 font-medium"
        >
          <FaInstagram className="h-5 w-5" aria-hidden="true" />
          Message on Instagram
        </a>
      )}
    </div>
  );
}