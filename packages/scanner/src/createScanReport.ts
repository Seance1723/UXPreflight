import type {
  UXPreflightComponentDiscoveryResult,
  UXPreflightComponentRegistrySuggestionResult,
  UXPreflightDesignTokenSuggestionResult,
  UXPreflightFullScanReport,
  UXPreflightScanResult,
  UXPreflightScanReportSummary,
  UXPreflightTokenDiscoveryResult
} from "./types.js";

export interface CreateScanReportInput {
  scanResult: UXPreflightScanResult;
  tokenDiscovery: UXPreflightTokenDiscoveryResult | null;
  tokenSuggestions: UXPreflightDesignTokenSuggestionResult | null;
  componentDiscovery: UXPreflightComponentDiscoveryResult | null;
  componentRegistrySuggestions: UXPreflightComponentRegistrySuggestionResult | null;
}

export function createFullScanReport(input: CreateScanReportInput): UXPreflightFullScanReport {
  return {
    generatedAt: new Date().toISOString(),
    rootDir: input.scanResult.rootDir,
    summary: input.scanResult.summary,
    files: input.scanResult.files,
    tokenDiscovery: input.tokenDiscovery,
    tokenSuggestions: input.tokenSuggestions,
    componentDiscovery: input.componentDiscovery,
    componentRegistrySuggestions: input.componentRegistrySuggestions
  };
}

export function summarizeFullScanReport(
  report: UXPreflightFullScanReport
): UXPreflightScanReportSummary {
  return {
    generatedAt: report.generatedAt,
    totalFiles: report.summary.totalFiles,
    sourceFiles: report.summary.sourceFiles,
    styleFiles: report.summary.styleFiles,
    componentCandidates: report.summary.componentCandidates,
    tokenColorsDetected: report.tokenDiscovery?.summary.colors ?? 0,
    tokenSuggestionsAvailable: Boolean(report.tokenSuggestions),
    componentPatternsDetected: report.componentDiscovery?.summary.patternsDetected ?? 0,
    componentRegistrySuggestionsAvailable: Boolean(report.componentRegistrySuggestions)
  };
}

