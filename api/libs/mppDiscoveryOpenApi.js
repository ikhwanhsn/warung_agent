/** Minimal OpenAPI document for /openapi.json when full MPP discovery is absent. */
export function buildMppDiscoveryOpenApi() {
  return {
    openapi: "3.1.0",
    info: {
      title: "MPP discovery (stub)",
      version: "0.0.0",
      description: "Restore full api/libs/mppDiscoveryOpenApi.js for production discovery.",
    },
    paths: {},
  };
}
