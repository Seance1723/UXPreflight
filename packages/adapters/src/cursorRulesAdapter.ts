import type {
  UXPreflightDesignConstitution,
  UXPreflightRule,
  UXPreflightRulePack
} from "@uxpreflight/core";

export interface GenerateCursorRulesInput {
  constitution: UXPreflightDesignConstitution;
  rulePacks: UXPreflightRulePack[];
}

export interface CursorRulesSummary {
  characters: number;
  lines: number;
  ruleCount: number;
  includesAlwaysApply: boolean;
  includesDesignConstitutionPath: boolean;
  includesTokenRules: boolean;
  includesStateRules: boolean;
  includesDoNotRules: boolean;
}

function flattenRules(rulePacks: UXPreflightRulePack[]) {
  return rulePacks.flatMap((pack) => pack.rules);
}

function createRuleMap(rulePacks: UXPreflightRulePack[]) {
  const map = new Map<string, UXPreflightRule>();

  flattenRules(rulePacks).forEach((rule) => {
    map.set(rule.id, rule);
  });

  return map;
}

function formatList(items: string[]) {
  if (items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function getRulesByIds(ruleIds: string[], ruleMap: Map<string, UXPreflightRule>) {
  return ruleIds
    .map((id) => ruleMap.get(id))
    .filter((rule): rule is UXPreflightRule => Boolean(rule));
}

function formatCompactRules(
  title: string,
  ruleIds: string[],
  ruleMap: Map<string, UXPreflightRule>
) {
  const rules = getRulesByIds(ruleIds, ruleMap);

  if (rules.length === 0) {
    return `## ${title}\n\n- No rules configured.`;
  }

  return `## ${title}\n\n${rules
    .map((rule) => `- [${rule.severity.toUpperCase()}] ${rule.title}`)
    .join("\n")}`;
}

function collectDoNotRules(rulePacks: UXPreflightRulePack[]) {
  return Array.from(
    new Set(
      flattenRules(rulePacks).flatMap((rule) => {
        return rule.doNot ?? [];
      })
    )
  );
}

export function generateCursorRules(input: GenerateCursorRulesInput) {
  const { constitution, rulePacks } = input;
  const ruleMap = createRuleMap(rulePacks);
  const doNotRules = collectDoNotRules(rulePacks);

  return `---
description: UXPreflight mandatory UI/UX governance rules
alwaysApply: true
---

# UXPreflight Cursor Rules

This project uses UXPreflight.

Before creating, editing, or refactoring any UI, frontend component, layout, style, page, or design-system file, follow these rules.

## Required Source of Truth

Always read and follow these files when available:

- \`.uxpreflight/design-constitution.json\`
- \`.uxpreflight/tokens.json\`
- \`.uxpreflight/components.rules.json\`
- \`.uxpreflight/states.rules.json\`
- \`.uxpreflight/accessibility.rules.json\`
- \`.uxpreflight/uxpreflight.config.json\`

## Project Context

- Project Name: ${constitution.project.name}
- Product Type: ${constitution.project.type}
- Platform: ${constitution.project.platform}
- Frontend Stack: ${constitution.project.frontendStack}
- Design Tone: ${constitution.project.designTone}
- Strictness: ${constitution.project.strictness}
- UXPreflight Version: ${constitution.version}

## Cursor Agent Behavior

Cursor must follow these rules:

- Do not redesign the whole application unless requested.
- Do not rewrite unrelated files.
- Do not introduce random colors, spacing, radius, shadows, typography, or component variants.
- Do not create duplicate components when an existing component can be reused.
- Do not change global design tokens unless the user explicitly asks to evolve the design system.
- Before creating a new component, check whether an existing component pattern already exists.
- Keep changes scoped to the requested screen, component, or flow.
- Explain any design-system change before applying it.

## Design Token Rules

Use approved tokens only.

### Colors

- Primary: ${constitution.tokens.colors.primary}
- Secondary: ${constitution.tokens.colors.secondary ?? "Not configured"}
- Background: ${constitution.tokens.colors.background}
- Surface: ${constitution.tokens.colors.surface}
- Text Primary: ${constitution.tokens.colors.textPrimary}
- Text Secondary: ${constitution.tokens.colors.textSecondary}
- Success: ${constitution.tokens.colors.success}
- Warning: ${constitution.tokens.colors.warning}
- Danger: ${constitution.tokens.colors.danger}
- Info: ${constitution.tokens.colors.info ?? "Not configured"}

### Typography

- Font Family: ${constitution.tokens.typography.fontFamily}
- Font Sizes: ${Object.entries(constitution.tokens.typography.scale)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ")}

### Spacing

- Base Unit: ${constitution.tokens.spacing.base}px
- Scale: ${constitution.tokens.spacing.scale.map((value) => `${value}px`).join(", ")}

### Radius

${formatList(Object.entries(constitution.tokens.radius).map(([key, value]) => `${key}: ${value}`))}

## Required States

Every relevant screen/component must consider these states:

${formatList(constitution.requiredStates)}

${formatCompactRules("Universal UX Rules", constitution.rules.universal, ruleMap)}

${formatCompactRules("Accessibility Rules", constitution.rules.accessibility, ruleMap)}

${formatCompactRules("State Coverage Rules", constitution.rules.states, ruleMap)}

${formatCompactRules("Component Rules", constitution.rules.components, ruleMap)}

${formatCompactRules("Product-Type Rules", constitution.rules.product, ruleMap)}

${formatCompactRules("Screen-Type Rules", constitution.rules.screen, ruleMap)}

## Global Do-Not Rules

${formatList(doNotRules)}

## Mandatory UI Rules

- Every form must have visible labels.
- Every form must include validation, loading, error, disabled, and success behavior where relevant.
- Every table/list must include loading, empty, error, filtered-empty, and mobile behavior.
- Every upload flow must show file-wise status.
- Every AI-agent workflow must show current step, completed steps, failed steps, and retry behavior.
- Every dangerous action must show confirmation and consequences.
- Every important async action must show system status.
- Every page must be responsive.
- Every error must explain recovery.
- Every empty state must guide the next action.
- Every status must use text, not color only.

## Output Rules

When generating or editing code:

- Follow the project frontend stack.
- Use existing project structure.
- Use reusable components.
- Use design tokens.
- Keep the output responsive.
- Keep the output accessible.
- Include relevant UI states.
- Avoid decorative UI without product purpose.
- Do not introduce unnecessary libraries.
- Do not break existing routes, imports, components, or API connections.
`;
}

export function summarizeCursorRules(
  content: string,
  rulePacks: UXPreflightRulePack[]
): CursorRulesSummary {
  return {
    characters: content.length,
    lines: content.split("\n").length,
    ruleCount: flattenRules(rulePacks).length,
    includesAlwaysApply: content.includes("alwaysApply: true"),
    includesDesignConstitutionPath: content.includes(".uxpreflight/design-constitution.json"),
    includesTokenRules: content.includes("Design Token Rules"),
    includesStateRules: content.includes("Required States"),
    includesDoNotRules: content.includes("Global Do-Not Rules")
  };
}