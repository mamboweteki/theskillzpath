"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, LockKeyhole } from "lucide-react";
import { categories } from "@/lib/courses";
import { site } from "@/lib/site";

const inputClass =
  "h-11 w-full rounded-xl border border-[#0b0b12]/10 bg-white/80 px-3.5 text-[13.5px] text-[#0b0b12] placeholder:text-[#a3a7b7] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] transition-colors hover:border-[#0b0b12]/20 focus:border-[#4f46e5] focus:outline-none";

const labelClass = "mb-1.5 block text-[12px] font-medium text-[#3b3f4d]";

export function SignupForm() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [interest, setInterest] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    if (password.length < 8) {
      setStatus("error");
      setError("Choose a password with at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setError("The two passwords do not match.");
      return;
    }

    setStatus("loading");
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, interest, password }),
      });
      const data: { error?: string } = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong. Try again.");
      }

      // Accounts start as reserved, so the next step is payment.
      router.push("/enroll");
      router.refresh();
    } catch (submitError) {
      setStatus("error");
      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="signup-firstName" className={labelClass}>
            First name
          </label>
          <input
            id="signup-firstName"
            name="firstName"
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Tendai"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="signup-email" className={labelClass}>
            Email address
          </label>
          <input
            id="signup-email"
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
      </div>

      <div>
        <label htmlFor="signup-interest" className={labelClass}>
          Skill you are most interested in
        </label>
        <select
          id="signup-interest"
          name="interest"
          value={interest}
          onChange={(e) => setInterest(e.target.value)}
          className={inputClass}
        >
          <option value="">Not sure yet</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="signup-password" className={labelClass}>
            Password
          </label>
          <input
            id="signup-password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="signup-confirmPassword" className={labelClass}>
            Confirm password
          </label>
          <input
            id="signup-confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            className={inputClass}
          />
        </div>
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
            Creating your account
          </>
        ) : (
          <>
            Create account
            <ArrowRight className="size-4" />
          </>
        )}
      </button>

      <p className="flex items-start justify-center gap-1.5 text-center text-[11.5px] leading-relaxed text-[#8b90a3]">
        <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
        Your seat is reserved now. The ${site.pricing.earlyBird} founding price is
        locked in at launch.
      </p>
    </form>
  );
}
