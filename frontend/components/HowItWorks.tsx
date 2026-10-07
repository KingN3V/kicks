// These really are steps in order, so they are numbered.
const steps = [
    {
      title: "Pick your shoe and size",
      text: "Open a shoe and tap the size you want.",
    },
    {
      title: "Message us",
      text: "Tap the WhatsApp button and your shoe and size are already typed in. Prefer Instagram? Message us there.",
    },
    {
      title: "We confirm and deliver",
      text: "We agree the details with you and arrange delivery to wherever you are.",
    },
  ];
  
  export default function HowItWorks() {
    return (
      <section
        id="how"
        className="mx-auto mt-20 w-full max-w-5xl scroll-mt-20 px-4"
      >
        <h2 className="font-display text-4xl leading-tight">
          How ordering works
        </h2>
  
        <ol className="mt-6 grid gap-0 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid grid-cols-[2.5rem_1fr] border-t py-6"
            >
              <span className="font-display text-3xl leading-none text-muted">
                {index + 1}
              </span>
              <div>
                <p className="text-lg font-medium">{step.title}</p>
                <p className="mt-1 text-muted">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    );
  }