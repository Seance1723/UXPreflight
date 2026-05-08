export const CLI_NAME = "uxpreflight";

export const CLI_VERSION = "0.1.0";

export const CURRENT_MODULE = "Release 0.2 Module 5";

export const CLI_DESCRIPTION =
  "Open-source design governance engine for AI-generated frontend applications.";

export const CLI_HELP_TEXT = `

Examples:

  Initialize UXPreflight in current project:
    npm run ux -- init

  Initialize with defaults:
    npm run ux -- init --yes --force

  Generate an AI-agent-ready prompt:
    npm run ux -- generate --screen "Billing Settings" --screen-type "billing_page" --force

  Export all UXPreflight files:
    npm run ux -- export --target all --force

  Validate current project setup:
    npm run ux -- validate

  List rule packs:
    npm run ux -- list packs

  List all rules:
    npm run ux -- list rules

  Search upload-related rules:
    npm run ux -- list rules --search upload

  Show one rule:
    npm run ux -- show rule ux_goal_clarity_001

  Show active design constitution:
    npm run ux -- show constitution

    Scan current project:
    npm run ux -- scan

  Scan current project as JSON:
    npm run ux -- scan --json
  
    Scan current project:
    npm run ux -- scan

  Scan current project and discover design tokens:
    npm run ux -- scan --tokens

  Scan current project as JSON:
    npm run ux -- scan --tokens --json
    
    Scan current project and discover component patterns:
    npm run ux -- scan --components

  Scan tokens and components together:
    npm run ux -- scan --tokens --components
    
    Scan current project and suggest design tokens:
    npm run ux -- scan --suggest-tokens

  Scan tokens, components, and suggestions together:
    npm run ux -- scan --tokens --components --suggest-tokens
    
    Scan current project and suggest component registry:
    npm run ux -- scan --suggest-components

  Scan everything together:
    npm run ux -- scan --tokens --components --suggest-tokens --suggest-components
    
  Check full project health:
    npm run ux -- doctor
`;

export const COMMAND_HINTS = {
  init: "Create .uxpreflight files, AGENTS.md, and Cursor rules.",
  generate: "Generate a prompt for an AI agent using the project design constitution.",
  export: "Regenerate selected UXPreflight files.",
  list: "List rule packs, rules, states, or tokens.",
  show: "Show one rule, one pack, or the active design constitution.",
  validate: "Validate current UXPreflight project files.",
  doctor: "Run full internal and project health checks.",
  scan: "Scan the current project, discover patterns, suggest design tokens, and suggest component registry items."
};
