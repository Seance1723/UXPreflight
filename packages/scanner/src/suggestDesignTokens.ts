import type {
  UXPreflightDesignTokenSuggestionResult,
  UXPreflightSuggestionConfidence,
  UXPreflightTokenDiscoveryResult,
  UXPreflightTokenOccurrence,
  UXPreflightTokenSuggestion
} from "./types.js";

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getConfidence(count: number): UXPreflightSuggestionConfidence {
  if (count >= 6) {
    return "high";
  }

  if (count >= 3) {
    return "medium";
  }

  return "low";
}

function getOverallConfidence(
  values: UXPreflightSuggestionConfidence[]
): UXPreflightSuggestionConfidence {
  const score = values.reduce((total, item) => {
    if (item === "high") return total + 3;
    if (item === "medium") return total + 2;
    return total + 1;
  }, 0);

  const average = values.length > 0 ? score / values.length : 1;

  if (average >= 2.4) {
    return "high";
  }

  if (average >= 1.7) {
    return "medium";
  }

  return "low";
}

function parseHexColor(value: string) {
  const normalized = value.trim().toLowerCase();

  if (!normalized.startsWith("#")) {
    return null;
  }

  let hex = normalized.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    hex = hex
      .slice(0, 3)
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  if (hex.length !== 6 && hex.length !== 8) {
    return null;
  }

  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);

  if ([red, green, blue].some((item) => Number.isNaN(item))) {
    return null;
  }

  return {
    red,
    green,
    blue,
    value: `#${hex.slice(0, 6).toUpperCase()}`
  };
}

