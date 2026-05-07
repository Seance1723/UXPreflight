export type UXPreflightStrictness = "relaxed" | "balanced" | "strict" | "enterprise";

export type UXPreflightSeverity = "info" | "warning" | "critical" | "blocker";

export type UXPreflightRuleCategory =
  | "universal_ux"
  | "accessibility"
  | "state"
  | "component"
  | "product"
  | "screen"
  | "business_risk"
  | "agent_behavior"
  | "trend"
  | "anti_pattern";

export type UXPreflightRuleConfidence = "low" | "medium" | "high";

export type UXPreflightPlatform = "web" | "mobile" | "desktop" | "responsive";

export type UXPreflightFrontendStack =
  | "react"
  | "nextjs"
  | "vue"
  | "angular"
  | "html_scss_js"
  | "tailwind"
  | "bootstrap"
  | "custom";

export interface UXPreflightRule {
  id: string;
  title: string;
  description: string;
  category: UXPreflightRuleCategory;
  severity: UXPreflightSeverity;
  confidence: UXPreflightRuleConfidence;
  appliesTo: string[];
  doNot?: string[];
  examples?: {
    pass?: string[];
    fail?: string[];
  };
  tags?: string[];
}

export interface UXPreflightRulePack {
  id: string;
  name: string;
  description: string;
  version: string;
  category: UXPreflightRuleCategory;
  rules: UXPreflightRule[];
}

export interface UXPreflightTokens {
  colors: {
    primary: string;
    secondary?: string;
    background: string;
    surface: string;
    textPrimary: string;
    textSecondary: string;
    success: string;
    warning: string;
    danger: string;
    info?: string;
  };
  typography: {
    fontFamily: string;
    scale: Record<string, string>;
    weights?: Record<string, number>;
  };
  spacing: {
    base: number;
    scale: number[];
  };
  radius: Record<string, string>;
  shadows?: Record<string, string>;
  breakpoints?: Record<string, string>;
}

export interface UXPreflightDesignConstitution {
  project: {
    name: string;
    type: string;
    platform: UXPreflightPlatform;
    frontendStack: UXPreflightFrontendStack;
    designTone: string;
    strictness: UXPreflightStrictness;
  };
  version: string;
  tokens: UXPreflightTokens;
  requiredStates: string[];
  rules: {
    universal: string[];
    accessibility: string[];
    components: string[];
    states: string[];
    product: string[];
    screen: string[];
    businessRisk: string[];
    agentBehavior: string[];
    trends: string[];
    antiPatterns: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export interface UXPreflightProjectConfig {
  projectName: string;
  productType: string;
  platform: UXPreflightPlatform;
  frontendStack: UXPreflightFrontendStack;
  designTone: string;
  strictness: UXPreflightStrictness;
  agents: string[];
}

export interface GenerateDesignConstitutionInput {
  config: UXPreflightProjectConfig;
  rulePacks: UXPreflightRulePack[];
  tokens?: UXPreflightTokens;
  version?: string;
}