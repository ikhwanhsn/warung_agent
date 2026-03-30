import helmet from "helmet";

/**
 * Security headers for the API gateway.
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});
