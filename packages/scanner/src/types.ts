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