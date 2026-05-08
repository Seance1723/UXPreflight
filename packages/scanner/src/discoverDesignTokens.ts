import { readFile } from "node:fs/promises";

import type {
  UXPreflightNamedTokenOccurrence,
  UXPreflightScannedFile,
  UXPreflightTokenDiscoveryResult,
  UXPreflightTokenOccurrence
} from "./types.js";

const DEFAULT_MAX_READ_SIZE_BYTES = 500_000;

function normalizeValue(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeColor(value: string) {
  return normalizeValue(value).toLowerCase();
}

function addOccurrence(
  map: Map<string, UXPreflightTokenOccurrence>,
  value: string,
  filePath: string
) {
  const normalizedValue = normalizeValue(value);

  if (!normalizedValue) {
    return;
  }

  const existing = map.get(normalizedValue);

  if (existing) {
    existing.count += 1;

    if (!existing.files.includes(filePath)) {
      existing.files.push(filePath);
    }

    return;
  }

  map.set(normalizedValue, {
    value: normalizedValue,
    count: 1,
    files: [filePath]
  });
}

function addNamedOccurrence(
  map: Map<string, UXPreflightNamedTokenOccurrence>,
  name: string,
  value: string,
  filePath: string
) {
  const normalizedName = normalizeValue(name);
  const normalizedValue = normalizeValue(value);
  const key = `${normalizedName}:${normalizedValue}`;

  if (!normalizedName || !normalizedValue) {
    return;
  }

  const existing = map.get(key);

  if (existing) {
    existing.count += 1;

    if (!existing.files.includes(filePath)) {
      existing.files.push(filePath);
    }

    return;
  }

  map.set(key, {
    name: normalizedName,
    value: normalizedValue,
    count: 1,
    files: [filePath]
  });
}

function sortOccurrences(items: UXPreflightTokenOccurrence[]) {
  return items.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.value.localeCompare(b.value);
  });
}

function sortNamedOccurrences(items: UXPreflightNamedTokenOccurrence[]) {
  return items.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.name.localeCompare(b.name);
  });
}

function trimFiles<T extends { files: string[] }>(items: T[], maxFiles = 8) {
  return items.map((item) => ({
    ...item,
    files: item.files.slice(0, maxFiles)
  }));
}

function extractColors(content: string, filePath: string, colorMap: Map<string, UXPreflightTokenOccurrence>) {
  const hexColorRegex = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
  const functionalColorRegex = /\b(?:rgb|rgba|hsl|hsla)\(\s*[^)]+\)/gi;

  for (const match of content.matchAll(hexColorRegex)) {
    addOccurrence(colorMap, normalizeColor(match[0]), filePath);
  }

  for (const match of content.matchAll(functionalColorRegex)) {
    addOccurrence(colorMap, normalizeColor(match[0]), filePath);
  }
}

function extractCssVariables(
  content: string,
  filePath: string,
  variableMap: Map<string, UXPreflightNamedTokenOccurrence>
) {
  const cssVariableRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;{}]+)/g;

  for (const match of content.matchAll(cssVariableRegex)) {
    addNamedOccurrence(variableMap, `--${match[1]}`, match[2], filePath);
  }
}

