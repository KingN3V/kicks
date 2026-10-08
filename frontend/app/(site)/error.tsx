"use client";

import { useEffect } from "react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  // Leave a trace in the browser console / server logs for debugging
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-start px-4 py-20">
      <h1 className="font-display text-4xl leading-tight md:text-5xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-muted">
        We couldn&apos;t load the shoes just now. This usually fixes itself in
        a moment. Try again, or message us using the contact details below.
      </p>
      <button
        type="button"
        onClick={() => unstable_retry()}
        className="mt-8 rounded-xs bg-white px-6 py-3.5 font-medium text-black hover:bg-white/85"
      >
        Try again
      </button>
    </main>
  );
}