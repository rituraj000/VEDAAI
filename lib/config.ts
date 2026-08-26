export const config = {
  urlLocal:
    process.env.URL_LOCAL ||
    process.env.url_local ||
    process.env.NEXT_PUBLIC_URL_LOCAL ||
    "http://localhost:3000",
  urlProd:
    process.env.URL_PROD ||
    process.env.url_prod ||
    process.env.NEXT_PUBLIC_URL_PROD ||
    "https://vedaai-pearl.vercel.app",
  apiKey:
    process.env.API_KEY ||
    process.env.api_key ||
    process.env.GEMINI_API_KEY ||
    process.env.OPENROUTER_API_KEY ||
    "",
};

/**
 * Returns the environment base URL for server-side API requests or headers.
 * Uses URL_PROD (or url_prod) in production and URL_LOCAL in local development.
 */
export function getAppUrl(): string {
  const isProd =
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL === "1";

  if (isProd) {
    return (
      process.env.URL_PROD ||
      process.env.url_prod ||
      process.env.NEXT_PUBLIC_URL_PROD ||
      "https://vedaai-pearl.vercel.app"
    );
  }

  return (
    process.env.URL_LOCAL ||
    process.env.url_local ||
    process.env.NEXT_PUBLIC_URL_LOCAL ||
    "http://localhost:3000"
  );
}

/**
 * Returns the environment base URL for client-side execution.
 */
export function getClientAppUrl(): string {
  if (typeof window !== "undefined" && window.location.origin) {
    return window.location.origin;
  }
  return getAppUrl();
}
