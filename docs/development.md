# Development

This page covers local development for the UXPreflight monorepo.

## Requirements

- Node.js
- npm
- A shell that can run npm workspace scripts

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

## Run Doctor

```bash
npm run ux -- doctor
```

## Correct Local CLI Usage

Run the CLI from the repository root when you want generated files to appear in the repository root:

```bash
npm run ux -- init --yes --force
```

Avoid using the CLI workspace command for file generation:

```bash
npm run dev -w @uxpreflight/cli -- init --yes --force
```

That workspace command runs with `packages/cli` as the working directory, so it creates `.uxpreflight/`, `AGENTS.md`, and Cursor rules inside `packages/cli` instead of the intended project root.

## Recommended Root Scripts

- `npm run build`: build all packages.
- `npm run ux -- doctor`: run the local CLI health check.
- `npm run ux -- validate`: validate the current project setup.
- `npm run doctor`: shortcut for the doctor command.
- `npm run typecheck`: run TypeScript project references.

## Package Overview

- `packages/core`: shared schemas, validation, defaults, token exports, constitution generation, and prompt generation.
- `packages/cli`: command-line interface.
- `packages/rule-packs`: built-in UXPreflight rule packs.
- `packages/adapters`: output adapters for agent-facing files.
- `packages/checker`: checker package for validation workflows.
- `packages/mcp-server`: MCP server package for integrations.

## Before Commit

Run:

```bash
npm run build
npm run ux -- validate
npm run ux -- doctor
```

These commands confirm packages build, generated project files validate, and Module health checks pass.
