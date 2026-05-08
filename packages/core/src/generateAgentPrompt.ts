import type {
  GenerateAgentPromptInput,
  UXPreflightRule,
  UXPreflightRulePack
} from "./types.js";

function flattenRules(rulePacks: UXPreflightRulePack[]) {
  return rulePacks.flatMap((pack) => pack.rules);
}

function createRuleMap(rulePacks: UXPreflightRulePack[]) {
  const rules = flattenRules(rulePacks);
  const map = new Map<string, UXPreflightRule>();

  rules.forEach((rule) => {
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

function formatRuleLine(rule: UXPreflightRule, detailLevel: "compact" | "detailed") {
  if (detailLevel === "compact") {
    return `- [${rule.severity.toUpperCase()}] ${rule.title}`;
  }

  const doNotText =
    rule.doNot && rule.doNot.length > 0
      ? `\n  Do not:\n${rule.doNot.map((item) => `  - ${item}`).join("\n")}`
      : "";

  return `- [${rule.severity.toUpperCase()}] ${rule.title}\n  ${rule.description}${doNotText}`;
}

function formatRuleGroup(
  title: string,
  ruleIds: string[],
  ruleMap: Map<string, UXPreflightRule>,
  detailLevel: "compact" | "detailed"
) {
  const rules = ruleIds
    .map((id) => ruleMap.get(id))
    .filter((rule): rule is UXPreflightRule => Boolean(rule));

  if (rules.length === 0) {
    return `## ${title}\n\n- No rules configured.`;
  }

  return `## ${title}\n\n${rules
    .map((rule) => formatRuleLine(rule, detailLevel))
    .join("\n")}`;
}

function formatTokens(input: GenerateAgentPromptInput) {
  const { tokens } = input.constitution;

  return `## Design Tokens Must Be Followed

Use only the project design tokens unless the user explicitly asks to evolve the design system.

### Colors

- Primary: ${tokens.colors.primary}
- Secondary: ${tokens.colors.secondary ?? "Not configured"}
- Background: ${tokens.colors.background}
- Surface: ${tokens.colors.surface}
- Text Primary: ${tokens.colors.textPrimary}
- Text Secondary: ${tokens.colors.textSecondary}
- Success: ${tokens.colors.success}
- Warning: ${tokens.colors.warning}
- Danger: ${tokens.colors.danger}
- Info: ${tokens.colors.info ?? "Not configured"}

### Typography

- Font Family: ${tokens.typography.fontFamily}
- Font Sizes: ${Object.entries(tokens.typography.scale)
    .map(([key, value]) => `${key}: ${value}`)
    .join(", ")}

### Spacing

- Base Unit: ${tokens.spacing.base}px
- Scale: ${tokens.spacing.scale.map((value) => `${value}px`).join(", ")}

### Radius

${formatList(Object.entries(tokens.radius).map(([key, value]) => `${key}: ${value}`))}

### Shadows

${formatList(
  tokens.shadows
    ? Object.entries(tokens.shadows).map(([key, value]) => `${key}: ${value}`)
    : []
)}
`;
}

function collectDoNotRules(rulePacks: UXPreflightRulePack[]) {
  const rules = flattenRules(rulePacks);
  const doNotRules = rules.flatMap((rule) => rule.doNot ?? []);
  return Array.from(new Set(doNotRules));
}

export function generateAgentPrompt(input: GenerateAgentPromptInput) {
  const detailLevel = input.detailLevel ?? "compact";
  const targetAgent = input.targetAgent ?? "generic";
  const outputFormat = input.outputFormat ?? "Complete production-ready frontend solution";
  const ruleMap = createRuleMap(input.rulePacks);
  const doNotRules = collectDoNotRules(input.rulePacks);

  const sections = [
    `# UXPreflight Agent Prompt

You are working inside a project that uses UXPreflight.

Before generating or modifying any UI, frontend code, layout, component, style, or design system file, you must follow the project design constitution below.

Target Agent: ${targetAgent}
Output Expected: ${outputFormat}
`,

    `## Project Context

- Project Name: ${input.constitution.project.name}
- Product Type: ${input.constitution.project.type}
- Platform: ${input.constitution.project.platform}
- Frontend Stack: ${input.constitution.project.frontendStack}
- Design Tone: ${input.constitution.project.designTone}
- Strictness: ${input.constitution.project.strictness}
- Screen Name: ${input.screenName}
- Screen Type: ${input.screenType ?? "Not specified"}

## User Requirement

${input.userRequirement}
`,

    formatTokens(input),

    `## Required States

Every relevant screen/component must consider these states:

${formatList(input.constitution.requiredStates)}
`,

    formatRuleGroup(
      "Universal UX Rules",
      input.constitution.rules.universal,
      ruleMap,
      detailLevel
    ),

    formatRuleGroup(
      "Accessibility Rules",
      input.constitution.rules.accessibility,
      ruleMap,
      detailLevel
    ),

    formatRuleGroup(
      "State Coverage Rules",
      input.constitution.rules.states,
      ruleMap,
      detailLevel
    ),

    formatRuleGroup(
      "Component Rules",
      input.constitution.rules.components,
      ruleMap,
      detailLevel
    ),

    formatRuleGroup(
      "Product-Type Rules",
      input.constitution.rules.product,
      ruleMap,
      detailLevel
    ),

    formatRuleGroup(
      "Screen-Type Rules",
      input.constitution.rules.screen,
      ruleMap,
      detailLevel
    ),

    `## Global Do-Not Rules

${formatList(doNotRules)}
`,

    `## Mandatory Agent Behavior

- Read and follow the design constitution before generating UI.
- Do not introduce new colors, spacing, typography, radius, shadows, or component styles unless the user explicitly requests design evolution.
- Reuse existing component patterns before creating new ones.
- Include loading, empty, error, success, disabled, permission denied, partial data, slow network, and mobile states where relevant.
- Do not generate decorative UI without product purpose.
- Do not hide errors, failed AI steps, failed uploads, billing risks, permission issues, or destructive-action consequences.
- Do not rewrite unrelated files or redesign the whole application unless requested.
- If the task is small, modify only the necessary component or screen.
- If a design-system change is required, mention it clearly before applying it.

## Final Output Requirement

Return the requested solution using the existing project design constitution.

The output must be:
- Consistent with design tokens
- Responsive
- Accessible
- State-aware
- Component-consistent
- Product-aware
- Screen-type-aware
- Ready for production-level implementation
`
  ];

  return `${sections.join("\n\n").trim()}\n`;
}

export function summarizeAgentPrompt(prompt: string, input: GenerateAgentPromptInput) {
  const ruleReferenceCount = Object.values(input.constitution.rules).reduce(
    (total, ruleIds) => total + ruleIds.length,
    0
  );

  return {
    characters: prompt.length,
    lines: prompt.split("\n").length,
    ruleReferenceCount,
    requiredStateCount: input.constitution.requiredStates.length,
    includesTokenGuidance: prompt.includes("Design Tokens Must Be Followed"),
    includesDoNotRules: prompt.includes("Global Do-Not Rules")
  };
}