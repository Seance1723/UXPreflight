import { DesignConstitutionSchema } from "./schemas.js";
import { createDefaultTokens, DEFAULT_REQUIRED_STATES } from "./defaults.js";
import type {
  GenerateDesignConstitutionInput,
  UXPreflightDesignConstitution,
  UXPreflightRuleCategory
} from "./types.js";

type RuleBucketKey =
  | "universal"
  | "accessibility"
  | "components"
  | "states"
  | "product"
  | "screen"
  | "businessRisk"
  | "agentBehavior"
  | "trends"
  | "antiPatterns";

function createEmptyRuleBuckets(): UXPreflightDesignConstitution["rules"] {
  return {
    universal: [],
    accessibility: [],
    components: [],
    states: [],
    product: [],
    screen: [],
    businessRisk: [],
    agentBehavior: [],
    trends: [],
    antiPatterns: []
  };
}

function mapCategoryToBucket(category: UXPreflightRuleCategory): RuleBucketKey {
  const map: Record<UXPreflightRuleCategory, RuleBucketKey> = {
    universal_ux: "universal",
    accessibility: "accessibility",
    component: "components",
    state: "states",
    product: "product",
    screen: "screen",
    business_risk: "businessRisk",
    agent_behavior: "agentBehavior",
    trend: "trends",
    anti_pattern: "antiPatterns"
  };

  return map[category];
}

function uniqueItems(items: string[]) {
  return Array.from(new Set(items));
}

export function generateDesignConstitution(
  input: GenerateDesignConstitutionInput
): UXPreflightDesignConstitution {
  const now = new Date().toISOString();
  const rules = createEmptyRuleBuckets();

  input.rulePacks.forEach((pack) => {
    pack.rules.forEach((rule) => {
      const bucket = mapCategoryToBucket(rule.category);
      rules[bucket].push(rule.id);
    });
  });

  const constitution: UXPreflightDesignConstitution = {
    project: {
      name: input.config.projectName,
      type: input.config.productType,
      platform: input.config.platform,
      frontendStack: input.config.frontendStack,
      designTone: input.config.designTone,
      strictness: input.config.strictness
    },
    version: input.version ?? "0.1.0",
    tokens: input.tokens ?? createDefaultTokens(),
    requiredStates: DEFAULT_REQUIRED_STATES,
    rules: {
      universal: uniqueItems(rules.universal),
      accessibility: uniqueItems(rules.accessibility),
      components: uniqueItems(rules.components),
      states: uniqueItems(rules.states),
      product: uniqueItems(rules.product),
      screen: uniqueItems(rules.screen),
      businessRisk: uniqueItems(rules.businessRisk),
      agentBehavior: uniqueItems(rules.agentBehavior),
      trends: uniqueItems(rules.trends),
      antiPatterns: uniqueItems(rules.antiPatterns)
    },
    createdAt: now,
    updatedAt: now
  };

  const result = DesignConstitutionSchema.safeParse(constitution);

  if (!result.success) {
    const messages = result.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(`Invalid design constitution:\n${messages}`);
  }

  return result.data;
}

export function summarizeDesignConstitution(constitution: UXPreflightDesignConstitution) {
  const ruleCounts = {
    universal: constitution.rules.universal.length,
    accessibility: constitution.rules.accessibility.length,
    components: constitution.rules.components.length,
    states: constitution.rules.states.length,
    product: constitution.rules.product.length,
    screen: constitution.rules.screen.length,
    businessRisk: constitution.rules.businessRisk.length,
    agentBehavior: constitution.rules.agentBehavior.length,
    trends: constitution.rules.trends.length,
    antiPatterns: constitution.rules.antiPatterns.length
  };

  const totalRules = Object.values(ruleCounts).reduce((total, count) => total + count, 0);

  return {
    projectName: constitution.project.name,
    productType: constitution.project.type,
    frontendStack: constitution.project.frontendStack,
    strictness: constitution.project.strictness,
    version: constitution.version,
    totalRules,
    ruleCounts,
    requiredStateCount: constitution.requiredStates.length,
    tokenGroups: Object.keys(constitution.tokens)
  };
}