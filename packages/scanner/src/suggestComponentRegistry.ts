import type {
  UXPreflightComponentDiscoveryResult,
  UXPreflightComponentPatternType,
  UXPreflightComponentRegistryItem,
  UXPreflightComponentRegistrySuggestionResult,
  UXPreflightSuggestionConfidence
} from "./types.js";

const CORE_COMPONENT_PATTERNS: UXPreflightComponentPatternType[] = [
  "button",
  "form",
  "table",
  "card",
  "modal",
  "tabs",
  "upload",
  "statusBadge",
  "kpiCard",
  "chart",
  "sidebar",
  "navbar"
];

const RECOMMENDED_COMPONENT_NAMES: Record<UXPreflightComponentPatternType, string> = {
  button: "Button",
  form: "FormField",
  table: "DataTable",
  card: "AppCard",
  modal: "AppModal",
  tabs: "AppTabs",
  upload: "FileUpload",
  statusBadge: "StatusBadge",
  kpiCard: "KpiCard",
  chart: "ChartCard",
  sidebar: "AppSidebar",
  navbar: "AppNavbar"
};

const REUSE_GUIDANCE: Record<UXPreflightComponentPatternType, string> = {
  button:
    "Reuse the existing button pattern for all primary, secondary, ghost, loading, disabled, and danger actions. Do not create random button styles.",
  form:
    "Reuse the existing form pattern for labels, helper text, validation, error messages, disabled states, and submit actions.",
  table:
    "Reuse the existing table/list pattern for loading, empty, error, filtered-empty, pagination, sorting, row actions, and mobile behavior.",
  card:
    "Reuse the existing card pattern for grouped content, KPI blocks, settings groups, and dashboard sections.",
  modal:
    "Reuse the existing modal/dialog pattern for confirmations and focused decisions. Avoid long workflows inside modals.",
  tabs:
    "Reuse the existing tabs pattern for sibling sections at the same hierarchy level. Do not use tabs for sequential workflows.",
  upload:
    "Reuse the existing upload pattern for accepted formats, size limits, file-wise progress, failed states, retry, and mapping.",
  statusBadge:
    "Reuse the existing status badge pattern for success, warning, error, pending, running, completed, disabled, and failed states.",
  kpiCard:
    "Reuse the existing KPI card pattern for metric label, value, context, trend, comparison, and action where relevant.",
  chart:
    "Reuse the existing chart pattern for data visualization. Charts must include labels, context, filters, and empty/error states.",
  sidebar:
    "Reuse the existing sidebar pattern for primary navigation, active state, collapse behavior, and role-based navigation.",
  navbar:
    "Reuse the existing navbar/header pattern for top-level navigation, user actions, notifications, and responsive behavior."
};

function getConfidence(
  patternCount: number,
  sourceFileCount: number
): UXPreflightSuggestionConfidence {
  if (patternCount >= 8 || sourceFileCount >= 4) {
    return "high";
  }

  if (patternCount >= 3 || sourceFileCount >= 2) {
    return "medium";
  }

  return "low";
}

function getReason(
  pattern: UXPreflightComponentPatternType,
  patternCount: number,
  sourceFileCount: number
) {
  return `Detected ${patternCount} ${pattern} signal(s) across ${sourceFileCount} file(s). This appears to be an existing reusable UI pattern.`;
}

function getDetectedSignals(pattern: UXPreflightComponentPatternType) {
  const signalMap: Record<UXPreflightComponentPatternType, string[]> = {
    button: ["button element", "Button component", "btn class"],
    form: ["form element", "input/select/textarea", "Form component", "useForm"],
    table: ["table element", "Table component", "DataTable", "table library"],
    card: ["Card component", "card class", "CardContent"],
    modal: ["Modal component", "Dialog component", "role=dialog", "aria-modal"],
    tabs: ["Tabs component", "Tab component", "role=tablist", "role=tab"],
    upload: ["file input", "dropzone", "upload text", "FileUpload"],
    statusBadge: ["Badge component", "StatusBadge", "badge class", "status labels"],
    kpiCard: ["KpiCard", "MetricCard", "StatCard", "kpi class", "metric text"],
    chart: ["Chart component", "Recharts", "Chart.js", "ApexCharts"],
    sidebar: ["Sidebar component", "sidebar class", "aside"],
    navbar: ["Navbar component", "Nav component", "navbar class", "nav element"]
  };

  return signalMap[pattern];
}

function sortRegistryItems(items: UXPreflightComponentRegistryItem[]) {
  const confidenceWeight: Record<UXPreflightSuggestionConfidence, number> = {
    high: 3,
    medium: 2,
    low: 1
  };

  return items.sort((a, b) => {
    const confidenceDifference = confidenceWeight[b.confidence] - confidenceWeight[a.confidence];

    if (confidenceDifference !== 0) {
      return confidenceDifference;
    }

    return a.type.localeCompare(b.type);
  });
}

function getSourceFilesForPattern(
  discovery: UXPreflightComponentDiscoveryResult,
  pattern: UXPreflightComponentPatternType
) {
  const patternFiles =
    discovery.patterns.find((item) => item.pattern === pattern)?.files ?? [];

  const candidateFiles = discovery.candidates
    .filter((candidate) => candidate.signals.includes(pattern))
    .map((candidate) => candidate.relativePath);

  return Array.from(new Set([...patternFiles, ...candidateFiles])).slice(0, 12);
}

export function suggestComponentRegistryFromDiscovery(
  discovery: UXPreflightComponentDiscoveryResult
): UXPreflightComponentRegistrySuggestionResult {
  const items: UXPreflightComponentRegistryItem[] = [];

  for (const pattern of CORE_COMPONENT_PATTERNS) {
    const occurrence = discovery.patterns.find((item) => item.pattern === pattern);
    const sourceFiles = getSourceFilesForPattern(discovery, pattern);

    if (!occurrence && sourceFiles.length === 0) {
      continue;
    }

    const patternCount = occurrence?.count ?? sourceFiles.length;
    const sourceFileCount = sourceFiles.length;

    items.push({
      type: pattern,
      recommendedName: RECOMMENDED_COMPONENT_NAMES[pattern],
      confidence: getConfidence(patternCount, sourceFileCount),
      sourceFiles,
      detectedSignals: getDetectedSignals(pattern),
      reason: getReason(pattern, patternCount, sourceFileCount),
      reuseGuidance: REUSE_GUIDANCE[pattern]
    });
  }

  const sortedItems = sortRegistryItems(items);
  const detectedTypes = new Set(sortedItems.map((item) => item.type));

  const missingCorePatterns = CORE_COMPONENT_PATTERNS.filter((pattern) => {
    return !detectedTypes.has(pattern);
  });

  return {
    summary: {
      itemsSuggested: sortedItems.length,
      highConfidenceItems: sortedItems.filter((item) => item.confidence === "high").length,
      mediumConfidenceItems: sortedItems.filter((item) => item.confidence === "medium").length,
      lowConfidenceItems: sortedItems.filter((item) => item.confidence === "low").length,
      reusablePatterns: sortedItems.length,
      missingCorePatterns
    },
    items: sortedItems
  };
}