#!/usr/bin/env node

import { Command } from "commander";
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  createTokenExportBundle,
  generateAgentPrompt,
  generateDesignConstitution,
  getCoreInfo,
  getSchemaInfo,
  summarizeAgentPrompt,
  summarizeDesignConstitution,
  summarizeTokenExports,
  validateDesignConstitution,
  type UXPreflightDesignConstitution,
  type UXPreflightFrontendStack,
  type UXPreflightPlatform,
  type UXPreflightProjectConfig,
  type UXPreflightPromptDetailLevel,
  type UXPreflightStrictness,
  type UXPreflightTargetAgent
} from "@uxpreflight/core";

import {
  accessibilityRules,
  componentRules,
  getDefaultRulePacks,
  productTypeRules,
  rulePacksInfo,
  screenTypeRules,
  stateCoverageRules,
  universalUXRules,
  validateDefaultRulePacks
} from "@uxpreflight/rule-packs";

import {
  adaptersInfo,
  generateAgentsMd,
  generateCursorRules,
  summarizeAgentsMd,
  summarizeCursorRules
} from "@uxpreflight/adapters";

const program = new Command();

program
  .name("uxpreflight")
  .description("Open-source design governance engine for AI-generated frontend applications.")
  .version("0.1.0");

async function pathExists(filePath: string) {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function writeFileSafe(filePath: string, content: string, force: boolean) {
  const exists = await pathExists(filePath);

  if (exists && !force) {
    return {
      filePath,
      status: "skipped"
    };
  }

  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, content, "utf8");

  return {
    filePath,
    status: exists ? "overwritten" : "created"
  };
}

function normalizeFrontendStack(value: string): UXPreflightFrontendStack {
  const normalized = value.trim().toLowerCase();

  const allowed: UXPreflightFrontendStack[] = [
    "react",
    "nextjs",
    "vue",
    "angular",
    "html_scss_js",
    "tailwind",
    "bootstrap",
    "custom"
  ];

  if (allowed.includes(normalized as UXPreflightFrontendStack)) {
    return normalized as UXPreflightFrontendStack;
  }

  return "react";
}

function normalizePlatform(value: string): UXPreflightPlatform {
  const normalized = value.trim().toLowerCase();

  const allowed: UXPreflightPlatform[] = ["web", "mobile", "desktop", "responsive"];

  if (allowed.includes(normalized as UXPreflightPlatform)) {
    return normalized as UXPreflightPlatform;
  }

  return "responsive";
}

function normalizeStrictness(value: string): UXPreflightStrictness {
  const normalized = value.trim().toLowerCase();

  const allowed: UXPreflightStrictness[] = ["relaxed", "balanced", "strict", "enterprise"];

  if (allowed.includes(normalized as UXPreflightStrictness)) {
    return normalized as UXPreflightStrictness;
  }

  return "strict";
}

function parseAgents(value: string) {
  const agents = value
    .split(",")
    .map((agent) => agent.trim().toLowerCase())
    .filter(Boolean);

  return agents.length > 0 ? agents : ["codex", "cursor"];
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await readFile(filePath, "utf8");
  return JSON.parse(content) as T;
}

function normalizeTargetAgent(value?: string): UXPreflightTargetAgent {
  const normalized = (value ?? "generic").trim().toLowerCase();

  const allowed: UXPreflightTargetAgent[] = [
    "codex",
    "cursor",
    "claude",
    "gemini",
    "windsurf",
    "chatgpt",
    "generic"
  ];

  if (allowed.includes(normalized as UXPreflightTargetAgent)) {
    return normalized as UXPreflightTargetAgent;
  }

  return "generic";
}

function normalizePromptDetailLevel(value?: string): UXPreflightPromptDetailLevel {
  const normalized = (value ?? "compact").trim().toLowerCase();

  const allowed: UXPreflightPromptDetailLevel[] = ["compact", "detailed"];

  if (allowed.includes(normalized as UXPreflightPromptDetailLevel)) {
    return normalized as UXPreflightPromptDetailLevel;
  }

  return "compact";
}

