import { z } from "zod";

export const StrictnessSchema = z.enum(["relaxed", "balanced", "strict", "enterprise"]);

export const SeveritySchema = z.enum(["info", "warning", "critical", "blocker"]);

export const RuleConfidenceSchema = z.enum(["low", "medium", "high"]);

export const RuleCategorySchema = z.enum([
  "universal_ux",
  "accessibility",
  "state",
  "component",
  "product",
  "screen",
  "business_risk",
  "agent_behavior",
  "trend",
  "anti_pattern"
]);

export const PlatformSchema = z.enum(["web", "mobile", "desktop", "responsive"]);

export const FrontendStackSchema = z.enum([
  "react",
  "nextjs",
  "vue",
  "angular",
  "html_scss_js",
  "tailwind",
  "bootstrap",
  "custom"
]);

export const RuleSchema = z.object({
  id: z.string().min(3),
  title: z.string().min(3),
  description: z.string().min(10),
  category: RuleCategorySchema,
  severity: SeveritySchema,
  confidence: RuleConfidenceSchema,
  appliesTo: z.array(z.string()).default([]),
  doNot: z.array(z.string()).optional(),
  examples: z
    .object({
      pass: z.array(z.string()).optional(),
      fail: z.array(z.string()).optional()
    })
    .optional(),
  tags: z.array(z.string()).optional()
});

export const RulePackSchema = z.object({
  id: z.string().min(3),
  name: z.string().min(3),
  description: z.string().min(10),
  version: z.string().min(1),
  category: RuleCategorySchema,
  rules: z.array(RuleSchema)
});

export const TokensSchema = z.object({
  colors: z.object({
    primary: z.string().min(3),
    secondary: z.string().min(3).optional(),
    background: z.string().min(3),
    surface: z.string().min(3),
    textPrimary: z.string().min(3),
    textSecondary: z.string().min(3),
    success: z.string().min(3),
    warning: z.string().min(3),
    danger: z.string().min(3),
    info: z.string().min(3).optional()
  }),
  typography: z.object({
    fontFamily: z.string().min(2),
    scale: z.record(z.string(), z.string()),
    weights: z.record(z.string(), z.number()).optional()
  }),
  spacing: z.object({
    base: z.number().positive(),
    scale: z.array(z.number().positive())
  }),
  radius: z.record(z.string(), z.string()),
  shadows: z.record(z.string(), z.string()).optional(),
  breakpoints: z.record(z.string(), z.string()).optional()
});

export const DesignConstitutionSchema = z.object({
  project: z.object({
    name: z.string().min(2),
    type: z.string().min(2),
    platform: PlatformSchema,
    frontendStack: FrontendStackSchema,
    designTone: z.string().min(2),
    strictness: StrictnessSchema
  }),
  version: z.string().min(1),
  tokens: TokensSchema,
  requiredStates: z.array(z.string()),
  rules: z.object({
    universal: z.array(z.string()),
    accessibility: z.array(z.string()),
    components: z.array(z.string()),
    states: z.array(z.string()),
    product: z.array(z.string()),
    screen: z.array(z.string()),
    businessRisk: z.array(z.string()),
    agentBehavior: z.array(z.string()),
    trends: z.array(z.string()),
    antiPatterns: z.array(z.string())
  }),
  createdAt: z.string(),
  updatedAt: z.string()
});

export const ProjectConfigSchema = z.object({
  projectName: z.string().min(2),
  productType: z.string().min(2),
  platform: PlatformSchema,
  frontendStack: FrontendStackSchema,
  designTone: z.string().min(2),
  strictness: StrictnessSchema,
  agents: z.array(z.string())
});