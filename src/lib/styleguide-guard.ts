/**
 * Dev-only visual preview guard ensuring /styleguide is inaccessible in production.
 */
export function isStyleguideEnabled(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): boolean {
  return nodeEnv !== "production";
}