async function askQuestion(
  rl: readline.Interface,
  question: string,
  defaultValue: string
) {
  const answer = await rl.question(`${question} (${defaultValue}): `);
  return answer.trim() || defaultValue;
}

async function collectInitConfig(options: {
  yes?: boolean;
  projectName?: string;
  productType?: string;
  platform?: string;
  frontendStack?: string;
  designTone?: string;
  strictness?: string;
  agents?: string;
}) {
  if (options.yes) {
    return {
      projectName: options.projectName ?? "UXPreflight Project",
      productType: options.productType ?? "saas_admin",
      platform: normalizePlatform(options.platform ?? "responsive"),
      frontendStack: normalizeFrontendStack(options.frontendStack ?? "react"),
      designTone: options.designTone ?? "modern enterprise SaaS",
      strictness: normalizeStrictness(options.strictness ?? "strict"),
      agents: parseAgents(options.agents ?? "codex,cursor")
    } satisfies UXPreflightProjectConfig;
  }

  const rl = readline.createInterface({ input, output });

  try {
    console.log("");
    console.log("UXPreflight Init");
    console.log("----------------");
    console.log("Create a project-level design constitution for AI agents.");
    console.log("");

    const projectName = await askQuestion(rl, "Project name", options.projectName ?? "UXPreflight Project");
    const productType = await askQuestion(
      rl,
      "Product type",
      options.productType ?? "saas_admin"
    );
    const platform = await askQuestion(
      rl,
      "Platform: web, mobile, desktop, responsive",
      options.platform ?? "responsive"
    );
    const frontendStack = await askQuestion(
      rl,
      "Frontend stack: react, nextjs, vue, angular, html_scss_js, tailwind, bootstrap, custom",
      options.frontendStack ?? "react"
    );
    const designTone = await askQuestion(
      rl,
      "Design tone",
      options.designTone ?? "modern enterprise SaaS"
    );
    const strictness = await askQuestion(
      rl,
      "Strictness: relaxed, balanced, strict, enterprise",
      options.strictness ?? "strict"
    );
    const agents = await askQuestion(
      rl,
      "AI agents: comma separated",
      options.agents ?? "codex,cursor"
    );

    return {
      projectName,
      productType,
      platform: normalizePlatform(platform),
      frontendStack: normalizeFrontendStack(frontendStack),
      designTone,
      strictness: normalizeStrictness(strictness),
      agents: parseAgents(agents)
    } satisfies UXPreflightProjectConfig;
  } finally {
    rl.close();
  }
}

