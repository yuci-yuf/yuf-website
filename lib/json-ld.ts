/**
 * Serialize an object for embedding in a `<script type="application/ld+json">`
 * tag. Escapes `<` as `<` so a value containing `</script>` (or any other
 * markup) can't break out of the script element and inject HTML — the standard
 * mitigation for JSON-in-HTML XSS. The escaped form is still valid JSON-LD.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
