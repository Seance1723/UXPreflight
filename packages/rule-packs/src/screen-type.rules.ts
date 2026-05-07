import type { UXPreflightRulePack } from "@uxpreflight/core";

export const screenTypeRules: UXPreflightRulePack = {
  id: "screen-type-rules",
  name: "Screen-Type Rules",
  description:
    "Rules that guide AI agents to generate UI based on the specific screen type, user task, layout needs, states, and interaction patterns.",
  version: "0.1.0",
  category: "screen",
  rules: [
    {
      id: "screen_dashboard_001",
      title: "Dashboards must prioritize insight and action",
      description:
        "Dashboard screens must show the most important metrics, risks, actions, and recent activity in a clear hierarchy. Metrics must include context and not appear as decorative numbers.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["dashboard", "analytics_dashboard", "admin_dashboard", "saas_dashboard"],
      doNot: [
        "Do not show too many KPI cards with equal priority.",
        "Do not show numbers without labels, context, or comparison.",
        "Do not use charts only for decoration."
      ],
      examples: {
        pass: [
          "Dashboard groups metrics into Usage, Risk, Activity, and Revenue.",
          "Failed processes are highlighted with retry action.",
          "KPI cards show value, label, comparison, and meaning."
        ],
        fail: [
          "20 KPI cards shown in one flat grid.",
          "Total: 982 shown without explanation.",
          "Charts appear without axis labels or meaning."
        ]
      },
      tags: ["dashboard", "kpi", "analytics", "insight"]
    },
    {
      id: "screen_settings_001",
      title: "Settings pages must be grouped by purpose",
      description:
        "Settings screens must group controls by purpose, explain what each setting affects, show save/cancel behavior, and protect high-risk changes with confirmation.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["settings_page", "admin_settings", "configuration_page"],
      doNot: [
        "Do not place all settings in one long confusing scroll.",
        "Do not allow dangerous settings to change without confirmation.",
        "Do not hide unsaved changes."
      ],
      examples: {
        pass: [
          "Settings are separated into General, Billing, Integrations, Security, and Audit Logs.",
          "Dangerous changes require confirmation and explain impact.",
          "Unsaved changes warning appears before leaving."
        ],
        fail: [
          "All controls are placed in one long page.",
          "Billing configuration changes instantly without confirmation.",
          "User leaves page and loses changes silently."
        ]
      },
      tags: ["settings", "configuration", "admin", "confirmation"]
    },
    {
      id: "screen_project_details_001",
      title: "Project detail pages must show summary, progress, files, and actions",
      description:
        "Project detail screens must clearly show project summary, current status, owner, progress, related files, key actions, activity timeline, and error/retry states.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["project_details", "project_management", "ai_agent_app", "document_processing"],
      doNot: [
        "Do not show project information without current status.",
        "Do not hide file-level processing status.",
        "Do not hide failed process details."
      ],
      examples: {
        pass: [
          "Project page shows summary, process coverage, uploaded files, mapped processes, current agent step, and activity timeline.",
          "Failed files show reason and retry action."
        ],
        fail: [
          "Project page only shows title and description.",
          "Files are uploaded but no status is shown.",
          "Processing error is hidden behind a generic failed badge."
        ]
      },
      tags: ["project-details", "files", "progress", "activity"]
    },
    {
      id: "screen_billing_001",
      title: "Billing screens must show usage, rules, invoices, and auditability",
      description:
        "Billing screens must show billing configuration, plan rules, usage, invoices, currency, tax, payment status, sync state, and audit information where applicable.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["billing_page", "saas_admin", "subscription", "usage_billing"],
      doNot: [
        "Do not hide token/API usage impact on billing.",
        "Do not allow billing rule changes without confirmation.",
        "Do not omit failed sync, empty invoice, or audit states."
      ],
      examples: {
        pass: [
          "Billing page includes API usage, current plan, invoices, currency, tax, billing rules, and audit log.",
          "Failed invoice sync has retry action and clear message."
        ],
        fail: [
          "Billing page only shows current plan.",
          "Currency and tax settings are hidden.",
          "Billing rule changes have no audit trail."
        ]
      },
      tags: ["billing", "subscription", "invoice", "audit"]
    },
    {
      id: "screen_upload_processing_001",
      title: "Upload and processing screens must show file-wise progress",
      description:
        "Upload and processing screens must show accepted formats, size limits, file-wise status, mapping, processing step, errors, retry, and completion state.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["upload_page", "processing_page", "document_processing", "ai_agent_app"],
      doNot: [
        "Do not show one generic spinner for many files.",
        "Do not hide which files failed.",
        "Do not skip accepted file type and size information."
      ],
      examples: {
        pass: [
          "Each uploaded file shows queued, uploading, processing, completed, or failed.",
          "One file can be mapped to multiple processes.",
          "Failed files show reason and retry."
        ],
        fail: [
          "Uploading 10 files shows one spinner only.",
          "Failed files disappear.",
          "User does not know allowed file types."
        ]
      },
      tags: ["upload", "processing", "file-status", "mapping"]
    },
    {
      id: "screen_table_list_001",
      title: "Table and list screens must support search, filter, sort, and states",
      description:
        "Table/list screens must include loading, empty, error, filtered-empty, pagination, sorting, filtering, row actions, bulk actions where needed, and mobile behavior.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["table_page", "list_page", "admin_panel", "data_management"],
      doNot: [
        "Do not create static tables without loading or empty states.",
        "Do not hide important row actions.",
        "Do not keep wide tables unchanged on mobile."
      ],
      examples: {
        pass: [
          "User list has search, filters, pagination, row actions, loading skeleton, and empty state.",
          "Mobile table converts rows into stacked cards."
        ],
        fail: [
          "Blank table when no data exists.",
          "No search/filter for large data.",
          "Table overflows horizontally on mobile."
        ]
      },
      tags: ["table", "list", "filter", "pagination", "mobile"]
    },
    {
      id: "screen_form_001",
      title: "Create and edit forms must protect user input",
      description:
        "Create/edit form screens must use visible labels, helper text, validation, save/cancel behavior, disabled states, error recovery, and unsaved-change warning.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["form_page", "create_page", "edit_page", "settings_form"],
      doNot: [
        "Do not use placeholder text as the only label.",
        "Do not clear user input after validation errors.",
        "Do not allow users to lose unsaved changes silently."
      ],
      examples: {
        pass: [
          "Project creation form has labels, helper text, inline errors, save/cancel, and unsaved-change warning.",
          "Submit button shows loading and disables duplicate submission."
        ],
        fail: [
          "Inputs only use placeholders.",
          "Form resets after one invalid field.",
          "User navigates away and loses all changes."
        ]
      },
      tags: ["form", "validation", "save", "unsaved-changes"]
    },
    {
      id: "screen_wizard_001",
      title: "Wizard flows must show progress and allow safe navigation",
      description:
        "Wizard screens must show current step, completed steps, upcoming steps, validation per step, save progress where needed, and clear back/next behavior.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["wizard", "stepper", "onboarding", "multi_step_form"],
      doNot: [
        "Do not use tabs for sequential steps.",
        "Do not let users proceed without required step validation.",
        "Do not lose previous step data when navigating back."
      ],
      examples: {
        pass: [
          "Add Project wizard shows Details, Upload Files, Configuration, and Review steps.",
          "Each step validates required fields before continuing.",
          "Back button preserves entered data."
        ],
        fail: [
          "Sequential flow is built with unrelated tabs.",
          "User can jump to final step without required data.",
          "Going back clears previous step values."
        ]
      },
      tags: ["wizard", "stepper", "onboarding", "multi-step"]
    },
    {
      id: "screen_login_001",
      title: "Login screens must be clear, secure, and role-aware when needed",
      description:
        "Login screens must use clear labels, password visibility control, error handling, forgot password path, loading state, and role selection only when the product requires it.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["login_page", "auth", "role_based_app"],
      doNot: [
        "Do not show vague login errors.",
        "Do not use placeholder as the only label.",
        "Do not ask for role selection unless it has real product purpose."
      ],
      examples: {
        pass: [
          "Login form includes username/email, password, optional role selection, forgot password, loading state, and clear error.",
          "If user has one role, role dropdown is disabled or hidden."
        ],
        fail: [
          "Login error only says Failed.",
          "Role dropdown shows irrelevant roles.",
          "No loading state after clicking Login."
        ]
      },
      tags: ["login", "auth", "role", "security"]
    },
    {
      id: "screen_analytics_001",
      title: "Analytics screens must show data context and trust signals",
      description:
        "Analytics screens must show date range, filters, data source, last updated time, metric definitions, chart labels, empty states, failed sections, and export/share actions where useful.",
      category: "screen",
      severity: "critical",
      confidence: "high",
      appliesTo: ["analytics_page", "reporting", "charts", "dashboards"],
      doNot: [
        "Do not show charts without labels, legends, or meaning.",
        "Do not show metrics without date range or source.",
        "Do not break the full page if one chart fails."
      ],
      examples: {
        pass: [
          "Analytics page shows active filters, date range, source, last updated, and clear metric definitions.",
          "Failed chart section shows retry without blocking the rest of the dashboard."
        ],
        fail: [
          "Charts appear without labels.",
          "No date range is shown.",
          "One failed chart breaks the whole page."
        ]
      },
      tags: ["analytics", "charts", "filters", "data-trust"]
    }
  ]
};