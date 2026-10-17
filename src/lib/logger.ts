type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_WEIGHT: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };

function minLevel(): LogLevel {
  const configured = process.env.LOG_LEVEL as LogLevel | undefined;
  if (configured && configured in LEVEL_WEIGHT) return configured;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function serializeError(error: unknown): Record<string, unknown> | unknown {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  return error;
}

function write(level: LogLevel, message: string, context?: Record<string, unknown>) {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel()]) return;

  const entry = { level, time: new Date().toISOString(), message, ...context };
  const line = process.env.NODE_ENV === "production" ? JSON.stringify(entry) : undefined;

  const sink =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  if (line) sink(line);
  else sink(`[${level.toUpperCase()}] ${message}`, context ?? "");
}

/**
 * Logger tunggal. Detail error hanya masuk ke log server,
 * tidak pernah dikirim ke client.
 */
export const logger = {
  debug: (message: string, context?: Record<string, unknown>) => write("debug", message, context),
  info: (message: string, context?: Record<string, unknown>) => write("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => write("warn", message, context),
  error: (message: string, error?: unknown, context?: Record<string, unknown>) =>
    write("error", message, { ...context, error: serializeError(error) }),
};