function extractScssVariables(
  content: string,
  filePath: string,
  variableMap: Map<string, UXPreflightNamedTokenOccurrence>
) {
  const scssVariableRegex = /\$([a-zA-Z0-9-_]+)\s*:\s*([^;{}]+)/g;

  for (const match of content.matchAll(scssVariableRegex)) {
    addNamedOccurrence(variableMap, `$${match[1]}`, match[2], filePath);
  }
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractPropertyValues(
  content: string,
  filePath: string,
  propertyNames: string[],
  valueMap: Map<string, UXPreflightTokenOccurrence>
) {
  const propertyPattern = propertyNames.map(escapeRegex).join("|");
  const propertyRegex = new RegExp(`\\b(?:${propertyPattern})\\s*:\\s*([^;{}]+)`, "gi");

  for (const match of content.matchAll(propertyRegex)) {
    addOccurrence(valueMap, match[1], filePath);
  }
}

function extractUnitValuesFromProperties(
  content: string,
  filePath: string,
  propertyNames: string[],
  valueMap: Map<string, UXPreflightTokenOccurrence>
) {
  const propertyPattern = propertyNames.map(escapeRegex).join("|");
  const propertyRegex = new RegExp(`\\b(?:${propertyPattern})\\s*:\\s*([^;{}]+)`, "gi");
  const unitRegex = /-?\d*\.?\d+(?:px|rem|em|vh|vw|%)\b/g;

  for (const propertyMatch of content.matchAll(propertyRegex)) {
    const propertyValue = propertyMatch[1];

    for (const unitMatch of propertyValue.matchAll(unitRegex)) {
      addOccurrence(valueMap, unitMatch[0], filePath);
    }
  }
}

function extractBreakpoints(
  content: string,
  filePath: string,
  breakpointMap: Map<string, UXPreflightTokenOccurrence>
) {
  const mediaQueryRegex = /@media[^{]*\(\s*(?:min|max)-width\s*:\s*([^)]+)\)/gi;

  for (const match of content.matchAll(mediaQueryRegex)) {
    addOccurrence(breakpointMap, match[1], filePath);
  }
}

function isTokenReadableFile(file: UXPreflightScannedFile) {
  return ["source", "style", "markup", "config"].includes(file.category);
}

export async function discoverDesignTokensFromFiles(
  files: UXPreflightScannedFile[],
  options?: {
    maxReadSizeBytes?: number;
  }
): Promise<UXPreflightTokenDiscoveryResult> {
  const maxReadSizeBytes = options?.maxReadSizeBytes ?? DEFAULT_MAX_READ_SIZE_BYTES;

  const colors = new Map<string, UXPreflightTokenOccurrence>();
  const cssVariables = new Map<string, UXPreflightNamedTokenOccurrence>();
  const scssVariables = new Map<string, UXPreflightNamedTokenOccurrence>();
  const fontSizes = new Map<string, UXPreflightTokenOccurrence>();
  const spacingValues = new Map<string, UXPreflightTokenOccurrence>();
  const radiusValues = new Map<string, UXPreflightTokenOccurrence>();
  const shadowValues = new Map<string, UXPreflightTokenOccurrence>();
  const breakpoints = new Map<string, UXPreflightTokenOccurrence>();

  let scannedFiles = 0;
  let skippedLargeFiles = 0;

  const readableFiles = files.filter(isTokenReadableFile);

  for (const file of readableFiles) {
    if (file.sizeBytes > maxReadSizeBytes) {
      skippedLargeFiles += 1;
      continue;
    }

    const content = await readFile(file.absolutePath, "utf8");
    scannedFiles += 1;

    extractColors(content, file.relativePath, colors);
    extractCssVariables(content, file.relativePath, cssVariables);
    extractScssVariables(content, file.relativePath, scssVariables);

    extractUnitValuesFromProperties(
      content,
      file.relativePath,
      ["font-size"],
      fontSizes
    );

    extractUnitValuesFromProperties(
      content,
      file.relativePath,
      [
        "margin",
        "margin-top",
        "margin-right",
        "margin-bottom",
        "margin-left",
        "padding",
        "padding-top",
        "padding-right",
        "padding-bottom",
        "padding-left",
        "gap",
        "row-gap",
        "column-gap",
        "top",
        "right",
        "bottom",
        "left"
      ],
      spacingValues
    );

    extractUnitValuesFromProperties(
      content,
      file.relativePath,
      [
        "border-radius",
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-left-radius",
        "border-bottom-right-radius"
      ],
      radiusValues
    );

    extractPropertyValues(
      content,
      file.relativePath,
      ["box-shadow", "text-shadow"],
      shadowValues
    );

    extractBreakpoints(content, file.relativePath, breakpoints);
  }

  const colorItems = trimFiles(sortOccurrences(Array.from(colors.values())));
  const cssVariableItems = trimFiles(sortNamedOccurrences(Array.from(cssVariables.values())));
  const scssVariableItems = trimFiles(sortNamedOccurrences(Array.from(scssVariables.values())));
  const fontSizeItems = trimFiles(sortOccurrences(Array.from(fontSizes.values())));
  const spacingItems = trimFiles(sortOccurrences(Array.from(spacingValues.values())));
  const radiusItems = trimFiles(sortOccurrences(Array.from(radiusValues.values())));
  const shadowItems = trimFiles(sortOccurrences(Array.from(shadowValues.values())));
  const breakpointItems = trimFiles(sortOccurrences(Array.from(breakpoints.values())));

  return {
    summary: {
      scannedFiles,
      skippedLargeFiles,
      colors: colorItems.length,
      cssVariables: cssVariableItems.length,
      scssVariables: scssVariableItems.length,
      fontSizes: fontSizeItems.length,
      spacingValues: spacingItems.length,
      radiusValues: radiusItems.length,
      shadowValues: shadowItems.length,
      breakpoints: breakpointItems.length
    },
    colors: colorItems,
    cssVariables: cssVariableItems,
    scssVariables: scssVariableItems,
    fontSizes: fontSizeItems,
    spacingValues: spacingItems,
    radiusValues: radiusItems,
    shadowValues: shadowItems,
    breakpoints: breakpointItems
  };
}