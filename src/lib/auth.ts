import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "./prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request";
import { logger } from "@/lib/logger";
import { USER_STATUS } from "@/lib/constants/status";
import type { Role } from "@/lib/constants/roles";

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(200),
});

const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Hash dummy supaya waktu respon sama baik user ada maupun tidak (mencegah user enumeration).
const DUMMY_HASH = "$2b$10$CwTycUXWue0Thq9StjUM0uJ8.0E3f1uP1v5F4E2Zr7u8wC8y3q9aS";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60, // 8 jam
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
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const ip = await getClientIp();

        const [byEmail, byIp] = await Promise.all([
          checkRateLimit(`login_email_${email}`, LOGIN_LIMIT, LOGIN_WINDOW_MS),
          checkRateLimit(`login_ip_${ip}`, LOGIN_LIMIT * 4, LOGIN_WINDOW_MS),
        ]);

        if (!byEmail.success || !byIp.success) {
          logger.warn("Login diblokir rate limit", { email });
          throw new Error("RATE_LIMITED");
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user || !user.password) {
          await bcrypt.compare(parsed.data.password, DUMMY_HASH);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isPasswordValid) return null;

        // Akun nonaktif / disuspend tidak boleh login.
        if (user.status !== USER_STATUS.ACTIVE) {
          logger.warn("Login ditolak: akun tidak aktif", { userId: user.id, status: user.status });
          throw new Error("ACCOUNT_INACTIVE");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        },
      };
    },
    jwt: ({ token, user }) => {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        };
      }
      return token;
    },
  },
};
