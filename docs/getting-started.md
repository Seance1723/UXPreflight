# Getting Started

This guide gets a local UXPreflight checkout ready for development and shows the basic workflow for using UXPreflight in a project.

## Install Dependencies

Run this from the repository root:

```bash
npm install
```

## Build Packages

```bash
npm run build
```

## Run Doctor

Doctor checks package wiring, rule packs, prompt generation, adapters, and the current project health.

```bash
npm run ux -- doctor
```

## Initialize UXPreflight

Interactive setup:

```bash
npm run ux -- init
```

Default setup with overwrite:

```bash
npm run ux -- init --yes --force
```

Initialization creates `.uxpreflight/`, `AGENTS.md`, and `.cursor/rules/uxpreflight.mdc`.

## Validate Setup

```bash
npm run ux -- validate
```

Validation confirms the expected project files exist and can be parsed.

## Generate Your First AI-Agent-Ready Prompt

```bash
npm run ux -- generate --screen "Billing Settings" --screen-type "billing_page" --target-agent "codex" --output-format "React + SCSS implementation" --force
```

This writes `uxpreflight-prompt.md` using the active design constitution and rule packs.

## Recommended Workflow

1. Run `npm run ux -- init` in the project.
2. Commit `.uxpreflight/`, `AGENTS.md`, and `.cursor/rules/uxpreflight.mdc`.
3. Run `npm run ux -- validate` before asking an AI agent to build UI.
4. Generate a screen-specific prompt with `npm run ux -- generate`.
5. Give the prompt to your AI agent, or rely on `AGENTS.md` and Cursor rules when working in supported tools.
6. Re-run `npm run ux -- doctor` when project guidance changes.

## Design Constitution Notes

Do not randomly change the design constitution after it is created. It is the project source of truth for AI-generated UI.

When the product direction changes, update the constitution intentionally, regenerate exports with `npm run ux -- export --target all --force`, and validate the project before continuing.
