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