#!/usr/bin/env node

import { Command } from "commander";
import {
  generateDesignConstitution,
  getCoreInfo,
  getSchemaInfo,
  summarizeDesignConstitution,
  validateDesignConstitution,
  type UXPreflightProjectConfig
} from "@uxpreflight/core";
import {
  getDefaultRulePacks,
  rulePacksInfo,
  validateDefaultRulePacks
} from "@uxpreflight/rule-packs";

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
      rulePacks: getDefaultRulePacks()
    });

    const constitutionValidation = validateDesignConstitution(sampleConstitution);
    const constitutionSummary = summarizeDesignConstitution(sampleConstitution);

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

    const hasInvalidPack = rulePackResults.some((pack) => !pack.valid);

    console.log("");

    if (hasInvalidPack || !constitutionValidation.success) {
      console.log("Module 9 setup has validation errors.");
      process.exitCode = 1;
      return;
    }

    console.log("Module 9 setup looks good.");
  });

program.parse();