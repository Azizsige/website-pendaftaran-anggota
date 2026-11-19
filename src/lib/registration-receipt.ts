import "server-only";
import crypto from "crypto";
import { cookies } from "next/headers";

export const REGISTRATION_RECEIPT_COOKIE = "reg_success_receipt";
const RECEIPT_TTL_SECONDS = 15 * 60;

export interface RegistrationReceipt {
  registrationNumber: string;
  submittedAt: string;
  namaLengkap: string;
  nim: string;
  exp: number;
}

function getReceiptSigningKey(): string {
  return process.env.NEXTAUTH_SECRET?.trim() || "registration-receipt-signing-fallback";
}

function signPayload(encodedPayload: string): string {
  return crypto
    .createHmac("sha256", getReceiptSigningKey())
    .update(`reg-receipt:${encodedPayload}`)
    .digest("base64url");
}

export function buildRegistrationNumber(nim: string, date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const cleanNim = nim.replace(/\D/g, "");
  const suffix = (cleanNim.slice(-4) || "0001").padStart(4, "0");
  return `REG-${year}${month}${day}-${suffix}`;
}

export function encodeRegistrationReceipt(receipt: RegistrationReceipt): string {
  const encodedPayload = Buffer.from(JSON.stringify(receipt), "utf8").toString("base64url");
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

export function verifyRegistrationReceipt(token: string): RegistrationReceipt | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [encodedPayload, providedSignature] = parts;
  if (!encodedPayload || !providedSignature) return null;

  const expectedSignature = signPayload(encodedPayload);
  const bufA = Buffer.from(providedSignature, "utf8");
  const bufB = Buffer.from(expectedSignature, "utf8");
  if (bufA.length !== bufB.length || !crypto.timingSafeEqual(bufA, bufB)) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as Partial<RegistrationReceipt>;

    if (
      typeof parsed.registrationNumber !== "string" ||
      typeof parsed.submittedAt !== "string" ||
      typeof parsed.namaLengkap !== "string" ||
      typeof parsed.nim !== "string" ||
      typeof parsed.exp !== "number"
    ) {
      return null;
    }

    if (Date.now() > parsed.exp) {
      return null;
    }

    return {
      registrationNumber: parsed.registrationNumber,
      submittedAt: parsed.submittedAt,
      namaLengkap: parsed.namaLengkap,
      nim: parsed.nim,
      exp: parsed.exp,
    };
  } catch {
    return null;
  }
}

export async function setRegistrationReceiptCookie(input: {
  namaLengkap: string;
  nim: string;
}): Promise<RegistrationReceipt> {
  const now = new Date();
  const receipt: RegistrationReceipt = {
    registrationNumber: buildRegistrationNumber(input.nim, now),
    submittedAt: now.toISOString(),
    namaLengkap: input.namaLengkap,
    nim: input.nim,
    exp: now.getTime() + RECEIPT_TTL_SECONDS * 1000,
  };

  try {
    if (typeof cookies === "function") {
      const cookieStore = await cookies();
      cookieStore.set(REGISTRATION_RECEIPT_COOKIE, encodeRegistrationReceipt(receipt), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/daftar",
        maxAge: RECEIPT_TTL_SECONDS,
      });
    }
  } catch {
    // Skip cookie write in non-request unit test environments.
  }

  return receipt;
}

export async function readRegistrationReceiptCookie(): Promise<RegistrationReceipt | null> {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(REGISTRATION_RECEIPT_COOKIE)?.value;
    if (!rawToken) return null;
    return verifyRegistrationReceipt(rawToken);
  } catch {
    return null;
  }
}
