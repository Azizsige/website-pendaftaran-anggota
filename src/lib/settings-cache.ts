import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { settingsToMap } from "@/lib/constants/settings";

export const getCachedAllSettings = cache(async () =>
  prisma.systemSetting.findMany({ orderBy: { key: "asc" } })
);

export const getCachedSettingsMap = cache(async () =>
  settingsToMap(await getCachedAllSettings())
);
