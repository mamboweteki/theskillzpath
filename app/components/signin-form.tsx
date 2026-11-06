"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const inputClass =
  "h-11 w-full rounded-xl border border-[#0b0b12]/10 bg-white/80 px-3.5 text-[13.5px] text-[#0b0b12] placeholder:text-[#a3a7b7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:border-[#0b0b12]/20 focus:border-[#4f46e5] focus:outline-none";

const labelClass = "mb-1.5 block text-[12px] font-medium text-[#3b3f4d]";

export function SigninForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data: { ok?: boolean; member?: { accessStatus?: string }; error?: string } =
        await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? "Could not sign you in. Try again.");
      }

      if (data.member?.accessStatus === "ACTIVE") {
        router.push("/dashboard");
      } else {
        router.push("/enroll");
      }
      router.refresh();
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="signin-email" className={labelClass}>
          Email address
        </label>
        <input
          id="signin-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="signin-password" className={labelClass}>
          Password
        </label>
        <input
          id="signin-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
          className={inputClass}
        />
      </div>

      {status === "error" ? (
        <p className="text-[12.5px] text-red-600" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing you in
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="text-center text-[11.5px] text-[#8b90a3]">
        Sign in with the email and password you used to reserve your seat.
      </p>
    </form>
  );
}
