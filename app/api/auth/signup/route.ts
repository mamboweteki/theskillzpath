import { NextResponse } from "next/server";
import { createSessionToken, setSessionCookie, toPublicMember } from "@/lib/auth";
import { saveMember } from "@/lib/db";
import { isTrustedRequest } from "@/lib/security";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type SignupPayload = {
  email?: unknown;
  firstName?: unknown;
  interest?: unknown;
  password?: unknown;
};

export async function POST(request: Request) {
  if (!isTrustedRequest(request)) {
    return NextResponse.json({ error: "Request blocked." }, { status: 403 });
  }

  let payload: SignupPayload;
  try {
    payload = (await request.json()) as SignupPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const firstName = typeof payload.firstName === "string" ? payload.firstName.trim() : "";
  const interest = typeof payload.interest === "string" ? payload.interest.trim() : "";
  const password = typeof payload.password === "string" ? payload.password.trim() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 422 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: "Use a password with at least 8 characters." },
      { status: 422 },
    );
  }

  let member;
  try {
    member = saveMember({
      email,
      firstName,
      interest,
      password,
      paymentStatus: "PENDING",
      accessStatus: "RESERVED",
    });
  } catch (error) {
    console.error("[auth] signup database error:", error);
    return NextResponse.json(
      { error: "We could not create your account right now. Please try again." },
      { status: 500 },
    );
  }

  if (!member) {
    return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
  }

  const token = await createSessionToken(member.email);
  const response = NextResponse.json({ ok: true, member: toPublicMember(member) });
  setSessionCookie(response, token);
  return response;
}
