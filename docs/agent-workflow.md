# Agent Workflow

UXPreflight is designed to sit before UI generation. It gives AI agents a stable rule layer so generated frontend work starts from the same product and design expectations.

```text
User initializes UXPreflight
↓
UXPreflight creates design constitution
↓
UXPreflight creates AGENTS.md and Cursor rules
↓
User generates screen-specific prompt
↓
AI agent follows project rules
↓
Frontend output stays consistent
```

## Recommended Agent Process

1. Read the repository guidance files before changing UI.
2. Treat `.uxpreflight/design-constitution.json` as the source of truth.
3. Reuse project tokens and existing component patterns.
4. Generate or follow a screen-specific prompt for focused UI work.
5. Include required states such as loading, empty, error, permission denied, mobile, and unsaved changes when relevant.
6. Validate the project after changing UXPreflight-generated guidance.

## What Agents Must Follow

- The active design constitution.
- Approved design tokens.
- Universal UX, accessibility, state, component, product, and screen rules.
- Existing project structure and frontend stack.
- Accessible HTML and keyboard-supporting component patterns.

## What Agents Should Do

- Make the screen goal clear.
- Make the primary action obvious.
- Show system status and recovery paths.
- Use semantic structure and visible focus states.
- Design responsive mobile behavior.
- Confirm destructive actions with clear consequence text.

## What Agents Should Not Do

- Invent new colors, spacing, radius, typography, or button styles without reason.
- Skip loading, empty, error, disabled, permission denied, or mobile states.
- Hide important actions or failures.
- Use vague labels such as `Submit` when a specific action label is possible.
- Hand-edit generated rule files in ways that drift from the design constitution.

## Cursor Workflow

Cursor uses `.cursor/rules/uxpreflight.mdc`. After `npm run ux -- init`, keep this file committed so Cursor can apply UXPreflight guidance automatically in the project.

When guidance changes, regenerate Cursor rules:

```bash
npm run ux -- export --target cursor --force
```

## Generic and Codex Workflow

Generic agents and Codex use `AGENTS.md` as repository guidance. Repository-level `AGENTS.md` is useful because Codex reads `AGENTS.md` before doing work and uses it as repository guidance.

When guidance changes, regenerate `AGENTS.md`:

```bash
npm run ux -- export --target agents-md --force
```

## Prompt Workflow

Use `generate` to create `uxpreflight-prompt.md` for a specific screen:

```bash
npm run ux -- generate --screen "Billing Settings" --screen-type "billing_page" --target-agent "codex" --output-format "React + SCSS implementation" --force
```

Give that prompt to the AI agent when you want a focused implementation brief that includes the project constitution, relevant rules, required states, and output expectations.
