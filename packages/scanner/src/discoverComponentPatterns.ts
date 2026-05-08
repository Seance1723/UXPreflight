import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  UXPreflightComponentCandidate,
  UXPreflightComponentDiscoveryResult,
  UXPreflightComponentPatternOccurrence,
  UXPreflightComponentPatternType,
  UXPreflightScannedFile
} from "./types.js";

const DEFAULT_MAX_READ_SIZE_BYTES = 500_000;

const COMPONENT_PATTERN_DETECTORS: Record<UXPreflightComponentPatternType, RegExp[]> = {
  button: [
    /<button\b/gi,
    /<Button\b/g,
    /className=["'][^"']*\bbtn\b[^"']*["']/gi,
    /class=["'][^"']*\bbtn\b[^"']*["']/gi
  ],
  form: [
    /<form\b/gi,
    /<Form\b/g,
    /useForm\s*\(/g,
    /<input\b/gi,
    /<select\b/gi,
    /<textarea\b/gi,
    /react-hook-form/gi
  ],
  table: [
    /<table\b/gi,
    /<Table\b/g,
    /<DataTable\b/g,
    /TanStack/gi,
    /react-table/gi
  ],
  card: [
    /<Card\b/g,
    /className=["'][^"']*\bcard\b[^"']*["']/gi,
    /class=["'][^"']*\bcard\b[^"']*["']/gi,
    /\bCardContent\b/g
  ],
  modal: [
    /<Modal\b/g,
    /<Dialog\b/g,
    /<Drawer\b/g,
    /role=["']dialog["']/gi,
    /aria-modal=["']true["']/gi
  ],
  tabs: [
    /<Tabs\b/g,
    /<Tab\b/g,
    /role=["']tablist["']/gi,
    /role=["']tab["']/gi
  ],
  upload: [
    /type=["']file["']/gi,
    /<input[^>]+file/gi,
    /dropzone/gi,
    /upload/gi,
    /FileUpload/g
  ],
  statusBadge: [
    /<Badge\b/g,
    /StatusBadge/g,
    /className=["'][^"']*\bbadge\b[^"']*["']/gi,
    /status[-_ ]?badge/gi,
    /\bstatus\b.*\b(success|failed|pending|running|completed|error)\b/gi
  ],
  kpiCard: [
    /KpiCard/g,
    /KPICard/g,
    /MetricCard/g,
    /StatCard/g,
    /className=["'][^"']*\bkpi\b[^"']*["']/gi,
    /\bmetric\b/gi
  ],
  chart: [
    /<Chart\b/g,
    /<LineChart\b/g,
    /<BarChart\b/g,
    /<PieChart\b/g,
    /recharts/gi,
    /chart\.js/gi,
    /apexcharts/gi
  ],
  sidebar: [
    /<Sidebar\b/g,
    /className=["'][^"']*\bsidebar\b[^"']*["']/gi,
    /class=["'][^"']*\bsidebar\b[^"']*["']/gi,
    /aside\b/gi
  ],
  navbar: [
    /<Navbar\b/g,
    /<Nav\b/g,
    /className=["'][^"']*\bnavbar\b[^"']*["']/gi,
    /class=["'][^"']*\bnavbar\b[^"']*["']/gi,
    /<nav\b/gi
  ]
};

function isReadableComponentFile(file: UXPreflightScannedFile) {
  return ["source", "markup"].includes(file.category);
}

function getComponentName(file: UXPreflightScannedFile) {
  const baseName = path.basename(file.relativePath, file.extension);

  return baseName
    .replace(/[^a-zA-Z0-9_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join("");
}

function countPatternMatches(content: string, regexes: RegExp[]) {
  let count = 0;

  regexes.forEach((regex) => {
    const matches = content.match(regex);

    if (matches) {
      count += matches.length;
    }
  });

  return count;
}

function addPatternOccurrence(
  map: Map<UXPreflightComponentPatternType, UXPreflightComponentPatternOccurrence>,
  pattern: UXPreflightComponentPatternType,
  count: number,
  filePath: string
) {
  if (count <= 0) {
    return;
  }

  const existing = map.get(pattern);

  if (existing) {
    existing.count += count;

    if (!existing.files.includes(filePath)) {
      existing.files.push(filePath);
    }

    return;
  }

  map.set(pattern, {
    pattern,
    count,
    files: [filePath]
  });
}

function summarizePatternCount(
  patterns: UXPreflightComponentPatternOccurrence[],
  pattern: UXPreflightComponentPatternType
) {
  return patterns.find((item) => item.pattern === pattern)?.count ?? 0;
}

function sortPatternOccurrences(patterns: UXPreflightComponentPatternOccurrence[]) {
  return patterns.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }

    return a.pattern.localeCompare(b.pattern);
  });
}

function sortCandidates(candidates: UXPreflightComponentCandidate[]) {
  return candidates.sort((a, b) => {
    if (b.signals.length !== a.signals.length) {
      return b.signals.length - a.signals.length;
    }

    return a.relativePath.localeCompare(b.relativePath);
  });
}

export async function discoverComponentPatternsFromFiles(
  files: UXPreflightScannedFile[],
  options?: {
    maxReadSizeBytes?: number;
  }
): Promise<UXPreflightComponentDiscoveryResult> {
  const maxReadSizeBytes = options?.maxReadSizeBytes ?? DEFAULT_MAX_READ_SIZE_BYTES;

  const patternMap = new Map<
    UXPreflightComponentPatternType,
    UXPreflightComponentPatternOccurrence
  >();

  const candidates: UXPreflightComponentCandidate[] = [];

  let scannedFiles = 0;
  let skippedLargeFiles = 0;

  const readableFiles = files.filter(isReadableComponentFile);

  for (const file of readableFiles) {
    if (file.sizeBytes > maxReadSizeBytes) {
      skippedLargeFiles += 1;
      continue;
    }

    const content = await readFile(file.absolutePath, "utf8");
    scannedFiles += 1;

    const signals: UXPreflightComponentPatternType[] = [];

    for (const [pattern, regexes] of Object.entries(COMPONENT_PATTERN_DETECTORS) as Array<
      [UXPreflightComponentPatternType, RegExp[]]
    >) {
      const count = countPatternMatches(content, regexes);

      if (count > 0) {
        signals.push(pattern);
        addPatternOccurrence(patternMap, pattern, count, file.relativePath);
      }
    }

    if (file.isComponentCandidate || signals.length > 0) {
      candidates.push({
        name: getComponentName(file),
        relativePath: file.relativePath,
        extension: file.extension,
        sizeBytes: file.sizeBytes,
        signals
      });
    }
  }

  const patterns = sortPatternOccurrences(Array.from(patternMap.values())).map((item) => ({
    ...item,
    files: item.files.slice(0, 10)
  }));

  const sortedCandidates = sortCandidates(candidates).slice(0, 50);

  return {
    summary: {
      scannedFiles,
      skippedLargeFiles,
      componentCandidates: sortedCandidates.length,
      patternsDetected: patterns.length,
      buttons: summarizePatternCount(patterns, "button"),
      forms: summarizePatternCount(patterns, "form"),
      tables: summarizePatternCount(patterns, "table"),
      cards: summarizePatternCount(patterns, "card"),
      modals: summarizePatternCount(patterns, "modal"),
      tabs: summarizePatternCount(patterns, "tabs"),
      uploads: summarizePatternCount(patterns, "upload"),
      statusBadges: summarizePatternCount(patterns, "statusBadge"),
      kpiCards: summarizePatternCount(patterns, "kpiCard"),
      charts: summarizePatternCount(patterns, "chart"),
      sidebars: summarizePatternCount(patterns, "sidebar"),
      navbars: summarizePatternCount(patterns, "navbar")
    },
    candidates: sortedCandidates,
    patterns
  };
}