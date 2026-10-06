"use client";

import { useState, type SubmitEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminApiError, login } from "@/lib/adminApi";
import { FaEye, FaEyeSlash } from "react-icons/fa6";

const field = "mt-1 w-full rounded border bg-transparent px-3 py-2 text-base";

export default function AdminLoginPage() {
  const router = useRouter();

  // What the person has typed, plus the screen's state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault(); // stop the browser's own submit, which would reload the page
    setError(null);
    setLoading(true);

    try {
      await login(username, password); // saves the token in localStorage
      router.replace("/admin"); // go to the admin home (we build it later)
    } catch (err) {
      setError(
        err instanceof AdminApiError
          ? err.message
          : "Could not reach the server. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-sm flex-col justify-center p-4">
      <h1 className="text-2xl font-bold">Kicks JJ admin</h1>
      <p className="mb-6 text-sm text-gray-500">Log in to manage shoes.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm text-gray-500">
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
            className={field}
          />
        </label>

        <div>
          <label htmlFor="password" className="block text-sm text-gray-500">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded border bg-transparent px-3 py-2 pr-12 text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-gray-500"
            >
              {showPassword ? (
                <FaEyeSlash aria-hidden="true" />
              ) : (
                <FaEye aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {error && (
          <p role="alert" className="text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg border px-4 py-3 font-medium disabled:opacity-60"
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>
    </main>
  );
}