
/** Standardized error handling utility */

export function logAndExtractMessage(error: unknown, fallback = "Unexpected error"): string {
  let message = fallback;
  if (error instanceof Error) {
    message = error.message;
    // Optionally: Stack trace to external service here
  } else if (typeof error === "string") {
    message = error;
  }
  console.error("App error:", error);
  return message;
}
