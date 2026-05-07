import { validateRulePack } from "@uxpreflight/core";
import { universalUXRules } from "./universal-ux.rules.js";

export { universalUXRules };

export const rulePacksInfo = {
  name: "@uxpreflight/rule-packs",
  version: "0.1.0",
  status: "Universal UX rule pack ready"
};

export function getDefaultRulePacks() {
  return [universalUXRules];
}

export function validateDefaultRulePacks() {
  const packs = getDefaultRulePacks();

  return packs.map((pack) => {
    const result = validateRulePack(pack);

    return {
      id: pack.id,
      name: pack.name,
      valid: result.success,
      ruleCount: pack.rules.length,
      errors: result.success ? [] : result.error.issues
    };
  });
}