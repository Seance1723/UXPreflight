import type { UXPreflightTokens } from "./types.js";

export type UXPreflightTokenExportFormat = "json" | "css" | "scss";

export interface TokenExportBundle {
  json: string;
  css: string;
  scss: string;
}

function toKebabCase(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function createCssVariable(name: string, value: string | number) {
  return `  --ux-${name}: ${value};`;
}

function createScssVariable(name: string, value: string | number) {
  return `$ux-${name}: ${value};`;
}

export function exportTokensAsJson(tokens: UXPreflightTokens) {
  return JSON.stringify(tokens, null, 2);
}

export function exportTokensAsCss(tokens: UXPreflightTokens) {
  const lines: string[] = [];

  lines.push(":root {");

  Object.entries(tokens.colors).forEach(([key, value]) => {
    if (value) {
      lines.push(createCssVariable(`color-${toKebabCase(key)}`, value));
    }
  });

  lines.push("");
  lines.push(createCssVariable("font-family-base", tokens.typography.fontFamily));

  Object.entries(tokens.typography.scale).forEach(([key, value]) => {
    lines.push(createCssVariable(`font-size-${toKebabCase(key)}`, value));
  });

  if (tokens.typography.weights) {
    Object.entries(tokens.typography.weights).forEach(([key, value]) => {
      lines.push(createCssVariable(`font-weight-${toKebabCase(key)}`, value));
    });
  }

  lines.push("");
  lines.push(createCssVariable("space-base", `${tokens.spacing.base}px`));

  tokens.spacing.scale.forEach((value, index) => {
    lines.push(createCssVariable(`space-${index + 1}`, `${value}px`));
  });

  lines.push("");

  Object.entries(tokens.radius).forEach(([key, value]) => {
    lines.push(createCssVariable(`radius-${toKebabCase(key)}`, value));
  });

  if (tokens.shadows) {
    lines.push("");

    Object.entries(tokens.shadows).forEach(([key, value]) => {
      lines.push(createCssVariable(`shadow-${toKebabCase(key)}`, value));
    });
  }

  if (tokens.breakpoints) {
    lines.push("");

    Object.entries(tokens.breakpoints).forEach(([key, value]) => {
      lines.push(createCssVariable(`breakpoint-${toKebabCase(key)}`, value));
    });
  }

  lines.push("}");

  return `${lines.join("\n")}\n`;
}

export function exportTokensAsScss(tokens: UXPreflightTokens) {
  const lines: string[] = [];

  lines.push("// UXPreflight Design Tokens");
  lines.push("// Generated from .uxpreflight/design-constitution.json");
  lines.push("");

  Object.entries(tokens.colors).forEach(([key, value]) => {
    if (value) {
      lines.push(createScssVariable(`color-${toKebabCase(key)}`, value));
    }
  });

  lines.push("");
  lines.push(createScssVariable("font-family-base", tokens.typography.fontFamily));

  Object.entries(tokens.typography.scale).forEach(([key, value]) => {
    lines.push(createScssVariable(`font-size-${toKebabCase(key)}`, value));
  });

  if (tokens.typography.weights) {
    Object.entries(tokens.typography.weights).forEach(([key, value]) => {
      lines.push(createScssVariable(`font-weight-${toKebabCase(key)}`, value));
    });
  }

  lines.push("");
  lines.push(createScssVariable("space-base", `${tokens.spacing.base}px`));

  tokens.spacing.scale.forEach((value, index) => {
    lines.push(createScssVariable(`space-${index + 1}`, `${value}px`));
  });

  lines.push("");

  Object.entries(tokens.radius).forEach(([key, value]) => {
    lines.push(createScssVariable(`radius-${toKebabCase(key)}`, value));
  });

  if (tokens.shadows) {
    lines.push("");

    Object.entries(tokens.shadows).forEach(([key, value]) => {
      lines.push(createScssVariable(`shadow-${toKebabCase(key)}`, value));
    });
  }

  if (tokens.breakpoints) {
    lines.push("");

    Object.entries(tokens.breakpoints).forEach(([key, value]) => {
      lines.push(createScssVariable(`breakpoint-${toKebabCase(key)}`, value));
    });
  }

  return `${lines.join("\n")}\n`;
}

export function exportTokens(tokens: UXPreflightTokens, format: UXPreflightTokenExportFormat) {
  if (format === "json") {
    return exportTokensAsJson(tokens);
  }

  if (format === "css") {
    return exportTokensAsCss(tokens);
  }

  return exportTokensAsScss(tokens);
}

export function createTokenExportBundle(tokens: UXPreflightTokens): TokenExportBundle {
  return {
    json: exportTokensAsJson(tokens),
    css: exportTokensAsCss(tokens),
    scss: exportTokensAsScss(tokens)
  };
}

export function summarizeTokenExports(bundle: TokenExportBundle) {
  return {
    jsonCharacters: bundle.json.length,
    cssCharacters: bundle.css.length,
    scssCharacters: bundle.scss.length,
    cssVariableCount: (bundle.css.match(/--ux-/g) ?? []).length,
    scssVariableCount: (bundle.scss.match(/\$ux-/g) ?? []).length
  };
}