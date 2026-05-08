# Rule Packs

UXPreflight organizes design governance into rule packs. Each pack can be listed and inspected from the CLI.

## Universal UX Rules

Universal UX rules apply to almost every screen. They cover basic product quality expectations such as clear screen goals, obvious primary actions, visible system status, useful empty states, and confirmation for dangerous actions.

Examples:

- A settings screen should explain what settings are being controlled.
- A destructive delete action should require confirmation and explain the consequence.
- An empty table should tell the user what to do next.

## Accessibility Rules

Accessibility rules help generated UI remain usable with keyboards, assistive technology, and readable visual contrast.

Examples:

- Inputs need visible labels.
- Icon-only actions need accessible labels.
- Status cannot depend on color alone.

## State Coverage Rules

State coverage rules require screens and components to handle real application states instead of only the happy path.

Examples:

- Tables need loading, empty, error, and mobile behavior.
- Restricted areas need a permission denied state.
- Long-running work needs slow network or processing feedback.

## Component Rules

Component rules define expected behavior for common interface building blocks.

Examples:

- Buttons need clear action hierarchy.
- Forms need validation and recovery.
- Upload components need file-wise status and retry behavior.

## Product-Type Rules

Product-type rules adapt UX expectations to the kind of product being built.

Examples:

- SaaS admin panels should prioritize control, clarity, and auditability.
- AI agent apps should show transparency and user control.
- Analytics platforms should explain metric source and date range.

## Screen-Type Rules

Screen-type rules describe expectations for common screen patterns.

Examples:

- Billing screens should show usage, rules, invoices, and auditability.
- Wizard flows should show progress and preserve previous step data.
- Upload and processing screens should show file-level progress and failures.

## Inspecting Rule Packs

```bash
npm run ux -- list packs
npm run ux -- list rules
npm run ux -- show pack component-rules
npm run ux -- show rule ux_goal_clarity_001
```
