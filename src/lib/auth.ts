import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "./prisma";
import { isDatabaseUnavailableError } from "./db-health";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { logger } from "@/lib/logger";
import { ACTIVITY_ACTIONS, recordActivityLog } from "@/lib/activity-log";
import {
  ensureOwnerUserInDb,
  getConfiguredOwnerCredentials,
  verifyOwnerEnvironmentAccess,
} from "@/lib/owner-access";
import { USER_STATUS } from "@/lib/constants/status";
import { ROLES, type Role } from "@/lib/constants/roles";
import { normalizeNextAuthUrlEnv } from "@/lib/env";

normalizeNextAuthUrlEnv();

export const SHORT_SESSION_SECONDS = 8 * 60 * 60; // 8 jam
export const REMEMBER_SESSION_SECONDS = 30 * 24 * 60 * 60; // 30 hari

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
  rememberMe: z.enum(["true", "false"]).optional(),
});

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Hash dummy supaya waktu respon sama baik user ada maupun tidak (mencegah user enumeration).
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.0E3f1uP1v5F4E2Zr7u8wC8y3q9aS";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: REMEMBER_SESSION_SECONDS,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "hello@example.com",
        },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const rememberMe = parsed.data.rememberMe === "true";
        const ip = await getClientIp();

        const [byEmail, byIp] = await Promise.all([
          checkRateLimit(`login_email_${email}`, LOGIN_LIMIT, LOGIN_WINDOW_MS),
          checkRateLimit(`login_ip_${ip}`, LOGIN_LIMIT * 4, LOGIN_WINDOW_MS),
        ]);

        if (!byEmail.success || !byIp.success) {
          logger.warn("Login diblokir rate limit", { email });
          throw new Error("RATE_LIMITED");
        }

        let user = null;
        try {
          const { email: ownerEmail } = getConfiguredOwnerCredentials();
          if (email === ownerEmail) {
            await ensureOwnerUserInDb();
          }
          user = await prisma.user.findUnique({ where: { email } });
        } catch (err) {
          if (isDatabaseUnavailableError(err)) {
            logger.warn("Login ditunda: basis data sedang tidak aktif");
            throw new Error("DATABASE_UNAVAILABLE");
          }
          throw err;
        }

        if (!user || !user.password) {
          await bcrypt.compare(parsed.data.password, DUMMY_HASH);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isPasswordValid) {
          await recordActivityLog({
            actor: { id: user.id, role: user.role },
            action: ACTIVITY_ACTIONS.LOGIN_FAILED,
            entityType: "Security",
            entityId: user.id,
            details: `Gagal masuk ke akun ${user.email} (${user.role}): kata sandi salah (IP: ${ip})`,
          });
          return null;
        }

        if (user.role === ROLES.OWNER) {
          const ownerAccess = await verifyOwnerEnvironmentAccess();
          if (!ownerAccess.allowed) {
            logger.warn("Login Owner ditolak: IP atau perangkat tidak diizinkan", {
              email: user.email,
              reason: ownerAccess.reason,
              currentIp: ownerAccess.currentIp,
            });
            return null;
          }
        }

        // Akun nonaktif / disuspend tidak boleh login.
        if (user.status !== USER_STATUS.ACTIVE) {
          logger.warn("Login ditolak: akun tidak aktif", { userId: user.id, status: user.status });
          await recordActivityLog({
            actor: { id: user.id, role: user.role },
            action: ACTIVITY_ACTIONS.LOGIN_FAILED,
            entityType: "Security",
            entityId: user.id,
            details: `Gagal masuk ke akun ${user.email} (${user.role}): akun berstatus ${user.status} (IP: ${ip})`,
          });
          throw new Error("ACCOUNT_INACTIVE");
        }

        await recordActivityLog({
          actor: { id: user.id, role: user.role },
          action: ACTIVITY_ACTIONS.LOGIN,
          entityType: "Auth",
          entityId: user.id,
          details: `Masuk ke panel administrasi menggunakan akun ${user.email} (${user.role}) dari IP ${ip}`,
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          rememberMe,
        };
      },
    }),
  ],
  callbacks: {
    redirect: ({ url, baseUrl }) => {
      if (url.startsWith("/") && !url.startsWith("//")) return `${baseUrl}${url}`;
      try {
        const parsedUrl = new URL(url);
        const parsedBase = new URL(baseUrl);
        if (parsedUrl.origin === parsedBase.origin) return url;
        const isLoopbackTarget =
          parsedUrl.hostname === "localhost" ||
          parsedUrl.hostname === "127.0.0.1" ||
          parsedUrl.hostname === "[::1]";
        const isLoopbackBase =
          parsedBase.hostname === "localhost" ||
          parsedBase.hostname === "127.0.0.1" ||
          parsedBase.hostname === "[::1]";
        if (isLoopbackTarget && !isLoopbackBase) {
          return `${baseUrl}${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
        }
      } catch {
        return baseUrl;
      }
      return baseUrl;
    },
    session: ({ session, token }) => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const isExpired =
        !token?.id ||
        (typeof token.sessionExp === "number" && nowSeconds > token.sessionExp);

      if (isExpired) {
        return {
          ...session,
          expires: new Date(0).toISOString(),
          user: {
            ...session.user,
            id: "",
            role: "" as Role,
          },
        };
      }

      return {
        ...session,
        expires:
          typeof token.sessionExp === "number"
            ? new Date(token.sessionExp * 1000).toISOString()
            : session.expires,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        const rememberMe = Boolean(user.rememberMe);
        const ttlSeconds = rememberMe
          ? REMEMBER_SESSION_SECONDS
          : SHORT_SESSION_SECONDS;

        return {
          ...token,
          id: user.id,
          role: user.role,
          rememberMe,
          sessionExp: Math.floor(Date.now() / 1000) + ttlSeconds,
        };
      }
      return token;
    },
  },
  events: {
    async signOut({ token }) {
      if (token?.id && token?.role) {
        await recordActivityLog({
          actor: { id: String(token.id), role: String(token.role) },
          action: ACTIVITY_ACTIONS.LOGOUT,
          entityType: "Auth",
          entityId: String(token.id),
          details: `Keluar dari sesi panel administrasi (${String(token.role)})`,
        });
      }
    },
  },
};
