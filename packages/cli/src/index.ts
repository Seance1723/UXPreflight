#!/usr/bin/env node

import { Command } from "commander";
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
  type UXPreflightProjectConfig
} from "@uxpreflight/core";
import {
  getDefaultRulePacks,
  rulePacksInfo,
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
      console.log("Module 13 setup has validation errors.");
      process.exitCode = 1;
      return;
    }

    console.log("Module 13 setup looks good.");
  });

program.parse();