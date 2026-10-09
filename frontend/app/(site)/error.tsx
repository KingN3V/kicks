"use client";

import { useEffect } from "react";

const AUTO_RELOAD_KEY = "kicksjj_auto_reload_at";
const AUTO_RELOAD_DELAY_MS = 6000; // wait a few seconds, then reload once by itself
const AUTO_RELOAD_COOLDOWN_MS = 60000; // never auto-reload more than once a minute

export default function Error({ error }: { error: Error & { digest?: string } }) {
  // Leave a trace in the browser console / server logs for debugging
  useEffect(() => {
    console.error(error);
  }, [error]);

  // The free backend may have just been waking up: reload once by itself.
  // sessionStorage survives the reload, so the cooldown stops an endless loop
  // if the API is really down.
  useEffect(() => {
    let last = 0;
    try {
      last = Number(sessionStorage.getItem(AUTO_RELOAD_KEY)) || 0;
    } catch {
      // storage blocked: last stays 0
    }
    if (Date.now() - last < AUTO_RELOAD_COOLDOWN_MS) return;

    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(AUTO_RELOAD_KEY, String(Date.now()));
      } catch {
        // ignore
      }
      window.location.reload();
    }, AUTO_RELOAD_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-start px-4 py-20">
      <h1 className="font-display text-4xl leading-tight md:text-5xl">
        We couldn&apos;t load the shoes just now
      </h1>
      <p className="mt-3 max-w-md text-muted">
        The shop sometimes needs a moment to wake up. This usually fixes itself
        in a few seconds. Try again, or message us using the contact details
        below.
      </p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="mt-8 rounded-xs bg-white px-6 py-3.5 font-medium text-black hover:bg-white/85"
      >
        Try again
      </button>
    </main>
  );
}