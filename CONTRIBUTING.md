# Contributing to UXPreflight

Thank you for helping improve UXPreflight. Contributions of all sizes are welcome, from typo fixes and examples to new rule packs and CLI improvements.

## What UXPreflight Is

UXPreflight is an open-source, local-first design governance engine for AI-generated frontend applications.

It creates a project-level design constitution so AI coding/design agents follow consistent UI, UX, accessibility, component, state, spacing, color, and design-system rules before generating frontend code.

## Ways to Contribute

- Improve documentation
- Add or improve UX rules
- Add accessibility rules
- Add component rules
- Add product-type rules
- Add screen-type rules
- Improve CLI commands
- Improve adapters
- Improve validation
- Add tests
- Report bugs

## Project Philosophy

- Rules must be practical.
- Avoid vague advice like "make it beautiful."
- Prefer specific rules like "Every upload component must show file-wise status."
- Accessibility rules should be clear and usable.
- UXPreflight should stay local-first.
- The tool should help AI agents generate better UI before coding, not only review after generation.

## Local Development

```bash
npm install
npm run build
npm run ux -- doctor
npm run ux -- validate
```

## Before Submitting a PR

Run:

```bash
npm run build
npm run ux -- doctor
npm run ux -- validate
```

## Rule Contribution Guidelines

A good rule should include:

- Clear title
- Clear description
- Category
- Severity
- Confidence
- Applies-to list
- Do-not rules
- Pass examples
- Fail examples
- Tags

## Pull Request Guidelines

- Keep PRs focused.
- Explain what changed.
- Mention tests run.
- Do not mix unrelated changes.
- Update docs when behavior changes.

## Code Style

- TypeScript
- Keep functions small and readable
- Prefer clear names
- Avoid unnecessary dependencies
- Preserve local-first behavior
