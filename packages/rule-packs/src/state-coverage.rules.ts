import type { UXPreflightRulePack } from "@uxpreflight/core";

export const stateCoverageRules: UXPreflightRulePack = {
  id: "state-coverage-rules",
  name: "State Coverage Rules",
  description:
    "Rules that force AI agents to design real application states such as loading, empty, error, success, disabled, permission denied, partial data, and mobile states.",
  version: "0.1.0",
  category: "state",
  rules: [
    {
      id: "state_loading_001",
      title: "Loading state is required",
      description:
        "Every screen, section, table, card list, form submission, upload flow, and async action must define a loading state.",
      category: "state",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens", "async_actions", "tables", "forms", "uploads"],
      doNot: [
        "Do not leave blank space while data is loading.",
        "Do not allow users to click the same action repeatedly while loading."
      ],
      examples: {
        pass: [
          "A table shows skeleton rows while loading data.",
          "A save button changes to Saving... and becomes disabled during submission."
        ],
        fail: [
          "The screen stays blank until data appears.",
          "User can click Save multiple times while request is running."
        ]
      },
      tags: ["loading", "async", "feedback"]
    },
    {
      id: "state_empty_001",
      title: "Empty state must explain next action",
      description:
        "Every list, table, dashboard, upload area, search result, notification page, and report area must define an empty state with helpful next action.",
      category: "state",
      severity: "critical",
      confidence: "high",
      appliesTo: ["tables", "lists", "dashboards", "uploads", "search", "reports"],
      doNot: [
        "Do not show only 'No data found'.",
        "Do not leave the screen visually empty without explanation."
      ],
      examples: {
        pass: [
          "No files uploaded yet. Upload your first file to start discovery.",
          "No results found. Try changing filters or search keyword."
        ],
        fail: [
          "No data found.",
          "Blank table with no message or CTA."
        ]
      },
      tags: ["empty-state", "onboarding", "content"]
    },
    {
      id: "state_error_001",
      title: "Error state must show recovery path",
      description:
        "Every failed request, failed upload, failed sync, failed save, and failed AI process must show the reason and a clear recovery action.",
      category: "state",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "forms", "uploads", "api_requests", "ai_agent_apps"],
      doNot: [
        "Do not show raw server errors as the only message.",
        "Do not show an error without retry, edit, re-upload, or support action."
      ],
      examples: {
        pass: [
          "Upload failed because file size exceeds 10MB. Upload a smaller file.",
          "Billing sync failed. Retry sync or check API credentials."
        ],
        fail: [
          "Error 500.",
          "Something went wrong."
        ]
      },
      tags: ["error", "recovery", "failure"]
    },
    {
      id: "state_success_001",
      title: "Success state must confirm completion",
      description:
        "After important actions, the UI must clearly confirm that the action was completed and explain what changed or what happens next.",
      category: "state",
      severity: "warning",
      confidence: "high",
      appliesTo: ["forms", "uploads", "settings", "billing", "admin_actions"],
      doNot: [
        "Do not silently complete important actions without feedback.",
        "Do not show vague success messages that do not explain what happened."
      ],
      examples: {
        pass: [
          "Billing rules saved successfully. New rules will apply from the next invoice cycle.",
          "Files uploaded successfully. Processing has started."
        ],
        fail: [
          "Done.",
          "The screen updates but user gets no confirmation."
        ]
      },
      tags: ["success", "confirmation", "feedback"]
    },
    {
      id: "state_disabled_001",
      title: "Disabled state must explain why",
      description:
        "Disabled buttons, fields, tabs, actions, and controls must make it clear why they are unavailable when the reason is not obvious.",
      category: "state",
      severity: "warning",
      confidence: "high",
      appliesTo: ["buttons", "forms", "settings", "admin_panels", "all_projects"],
      doNot: [
        "Do not disable important actions without explanation.",
        "Do not make disabled controls look like broken UI."
      ],
      examples: {
        pass: [
          "Start Processing is disabled until at least one file is mapped.",
          "Save is disabled because no changes were made."
        ],
        fail: [
          "A disabled button with no helper text.",
          "A grayed-out action that gives no reason."
        ]
      },
      tags: ["disabled", "forms", "actions"]
    },
    {
      id: "state_permission_denied_001",
      title: "Permission denied state is required for restricted areas",
      description:
        "Restricted screens, actions, settings, records, and admin features must define a permission denied state with clear explanation.",
      category: "state",
      severity: "critical",
      confidence: "high",
      appliesTo: ["admin_panels", "role_based_apps", "settings", "billing", "user_management"],
      doNot: [
        "Do not show a broken screen when the user lacks access.",
        "Do not hide permission problems behind generic errors."
      ],
      examples: {
        pass: [
          "You do not have permission to manage billing settings. Contact your Super Admin.",
          "This report is available only to Admin and Practice Lead roles."
        ],
        fail: [
          "Page not found for permission issue.",
          "Blank page when access is denied."
        ]
      },
      tags: ["permission", "roles", "access-control"]
    },
    {
      id: "state_partial_data_001",
      title: "Partial data state must be handled",
      description:
        "When only some data loads or some items fail, the UI must show what succeeded, what failed, and what the user can do next.",
      category: "state",
      severity: "critical",
      confidence: "high",
      appliesTo: ["dashboards", "tables", "uploads", "ai_agent_apps", "reports"],
      doNot: [
        "Do not fail the entire screen when only one section fails.",
        "Do not hide item-level failures."
      ],
      examples: {
        pass: [
          "8 files processed successfully, 2 failed. View failed files and retry.",
          "Dashboard loaded except API Usage. Retry API Usage section."
        ],
        fail: [
          "Entire page shows error because one widget failed.",
          "Some files are missing with no explanation."
        ]
      },
      tags: ["partial-data", "resilience", "failure"]
    },
    {
      id: "state_slow_network_001",
      title: "Slow network state must provide feedback",
      description:
        "Long-running actions must show meaningful progress, current status, or estimated next step instead of leaving users uncertain.",
      category: "state",
      severity: "warning",
      confidence: "medium",
      appliesTo: ["uploads", "ai_processing", "reports", "sync", "long_running_actions"],
      doNot: [
        "Do not show an endless spinner without context for long tasks.",
        "Do not allow users to think the app is frozen."
      ],
      examples: {
        pass: [
          "Processing file 3 of 10. This may take a few minutes.",
          "Generating report. You can continue working while this runs."
        ],
        fail: [
          "Infinite spinner with no message.",
          "Button remains stuck on loading with no status."
        ]
      },
      tags: ["slow-network", "progress", "long-running"]
    },
    {
      id: "state_mobile_001",
      title: "Mobile state must be designed",
      description:
        "Every screen must define how layout, tables, filters, tabs, cards, forms, and actions behave on mobile devices.",
      category: "state",
      severity: "critical",
      confidence: "high",
      appliesTo: ["responsive", "mobile", "all_screens"],
      doNot: [
        "Do not keep wide desktop tables unchanged on mobile.",
        "Do not create fixed-width layouts that cause horizontal scrolling."
      ],
      examples: {
        pass: [
          "Desktop table converts into stacked mobile cards.",
          "Settings tabs convert into scrollable pills or accordions."
        ],
        fail: [
          "A 1200px layout overflows on mobile.",
          "Table columns become unreadable on smaller screens."
        ]
      },
      tags: ["mobile", "responsive", "layout"]
    },
    {
      id: "state_unsaved_changes_001",
      title: "Unsaved changes state is required",
      description:
        "Forms, settings pages, editors, and configuration screens must warn users when they try to leave with unsaved changes.",
      category: "state",
      severity: "critical",
      confidence: "high",
      appliesTo: ["forms", "settings", "editors", "configuration_pages", "admin_panels"],
      doNot: [
        "Do not allow users to accidentally lose unsaved work.",
        "Do not reset form values without warning."
      ],
      examples: {
        pass: [
          "You have unsaved changes. Save, discard, or continue editing.",
          "Leaving this page will discard billing configuration changes."
        ],
        fail: [
          "User navigates away and loses all form input.",
          "Refresh resets a long configuration form without warning."
        ]
      },
      tags: ["unsaved-changes", "forms", "data-loss"]
    }
  ]
};