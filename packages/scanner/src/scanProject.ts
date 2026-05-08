import { readdir, stat } from "node:fs/promises";
import path from "node:path";

import {
  DEFAULT_IGNORE_DIRS,
  DEFAULT_SCAN_EXTENSIONS
} from "./defaults.js";

import type {
  UXPreflightScannedFile,
  UXPreflightScannedFileCategory,
  UXPreflightScanOptions,
  UXPreflightScanResult,
  UXPreflightScanSummary
} from "./types.js";

function normalizePath(filePath: string) {
  return filePath.split(path.sep).join("/");
}

function getFileCategory(extension: string): UXPreflightScannedFileCategory {
  const sourceExtensions = [".js", ".jsx", ".ts", ".tsx", ".vue", ".mjs", ".cjs"];
  const styleExtensions = [".css", ".scss", ".sass", ".less"];
  const markupExtensions = [".html"];
  const configExtensions = [".json", ".yml", ".yaml"];
  const documentationExtensions = [".md", ".mdx"];
  const assetExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
    ".gif",
    ".svg",
    ".ico",
    ".mp4",
    ".webm",
    ".pdf"
  ];

  if (sourceExtensions.includes(extension)) {
    return "source";
  }

  if (styleExtensions.includes(extension)) {
    return "style";
  }

  if (markupExtensions.includes(extension)) {
    return "markup";
  }

  if (configExtensions.includes(extension)) {
    return "config";
  }

  if (documentationExtensions.includes(extension)) {
    return "documentation";
  }

  if (assetExtensions.includes(extension)) {
    return "asset";
  }

  return "other";
}

function isComponentCandidate(relativePath: string, extension: string) {
  const normalizedPath = normalizePath(relativePath);
  const fileName = path.basename(relativePath);
  const componentExtensions = [".jsx", ".tsx", ".vue"];

  if (!componentExtensions.includes(extension)) {
    return false;
  }

  if (normalizedPath.includes("/components/")) {
    return true;
  }

  if (normalizedPath.includes("/pages/")) {
    return false;
  }

  return /^[A-Z]/.test(fileName);
}

function shouldIgnoreDir(dirName: string, ignoreDirs: string[]) {
  return ignoreDirs.includes(dirName);
}

function shouldIncludeExtension(extension: string, includeExtensions: string[]) {
  return includeExtensions.includes(extension);
}

async function walkProject(
  rootDir: string,
  currentDir: string,
  options: Required<Pick<UXPreflightScanOptions, "ignoreDirs" | "includeExtensions" | "maxFiles">>,
  files: UXPreflightScannedFile[]
) {
  if (files.length >= options.maxFiles) {
    return;
  }

  const entries = await readdir(currentDir, { withFileTypes: true });

  for (const entry of entries) {
    if (files.length >= options.maxFiles) {
      return;
    }

    const absolutePath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      if (shouldIgnoreDir(entry.name, options.ignoreDirs)) {
        continue;
      }

      await walkProject(rootDir, absolutePath, options, files);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();

    if (!shouldIncludeExtension(extension, options.includeExtensions)) {
      continue;
    }

    const fileStat = await stat(absolutePath);
    const relativePath = normalizePath(path.relative(rootDir, absolutePath));
    const category = getFileCategory(extension);

    files.push({
      absolutePath,
      relativePath,
      extension,
      sizeBytes: fileStat.size,
      category,
      isComponentCandidate: isComponentCandidate(relativePath, extension)
    });
  }
}

function createExtensionCounts(files: UXPreflightScannedFile[]) {
  return files.reduce<Record<string, number>>((acc, file) => {
    const key = file.extension || "no-extension";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}

export function summarizeScanResult(
  rootDir: string,
  files: UXPreflightScannedFile[]
): UXPreflightScanSummary {
  const countByCategory = (category: UXPreflightScannedFileCategory) => {
    return files.filter((file) => file.category === category).length;
  };

  const largestFiles = [...files]
    .sort((a, b) => b.sizeBytes - a.sizeBytes)
    .slice(0, 10)
    .map((file) => ({
      relativePath: file.relativePath,
      sizeBytes: file.sizeBytes
    }));

  return {
    rootDir,
    totalFiles: files.length,
    sourceFiles: countByCategory("source"),
    styleFiles: countByCategory("style"),
    markupFiles: countByCategory("markup"),
    configFiles: countByCategory("config"),
    documentationFiles: countByCategory("documentation"),
    assetFiles: countByCategory("asset"),
    otherFiles: countByCategory("other"),
    componentCandidates: files.filter((file) => file.isComponentCandidate).length,
    extensionCounts: createExtensionCounts(files),
    largestFiles
  };
}

export async function scanProject(
  options: UXPreflightScanOptions
): Promise<UXPreflightScanResult> {
  const rootDir = path.resolve(options.rootDir);

  const files: UXPreflightScannedFile[] = [];

  await walkProject(
    rootDir,
    rootDir,
    {
      ignoreDirs: options.ignoreDirs ?? DEFAULT_IGNORE_DIRS,
      includeExtensions: options.includeExtensions ?? DEFAULT_SCAN_EXTENSIONS,
      maxFiles: options.maxFiles ?? 5000
    },
    files
  );

  const summary = summarizeScanResult(rootDir, files);

  return {
    rootDir,
    files,
    summary
  };
}