program
  .command("init")
  .description("Create UXPreflight design constitution and agent rule files.")
  .option("-y, --yes", "Use default answers.")
  .option("--force", "Overwrite existing UXPreflight files.")
  .option("--project-name <name>", "Project name.")
  .option("--product-type <type>", "Product type, for example saas_admin or ai_agent_app.")
  .option("--platform <platform>", "web, mobile, desktop, responsive.")
  .option("--frontend-stack <stack>", "react, nextjs, vue, angular, html_scss_js, tailwind, bootstrap, custom.")
  .option("--design-tone <tone>", "Design tone.")
  .option("--strictness <level>", "relaxed, balanced, strict, enterprise.")
  .option("--agents <agents>", "Comma-separated agents, for example codex,cursor.")
  .action(async (options) => {
    const cwd = process.cwd();
    const force = Boolean(options.force);

    const config = await collectInitConfig({
      yes: options.yes,
      projectName: options.projectName,
      productType: options.productType,
      platform: options.platform,
      frontendStack: options.frontendStack,
      designTone: options.designTone,
      strictness: options.strictness,
      agents: options.agents
    });

    const rulePacks = getDefaultRulePacks();

    const constitution = generateDesignConstitution({
      config,
      rulePacks
    });

    const tokenBundle = createTokenExportBundle(constitution.tokens);

    const agentsMd = generateAgentsMd({
      constitution,
      rulePacks
    });

    const cursorRules = generateCursorRules({
      constitution,
      rulePacks
    });

    const files = [
      {
        filePath: path.join(cwd, ".uxpreflight", "uxpreflight.config.json"),
        content: JSON.stringify(config, null, 2)
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "design-constitution.json"),
        content: JSON.stringify(constitution, null, 2)
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "tokens.json"),
        content: tokenBundle.json
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "tokens.css"),
        content: tokenBundle.css
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "_tokens.scss"),
        content: tokenBundle.scss
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "universal.rules.json"),
        content: JSON.stringify(universalUXRules, null, 2)
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "accessibility.rules.json"),
        content: JSON.stringify(accessibilityRules, null, 2)
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "states.rules.json"),
        content: JSON.stringify(stateCoverageRules, null, 2)
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "components.rules.json"),
        content: JSON.stringify(componentRules, null, 2)
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "product.rules.json"),
        content: JSON.stringify(productTypeRules, null, 2)
      },
      {
        filePath: path.join(cwd, ".uxpreflight", "screen.rules.json"),
        content: JSON.stringify(screenTypeRules, null, 2)
      },
      {
        filePath: path.join(cwd, "AGENTS.md"),
        content: agentsMd
      },
      {
        filePath: path.join(cwd, ".cursor", "rules", "uxpreflight.mdc"),
        content: cursorRules
      }
    ];

    const results = [];

    for (const file of files) {
      const result = await writeFileSafe(file.filePath, file.content, force);
      results.push(result);
    }

    console.log("");
    console.log("UXPreflight init complete.");
    console.log("--------------------------");
    console.log(`Project: ${config.projectName}`);
    console.log(`Product Type: ${config.productType}`);
    console.log(`Frontend Stack: ${config.frontendStack}`);
    console.log(`Strictness: ${config.strictness}`);
    console.log("");

    results.forEach((result) => {
      const relativePath = path.relative(cwd, result.filePath);
      console.log(`${result.status.toUpperCase()}: ${relativePath}`);
    });

    console.log("");

    if (!force && results.some((result) => result.status === "skipped")) {
      console.log("Some files were skipped because they already exist.");
      console.log("Run with --force to overwrite them.");
      console.log("");
    }

    console.log("Next:");
    console.log("- Open AGENTS.md to review AI-agent rules.");
    console.log("- Open .uxpreflight/design-constitution.json to review project design rules.");
    console.log("- Use .uxpreflight/tokens.css or .uxpreflight/_tokens.scss in your frontend.");
  });

