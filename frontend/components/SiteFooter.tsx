import type { ReactNode } from "react";
import { FaInstagram, FaPhone, FaTruck, FaWhatsapp } from "react-icons/fa6";
import {
  instagramHandle,
  instagramProfileUrl,
  phoneDisplay,
  telUrl,
  whatsappUrl,
} from "@/lib/contact";

// One contact line: a round icon, a label and a small detail underneath
function ContactLink({
  href,
  icon,
  label,
  detail,
  external = true,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  detail: string;
  external?: boolean; // false for tel: links, which open the dialer, not a new tab
}) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="group flex items-center gap-3 py-2"
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-lg group-hover:border-white"
        >
          {icon}
        </span>
        <span>
          <span className="block font-medium">{label}</span>
          <span className="block text-sm text-muted">{detail}</span>
        </span>
      </a>
    </li>
  );
}

export default function SiteFooter() {
  const whatsapp = whatsappUrl("Hi! I'd like to order a shoe.");
  const tel = telUrl();
  const phone = phoneDisplay();
  const instagram = instagramProfileUrl();
  const handle = instagramHandle();

  return (
    <footer id="contact" className="mt-20 scroll-mt-20 border-t">
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-display text-3xl leading-none">Kicks JJ</p>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Your next pair is one message away.
            </p>
          </div>

          <div>
            <h2 className="font-medium">Talk to us</h2>
            <p className="mt-1 text-sm text-muted">
              Message or call anytime. We&apos;re online 24/7.
            </p>
            <ul className="mt-3">
              {whatsapp && (
                <ContactLink
                  href={whatsapp}
                  icon={<FaWhatsapp />}
                  label="WhatsApp"
                  detail="Send us a message"
                />
              )}
              {tel && phone && (
                <ContactLink
                  href={tel}
                  icon={<FaPhone />}
                  label="Call us"
                  detail={phone}
                  external={false}
                />
              )}
              {instagram && handle && (
                <ContactLink
                  href={instagram}
                  icon={<FaInstagram />}
                  label="Instagram"
                  detail={handle}
                />
              )}
            </ul>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-medium">
              <FaTruck aria-hidden="true" className="text-muted" />
              Delivery
            </h2>
            <p className="mt-1 max-w-xs text-sm text-muted">
              We deliver countrywide. Tell us where you are and we&apos;ll
              bring your order to you.
            </p>
          </div>
        </div>

        <p className="mt-12 border-t pt-6 text-xs text-muted">
          © {new Date().getFullYear()} Kicks JJ
        </p>
      </div>
    </footer>
  );
}