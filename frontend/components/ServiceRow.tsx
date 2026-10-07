import type { ReactNode } from "react";
import { FaMagnifyingGlass, FaRegCommentDots, FaTruck } from "react-icons/fa6";

const items: { icon: ReactNode; title: string; text: string }[] = [
  {
    icon: <FaTruck />,
    title: "Delivery countrywide",
    text: "Tell us where you are and we bring it to you.",
  },
  {
    icon: <FaRegCommentDots />,
    title: "Order by message",
    text: "Pick a shoe, then chat with us on WhatsApp or Instagram.",
  },
  {
    icon: <FaMagnifyingGlass />,
    title: "Can't find your pair?",
    text: "We'll try to source it for you.",
  },
];

export default function ServiceRow() {
  return (
    <section aria-label="How we work" className="border-y">
      <div className="mx-auto grid w-full max-w-5xl divide-y px-4 md:grid-cols-3 md:divide-x md:divide-y-0">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-4 py-6 md:px-6 md:first:pl-0 md:last:pr-0"
          >
            <span aria-hidden="true" className="mt-1 text-xl">
              {item.icon}
            </span>
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}