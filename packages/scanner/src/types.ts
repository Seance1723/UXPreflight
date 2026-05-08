export type UXPreflightScannedFileCategory =
  | "source"
  | "style"
  | "markup"
  | "config"
  | "documentation"
  | "asset"
  | "other";

export interface UXPreflightScannedFile {
  absolutePath: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
  category: UXPreflightScannedFileCategory;
  isComponentCandidate: boolean;
}

export interface UXPreflightScanOptions {
  rootDir: string;
  maxFiles?: number;
  ignoreDirs?: string[];
  includeExtensions?: string[];
}

export interface UXPreflightScanSummary {
  rootDir: string;
  totalFiles: number;
  sourceFiles: number;
  styleFiles: number;
  markupFiles: number;
  configFiles: number;
  documentationFiles: number;
  assetFiles: number;
  otherFiles: number;
  componentCandidates: number;
  extensionCounts: Record<string, number>;
  largestFiles: Array<{
    relativePath: string;
    sizeBytes: number;
  }>;
}

export interface UXPreflightScanResult {
  rootDir: string;
  files: UXPreflightScannedFile[];
  summary: UXPreflightScanSummary;
}

export interface UXPreflightTokenOccurrence {
  value: string;
  count: number;
  files: string[];
}

export interface UXPreflightNamedTokenOccurrence {
  name: string;
  value: string;
  count: number;
  files: string[];
}

export interface UXPreflightTokenDiscoverySummary {
  scannedFiles: number;
  skippedLargeFiles: number;
  colors: number;
  cssVariables: number;
  scssVariables: number;
  fontSizes: number;
  spacingValues: number;
  radiusValues: number;
  shadowValues: number;
  breakpoints: number;
}

export interface UXPreflightTokenDiscoveryResult {
  summary: UXPreflightTokenDiscoverySummary;
  colors: UXPreflightTokenOccurrence[];
  cssVariables: UXPreflightNamedTokenOccurrence[];
  scssVariables: UXPreflightNamedTokenOccurrence[];
  fontSizes: UXPreflightTokenOccurrence[];
  spacingValues: UXPreflightTokenOccurrence[];
  radiusValues: UXPreflightTokenOccurrence[];
  shadowValues: UXPreflightTokenOccurrence[];
  breakpoints: UXPreflightTokenOccurrence[];
}

export type UXPreflightComponentPatternType =
  | "button"
  | "form"
  | "table"
  | "card"
  | "modal"
  | "tabs"
  | "upload"
  | "statusBadge"
  | "kpiCard"
  | "chart"
  | "sidebar"
  | "navbar";

export interface UXPreflightComponentCandidate {
  name: string;
  relativePath: string;
  extension: string;
  sizeBytes: number;
  signals: UXPreflightComponentPatternType[];
}

export interface UXPreflightComponentPatternOccurrence {
  pattern: UXPreflightComponentPatternType;
  count: number;
  files: string[];
}

export interface UXPreflightComponentDiscoverySummary {
  scannedFiles: number;
  skippedLargeFiles: number;
  componentCandidates: number;
  patternsDetected: number;
  buttons: number;
  forms: number;
  tables: number;
  cards: number;
  modals: number;
  tabs: number;
  uploads: number;
  statusBadges: number;
  kpiCards: number;
  charts: number;
  sidebars: number;
  navbars: number;
}

export interface UXPreflightComponentDiscoveryResult {
  summary: UXPreflightComponentDiscoverySummary;
  candidates: UXPreflightComponentCandidate[];
  patterns: UXPreflightComponentPatternOccurrence[];
}

export type UXPreflightSuggestionConfidence = "low" | "medium" | "high";

export interface UXPreflightTokenSuggestion<TValue> {
  value: TValue;
  confidence: UXPreflightSuggestionConfidence;
  reason: string;
  sourceValues: string[];
}

export interface UXPreflightColorTokenSuggestions {
  primary: UXPreflightTokenSuggestion<string | null>;
  background: UXPreflightTokenSuggestion<string | null>;
  surface: UXPreflightTokenSuggestion<string | null>;
  textPrimary: UXPreflightTokenSuggestion<string | null>;
  textSecondary: UXPreflightTokenSuggestion<string | null>;
}

export interface UXPreflightScaleTokenSuggestions {
  spacing: UXPreflightTokenSuggestion<string[]>;
  radius: UXPreflightTokenSuggestion<string[]>;
  fontSizes: UXPreflightTokenSuggestion<string[]>;
  shadows: UXPreflightTokenSuggestion<string[]>;
  breakpoints: UXPreflightTokenSuggestion<string[]>;
}

export interface UXPreflightTokenSuggestionSummary {
  colorsSuggested: number;
  spacingValuesSuggested: number;
  radiusValuesSuggested: number;
  fontSizesSuggested: number;
  shadowValuesSuggested: number;
  breakpointsSuggested: number;
  overallConfidence: UXPreflightSuggestionConfidence;
}

export interface UXPreflightDesignTokenSuggestionResult {
  summary: UXPreflightTokenSuggestionSummary;
  colors: UXPreflightColorTokenSuggestions;
  scales: UXPreflightScaleTokenSuggestions;
}