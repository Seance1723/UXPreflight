import type {
  UXPreflightDesignConstitution,
  UXPreflightRule,
  UXPreflightRulePack
} from "@uxpreflight/core";

export interface GenerateAgentsMdInput {
  constitution: UXPreflightDesignConstitution;
  rulePacks: UXPreflightRulePack[];
  projectRoot?: string;
}

export interface AgentsMdSummary {
  characters: number;
  lines: number;
  ruleCount: number;
  includesDesignConstitutionPath: boolean;
  includesTokenRules: boolean;
  includesDoNotRules: boolean;
  includesStateRules: boolean;
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

function formatRuleSummary(title: string, ruleIds: string[], ruleMap: Map<string, UXPreflightRule>) {
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

export function generateAgentsMd(input: GenerateAgentsMdInput) {
  const { constitution, rulePacks } = input;
  const ruleMap = createRuleMap(rulePacks);
  const doNotRules = collectDoNotRules(rulePacks);

  return `# UXPreflight Agent Rules

This project uses UXPreflight.

Before creating, editing, or refactoring any UI, frontend component, layout, style, page, or design-system file, follow the project design constitution.

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

## Design Token Rules

Use the approved design tokens.

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

${formatRuleSummary("Universal UX Rules", constitution.rules.universal, ruleMap)}

${formatRuleSummary("Accessibility Rules", constitution.rules.accessibility, ruleMap)}

${formatRuleSummary("State Coverage Rules", constitution.rules.states, ruleMap)}

${formatRuleSummary("Component Rules", constitution.rules.components, ruleMap)}

${formatRuleSummary("Product-Type Rules", constitution.rules.product, ruleMap)}

${formatRuleSummary("Screen-Type Rules", constitution.rules.screen, ruleMap)}

## Global Do-Not Rules

${formatList(doNotRules)}

## Mandatory Agent Behavior

- Do not introduce new colors unless the user explicitly asks to evolve the design system.
- Do not introduce new spacing, radius, shadow, typography, or component variants without reason.
- Reuse existing components before creating new ones.
- Use existing tokens instead of hardcoded values.
- Every table/list must include loading, empty, error, and mobile behavior.
- Every form must include visible labels, validation, error recovery, and disabled/loading states.
- Every upload flow must include file-wise status and retry behavior.
- Every AI-agent flow must show current step, completed steps, failed steps, and recovery action.
- Every destructive action must include confirmation and consequence explanation.
- Do not redesign unrelated screens while solving a small task.
- Do not rewrite the whole app unless the user explicitly requests it.
- Do not hide permission, billing, upload, sync, or AI-processing failures.
- Do not create decorative UI that has no product purpose.

## Output Rules

When generating frontend code:

- Follow the existing project structure.
- Follow the project frontend stack.
- Keep code reusable and maintainable.
- Use accessible HTML and component patterns.
- Include responsive behavior.
- Include all relevant states.
- Explain any design-system change before applying it.
- Keep the output consistent with UXPreflight.
`;
}

export function summarizeAgentsMd(content: string, rulePacks: UXPreflightRulePack[]): AgentsMdSummary {
  return {
    characters: content.length,
    lines: content.split("\n").length,
    ruleCount: flattenRules(rulePacks).length,
    includesDesignConstitutionPath: content.includes(".uxpreflight/design-constitution.json"),
    includesTokenRules: content.includes("Design Token Rules"),
    includesDoNotRules: content.includes("Global Do-Not Rules"),
    includesStateRules: content.includes("Required States")
  };
}