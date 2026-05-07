import {
  DesignConstitutionSchema,
  ProjectConfigSchema,
  RulePackSchema,
  RuleSchema,
  TokensSchema
} from "./schemas.js";

export function validateRule(input: unknown) {
  return RuleSchema.safeParse(input);
}

export function validateRulePack(input: unknown) {
  return RulePackSchema.safeParse(input);
}

export function validateTokens(input: unknown) {
  return TokensSchema.safeParse(input);
}

export function validateDesignConstitution(input: unknown) {
  return DesignConstitutionSchema.safeParse(input);
}

export function validateProjectConfig(input: unknown) {
  return ProjectConfigSchema.safeParse(input);
}

export function getSchemaInfo() {
  return {
    schemas: [
      "RuleSchema",
      "RulePackSchema",
      "TokensSchema",
      "DesignConstitutionSchema",
      "ProjectConfigSchema"
    ],
    status: "Module 2 rule schemas ready"
  };
}