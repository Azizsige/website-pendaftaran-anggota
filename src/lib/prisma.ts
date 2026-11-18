import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaUrl: string | undefined;
};

function createPrismaClient(url?: string): PrismaClient {
  return new PrismaClient({
    ...(url ? { datasources: { db: { url } } } : {}),
    // Matikan log 'error' internal Prisma agar error yang sudah ditangani try/catch
    // tidak bocor menjadi 'Server prisma:error' di console browser Next.js DevTools.
    log: process.env.PRISMA_LOG_QUERIES === "true" ? ["query", "warn"] : [],
  });
}

function getActivePrismaClient(): PrismaClient {
  const currentUrl = process.env.POSTGRES_PRISMA_URL;

  if (
    !globalForPrisma.prisma ||
    (currentUrl &&
      globalForPrisma.prismaUrl &&
      globalForPrisma.prismaUrl !== currentUrl)
  ) {
    if (globalForPrisma.prisma) {
      void globalForPrisma.prisma.$disconnect().catch(() => {});
    }
    globalForPrisma.prisma = createPrismaClient(currentUrl);
    globalForPrisma.prismaUrl = currentUrl;
  }

  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getActivePrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