program
  .command("generate")
  .description("Generate an AI-agent-ready prompt from the project design constitution.")
  .requiredOption("--screen <name>", "Screen name, for example Billing Settings.")
  .option("--screen-type <type>", "Screen type, for example billing_page or dashboard.")
  .option("--requirement <text>", "User requirement for the screen or task.")
  .option("--target-agent <agent>", "codex, cursor, claude, gemini, windsurf, chatgpt, generic.", "generic")
  .option("--output-format <format>", "Expected output format.", "Complete production-ready frontend solution")
  .option("--detail-level <level>", "compact or detailed.", "compact")
  .option("--out <file>", "Output prompt file.", "uxpreflight-prompt.md")
  .option("--force", "Overwrite existing prompt file.")
  .action(async (options) => {
    const cwd = process.cwd();
    const force = Boolean(options.force);

    const constitutionPath = path.join(cwd, ".uxpreflight", "design-constitution.json");

    const constitutionExists = await pathExists(constitutionPath);

    if (!constitutionExists) {
      console.log("");
      console.log("UXPreflight generate failed.");
      console.log("----------------------------");
      console.log("Missing .uxpreflight/design-constitution.json");
      console.log("");
      console.log("Run this first:");
      console.log("npm run ux -- init");
      console.log("");
      process.exitCode = 1;
      return;
    }

    const constitution = await readJsonFile<UXPreflightDesignConstitution>(constitutionPath);
    const constitutionValidation = validateDesignConstitution(constitution);

    if (!constitutionValidation.success) {
      console.log("");
      console.log("UXPreflight generate failed.");
      console.log("----------------------------");
      console.log("Invalid .uxpreflight/design-constitution.json");
      console.log("");

      constitutionValidation.error.issues.forEach((issue) => {
        console.log(`- ${issue.path.join(".")}: ${issue.message}`);
      });

      console.log("");
      process.exitCode = 1;
      return;
    }

    const requirement =
      options.requirement ??
      `Create or improve the ${options.screen} screen while strictly following the UXPreflight design constitution.`;

    const rulePacks = getDefaultRulePacks();

    const prompt = generateAgentPrompt({
      constitution,
      rulePacks,
      screenName: options.screen,
      screenType: options.screenType,
      userRequirement: requirement,
      targetAgent: normalizeTargetAgent(options.targetAgent),
      outputFormat: options.outputFormat,
      detailLevel: normalizePromptDetailLevel(options.detailLevel)
    });

    const promptSummary = summarizeAgentPrompt(prompt, {
      constitution,
      rulePacks,
      screenName: options.screen,
      screenType: options.screenType,
      userRequirement: requirement,
      targetAgent: normalizeTargetAgent(options.targetAgent),
      outputFormat: options.outputFormat,
      detailLevel: normalizePromptDetailLevel(options.detailLevel)
    });

    const outputPath = path.isAbsolute(options.out)
      ? options.out
      : path.join(cwd, options.out);

    const result = await writeFileSafe(outputPath, prompt, force);

    console.log("");
    console.log("UXPreflight prompt generated.");
    console.log("-----------------------------");
    console.log(`Screen: ${options.screen}`);
    console.log(`Screen Type: ${options.screenType ?? "Not specified"}`);
    console.log(`Target Agent: ${normalizeTargetAgent(options.targetAgent)}`);
    console.log(`Detail Level: ${normalizePromptDetailLevel(options.detailLevel)}`);
    console.log(`Output Format: ${options.outputFormat}`);
    console.log("");
    console.log(`Prompt File: ${path.relative(cwd, outputPath)}`);
    console.log(`Status: ${result.status.toUpperCase()}`);
    console.log(`Characters: ${promptSummary.characters}`);
    console.log(`Lines: ${promptSummary.lines}`);
    console.log(`Rule References: ${promptSummary.ruleReferenceCount}`);
    console.log(`Required States: ${promptSummary.requiredStateCount}`);
    console.log("");

    if (result.status === "skipped") {
      console.log("The prompt file already exists.");
      console.log("Run with --force to overwrite it.");
      console.log("");
      return;
    }

    console.log("Next:");
    console.log("- Open the generated prompt file.");
    console.log("- Copy it into your AI agent before asking it to create UI/code.");
    console.log("- The agent should now follow your project design constitution.");
  });
  
