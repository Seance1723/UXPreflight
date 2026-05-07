import { validateRulePack } from "@uxpreflight/core";
import { universalUXRules } from "./universal-ux.rules.js";
import { accessibilityRules } from "./accessibility.rules.js";
import { stateCoverageRules } from "./state-coverage.rules.js";
import { componentRules } from "./component.rules.js";

export {
  universalUXRules,
  accessibilityRules,
  stateCoverageRules,
  componentRules
};

export const rulePacksInfo = {
  name: "@uxpreflight/rule-packs",
  version: "0.1.0",
  status: "Universal UX, Accessibility, State Coverage, and Component rule packs ready"
};

export function getDefaultRulePacks() {
  return [
    universalUXRules,
    accessibilityRules,
    stateCoverageRules,
    componentRules
  ];
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