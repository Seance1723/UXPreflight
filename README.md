# UXPreflight

UXPreflight is an open-source, local-first design governance engine for AI-generated frontend applications.

AI agents often generate inconsistent UI. One screen may use a different color system, another may skip loading or error states, and a third may invent new component patterns. UXPreflight creates one project-level design constitution that every AI agent follows before generating frontend code.

Current version: **v0.1.0**

## What UXPreflight Creates

After `init`, UXPreflight creates project guidance files that should live with your application:

```text
.uxpreflight/
  uxpreflight.config.json
  design-constitution.json
  tokens.json
  tokens.css
  _tokens.scss
  universal.rules.json
  accessibility.rules.json
  states.rules.json
  components.rules.json
  product.rules.json
  screen.rules.json

AGENTS.md

.cursor/
  rules/
    uxpreflight.mdc
```

The design constitution is the source of truth. `AGENTS.md` and Cursor rules make that source of truth visible to coding agents and editors.

## Main Features

- Project-level design constitution
- Design token generation
- Universal UX rules
- Accessibility rules
- State coverage rules
- Component rules
- Product-type rules
- Screen-type rules
- `AGENTS.md` generator
- Cursor rules generator
- AI-agent prompt generator
- Project health doctor
- Validation command
- Rule listing and inspection commands

## Development Setup

```bash
npm install
npm run build
npm run ux -- doctor
```

## Common Commands

```bash
npm run ux -- init
npm run ux -- init --yes --force
npm run ux -- generate --screen "Billing Settings" --screen-type "billing_page" --force
npm run ux -- validate
npm run ux -- list packs
npm run ux -- list rules
npm run ux -- list rules --search upload
npm run ux -- show rule ux_goal_clarity_001
npm run ux -- show constitution
npm run ux -- export --target all --force
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Commands](docs/commands.md)
- [Project Files](docs/project-files.md)
- [Rule Packs](docs/rule-packs.md)
- [Agent Workflow](docs/agent-workflow.md)
- [Development](docs/development.md)

## Package Overview

- `packages/core`: shared types, schemas, validation, token exports, constitution generation, and prompt generation.
- `packages/cli`: local CLI for init, export, generate, validate, doctor, list, show, and version metadata.
- `packages/rule-packs`: default UX, accessibility, state, component, product, and screen rules.
- `packages/adapters`: generators for agent-facing files such as `AGENTS.md` and Cursor rules.
- `packages/checker`: checker package for validation-oriented workflows.
- `packages/mcp-server`: MCP server package for future agent integrations.

## Philosophy

UXPreflight is not a UI generator. It is a rule layer that helps AI agents generate better UI from the beginning.

It keeps product teams, designers, and developers aligned around one practical design constitution for spacing, color, typography, accessibility, component behavior, state coverage, and product-specific UX expectations.

## License

Apache-2.0