program
  .command("export")
  .description("Export UXPreflight files such as AGENTS.md, Cursor rules, tokens, and rule packs.")
  .option(
    "--target <target>",
    "all, agents-md, cursor, tokens, rules, constitution.",
    "all"
  )
  .option("--force", "Overwrite existing exported files.")
  .action(async (options) => {
    const cwd = process.cwd();
    const force = Boolean(options.force);
    const target = String(options.target).trim().toLowerCase();

    const allowedTargets = [
      "all",
      "agents-md",
      "cursor",
      "tokens",
      "rules",
      "constitution"
    ];

    if (!allowedTargets.includes(target)) {
      console.log("");
      console.log("UXPreflight export failed.");
      console.log("--------------------------");
      console.log(`Invalid target: ${target}`);
      console.log("");
      console.log("Allowed targets:");
      allowedTargets.forEach((item) => console.log(`- ${item}`));
      console.log("");
      process.exitCode = 1;
      return;
    }

    const constitutionPath = path.join(cwd, ".uxpreflight", "design-constitution.json");
    const constitutionExists = await pathExists(constitutionPath);

    if (!constitutionExists) {
      console.log("");
      console.log("UXPreflight export failed.");
      console.log("--------------------------");
      console.log("Missing .uxpreflight/design-constitution.json");
      console.log("");
      console.log("Run this first:");
      console.log("npm run ux -- init");
      console.log("");
      process.exitCode = 1;
      return;
    }

    const constitution = await readJsonFile<UXPreflightDesignConstitution>(constitutionPath);
    const constitutionValidation = validateDesignConstitution(constitution);

    if (!constitutionValidation.success) {
      console.log("");
      console.log("UXPreflight export failed.");
      console.log("--------------------------");
      console.log("Invalid .uxpreflight/design-constitution.json");
      console.log("");

      constitutionValidation.error.issues.forEach((issue) => {
        console.log(`- ${issue.path.join(".")}: ${issue.message}`);
      });

      console.log("");
      process.exitCode = 1;
      return;
    }

    const rulePacks = getDefaultRulePacks();
    const tokenBundle = createTokenExportBundle(constitution.tokens);

    const agentsMd = generateAgentsMd({
      constitution,
      rulePacks
    });

    const cursorRules = generateCursorRules({
      constitution,
      rulePacks
    });

    const files: Array<{ filePath: string; content: string; group: string }> = [];

    if (target === "all" || target === "constitution") {
      files.push({
        group: "constitution",
        filePath: path.join(cwd, ".uxpreflight", "design-constitution.json"),
        content: JSON.stringify(constitution, null, 2)
      });
    }

    if (target === "all" || target === "tokens") {
      files.push(
        {
          group: "tokens",
          filePath: path.join(cwd, ".uxpreflight", "tokens.json"),
          content: tokenBundle.json
        },
        {
          group: "tokens",
          filePath: path.join(cwd, ".uxpreflight", "tokens.css"),
          content: tokenBundle.css
        },
        {
          group: "tokens",
          filePath: path.join(cwd, ".uxpreflight", "_tokens.scss"),
          content: tokenBundle.scss
        }
      );
    }

    if (target === "all" || target === "rules") {
      files.push(
        {
          group: "rules",
          filePath: path.join(cwd, ".uxpreflight", "universal.rules.json"),
          content: JSON.stringify(universalUXRules, null, 2)
        },
        {
          group: "rules",
          filePath: path.join(cwd, ".uxpreflight", "accessibility.rules.json"),
          content: JSON.stringify(accessibilityRules, null, 2)
        },
        {
          group: "rules",
          filePath: path.join(cwd, ".uxpreflight", "states.rules.json"),
          content: JSON.stringify(stateCoverageRules, null, 2)
        },
        {
          group: "rules",
          filePath: path.join(cwd, ".uxpreflight", "components.rules.json"),
          content: JSON.stringify(componentRules, null, 2)
        },
        {
          group: "rules",
          filePath: path.join(cwd, ".uxpreflight", "product.rules.json"),
          content: JSON.stringify(productTypeRules, null, 2)
        },
        {
          group: "rules",
          filePath: path.join(cwd, ".uxpreflight", "screen.rules.json"),
          content: JSON.stringify(screenTypeRules, null, 2)
        }
      );
    }

    if (target === "all" || target === "agents-md") {
      files.push({
        group: "agents-md",
        filePath: path.join(cwd, "AGENTS.md"),
        content: agentsMd
      });
    }

    if (target === "all" || target === "cursor") {
      files.push({
        group: "cursor",
        filePath: path.join(cwd, ".cursor", "rules", "uxpreflight.mdc"),
        content: cursorRules
      });
    }

    const results = [];

    for (const file of files) {
      const result = await writeFileSafe(file.filePath, file.content, force);
      results.push({
        ...result,
        group: file.group
      });
    }

    console.log("");
    console.log("UXPreflight export complete.");
    console.log("----------------------------");
    console.log(`Target: ${target}`);
    console.log(`Files: ${results.length}`);
    console.log("");

    results.forEach((result) => {
      const relativePath = path.relative(cwd, result.filePath);
      console.log(`${result.status.toUpperCase()}: ${relativePath}`);
    });

    console.log("");

    if (!force && results.some((result) => result.status === "skipped")) {
      console.log("Some files were skipped because they already exist.");
      console.log("Run with --force to overwrite them.");
      console.log("");
    }

    console.log("Export finished.");
  });

