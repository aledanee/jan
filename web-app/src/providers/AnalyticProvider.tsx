/**
 * Offline build: product analytics is disabled entirely.
 *
 * This build never loads PostHog and never opens a connection to an analytics
 * backend. The component is kept as a no-op so the app layout and the privacy
 * settings page keep working unchanged.
 */
export function AnalyticProvider() {
  // This component doesn't render anything
  return null
}