function getRelativeLuminance(red: number, green: number, blue: number) {
  const normalize = (channel: number) => {
    const value = channel / 255;

    return value <= 0.03928
      ? value / 12.92
      : Math.pow((value + 0.055) / 1.055, 2.4);
  };

  const r = normalize(red);
  const g = normalize(green);
  const b = normalize(blue);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getColorSaturation(red: number, green: number, blue: number) {
  const max = Math.max(red, green, blue) / 255;
  const min = Math.min(red, green, blue) / 255;

  if (max === min) {
    return 0;
  }

  const lightness = (max + min) / 2;
  const delta = max - min;

  return lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
}

function getHexColorItems(colors: UXPreflightTokenOccurrence[]) {
  return colors
    .map((item) => {
      const parsed = parseHexColor(item.value);

      if (!parsed) {
        return null;
      }

      const luminance = getRelativeLuminance(parsed.red, parsed.green, parsed.blue);
      const saturation = getColorSaturation(parsed.red, parsed.green, parsed.blue);

      return {
        ...item,
        parsed,
        luminance,
        saturation
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
}

function createSuggestion<TValue>(
  value: TValue,
  confidence: UXPreflightSuggestionConfidence,
  reason: string,
  sourceValues: string[]
): UXPreflightTokenSuggestion<TValue> {
  return {
    value,
    confidence,
    reason,
    sourceValues
  };
}

function suggestPrimaryColor(colors: UXPreflightTokenOccurrence[]) {
  const hexColors = getHexColorItems(colors);

  const candidates = hexColors
    .filter((item) => {
      return item.saturation >= 0.18 && item.luminance > 0.08 && item.luminance < 0.82;
    })
    .sort((a, b) => {
      const scoreA = a.count * 2 + a.saturation * 10;
      const scoreB = b.count * 2 + b.saturation * 10;
      return scoreB - scoreA;
    });

  const selected = candidates[0];

  if (!selected) {
    return createSuggestion(
      null,
      "low",
      "No strong brand-like color was detected. Keep default primary or set manually.",
      []
    );
  }

  return createSuggestion(
    selected.parsed.value,
    getConfidence(selected.count),
    "Suggested from the most repeated saturated color that looks suitable for brand/primary actions.",
    [selected.value]
  );
}

function suggestBackgroundColor(colors: UXPreflightTokenOccurrence[]) {
  const hexColors = getHexColorItems(colors);

  const candidates = hexColors
    .filter((item) => item.luminance >= 0.9)
    .sort((a, b) => b.count - a.count);

  const selected = candidates[0];

  if (!selected) {
    return createSuggestion(
      null,
      "low",
      "No clear light background color detected.",
      []
    );
  }

  return createSuggestion(
    selected.parsed.value,
    getConfidence(selected.count),
    "Suggested from the most repeated very light color.",
    [selected.value]
  );
}

function suggestSurfaceColor(colors: UXPreflightTokenOccurrence[], backgroundValue: string | null) {
  const hexColors = getHexColorItems(colors);

  const candidates = hexColors
    .filter((item) => item.luminance >= 0.86)
    .filter((item) => item.parsed.value !== backgroundValue)
    .sort((a, b) => b.count - a.count);

  const selected = candidates[0];

  if (!selected) {
    return createSuggestion(
      backgroundValue ?? null,
      backgroundValue ? "low" : "low",
      backgroundValue
        ? "No separate surface color detected. Background value may be reused temporarily."
        : "No clear surface color detected.",
      backgroundValue ? [backgroundValue] : []
    );
  }

  return createSuggestion(
    selected.parsed.value,
    getConfidence(selected.count),
    "Suggested from a repeated light color different from the background.",
    [selected.value]
  );
}

function suggestTextPrimaryColor(colors: UXPreflightTokenOccurrence[]) {
  const hexColors = getHexColorItems(colors);

  const candidates = hexColors
    .filter((item) => item.luminance <= 0.18)
    .sort((a, b) => b.count - a.count);

  const selected = candidates[0];

  if (!selected) {
    return createSuggestion(
      null,
      "low",
      "No clear dark text color detected.",
      []
    );
  }

  return createSuggestion(
    selected.parsed.value,
    getConfidence(selected.count),
    "Suggested from the most repeated dark color suitable for primary text.",
    [selected.value]
  );
}

function suggestTextSecondaryColor(
  colors: UXPreflightTokenOccurrence[],
  textPrimaryValue: string | null
) {
  const hexColors = getHexColorItems(colors);

  const candidates = hexColors
    .filter((item) => item.luminance > 0.18 && item.luminance <= 0.45)
    .filter((item) => item.parsed.value !== textPrimaryValue)
    .sort((a, b) => b.count - a.count);

  const selected = candidates[0];

  if (!selected) {
    return createSuggestion(
      null,
      "low",
      "No clear secondary text color detected.",
      []
    );
  }

  return createSuggestion(
    selected.parsed.value,
    getConfidence(selected.count),
    "Suggested from a repeated medium-dark color suitable for secondary text.",
    [selected.value]
  );
}

function parseUnitValue(value: string) {
  const match = value.trim().match(/^(-?\d*\.?\d+)(px|rem|em|vh|vw|%)$/);

  if (!match) {
    return null;
  }

  const amount = Number.parseFloat(match[1]);
  const unit = match[2];

  if (Number.isNaN(amount)) {
    return null;
  }

  return {
    amount,
    unit,
    value: `${amount}${unit}`
  };
}

function normalizeUnitList(items: UXPreflightTokenOccurrence[], maxItems: number) {
  const parsed = items
    .map((item) => {
      const unitValue = parseUnitValue(item.value);

      if (!unitValue) {
        return null;
      }

      return {
        ...item,
        unitValue
      };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .filter((item) => item.unitValue.amount >= 0)
    .sort((a, b) => {
      if (a.unitValue.unit !== b.unitValue.unit) {
        return a.unitValue.unit.localeCompare(b.unitValue.unit);
      }

      return a.unitValue.amount - b.unitValue.amount;
    });

  const unique = new Map<string, string>();

  parsed.forEach((item) => {
    const normalizedAmount = Number.isInteger(item.unitValue.amount)
      ? String(item.unitValue.amount)
      : String(Number(item.unitValue.amount.toFixed(3)));

    unique.set(`${normalizedAmount}${item.unitValue.unit}`, `${normalizedAmount}${item.unitValue.unit}`);
  });

  return Array.from(unique.values()).slice(0, maxItems);
}

function suggestScale(
  label: string,
  items: UXPreflightTokenOccurrence[],
  maxItems: number,
  fallback: string[]
) {
  const values = normalizeUnitList(items, maxItems);

  if (values.length === 0) {
    return createSuggestion(
      fallback,
      "low",
      `No clear ${label} scale detected. Suggested fallback values are provided.`,
      []
    );
  }

  return createSuggestion(
    values,
    values.length >= 5 ? "high" : values.length >= 3 ? "medium" : "low",
    `Suggested from detected ${label} values sorted into a reusable scale.`,
    values
  );
}

function suggestShadows(items: UXPreflightTokenOccurrence[]) {
  const values = items
    .filter((item) => item.value !== "none")
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((item) => item.value);

  if (values.length === 0) {
    return createSuggestion(
      [],
      "low",
      "No reusable shadow values detected.",
      []
    );
  }

  return createSuggestion(
    values,
    values.length >= 3 ? "medium" : "low",
    "Suggested from repeated box-shadow/text-shadow values.",
    values
  );
}

function summarizeSuggestions(result: UXPreflightDesignTokenSuggestionResult) {
  const colorValues = Object.values(result.colors).filter((item) => Boolean(item.value));
  const confidenceValues = [
    ...Object.values(result.colors).map((item) => item.confidence),
    ...Object.values(result.scales).map((item) => item.confidence)
  ];

  return {
    colorsSuggested: colorValues.length,
    spacingValuesSuggested: result.scales.spacing.value.length,
    radiusValuesSuggested: result.scales.radius.value.length,
    fontSizesSuggested: result.scales.fontSizes.value.length,
    shadowValuesSuggested: result.scales.shadows.value.length,
    breakpointsSuggested: result.scales.breakpoints.value.length,
    overallConfidence: getOverallConfidence(confidenceValues)
  };
}

export function suggestDesignTokensFromDiscovery(
  discovery: UXPreflightTokenDiscoveryResult
): UXPreflightDesignTokenSuggestionResult {
  const primary = suggestPrimaryColor(discovery.colors);
  const background = suggestBackgroundColor(discovery.colors);
  const surface = suggestSurfaceColor(discovery.colors, background.value);
  const textPrimary = suggestTextPrimaryColor(discovery.colors);
  const textSecondary = suggestTextSecondaryColor(discovery.colors, textPrimary.value);

  const result: UXPreflightDesignTokenSuggestionResult = {
    summary: {
      colorsSuggested: 0,
      spacingValuesSuggested: 0,
      radiusValuesSuggested: 0,
      fontSizesSuggested: 0,
      shadowValuesSuggested: 0,
      breakpointsSuggested: 0,
      overallConfidence: "low"
    },
    colors: {
      primary,
      background,
      surface,
      textPrimary,
      textSecondary
    },
    scales: {
      spacing: suggestScale(
        "spacing",
        discovery.spacingValues,
        10,
        ["4px", "8px", "12px", "16px", "24px", "32px", "40px", "48px", "64px"]
      ),
      radius: suggestScale(
        "radius",
        discovery.radiusValues,
        6,
        ["4px", "8px", "12px", "16px", "24px", "999px"]
      ),
      fontSizes: suggestScale(
        "font-size",
        discovery.fontSizes,
        8,
        ["12px", "14px", "16px", "18px", "24px", "32px", "40px"]
      ),
      shadows: suggestShadows(discovery.shadowValues),
      breakpoints: suggestScale(
        "breakpoint",
        discovery.breakpoints,
        6,
        ["576px", "768px", "992px", "1200px", "1400px"]
      )
    }
  };

  result.summary = summarizeSuggestions(result);

  return result;
}