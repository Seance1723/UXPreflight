# UXPreflight

UXPreflight is an open-source design governance engine for AI-generated frontend applications.

It creates a project-level design constitution and helps AI agents follow consistent UI, UX, accessibility, component, state, spacing, color, and design-system rules before generating frontend code.

## Current Version

v0.1.0 — Module 1 Foundation

## Goal

Stop AI agents from redesigning your app every time they code.

## Packages

- `@uxpreflight/core` — Core rule engine
- `@uxpreflight/cli` — Command line interface
- `@uxpreflight/rule-packs` — Default UX/UI rule packs
- `@uxpreflight/adapters` — Agent exports such as AGENTS.md and Cursor rules
- `@uxpreflight/checker` — Design drift checker
- `@uxpreflight/mcp-server` — Future MCP server

## Development

```bash
npm install
npm run build
npm run doctor