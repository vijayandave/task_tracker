import { ZodError } from "zod";

export function getZodErrorMessage(error: ZodError): string {
  const issues = error.issues;
  if (issues.length > 0) {
    return issues[0].message;
  }
  return "Validation error";
}
