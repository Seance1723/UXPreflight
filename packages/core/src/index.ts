export const UX_PREFLIGHT_VERSION = "0.1.0";

export function getCoreInfo() {
  return {
    name: "@uxpreflight/core",
    version: UX_PREFLIGHT_VERSION,
    status: "Release 0.2 Module 6 scan report writer ready"
  };
}

export * from "./types.js";
export * from "./schemas.js";
export * from "./validate.js";
export * from "./defaults.js";
export * from "./generateDesignConstitution.js";
export * from "./exportDesignTokens.js";
export * from "./generateAgentPrompt.js";
