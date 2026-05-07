import type { UXPreflightRulePack } from "@uxpreflight/core";

export const universalUXRules: UXPreflightRulePack = {
  id: "universal-ux-rules",
  name: "Universal UX Rules",
  description: "Core usability rules that apply to every UI screen generated or modified by AI agents.",
  version: "0.1.0",
  category: "universal_ux",
  rules: [
    {
      id: "ux_goal_clarity_001",
      title: "Screen goal must be clear",
      description:
        "Every screen must make the user's main goal clear within a few seconds through layout, heading, content hierarchy, and primary action.",
      category: "universal_ux",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not create screens where all actions look equally important.",
        "Do not use vague headings that fail to explain the screen purpose."
      ],
      examples: {
        pass: [
          "A billing page clearly shows current plan, usage, invoice status, and the main billing action.",
          "An upload page clearly tells users to upload files and shows what happens next."
        ],
        fail: [
          "A dashboard with many cards but no clear primary purpose.",
          "A settings page where users cannot understand which section controls what."
        ]
      },
      tags: ["clarity", "hierarchy", "goal"]
    },
    {
      id: "ux_primary_action_001",
      title: "Primary action must be obvious",
      description:
        "Every important screen or section must have one clearly visible primary action that matches the user's main task.",
      category: "universal_ux",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not show multiple primary buttons competing with each other.",
        "Do not hide the main action inside a dropdown unless the action is secondary."
      ],
      examples: {
        pass: [
          "A project page has a clear 'Add Files' or 'Create Project' action.",
          "A billing settings page has a clear 'Save Changes' action."
        ],
        fail: [
          "Every button uses the same visual weight.",
          "The main action is hidden below the fold without reason."
        ]
      },
      tags: ["cta", "action", "conversion"]
    },
    {
      id: "ux_system_status_001",
      title: "System status must be visible",
      description:
        "The interface must clearly show what is happening when data is loading, processing, saving, syncing, failing, or completed.",
      category: "universal_ux",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not leave users guessing after they click an action.",
        "Do not show fake progress or unclear loading indicators."
      ],
      examples: {
        pass: [
          "A file upload shows queued, uploading, processing, completed, and failed states.",
          "A save button changes to 'Saving...' and confirms when saved."
        ],
        fail: [
          "User clicks Save and nothing changes.",
          "A processing screen shows a loader but no information about what is running."
        ]
      },
      tags: ["feedback", "status", "loading", "processing"]
    },
    {
      id: "ux_error_recovery_001",
      title: "Errors must explain recovery",
      description:
        "Error messages must explain what went wrong, what the user can do next, and whether retry, edit, re-upload, or support action is available.",
      category: "universal_ux",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not show raw technical errors as the only message.",
        "Do not show only 'Something went wrong' without a next action."
      ],
      examples: {
        pass: [
          "Upload failed because the file type is unsupported. Upload PDF or DOCX.",
          "Billing sync failed. Retry sync or check API credentials."
        ],
        fail: [
          "Error 500.",
          "Something went wrong."
        ]
      },
      tags: ["error", "recovery", "support"]
    },
    {
      id: "ux_consistency_001",
      title: "Use consistent patterns",
      description:
        "Screens must reuse existing layout, spacing, component, naming, and interaction patterns instead of inventing new ones without reason.",
      category: "universal_ux",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not create new button styles when existing variants are available.",
        "Do not change spacing, colors, radius, or typography randomly between screens."
      ],
      examples: {
        pass: [
          "All primary buttons use the same token and visual style.",
          "Tables use the same filter, empty state, and row action pattern."
        ],
        fail: [
          "One page uses rounded cards, another uses sharp cards, another uses glass cards without reason.",
          "Every generated screen has a different color palette."
        ]
      },
      tags: ["consistency", "design-system", "tokens"]
    },
    {
      id: "ux_cognitive_load_001",
      title: "Reduce cognitive load",
      description:
        "The interface must avoid unnecessary complexity by grouping related information, using progressive disclosure, and making decisions easy to understand.",
      category: "universal_ux",
      severity: "warning",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not show all advanced settings at once when they can be grouped.",
        "Do not overload the user with too many equal-priority cards, filters, or actions."
      ],
      examples: {
        pass: [
          "Advanced settings are grouped inside tabs or accordions.",
          "Dashboard cards are grouped by purpose and priority."
        ],
        fail: [
          "A long settings page with every control shown in one scroll.",
          "A dashboard with 20 cards and no grouping."
        ]
      },
      tags: ["simplicity", "progressive-disclosure", "mental-load"]
    },
    {
      id: "ux_empty_state_001",
      title: "Empty states must guide action",
      description:
        "Empty states must explain why there is no data and what the user can do next.",
      category: "universal_ux",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not show a blank area when there is no data.",
        "Do not use only 'No data found' without context or action."
      ],
      examples: {
        pass: [
          "No files uploaded yet. Upload your first file to start discovery.",
          "No invoices generated yet. Invoices will appear after the first billing cycle."
        ],
        fail: [
          "No data found.",
          "A completely empty table area."
        ]
      },
      tags: ["empty-state", "content", "onboarding"]
    },
    {
      id: "ux_mobile_responsiveness_001",
      title: "Mobile behavior must be defined",
      description:
        "Every generated UI must define how layout, navigation, tables, cards, forms, and actions behave on smaller screens.",
      category: "universal_ux",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not create fixed-width layouts that break on mobile.",
        "Do not keep wide tables unchanged on small screens."
      ],
      examples: {
        pass: [
          "A desktop table becomes stacked cards on mobile.",
          "Tabs become scrollable pills or accordions on mobile."
        ],
        fail: [
          "A 1200px wide dashboard overflows on mobile.",
          "Table columns become unreadable on small screens."
        ]
      },
      tags: ["responsive", "mobile", "layout"]
    },
    {
      id: "ux_content_clarity_001",
      title: "Use clear and human-friendly content",
      description:
        "Labels, headings, helper text, errors, and button text must be specific, short, and easy to understand.",
      category: "universal_ux",
      severity: "warning",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not use vague labels like Submit, Click Here, or Manage without context.",
        "Do not use technical jargon unless the target user expects it."
      ],
      examples: {
        pass: [
          "Upload Files",
          "Save Billing Rules",
          "Retry Failed Sync"
        ],
        fail: [
          "Submit",
          "Proceed",
          "Execute Operation"
        ]
      },
      tags: ["content", "microcopy", "clarity"]
    },
    {
      id: "ux_dangerous_action_001",
      title: "Dangerous actions need confirmation",
      description:
        "Actions that delete, reset, remove access, change billing, affect permissions, or trigger irreversible changes must require confirmation and explain the consequence.",
      category: "universal_ux",
      severity: "blocker",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens"],
      doNot: [
        "Do not allow destructive action with one accidental click.",
        "Do not use vague confirmation text for high-risk actions."
      ],
      examples: {
        pass: [
          "Delete project confirmation explains that files, mappings, and reports will be removed.",
          "Changing billing settings shows affected customers before saving."
        ],
        fail: [
          "Delete button instantly removes data.",
          "Confirmation modal only says 'Are you sure?'"
        ]
      },
      tags: ["risk", "confirmation", "destructive-action"]
    }
  ]
};