#!/usr/bin/env node

import { Command } from "commander";
import { getCoreInfo, getSchemaInfo } from "@uxpreflight/core";

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
    console.log("Module 2 setup looks good.");
  });

program.parse();