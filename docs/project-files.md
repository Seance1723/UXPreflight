# Project Files

UXPreflight writes project-level guidance files. They are meant to be committed so every person and AI agent works from the same rules.

## Generated Files

### `.uxpreflight/uxpreflight.config.json`

Stores the project setup values used to generate the constitution, including project name, product type, platform, frontend stack, design tone, strictness, and target agents.

### `.uxpreflight/design-constitution.json`

The source of truth for the project. It combines project context, design tokens, required states, and rule references into one file that agents should follow before creating UI.

### `.uxpreflight/tokens.json`

Machine-readable design tokens for colors, typography, spacing, radius, shadows, and breakpoints.

### `.uxpreflight/tokens.css`

CSS custom properties generated from the token set.

### `.uxpreflight/_tokens.scss`

SCSS variables generated from the token set.

### `.uxpreflight/universal.rules.json`

Universal UX rules such as clear screen goals, obvious primary actions, visible system status, useful empty states, and dangerous action confirmation.

### `.uxpreflight/accessibility.rules.json`

Accessibility rules for visible labels, focus states, keyboard support, readable contrast, semantic structure, and non-color-only status.

### `.uxpreflight/states.rules.json`

State coverage rules for loading, empty, error, success, disabled, permission denied, partial data, slow network, mobile, and unsaved changes states.

### `.uxpreflight/components.rules.json`

Component rules for buttons, forms, tables, cards, modals, tabs, uploads, status badges, KPI cards, and AI activity timelines.

### `.uxpreflight/product.rules.json`

Product-type rules for SaaS admin, AI agent apps, hiring platforms, assessment tools, dashboards, e-commerce, CRM, HRMS, project management, and analytics platforms.

### `.uxpreflight/screen.rules.json`

Screen-type rules for dashboards, settings, project details, billing, upload processing, table/list screens, forms, wizards, login, and analytics screens.

### `AGENTS.md`

Repository-level instructions for AI coding agents. It exists so tools such as Codex can read project guidance before doing work and apply UXPreflight rules consistently.

### `.cursor/rules/uxpreflight.mdc`

Cursor-specific project rules. It exists so Cursor can apply the same UXPreflight constitution and rule guidance inside the editor.

## What Should Be Committed

Commit these files:

```text
.uxpreflight/
AGENTS.md
.cursor/rules/uxpreflight.mdc
```

Also commit `uxpreflight-prompt.md` only when the prompt is useful as project documentation or review material. It can also be treated as a temporary generated artifact.

## Why the Constitution Is the Source of Truth

The design constitution is the single place where project context, token decisions, required states, and rule references come together. Other generated files make that constitution easier for agents and tools to consume, but they should not drift away from it.

When guidance needs to change, update the source inputs intentionally and regenerate exports instead of hand-editing generated files in different directions.
