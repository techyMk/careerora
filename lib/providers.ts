/**
 * Server-side feature flags for available auth providers.
 * Used by sign-in / sign-up pages to conditionally render OAuth buttons.
 */
export function getEnabledProviders() {
  return {
    google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  };
}
