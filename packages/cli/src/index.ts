#!/usr/bin/env node

import { Command } from "commander";
import { mkdir, writeFile, access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import {
  createDefaultTokens,
  createTokenExportBundle,
  DEFAULT_REQUIRED_STATES,
  generateAgentPrompt,
  generateDesignConstitution,
  getCoreInfo,
  getSchemaInfo,
  summarizeAgentPrompt,
  summarizeDesignConstitution,
  summarizeTokenExports,
  validateDesignConstitution,
  validateProjectConfig,
  validateRulePack,
  validateTokens,
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

import {
  CLI_DESCRIPTION,
  CLI_HELP_TEXT,
  CLI_NAME,
  CLI_VERSION,
  COMMAND_HINTS,
  CURRENT_MODULE
} from "./cliMeta.js";

import {
  discoverComponentPatternsFromFiles,
  discoverDesignTokensFromFiles,
  scanProject,
  scannerInfo
} from "@uxpreflight/scanner";

const program = new Command();

program
  .name(CLI_NAME)
  .description(CLI_DESCRIPTION)
  .version(CLI_VERSION)
  .addHelpText("after", CLI_HELP_TEXT);

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

type ProjectHealthStatus = "ok" | "missing" | "invalid";

interface ProjectHealthCheck {
  label: string;
  relativePath: string;
  status: ProjectHealthStatus;
  message: string;
}

type UXPreflightValidationIssue = {
  path: PropertyKey[];
  message: string;
};

type UXPreflightValidationResult = {
  success: boolean;
  error?: {
    issues: UXPreflightValidationIssue[];
  };
};

function formatIssuePath(pathValue: PropertyKey[]) {
  return pathValue.map((item) => String(item)).join(".");
}

async function checkTextFile(
  cwd: string,
  relativePath: string,
  label: string,
  requiredIncludes: string[]
): Promise<ProjectHealthCheck> {
  const filePath = path.join(cwd, relativePath);
  const exists = await pathExists(filePath);

  if (!exists) {
    return {
      label,
      relativePath,
      status: "missing",
      message: "File is missing."
    };
  }

  const content = await readFile(filePath, "utf8");
  const missingIncludes = requiredIncludes.filter((item) => !content.includes(item));

  if (missingIncludes.length > 0) {
    return {
      label,
      relativePath,
      status: "invalid",
      message: `Missing expected content: ${missingIncludes.join(", ")}`
    };
  }

  return {
    label,
    relativePath,
    status: "ok",
    message: "Valid."
  };
}

async function checkJsonFile(
  cwd: string,
  relativePath: string,
  label: string,
  validator: (value: unknown) => UXPreflightValidationResult
): Promise<ProjectHealthCheck> {
  const filePath = path.join(cwd, relativePath);
  const exists = await pathExists(filePath);

  if (!exists) {
    return {
      label,
      relativePath,
      status: "missing",
      message: "File is missing."
    };
  }

  try {
    const content = await readFile(filePath, "utf8");
    const parsed = JSON.parse(content) as unknown;
    const result = validator(parsed);

    if (!result.success) {
      const firstIssue = result.error?.issues[0];

      return {
        label,
        relativePath,
        status: "invalid",
        message: firstIssue
          ? `${formatIssuePath(firstIssue.path)}: ${firstIssue.message}`
          : "JSON validation failed."
      };
    }

    return {
      label,
      relativePath,
      status: "ok",
      message: "Valid."
    };
  } catch (error) {
    return {
      label,
      relativePath,
      status: "invalid",
      message: error instanceof Error ? error.message : "Failed to read or parse JSON."
    };
  }
}

async function checkProjectHealth(cwd: string) {
  const checks: ProjectHealthCheck[] = [];

  checks.push(
    await checkJsonFile(
      cwd,
      ".uxpreflight/uxpreflight.config.json",
      "Project Config",
      validateProjectConfig
    )
  );

  checks.push(
    await checkJsonFile(
      cwd,
      ".uxpreflight/design-constitution.json",
      "Design Constitution",
      validateDesignConstitution
    )
  );

  checks.push(
    await checkJsonFile(
      cwd,
      ".uxpreflight/tokens.json",
      "Design Tokens JSON",
      validateTokens
    )
  );

  checks.push(
    await checkTextFile(
      cwd,
      ".uxpreflight/tokens.css",
      "Design Tokens CSS",
      ["--ux-color-primary", "--ux-space-base"]
    )
  );

  checks.push(
    await checkTextFile(
      cwd,
      ".uxpreflight/_tokens.scss",
      "Design Tokens SCSS",
      ["$ux-color-primary", "$ux-space-base"]
    )
  );

  const ruleFiles = [
    [".uxpreflight/universal.rules.json", "Universal Rules"],
    [".uxpreflight/accessibility.rules.json", "Accessibility Rules"],
    [".uxpreflight/states.rules.json", "State Rules"],
    [".uxpreflight/components.rules.json", "Component Rules"],
    [".uxpreflight/product.rules.json", "Product Rules"],
    [".uxpreflight/screen.rules.json", "Screen Rules"]
  ] as const;

  for (const [relativePath, label] of ruleFiles) {
    checks.push(await checkJsonFile(cwd, relativePath, label, validateRulePack));
  }

  checks.push(
    await checkTextFile(
      cwd,
      "AGENTS.md",
      "AGENTS.md",
      ["UXPreflight Agent Rules", ".uxpreflight/design-constitution.json"]
    )
  );

  checks.push(
    await checkTextFile(
      cwd,
      ".cursor/rules/uxpreflight.mdc",
      "Cursor Rules",
      ["alwaysApply: true", "UXPreflight Cursor Rules"]
    )
  );

  const summary = {
    total: checks.length,
    ok: checks.filter((check) => check.status === "ok").length,
    missing: checks.filter((check) => check.status === "missing").length,
    invalid: checks.filter((check) => check.status === "invalid").length
  };

  return {
    checks,
    summary,
    isInitialized: summary.ok > 0,
    isHealthy: summary.missing === 0 && summary.invalid === 0
  };
}

function flattenDefaultRules() {
  return getDefaultRulePacks().flatMap((pack) => {
    return pack.rules.map((rule) => ({
      ...rule,
      packId: pack.id,
      packName: pack.name
    }));
  });
}

async function getCurrentProjectConstitution(cwd: string) {
  const constitutionPath = path.join(cwd, ".uxpreflight", "design-constitution.json");
  const exists = await pathExists(constitutionPath);

  if (!exists) {
    return null;
  }

  const constitution = await readJsonFile<UXPreflightDesignConstitution>(constitutionPath);
  const validation = validateDesignConstitution(constitution);

  if (!validation.success) {
    return null;
  }

  return constitution;
}

function normalizeListType(value: string) {
  return value.trim().toLowerCase();
}

function printSectionTitle(title: string) {
  console.log("");
  console.log(title);
  console.log("-".repeat(title.length));
}

function formatOptionalList(items?: string[]) {
  if (!items || items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function findRuleById(ruleId: string) {
  const normalizedRuleId = ruleId.trim().toLowerCase();

  for (const pack of getDefaultRulePacks()) {
    const rule = pack.rules.find((item) => item.id.toLowerCase() === normalizedRuleId);

    if (rule) {
      return {
        rule,
        pack
      };
    }
  }

  return null;
}

function findPackById(packId: string) {
  const normalizedPackId = packId.trim().toLowerCase();

  return (
    getDefaultRulePacks().find((pack) => {
      return pack.id.toLowerCase() === normalizedPackId || pack.name.toLowerCase() === normalizedPackId;
    }) ?? null
  );
}

function printRuleDetails(ruleId: string) {
  const result = findRuleById(ruleId);

  if (!result) {
    console.log("");
    console.log("Rule not found.");
    console.log("---------------");
    console.log(`Rule ID: ${ruleId}`);
    console.log("");
    console.log("Try:");
    console.log("npm run ux -- list rules");
    console.log("");
    return false;
  }

  const { rule, pack } = result;

  printSectionTitle(rule.title);

  console.log(`ID: ${rule.id}`);
  console.log(`Pack: ${pack.name}`);
  console.log(`Category: ${rule.category}`);
  console.log(`Severity: ${rule.severity}`);
  console.log(`Confidence: ${rule.confidence}`);
  console.log(`Applies To: ${rule.appliesTo.join(", ")}`);
  console.log(`Tags: ${(rule.tags ?? []).join(", ") || "None"}`);

  console.log("");
  console.log("Description:");
  console.log(rule.description);

  console.log("");
  console.log("Do Not:");
  console.log(formatOptionalList(rule.doNot));

  console.log("");
  console.log("Pass Examples:");
  console.log(formatOptionalList(rule.examples?.pass));

  console.log("");
  console.log("Fail Examples:");
  console.log(formatOptionalList(rule.examples?.fail));

  return true;
}

function printPackDetails(packId: string) {
  const pack = findPackById(packId);

  if (!pack) {
    console.log("");
    console.log("Rule pack not found.");
    console.log("--------------------");
    console.log(`Pack ID/Name: ${packId}`);
    console.log("");
    console.log("Try:");
    console.log("npm run ux -- list packs");
    console.log("");
    return false;
  }

  printSectionTitle(pack.name);

  console.log(`ID: ${pack.id}`);
  console.log(`Category: ${pack.category}`);
  console.log(`Version: ${pack.version}`);
  console.log(`Rules: ${pack.rules.length}`);

  console.log("");
  console.log("Description:");
  console.log(pack.description);

  console.log("");
  console.log("Rules:");

  pack.rules.forEach((rule) => {
    console.log(`- [${rule.severity.toUpperCase()}] ${rule.id} — ${rule.title}`);
  });

  return true;
}

function printConstitutionSummary(constitution: UXPreflightDesignConstitution) {
  const summary = summarizeDesignConstitution(constitution);

  printSectionTitle("UXPreflight Design Constitution");

  console.log(`Project: ${summary.projectName}`);
  console.log(`Product Type: ${summary.productType}`);
  console.log(`Frontend Stack: ${summary.frontendStack}`);
  console.log(`Strictness: ${summary.strictness}`);
  console.log(`Version: ${summary.version}`);
  console.log(`Required States: ${summary.requiredStateCount}`);
  console.log(`Total Rule References: ${summary.totalRules}`);

  console.log("");
  console.log("Rule References by Group:");
  Object.entries(summary.ruleCounts).forEach(([group, count]) => {
    console.log(`- ${group}: ${count}`);
  });

  console.log("");
  console.log("Design Tokens:");
  console.log(`- Primary Color: ${constitution.tokens.colors.primary}`);
  console.log(`- Background: ${constitution.tokens.colors.background}`);
  console.log(`- Surface: ${constitution.tokens.colors.surface}`);
  console.log(`- Text Primary: ${constitution.tokens.colors.textPrimary}`);
  console.log(`- Font Family: ${constitution.tokens.typography.fontFamily}`);
  console.log(`- Spacing Base: ${constitution.tokens.spacing.base}px`);
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
  .description(COMMAND_HINTS.init)
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
  .description(COMMAND_HINTS.generate)
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
  .description(COMMAND_HINTS.export)
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
  .command("list")
  .description(COMMAND_HINTS.list)
  .argument("<type>", "packs, rules, states, or tokens")
  .option("--category <category>", "Filter rules by category.")
  .option("--severity <severity>", "Filter rules by severity.")
  .option("--search <text>", "Search rules by title, description, tag, or ID.")
  .action(async (type, options) => {
    const cwd = process.cwd();
    const listType = normalizeListType(type);

    const allowedTypes = ["packs", "rules", "states", "tokens"];

    if (!allowedTypes.includes(listType)) {
      console.log("");
      console.log("UXPreflight list failed.");
      console.log("------------------------");
      console.log(`Invalid list type: ${type}`);
      console.log("");
      console.log("Allowed types:");
      allowedTypes.forEach((item) => console.log(`- ${item}`));
      console.log("");
      return;
    }

    if (listType === "packs") {
      const packs = getDefaultRulePacks();

      printSectionTitle("UXPreflight Rule Packs");

      packs.forEach((pack) => {
        console.log("");
        console.log(`Name: ${pack.name}`);
        console.log(`ID: ${pack.id}`);
        console.log(`Category: ${pack.category}`);
        console.log(`Version: ${pack.version}`);
        console.log(`Rules: ${pack.rules.length}`);
        console.log(`Description: ${pack.description}`);
      });

      console.log("");
      console.log(`Total Packs: ${packs.length}`);
      return;
    }

    if (listType === "rules") {
      let rules = flattenDefaultRules();

      if (options.category) {
        const category = String(options.category).trim().toLowerCase();
        rules = rules.filter((rule) => rule.category === category);
      }

      if (options.severity) {
        const severity = String(options.severity).trim().toLowerCase();
        rules = rules.filter((rule) => rule.severity === severity);
      }

      if (options.search) {
        const search = String(options.search).trim().toLowerCase();

        rules = rules.filter((rule) => {
          const searchableText = [
            rule.id,
            rule.title,
            rule.description,
            rule.category,
            rule.severity,
            rule.confidence,
            rule.packId,
            rule.packName,
            ...(rule.tags ?? [])
          ]
            .join(" ")
            .toLowerCase();

          return searchableText.includes(search);
        });
      }

      printSectionTitle("UXPreflight Rules");

      rules.forEach((rule) => {
        console.log("");
        console.log(`[${rule.severity.toUpperCase()}] ${rule.title}`);
        console.log(`ID: ${rule.id}`);
        console.log(`Pack: ${rule.packName}`);
        console.log(`Category: ${rule.category}`);
        console.log(`Confidence: ${rule.confidence}`);
        console.log(`Applies To: ${rule.appliesTo.join(", ")}`);
        console.log(`Tags: ${(rule.tags ?? []).join(", ") || "None"}`);
      });

      console.log("");
      console.log(`Total Rules: ${rules.length}`);

      if (rules.length === 0) {
        console.log("No rules matched your filters.");
      }

      return;
    }

    if (listType === "states") {
      const constitution = await getCurrentProjectConstitution(cwd);
      const states = constitution?.requiredStates ?? DEFAULT_REQUIRED_STATES;

      printSectionTitle("UXPreflight Required States");

      states.forEach((state, index) => {
        console.log(`${index + 1}. ${state}`);
      });

      console.log("");
      console.log(`Total States: ${states.length}`);

      if (!constitution) {
        console.log("");
        console.log("Note: No valid project constitution found.");
        console.log("Showing default UXPreflight states.");
      }

      return;
    }

    if (listType === "tokens") {
      const constitution = await getCurrentProjectConstitution(cwd);
      const tokens = constitution?.tokens ?? createDefaultTokens();

      printSectionTitle("UXPreflight Design Tokens");

      console.log("");
      console.log("Colors:");
      Object.entries(tokens.colors).forEach(([key, value]) => {
        if (value) {
          console.log(`- ${key}: ${value}`);
        }
      });

      console.log("");
      console.log("Typography:");
      console.log(`- fontFamily: ${tokens.typography.fontFamily}`);
      Object.entries(tokens.typography.scale).forEach(([key, value]) => {
        console.log(`- ${key}: ${value}`);
      });

      if (tokens.typography.weights) {
        console.log("");
        console.log("Font Weights:");
        Object.entries(tokens.typography.weights).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      }

      console.log("");
      console.log("Spacing:");
      console.log(`- base: ${tokens.spacing.base}px`);
      console.log(`- scale: ${tokens.spacing.scale.map((value) => `${value}px`).join(", ")}`);

      console.log("");
      console.log("Radius:");
      Object.entries(tokens.radius).forEach(([key, value]) => {
        console.log(`- ${key}: ${value}`);
      });

      if (tokens.shadows) {
        console.log("");
        console.log("Shadows:");
        Object.entries(tokens.shadows).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      }

      if (tokens.breakpoints) {
        console.log("");
        console.log("Breakpoints:");
        Object.entries(tokens.breakpoints).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      }

      if (!constitution) {
        console.log("");
        console.log("Note: No valid project constitution found.");
        console.log("Showing default UXPreflight tokens.");
      }
    }
  });

program
  .command("show")
  .description(COMMAND_HINTS.show)
  .argument("<type>", "rule, pack, or constitution")
  .argument("[id]", "Rule ID or pack ID/name. Not required for constitution.")
  .option("--json", "Print raw JSON output.")
  .action(async (type, id, options) => {
    const cwd = process.cwd();
    const showType = String(type).trim().toLowerCase();

    const allowedTypes = ["rule", "pack", "constitution"];

    if (!allowedTypes.includes(showType)) {
      console.log("");
      console.log("UXPreflight show failed.");
      console.log("------------------------");
      console.log(`Invalid show type: ${type}`);
      console.log("");
      console.log("Allowed types:");
      allowedTypes.forEach((item) => console.log(`- ${item}`));
      console.log("");
      return;
    }

    if (showType === "rule") {
      if (!id) {
        console.log("");
        console.log("Rule ID is required.");
        console.log("--------------------");
        console.log("Example:");
        console.log("npm run ux -- show rule ux_goal_clarity_001");
        console.log("");
        return;
      }

      const result = findRuleById(String(id));

      if (!result) {
        console.log("");
        console.log("Rule not found.");
        console.log("---------------");
        console.log(`Rule ID: ${id}`);
        console.log("");
        console.log("Try:");
        console.log("npm run ux -- list rules");
        console.log("");
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(result.rule, null, 2));
        return;
      }

      printRuleDetails(String(id));
      return;
    }

    if (showType === "pack") {
      if (!id) {
        console.log("");
        console.log("Pack ID or name is required.");
        console.log("----------------------------");
        console.log("Example:");
        console.log("npm run ux -- show pack component-rules");
        console.log("");
        return;
      }

      const pack = findPackById(String(id));

      if (!pack) {
        console.log("");
        console.log("Rule pack not found.");
        console.log("--------------------");
        console.log(`Pack ID/Name: ${id}`);
        console.log("");
        console.log("Try:");
        console.log("npm run ux -- list packs");
        console.log("");
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(pack, null, 2));
        return;
      }

      printPackDetails(String(id));
      return;
    }

    if (showType === "constitution") {
      const constitution = await getCurrentProjectConstitution(cwd);

      if (!constitution) {
        console.log("");
        console.log("Design constitution not found or invalid.");
        console.log("-----------------------------------------");
        console.log("Missing or invalid file:");
        console.log(".uxpreflight/design-constitution.json");
        console.log("");
        console.log("Run:");
        console.log("npm run ux -- init");
        console.log("");
        return;
      }

      if (options.json) {
        console.log(JSON.stringify(constitution, null, 2));
        return;
      }

      printConstitutionSummary(constitution);
    }
  });

program
  .command("validate")
  .description(COMMAND_HINTS.validate)
  .option("--json", "Print validation result as JSON.")
  .action(async (options) => {
    const cwd = process.cwd();
    const projectHealth = await checkProjectHealth(cwd);

    const result = {
      valid: projectHealth.isHealthy,
      initialized: projectHealth.isInitialized,
      summary: projectHealth.summary,
      checks: projectHealth.checks
    };

    if (options.json) {
      console.log(JSON.stringify(result, null, 2));

      if (!result.valid) {
        process.exitCode = 1;
      }

      return;
    }

    console.log("");
    console.log("UXPreflight Validate");
    console.log("--------------------");

    if (!projectHealth.isInitialized) {
      console.log("Status: NOT INITIALIZED");
      console.log("");
      console.log("Missing UXPreflight project files.");
      console.log("");
      console.log("Run:");
      console.log("npm run ux -- init");
      console.log("");

      process.exitCode = 1;
      return;
    }

    console.log(`Status: ${projectHealth.isHealthy ? "VALID" : "INVALID"}`);
    console.log(`Total Checks: ${projectHealth.summary.total}`);
    console.log(`OK: ${projectHealth.summary.ok}`);
    console.log(`Missing: ${projectHealth.summary.missing}`);
    console.log(`Invalid: ${projectHealth.summary.invalid}`);

    console.log("");

    projectHealth.checks.forEach((check) => {
      const label =
        check.status === "ok" ? "OK" : check.status === "missing" ? "MISSING" : "INVALID";

      console.log(`${label}: ${check.relativePath}`);
      console.log(`  ${check.message}`);
    });

    console.log("");

    if (!projectHealth.isHealthy) {
      console.log("Validation failed.");
      console.log("");
      console.log("To regenerate missing or outdated files, run:");
      console.log("npm run ux -- export --target all --force");
      console.log("");

      process.exitCode = 1;
      return;
    }

    console.log("Validation passed.");
  });

program
  .command("version-info")
  .description("Show UXPreflight CLI version and module information.")
  .action(() => {
    const core = getCoreInfo();

    console.log("");
    console.log("UXPreflight Version Info");
    console.log("------------------------");
    console.log(`CLI Name: ${CLI_NAME}`);
    console.log(`CLI Version: ${CLI_VERSION}`);
    console.log(`Current Module: ${CURRENT_MODULE}`);
    console.log(`Core Package: ${core.name}`);
    console.log(`Core Version: ${core.version}`);
    console.log(`Core Status: ${core.status}`);
    console.log("");
  });
program
  .command("scan")
  .description(COMMAND_HINTS.scan)
  .option("--json", "Print scan result as JSON.")
  .option("--tokens", "Discover design tokens from scanned files.")
  .option("--components", "Discover component patterns from scanned files.")
  .option("--max-files <number>", "Maximum number of files to scan.", "5000")
  .action(async (options) => {
    const cwd = process.cwd();
    const maxFiles = Number.parseInt(String(options.maxFiles), 10);

    if (Number.isNaN(maxFiles) || maxFiles <= 0) {
      console.log("");
      console.log("UXPreflight scan failed.");
      console.log("------------------------");
      console.log("--max-files must be a positive number.");
      console.log("");
      process.exitCode = 1;
      return;
    }

    const result = await scanProject({
      rootDir: cwd,
      maxFiles
    });

    const tokenDiscovery = options.tokens
      ? await discoverDesignTokensFromFiles(result.files)
      : null;

    const componentDiscovery = options.components
      ? await discoverComponentPatternsFromFiles(result.files)
      : null;

    if (options.json) {
      console.log(
        JSON.stringify(
          {
            ...result,
            tokenDiscovery,
            componentDiscovery
          },
          null,
          2
        )
      );
      return;
    }

    console.log("");
    console.log("UXPreflight Project Scan");
    console.log("------------------------");
    console.log(`Scanner Package: ${scannerInfo.name}`);
    console.log(`Scanner Version: ${scannerInfo.version}`);
    console.log(`Root: ${result.summary.rootDir}`);
    console.log("");

    console.log("File Summary:");
    console.log(`- Total Files: ${result.summary.totalFiles}`);
    console.log(`- Source Files: ${result.summary.sourceFiles}`);
    console.log(`- Style Files: ${result.summary.styleFiles}`);
    console.log(`- Markup Files: ${result.summary.markupFiles}`);
    console.log(`- Config Files: ${result.summary.configFiles}`);
    console.log(`- Documentation Files: ${result.summary.documentationFiles}`);
    console.log(`- Asset Files: ${result.summary.assetFiles}`);
    console.log(`- Other Files: ${result.summary.otherFiles}`);
    console.log(`- Component Candidates: ${result.summary.componentCandidates}`);

    console.log("");
    console.log("Detected Extensions:");
    Object.entries(result.summary.extensionCounts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([extension, count]) => {
        console.log(`- ${extension}: ${count}`);
      });

    console.log("");
    console.log("Largest Files:");
    result.summary.largestFiles.forEach((file) => {
      console.log(`- ${file.relativePath} (${file.sizeBytes} bytes)`);
    });

    console.log("");

    if (result.summary.totalFiles >= maxFiles) {
      console.log(`Scan stopped after reaching max file limit: ${maxFiles}`);
      console.log("Use --max-files to increase the limit.");
      console.log("");
    }

    if (tokenDiscovery) {
      console.log("");
      console.log("Design Token Discovery:");
      console.log(`- Files Scanned for Tokens: ${tokenDiscovery.summary.scannedFiles}`);
      console.log(`- Large Files Skipped: ${tokenDiscovery.summary.skippedLargeFiles}`);
      console.log(`- Colors: ${tokenDiscovery.summary.colors}`);
      console.log(`- CSS Variables: ${tokenDiscovery.summary.cssVariables}`);
      console.log(`- SCSS Variables: ${tokenDiscovery.summary.scssVariables}`);
      console.log(`- Font Sizes: ${tokenDiscovery.summary.fontSizes}`);
      console.log(`- Spacing Values: ${tokenDiscovery.summary.spacingValues}`);
      console.log(`- Radius Values: ${tokenDiscovery.summary.radiusValues}`);
      console.log(`- Shadow Values: ${tokenDiscovery.summary.shadowValues}`);
      console.log(`- Breakpoints: ${tokenDiscovery.summary.breakpoints}`);

      const printTopValues = (
        title: string,
        items: Array<{ value: string; count: number; files: string[] }>
      ) => {
        console.log("");
        console.log(title);

        if (items.length === 0) {
          console.log("- None detected");
          return;
        }

        items.slice(0, 10).forEach((item) => {
          console.log(`- ${item.value} (${item.count})`);
          console.log(`  ${item.files.slice(0, 2).join(", ")}`);
        });
      };

      const printTopNamedValues = (
        title: string,
        items: Array<{ name: string; value: string; count: number; files: string[] }>
      ) => {
        console.log("");
        console.log(title);

        if (items.length === 0) {
          console.log("- None detected");
          return;
        }

        items.slice(0, 10).forEach((item) => {
          console.log(`- ${item.name}: ${item.value} (${item.count})`);
          console.log(`  ${item.files.slice(0, 2).join(", ")}`);
        });
      };

      printTopValues("Top Colors:", tokenDiscovery.colors);
      printTopNamedValues("Top CSS Variables:", tokenDiscovery.cssVariables);
      printTopNamedValues("Top SCSS Variables:", tokenDiscovery.scssVariables);
      printTopValues("Top Font Sizes:", tokenDiscovery.fontSizes);
      printTopValues("Top Spacing Values:", tokenDiscovery.spacingValues);
      printTopValues("Top Radius Values:", tokenDiscovery.radiusValues);
      printTopValues("Top Shadows:", tokenDiscovery.shadowValues);
      printTopValues("Top Breakpoints:", tokenDiscovery.breakpoints);
    }

    if (componentDiscovery) {
      console.log("");
      console.log("Component Pattern Discovery:");
      console.log(`- Files Scanned for Components: ${componentDiscovery.summary.scannedFiles}`);
      console.log(`- Large Files Skipped: ${componentDiscovery.summary.skippedLargeFiles}`);
      console.log(`- Component Candidates: ${componentDiscovery.summary.componentCandidates}`);
      console.log(`- Patterns Detected: ${componentDiscovery.summary.patternsDetected}`);
      console.log(`- Buttons: ${componentDiscovery.summary.buttons}`);
      console.log(`- Forms: ${componentDiscovery.summary.forms}`);
      console.log(`- Tables: ${componentDiscovery.summary.tables}`);
      console.log(`- Cards: ${componentDiscovery.summary.cards}`);
      console.log(`- Modals: ${componentDiscovery.summary.modals}`);
      console.log(`- Tabs: ${componentDiscovery.summary.tabs}`);
      console.log(`- Uploads: ${componentDiscovery.summary.uploads}`);
      console.log(`- Status Badges: ${componentDiscovery.summary.statusBadges}`);
      console.log(`- KPI Cards: ${componentDiscovery.summary.kpiCards}`);
      console.log(`- Charts: ${componentDiscovery.summary.charts}`);
      console.log(`- Sidebars: ${componentDiscovery.summary.sidebars}`);
      console.log(`- Navbars: ${componentDiscovery.summary.navbars}`);

      console.log("");
      console.log("Top Component Patterns:");

      if (componentDiscovery.patterns.length === 0) {
        console.log("- None detected");
      }

      componentDiscovery.patterns.slice(0, 12).forEach((item) => {
        console.log(`- ${item.pattern}: ${item.count}`);
        console.log(`  ${item.files.slice(0, 3).join(", ")}`);
      });

      console.log("");
      console.log("Top Component Candidates:");

      if (componentDiscovery.candidates.length === 0) {
        console.log("- None detected");
      }

      componentDiscovery.candidates.slice(0, 15).forEach((candidate) => {
        console.log(`- ${candidate.name}`);
        console.log(`  File: ${candidate.relativePath}`);
        console.log(`  Signals: ${candidate.signals.length > 0 ? candidate.signals.join(", ") : "component candidate"}`);
      });
    }

    console.log("Next:");
    console.log("- Release 0.2 Module 4 will convert discovered tokens into constitution suggestions.");
    console.log("- Release 0.2 Module 5 will convert detected component patterns into component registry suggestions.");
  });

program
  .command("doctor")
  .description(COMMAND_HINTS.doctor)
  .action(async () => {
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

    const projectHealth = await checkProjectHealth(process.cwd());

    console.log("");
    console.log("UXPreflight Doctor");
    console.log("------------------");
    console.log(`Core Package: ${core.name}`);
    console.log(`Version: ${core.version}`);
    console.log(`Status: ${core.status}`);

    console.log("");
    console.log("Project Scanner:");
    console.log(`Package: ${scannerInfo.name}`);
    console.log(`Version: ${scannerInfo.version}`);
    console.log(`Status: ${scannerInfo.status}`);

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

        console.log("");
    console.log("Current Project Health:");
    console.log(`Total Checks: ${projectHealth.summary.total}`);
    console.log(`OK: ${projectHealth.summary.ok}`);
    console.log(`Missing: ${projectHealth.summary.missing}`);
    console.log(`Invalid: ${projectHealth.summary.invalid}`);

    console.log("");

    projectHealth.checks.forEach((check) => {
      const icon =
        check.status === "ok" ? "OK" : check.status === "missing" ? "MISSING" : "INVALID";

      console.log(`${icon}: ${check.relativePath}`);
      console.log(`  ${check.message}`);
    });

    if (!projectHealth.isInitialized) {
      console.log("");
      console.log("This project does not look initialized yet.");
      console.log("Run:");
      console.log("npm run ux -- init");
    } else if (!projectHealth.isHealthy) {
      console.log("");
      console.log("Project health issues found.");
      console.log("To regenerate missing files, run:");
      console.log("npm run ux -- export --target all --force");
    }

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
          console.log(`${CURRENT_MODULE} setup has validation errors.`);
          process.exitCode = 1;
          return;
        }

        if (projectHealth.isInitialized && !projectHealth.isHealthy) {
          console.log("");
          console.log(`${CURRENT_MODULE} setup is working, but current project health has issues.`);
          return;
        }

        console.log(`${CURRENT_MODULE} setup looks good.`);
  });

program.parse();