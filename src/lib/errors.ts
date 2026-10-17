/**
 * Error yang pesannya AMAN ditampilkan ke user.
 * Error lain (Prisma, jaringan, dst.) tidak boleh bocor ke client.
 */
export class AppError extends Error {
  readonly code: string;

  constructor(message: string, code = "APP_ERROR") {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Anda harus login terlebih dahulu.") {
    super(message, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Anda tidak memiliki akses untuk melakukan tindakan ini.") {
    super(message, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Data tidak ditemukan.") {
    super(message, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Data yang dikirim tidak valid.") {
    super(message, "VALIDATION");
    this.name = "ValidationError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Terlalu banyak percobaan. Silakan coba lagi nanti.") {
    super(message, "RATE_LIMITED");
    this.name = "RateLimitError";
  }
}