function formatList(items: string[]) {
  if (items.length === 0) {
    return "- None";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

export function createScanSummaryMarkdown(report: UXPreflightFullScanReport) {
  const summary = summarizeFullScanReport(report);

  const lines: string[] = [];

  lines.push("# UXPreflight Scan Summary");
  lines.push("");
  lines.push(`Generated At: ${summary.generatedAt}`);
  lines.push(`Root: ${report.rootDir}`);
  lines.push("");

  lines.push("## File Summary");
  lines.push("");
  lines.push(`- Total Files: ${report.summary.totalFiles}`);
  lines.push(`- Source Files: ${report.summary.sourceFiles}`);
  lines.push(`- Style Files: ${report.summary.styleFiles}`);
  lines.push(`- Markup Files: ${report.summary.markupFiles}`);
  lines.push(`- Config Files: ${report.summary.configFiles}`);
  lines.push(`- Documentation Files: ${report.summary.documentationFiles}`);
  lines.push(`- Asset Files: ${report.summary.assetFiles}`);
  lines.push(`- Other Files: ${report.summary.otherFiles}`);
  lines.push(`- Component Candidates: ${report.summary.componentCandidates}`);
  lines.push("");

  lines.push("## Detected Extensions");
  lines.push("");
  Object.entries(report.summary.extensionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([extension, count]) => {
      lines.push(`- ${extension}: ${count}`);
    });
  lines.push("");

  lines.push("## Largest Files");
  lines.push("");
  if (report.summary.largestFiles.length === 0) {
    lines.push("- None");
  } else {
    report.summary.largestFiles.forEach((file) => {
      lines.push(`- ${file.relativePath} (${file.sizeBytes} bytes)`);
    });
  }
  lines.push("");

  if (report.tokenDiscovery) {
    lines.push("## Design Token Discovery");
    lines.push("");
    lines.push(`- Files Scanned: ${report.tokenDiscovery.summary.scannedFiles}`);
    lines.push(`- Large Files Skipped: ${report.tokenDiscovery.summary.skippedLargeFiles}`);
    lines.push(`- Colors: ${report.tokenDiscovery.summary.colors}`);
    lines.push(`- CSS Variables: ${report.tokenDiscovery.summary.cssVariables}`);
    lines.push(`- SCSS Variables: ${report.tokenDiscovery.summary.scssVariables}`);
    lines.push(`- Font Sizes: ${report.tokenDiscovery.summary.fontSizes}`);
    lines.push(`- Spacing Values: ${report.tokenDiscovery.summary.spacingValues}`);
    lines.push(`- Radius Values: ${report.tokenDiscovery.summary.radiusValues}`);
    lines.push(`- Shadow Values: ${report.tokenDiscovery.summary.shadowValues}`);
    lines.push(`- Breakpoints: ${report.tokenDiscovery.summary.breakpoints}`);
    lines.push("");

    lines.push("### Top Colors");
    lines.push("");
    lines.push(
      formatList(
        report.tokenDiscovery.colors.slice(0, 10).map((item) => {
          return `${item.value} (${item.count})`;
        })
      )
    );
    lines.push("");

    lines.push("### Top Spacing Values");
    lines.push("");
    lines.push(
      formatList(
        report.tokenDiscovery.spacingValues.slice(0, 10).map((item) => {
          return `${item.value} (${item.count})`;
        })
      )
    );
    lines.push("");

    lines.push("### Top Radius Values");
    lines.push("");
    lines.push(
      formatList(
        report.tokenDiscovery.radiusValues.slice(0, 10).map((item) => {
          return `${item.value} (${item.count})`;
        })
      )
    );
    lines.push("");
  }

  if (report.tokenSuggestions) {
    lines.push("## Design Token Suggestions");
    lines.push("");
    lines.push(`- Overall Confidence: ${report.tokenSuggestions.summary.overallConfidence}`);
    lines.push(`- Colors Suggested: ${report.tokenSuggestions.summary.colorsSuggested}`);
    lines.push(`- Font Sizes Suggested: ${report.tokenSuggestions.summary.fontSizesSuggested}`);
    lines.push(`- Spacing Values Suggested: ${report.tokenSuggestions.summary.spacingValuesSuggested}`);
    lines.push(`- Radius Values Suggested: ${report.tokenSuggestions.summary.radiusValuesSuggested}`);
    lines.push(`- Shadow Values Suggested: ${report.tokenSuggestions.summary.shadowValuesSuggested}`);
    lines.push(`- Breakpoints Suggested: ${report.tokenSuggestions.summary.breakpointsSuggested}`);
    lines.push("");

    lines.push("### Suggested Colors");
    lines.push("");
    Object.entries(report.tokenSuggestions.colors).forEach(([name, suggestion]) => {
      lines.push(`- ${name}: ${suggestion.value ?? "Not detected"} (${suggestion.confidence})`);
      lines.push(`  - Reason: ${suggestion.reason}`);
    });
    lines.push("");

    lines.push("### Suggested Scales");
    lines.push("");
    Object.entries(report.tokenSuggestions.scales).forEach(([name, suggestion]) => {
      lines.push(
        `- ${name}: ${
          suggestion.value.length > 0 ? suggestion.value.join(", ") : "Not detected"
        } (${suggestion.confidence})`
      );
      lines.push(`  - Reason: ${suggestion.reason}`);
    });
    lines.push("");
  }

  if (report.componentDiscovery) {
    lines.push("## Component Pattern Discovery");
    lines.push("");
    lines.push(`- Files Scanned: ${report.componentDiscovery.summary.scannedFiles}`);
    lines.push(`- Large Files Skipped: ${report.componentDiscovery.summary.skippedLargeFiles}`);
    lines.push(`- Component Candidates: ${report.componentDiscovery.summary.componentCandidates}`);
    lines.push(`- Patterns Detected: ${report.componentDiscovery.summary.patternsDetected}`);
    lines.push(`- Buttons: ${report.componentDiscovery.summary.buttons}`);
    lines.push(`- Forms: ${report.componentDiscovery.summary.forms}`);
    lines.push(`- Tables: ${report.componentDiscovery.summary.tables}`);
    lines.push(`- Cards: ${report.componentDiscovery.summary.cards}`);
    lines.push(`- Modals: ${report.componentDiscovery.summary.modals}`);
    lines.push(`- Tabs: ${report.componentDiscovery.summary.tabs}`);
    lines.push(`- Uploads: ${report.componentDiscovery.summary.uploads}`);
    lines.push(`- Status Badges: ${report.componentDiscovery.summary.statusBadges}`);
    lines.push(`- KPI Cards: ${report.componentDiscovery.summary.kpiCards}`);
    lines.push(`- Charts: ${report.componentDiscovery.summary.charts}`);
    lines.push(`- Sidebars: ${report.componentDiscovery.summary.sidebars}`);
    lines.push(`- Navbars: ${report.componentDiscovery.summary.navbars}`);
    lines.push("");

    lines.push("### Top Component Patterns");
    lines.push("");
    lines.push(
      formatList(
        report.componentDiscovery.patterns.slice(0, 12).map((item) => {
          return `${item.pattern}: ${item.count}`;
        })
      )
    );
    lines.push("");

    lines.push("### Top Component Candidates");
    lines.push("");
    lines.push(
      formatList(
        report.componentDiscovery.candidates.slice(0, 15).map((item) => {
          return `${item.name} — ${item.relativePath}`;
        })
      )
    );
    lines.push("");
  }

  if (report.componentRegistrySuggestions) {
    lines.push("## Component Registry Suggestions");
    lines.push("");
    lines.push(`- Items Suggested: ${report.componentRegistrySuggestions.summary.itemsSuggested}`);
    lines.push(`- High Confidence: ${report.componentRegistrySuggestions.summary.highConfidenceItems}`);
    lines.push(`- Medium Confidence: ${report.componentRegistrySuggestions.summary.mediumConfidenceItems}`);
    lines.push(`- Low Confidence: ${report.componentRegistrySuggestions.summary.lowConfidenceItems}`);
    lines.push(`- Reusable Patterns: ${report.componentRegistrySuggestions.summary.reusablePatterns}`);
    lines.push(
      `- Missing Core Patterns: ${
        report.componentRegistrySuggestions.summary.missingCorePatterns.length > 0
          ? report.componentRegistrySuggestions.summary.missingCorePatterns.join(", ")
          : "None"
      }`
    );
    lines.push("");

    lines.push("### Suggested Registry Items");
    lines.push("");
    if (report.componentRegistrySuggestions.items.length === 0) {
      lines.push("- None");
    } else {
      report.componentRegistrySuggestions.items.forEach((item) => {
        lines.push(`- ${item.recommendedName}`);
        lines.push(`  - Type: ${item.type}`);
        lines.push(`  - Confidence: ${item.confidence}`);
        lines.push(`  - Reason: ${item.reason}`);
        lines.push(`  - Reuse: ${item.reuseGuidance}`);
        lines.push(
          `  - Source Files: ${
            item.sourceFiles.length > 0 ? item.sourceFiles.slice(0, 4).join(", ") : "None"
          }`
        );
      });
    }
    lines.push("");
  }

  lines.push("## Recommended Next Steps");
  lines.push("");
  lines.push("- Review detected design tokens before applying them.");
  lines.push("- Review suggested component registry items before standardizing components.");
  lines.push("- Use this scan report to improve the project design constitution.");
  lines.push("- Do not blindly overwrite an existing design system without human review.");
  lines.push("");

  return `${lines.join("\n")}\n`;
}