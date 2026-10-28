export class AuthError extends Error {
  readonly code: "UNAUTHENTICATED" | "FORBIDDEN";
  constructor(code: "UNAUTHENTICATED" | "FORBIDDEN", message?: string) {
    super(message ?? code);
    this.code = code;
    this.name = "AuthError";
  }
}