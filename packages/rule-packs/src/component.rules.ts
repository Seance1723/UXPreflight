import type { UXPreflightRulePack } from "@uxpreflight/core";

export const componentRules: UXPreflightRulePack = {
  id: "component-rules",
  name: "Component Rules",
  description:
    "Rules that force AI agents to create consistent, reusable, accessible, and production-ready UI components.",
  version: "0.1.0",
  category: "component",
  rules: [
    {
      id: "component_button_001",
      title: "Buttons must follow clear action hierarchy",
      description:
        "Buttons must use clear visual hierarchy with primary, secondary, ghost, and danger variants. Every important section should have only one primary action.",
      category: "component",
      severity: "critical",
      confidence: "high",
      appliesTo: ["buttons", "forms", "dashboards", "settings_pages", "all_projects"],
      doNot: [
        "Do not use multiple primary buttons in the same section.",
        "Do not use vague button labels like Submit, Click Here, or Proceed without context.",
        "Do not create new button colors outside the design tokens."
      ],
      examples: {
        pass: [
          "Primary button: Save Billing Rules.",
          "Danger button: Delete Project with confirmation.",
          "Secondary button: Cancel."
        ],
        fail: [
          "Three primary buttons in one card.",
          "A button labelled Submit without context.",
          "Random purple button not defined in tokens."
        ]
      },
      tags: ["button", "cta", "hierarchy"]
    },
    {
      id: "component_form_001",
      title: "Forms must be structured and recoverable",
      description:
        "Forms must use visible labels, helper text where needed, field-level validation, clear error messages, save/cancel actions, and unsaved-change handling.",
      category: "component",
      severity: "critical",
      confidence: "high",
      appliesTo: ["forms", "settings_pages", "login_pages", "admin_panels", "all_projects"],
      doNot: [
        "Do not use placeholder as the only label.",
        "Do not show all form errors only at the top.",
        "Do not reset user input after validation errors."
      ],
      examples: {
        pass: [
          "Each field has label, helper text, and inline error.",
          "Save button is disabled until changes are made.",
          "Unsaved changes warning appears before leaving."
        ],
        fail: [
          "Input has only placeholder.",
          "Form clears all data after one invalid field.",
          "Validation message says Invalid only."
        ]
      },
      tags: ["form", "validation", "input"]
    },
    {
      id: "component_table_001",
      title: "Tables must support real data states",
      description:
        "Tables must include loading, empty, error, filtered-empty, pagination, sorting, filtering, row actions, and mobile behavior when data can grow.",
      category: "component",
      severity: "critical",
      confidence: "high",
      appliesTo: ["tables", "lists", "admin_panels", "dashboards", "data_pages"],
      doNot: [
        "Do not create a static table without loading or empty state.",
        "Do not keep wide desktop tables unchanged on mobile.",
        "Do not hide important row actions without clear affordance."
      ],
      examples: {
        pass: [
          "Table has search, filters, loading skeleton, empty state, and row actions.",
          "On mobile, table rows convert into stacked cards."
        ],
        fail: [
          "Blank table when no records exist.",
          "Table overflows horizontally on mobile.",
          "Actions are hidden with no label or tooltip."
        ]
      },
      tags: ["table", "data", "empty-state", "mobile"]
    },
    {
      id: "component_card_001",
      title: "Cards must have clear purpose",
      description:
        "Cards must represent meaningful grouped content, actions, summaries, or status. They must follow project spacing, radius, shadow, and typography tokens.",
      category: "component",
      severity: "warning",
      confidence: "high",
      appliesTo: ["cards", "dashboards", "settings_pages", "detail_pages", "all_projects"],
      doNot: [
        "Do not create decorative cards without business purpose.",
        "Do not use inconsistent card radius, shadow, or padding.",
        "Do not overload one card with unrelated content."
      ],
      examples: {
        pass: [
          "A KPI card shows label, value, trend, and context.",
          "A settings card groups related billing controls."
        ],
        fail: [
          "Random decorative card with no useful content.",
          "Every card uses different padding and radius.",
          "One card contains unrelated actions and metrics."
        ]
      },
      tags: ["card", "layout", "design-system"]
    },
    {
      id: "component_modal_001",
      title: "Modals must be used only for focused decisions",
      description:
        "Modals should be used for confirmations, focused forms, or short decisions. They must include clear title, description, actions, close behavior, and keyboard support.",
      category: "component",
      severity: "critical",
      confidence: "high",
      appliesTo: ["modals", "confirmations", "danger_actions", "forms", "all_projects"],
      doNot: [
        "Do not put long workflows inside a modal.",
        "Do not create destructive confirmation without explaining consequences.",
        "Do not create modals without close/cancel behavior."
      ],
      examples: {
        pass: [
          "Delete confirmation explains what will be removed.",
          "Modal has Cancel and Delete Project actions.",
          "Escape key and close button are supported."
        ],
        fail: [
          "A 5-step setup wizard inside one modal.",
          "Confirmation only says Are you sure?",
          "Modal cannot be closed with keyboard."
        ]
      },
      tags: ["modal", "confirmation", "keyboard"]
    },
    {
      id: "component_tabs_001",
      title: "Tabs must separate sibling sections",
      description:
        "Tabs must be used for related sections at the same hierarchy level. They must not replace step-by-step workflows.",
      category: "component",
      severity: "warning",
      confidence: "high",
      appliesTo: ["tabs", "settings_pages", "dashboards", "detail_pages"],
      doNot: [
        "Do not use tabs for sequential steps.",
        "Do not hide critical errors inside inactive tabs without indicator.",
        "Do not create tabs that become unusable on mobile."
      ],
      examples: {
        pass: [
          "Settings page uses tabs for General, Billing, Integrations, and Audit Logs.",
          "Mobile tabs convert into scrollable pills or accordion."
        ],
        fail: [
          "Checkout steps are implemented as tabs.",
          "A failed section is hidden inside an inactive tab with no badge.",
          "Tabs overflow on mobile."
        ]
      },
      tags: ["tabs", "navigation", "settings"]
    },
    {
      id: "component_upload_001",
      title: "Upload components must show file-wise status",
      description:
        "Upload components must show accepted file types, size limits, file-wise progress, file-wise errors, retry actions, and mapping/status where applicable.",
      category: "component",
      severity: "critical",
      confidence: "high",
      appliesTo: ["uploads", "ai_agent_apps", "document_processing", "admin_panels"],
      doNot: [
        "Do not show one generic loader for multiple uploaded files.",
        "Do not fail all files silently when one file fails.",
        "Do not hide accepted file type and size limit."
      ],
      examples: {
        pass: [
          "Each file shows queued, uploading, processing, completed, or failed.",
          "Failed files show reason and retry action.",
          "Upload area shows PDF/DOCX allowed, max 10MB."
        ],
        fail: [
          "Uploading 10 files shows only one spinner.",
          "Failed file disappears from the list.",
          "User is not told which file types are allowed."
        ]
      },
      tags: ["upload", "file-status", "processing"]
    },
    {
      id: "component_status_badge_001",
      title: "Status badges must combine text and visual signal",
      description:
        "Status badges must use text, icon, and token-based color to communicate states such as active, pending, completed, failed, disabled, running, and warning.",
      category: "component",
      severity: "critical",
      confidence: "high",
      appliesTo: ["status_badges", "tables", "dashboards", "ai_agent_apps", "all_projects"],
      doNot: [
        "Do not communicate status using color only.",
        "Do not create different labels for the same state across screens.",
        "Do not use random status colors outside tokens."
      ],
      examples: {
        pass: [
          "Failed badge uses danger token, error icon, and Failed text.",
          "Running badge uses info token and Running text."
        ],
        fail: [
          "Green dot with no label.",
          "One page says Failed while another says Error for the same state.",
          "Random badge colors not defined in tokens."
        ]
      },
      tags: ["status", "badge", "accessibility"]
    },
    {
      id: "component_kpi_card_001",
      title: "KPI cards must show value with context",
      description:
        "KPI cards must include metric label, value, context, comparison, trend, or explanation. They must not show vanity numbers without meaning.",
      category: "component",
      severity: "warning",
      confidence: "high",
      appliesTo: ["kpi_cards", "dashboards", "analytics_pages", "admin_panels"],
      doNot: [
        "Do not show numbers without context.",
        "Do not use too many KPI cards with equal priority.",
        "Do not use charts or trends that do not explain anything."
      ],
      examples: {
        pass: [
          "API Usage: 72% used. 28% remaining this billing cycle.",
          "Failed Uploads: 4 files need retry."
        ],
        fail: [
          "Total: 783 with no label or context.",
          "20 KPI cards shown without grouping.",
          "Trend arrow without comparison period."
        ]
      },
      tags: ["kpi", "dashboard", "analytics"]
    },
    {
      id: "component_ai_activity_timeline_001",
      title: "AI activity timeline must show agent progress honestly",
      description:
        "AI agent workflows must show current step, completed steps, failed steps, pending steps, timestamps, retry actions, and human approval points where needed.",
      category: "component",
      severity: "critical",
      confidence: "high",
      appliesTo: ["ai_agent_apps", "processing_pages", "automation", "document_processing"],
      doNot: [
        "Do not hide what the AI agent is doing.",
        "Do not show fake completion or fake progress.",
        "Do not hide failed AI steps without reason and recovery action."
      ],
      examples: {
        pass: [
          "Timeline shows Extracting files, Mapping schema, Generating BRD, Failed at test-case creation with retry.",
          "Human approval required before applying AI-generated changes."
        ],
        fail: [
          "Only one spinner says AI is working.",
          "AI failure disappears from the UI.",
          "User cannot see which step failed."
        ]
      },
      tags: ["ai-agent", "timeline", "progress", "transparency"]
    }
  ]
};