program
  .command("doctor")
  .description("Check UXPreflight project setup health.")
  .action(() => {
    const core = getCoreInfo();
    const schema = getSchemaInfo();
    const rulePacks = getDefaultRulePacks();
    const rulePackResults = validateDefaultRulePacks();

    const sampleConfig: UXPreflightProjectConfig = {
      projectName: "Sample UXPreflight Project",
      productType: "saas_admin",
      platform: "responsive",
      frontendStack: "react",
      designTone: "modern enterprise SaaS",
      strictness: "strict",
      agents: ["codex", "cursor"]
    };

    const sampleConstitution = generateDesignConstitution({
      config: sampleConfig,
      rulePacks
    });

    const constitutionValidation = validateDesignConstitution(sampleConstitution);
    const constitutionSummary = summarizeDesignConstitution(sampleConstitution);

    const tokenBundle = createTokenExportBundle(sampleConstitution.tokens);
    const tokenSummary = summarizeTokenExports(tokenBundle);

    const samplePromptInput = {
      constitution: sampleConstitution,
      rulePacks,
      screenName: "Billing Settings",
      screenType: "billing_page",
      userRequirement:
        "Create a SaaS super admin billing settings page with API usage, plan rules, invoices, currency, tax, failed sync state, and audit log.",
      targetAgent: "codex" as const,
      outputFormat: "React + SCSS implementation",
      detailLevel: "compact" as const
    };

    const samplePrompt = generateAgentPrompt(samplePromptInput);
    const promptSummary = summarizeAgentPrompt(samplePrompt, samplePromptInput);

    const agentsMd = generateAgentsMd({
      constitution: sampleConstitution,
      rulePacks
    });

    const agentsMdSummary = summarizeAgentsMd(agentsMd, rulePacks);

    const cursorRules = generateCursorRules({
      constitution: sampleConstitution,
      rulePacks
    });

    const cursorRulesSummary = summarizeCursorRules(cursorRules, rulePacks);

    console.log("");
    console.log("UXPreflight Doctor");
    console.log("------------------");
    console.log(`Core Package: ${core.name}`);
    console.log(`Version: ${core.version}`);
    console.log(`Status: ${core.status}`);

    console.log("");
    console.log("Available Schemas:");
    schema.schemas.forEach((item) => {
      console.log(`- ${item}`);
    });

    console.log("");
    console.log(`Schema Status: ${schema.status}`);

    console.log("");
    console.log("Rule Packs:");
    console.log(`Package: ${rulePacksInfo.name}`);
    console.log(`Status: ${rulePacksInfo.status}`);

    rulePackResults.forEach((pack) => {
      console.log("");
      console.log(`- ${pack.name}`);
      console.log(`  ID: ${pack.id}`);
      console.log(`  Rules: ${pack.ruleCount}`);
      console.log(`  Valid: ${pack.valid ? "Yes" : "No"}`);

      if (!pack.valid && pack.errors.length > 0) {
        console.log("  Errors:");
        pack.errors.forEach((error) => {
          console.log(`  - ${error.path.join(".")}: ${error.message}`);
        });
      }
    });

    console.log("");
    console.log("Design Constitution Generator:");
    console.log(`Project: ${constitutionSummary.projectName}`);
    console.log(`Product Type: ${constitutionSummary.productType}`);
    console.log(`Frontend Stack: ${constitutionSummary.frontendStack}`);
    console.log(`Strictness: ${constitutionSummary.strictness}`);
    console.log(`Version: ${constitutionSummary.version}`);
    console.log(`Required States: ${constitutionSummary.requiredStateCount}`);
    console.log(`Total Rule References: ${constitutionSummary.totalRules}`);
    console.log(`Valid: ${constitutionValidation.success ? "Yes" : "No"}`);

    console.log("");
    console.log("Rule References by Group:");
    Object.entries(constitutionSummary.ruleCounts).forEach(([group, count]) => {
      console.log(`- ${group}: ${count}`);
    });

    console.log("");
    console.log("Design Token Export:");
    console.log(`JSON Characters: ${tokenSummary.jsonCharacters}`);
    console.log(`CSS Characters: ${tokenSummary.cssCharacters}`);
    console.log(`SCSS Characters: ${tokenSummary.scssCharacters}`);
    console.log(`CSS Variables: ${tokenSummary.cssVariableCount}`);
    console.log(`SCSS Variables: ${tokenSummary.scssVariableCount}`);

    console.log("");
    console.log("Prompt Compiler:");
    console.log(`Characters: ${promptSummary.characters}`);
    console.log(`Lines: ${promptSummary.lines}`);
    console.log(`Rule References: ${promptSummary.ruleReferenceCount}`);
    console.log(`Required States: ${promptSummary.requiredStateCount}`);
    console.log(`Includes Token Guidance: ${promptSummary.includesTokenGuidance ? "Yes" : "No"}`);
    console.log(`Includes Do-Not Rules: ${promptSummary.includesDoNotRules ? "Yes" : "No"}`);

    console.log("");
    console.log("Agent Adapters:");
    console.log(`Package: ${adaptersInfo.name}`);
    console.log(`Status: ${adaptersInfo.status}`);
    console.log(`Supported: ${adaptersInfo.supportedAdapters.join(", ")}`);

    console.log("");
    console.log("AGENTS.md Adapter:");
    console.log(`Characters: ${agentsMdSummary.characters}`);
    console.log(`Lines: ${agentsMdSummary.lines}`);
    console.log(`Rule Count: ${agentsMdSummary.ruleCount}`);
    console.log(
      `Includes Constitution Path: ${agentsMdSummary.includesDesignConstitutionPath ? "Yes" : "No"}`
    );
    console.log(`Includes Token Rules: ${agentsMdSummary.includesTokenRules ? "Yes" : "No"}`);
    console.log(`Includes Do-Not Rules: ${agentsMdSummary.includesDoNotRules ? "Yes" : "No"}`);
    console.log(`Includes State Rules: ${agentsMdSummary.includesStateRules ? "Yes" : "No"}`);

    console.log("");
    console.log("Cursor Rules Adapter:");
    console.log(`Characters: ${cursorRulesSummary.characters}`);
    console.log(`Lines: ${cursorRulesSummary.lines}`);
    console.log(`Rule Count: ${cursorRulesSummary.ruleCount}`);
    console.log(`Includes alwaysApply: ${cursorRulesSummary.includesAlwaysApply ? "Yes" : "No"}`);
    console.log(
      `Includes Constitution Path: ${cursorRulesSummary.includesDesignConstitutionPath ? "Yes" : "No"}`
    );
    console.log(`Includes Token Rules: ${cursorRulesSummary.includesTokenRules ? "Yes" : "No"}`);
    console.log(`Includes Do-Not Rules: ${cursorRulesSummary.includesDoNotRules ? "Yes" : "No"}`);
    console.log(`Includes State Rules: ${cursorRulesSummary.includesStateRules ? "Yes" : "No"}`);

    const hasInvalidPack = rulePackResults.some((pack) => !pack.valid);

    const hasInvalidTokenExport =
      tokenSummary.jsonCharacters === 0 ||
      tokenSummary.cssVariableCount === 0 ||
      tokenSummary.scssVariableCount === 0;

    const hasInvalidPrompt =
      promptSummary.characters === 0 ||
      !promptSummary.includesTokenGuidance ||
      !promptSummary.includesDoNotRules ||
      promptSummary.ruleReferenceCount === 0;

    const hasInvalidAgentsMd =
      agentsMdSummary.characters === 0 ||
      !agentsMdSummary.includesDesignConstitutionPath ||
      !agentsMdSummary.includesTokenRules ||
      !agentsMdSummary.includesDoNotRules ||
      !agentsMdSummary.includesStateRules;

    const hasInvalidCursorRules =
      cursorRulesSummary.characters === 0 ||
      !cursorRulesSummary.includesAlwaysApply ||
      !cursorRulesSummary.includesDesignConstitutionPath ||
      !cursorRulesSummary.includesTokenRules ||
      !cursorRulesSummary.includesDoNotRules ||
      !cursorRulesSummary.includesStateRules;

    console.log("");

    if (
      hasInvalidPack ||
      !constitutionValidation.success ||
      hasInvalidTokenExport ||
      hasInvalidPrompt ||
      hasInvalidAgentsMd ||
      hasInvalidCursorRules
    ) {
      console.log("Module 16 setup has validation errors.");
      process.exitCode = 1;
      return;
    }

    console.log("Module 16 setup looks good.");
  });

program.parse();