import type { UXPreflightTokens } from "./types.js";

export const DEFAULT_REQUIRED_STATES = [
  "default",
  "loading",
  "skeleton",
  "empty",
  "error",
  "success",
  "disabled",
  "permission_denied",
  "partial_data",
  "slow_network",
  "mobile",
  "long_content",
  "api_failed",
  "processing",
  "unsaved_changes",
  "expired_session"
];

export function createDefaultTokens(primaryColor = "#5B5FEF"): UXPreflightTokens {
  return {
    colors: {
      primary: primaryColor,
      secondary: "#16A3B8",
      background: "#F7F8FC",
      surface: "#FFFFFF",
      textPrimary: "#101828",
      textSecondary: "#667085",
      success: "#12B76A",
      warning: "#F79009",
      danger: "#F04438",
      info: "#2E90FA"
    },
    typography: {
      fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
      scale: {
        xs: "12px",
        sm: "14px",
        base: "16px",
        lg: "18px",
        xl: "24px",
        "2xl": "32px",
        "3xl": "40px"
      },
      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      }
    },
    spacing: {
      base: 8,
      scale: [4, 8, 12, 16, 24, 32, 40, 48, 64]
    },
    radius: {
      sm: "8px",
      md: "12px",
      lg: "18px",
      xl: "24px",
      full: "999px"
    },
    shadows: {
      card: "0 12px 32px rgba(16, 24, 40, 0.08)",
      modal: "0 24px 64px rgba(16, 24, 40, 0.18)",
      dropdown: "0 16px 40px rgba(16, 24, 40, 0.12)"
    },
    breakpoints: {
      sm: "576px",
      md: "768px",
      lg: "992px",
      xl: "1200px",
      "2xl": "1400px"
    }
  };
}