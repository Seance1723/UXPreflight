export const UX_PREFLIGHT_VERSION = "0.1.0";

export function getCoreInfo() {
  return {
    name: "@uxpreflight/core",
    version: UX_PREFLIGHT_VERSION,
    status: "Module 2 schema foundation ready"
  };
}

export * from "./types.js";
export * from "./schemas.js";
export * from "./validate.js";