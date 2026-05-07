import type { UXPreflightRulePack } from "@uxpreflight/core";

export const productTypeRules: UXPreflightRulePack = {
  id: "product-type-rules",
  name: "Product-Type Rules",
  description:
    "Rules that guide AI agents to generate UI based on the actual product category, user role, workflow risk, and business context.",
  version: "0.1.0",
  category: "product",
  rules: [
    {
      id: "product_saas_admin_001",
      title: "SaaS admin panels must prioritize control, clarity, and auditability",
      description:
        "SaaS admin panels must clearly separate configuration, users, billing, integrations, permissions, audit logs, and analytics. High-risk changes must include confirmation and visibility.",
      category: "product",
      severity: "critical",
      confidence: "high",
      appliesTo: ["saas_admin", "admin_panel", "settings", "billing", "user_management"],
      doNot: [
        "Do not mix unrelated admin settings in one long page.",
        "Do not allow high-risk changes without confirmation.",
        "Do not hide audit information for sensitive changes."
      ],
      examples: {
        pass: [
          "Billing settings show plan rules, usage, invoices, tax, currency, and audit logs separately.",
          "User role changes show confirmation and last updated details."
        ],
        fail: [
          "All admin settings are placed in one confusing scroll.",
          "Billing rules can be changed without confirmation.",
          "No record of who changed a permission setting."
        ]
      },
      tags: ["saas", "admin", "audit", "settings"]
    },
    {
      id: "product_ai_agent_app_001",
      title: "AI agent apps must show transparency and control",
      description:
        "AI agent apps must show what the agent is doing, current step, completed steps, failed steps, confidence where useful, human approval points, retry actions, and audit trail.",
      category: "product",
      severity: "critical",
      confidence: "high",
      appliesTo: ["ai_agent_app", "automation", "document_processing", "ai_workflows"],
      doNot: [
        "Do not hide AI activity behind a generic loader.",
        "Do not show fake progress.",
        "Do not allow AI to make high-impact changes without user review."
      ],
      examples: {
        pass: [
          "AI timeline shows file extraction, schema mapping, BRD generation, and failed test-case step with retry.",
          "User approval is required before AI applies project-wide changes."
        ],
        fail: [
          "Screen only says AI is working.",
          "AI failure disappears without explanation.",
          "AI modifies important settings without confirmation."
        ]
      },
      tags: ["ai-agent", "transparency", "timeline", "human-approval"]
    },
    {
      id: "product_hiring_platform_001",
      title: "Hiring platforms must separate recruiter, candidate, and admin flows",
      description:
        "Hiring platforms must clearly separate recruiter actions, candidate experience, admin controls, scoring visibility, assessment status, and privacy-sensitive candidate data.",
      category: "product",
      severity: "critical",
      confidence: "high",
      appliesTo: ["hiring_platform", "recruitment", "candidate", "recruiter", "admin"],
      doNot: [
        "Do not expose internal recruiter scores to candidates unless explicitly allowed.",
        "Do not mix candidate and recruiter workflows in the same UI.",
        "Do not show sensitive candidate data without role-based access."
      ],
      examples: {
        pass: [
          "Recruiter can see match score, shortlist status, and assessment progress.",
          "Candidate only sees their assigned assessment and deadline.",
          "Admin sees usage, roles, and audit logs."
        ],
        fail: [
          "Candidate can see recruiter scoring notes.",
          "Recruiter dashboard and candidate assessment are visually mixed.",
          "No permission boundary between recruiter and admin."
        ]
      },
      tags: ["hiring", "candidate", "recruiter", "privacy"]
    },
    {
      id: "product_assessment_tool_001",
      title: "Assessment tools must protect integrity and time-bound flows",
      description:
        "Assessment tools must clearly show start rules, expiry rules, submission status, attempt limits, time limits, candidate identity, and post-submission restrictions.",
      category: "product",
      severity: "critical",
      confidence: "high",
      appliesTo: ["assessment_tool", "candidate_portal", "exam", "test_platform"],
      doNot: [
        "Do not let candidates restart completed assessments unless explicitly allowed.",
        "Do not hide expiry or deadline rules.",
        "Do not make submission status unclear."
      ],
      examples: {
        pass: [
          "Candidate sees assessment expiry, time limit, remaining time, and submission confirmation.",
          "After submission, candidate sees locked status and cannot retake unless admin reopens."
        ],
        fail: [
          "Assessment deadline is hidden.",
          "Candidate can submit multiple times accidentally.",
          "Completed test still looks editable."
        ]
      },
      tags: ["assessment", "exam", "integrity", "candidate"]
    },
    {
      id: "product_dashboard_app_001",
      title: "Dashboard apps must prioritize insight over decoration",
      description:
        "Dashboards must group metrics by business purpose, show context, highlight exceptions, support filtering, and avoid vanity metrics without interpretation.",
      category: "product",
      severity: "warning",
      confidence: "high",
      appliesTo: ["dashboard", "analytics", "admin_panel", "reporting"],
      doNot: [
        "Do not show too many KPI cards with equal importance.",
        "Do not show numbers without labels, comparison, or context.",
        "Do not use charts only for decoration."
      ],
      examples: {
        pass: [
          "Dashboard groups KPIs into Usage, Risk, Revenue, and Activity.",
          "Failed processes are highlighted with retry actions.",
          "Date filters clearly affect all charts."
        ],
        fail: [
          "20 KPI cards shown in one grid.",
          "A chart is shown without explaining what it means.",
          "Total: 798 appears without label."
        ]
      },
      tags: ["dashboard", "analytics", "kpi", "insight"]
    },
    {
      id: "product_ecommerce_001",
      title: "E-commerce apps must reduce purchase friction and increase trust",
      description:
        "E-commerce interfaces must clearly show product details, price, availability, delivery, returns, reviews, cart state, checkout progress, and trust information.",
      category: "product",
      severity: "critical",
      confidence: "high",
      appliesTo: ["ecommerce", "marketplace", "product_page", "cart", "checkout"],
      doNot: [
        "Do not hide price, delivery, return, or stock information.",
        "Do not make checkout steps unclear.",
        "Do not create cart actions that can accidentally remove items without recovery."
      ],
      examples: {
        pass: [
          "Product page shows price, delivery estimate, stock, return policy, and clear Add to Cart CTA.",
          "Checkout shows address, payment, review, and confirmation steps."
        ],
        fail: [
          "Delivery cost appears only at final payment step.",
          "Cart item removed with no undo.",
          "Product page has weak CTA and hidden price."
        ]
      },
      tags: ["ecommerce", "checkout", "trust", "conversion"]
    },
    {
      id: "product_crm_001",
      title: "CRM apps must make relationship context easy to act on",
      description:
        "CRM screens must show contact context, deal status, next action, owner, history, notes, tasks, pipeline stage, and communication timeline.",
      category: "product",
      severity: "warning",
      confidence: "high",
      appliesTo: ["crm", "sales", "contacts", "deals", "pipeline"],
      doNot: [
        "Do not show contact records without next action.",
        "Do not hide ownership or last activity.",
        "Do not mix leads, accounts, and deals without clear structure."
      ],
      examples: {
        pass: [
          "Deal detail shows stage, value, owner, last contact, next follow-up, notes, and activity timeline.",
          "Lead list highlights overdue follow-ups."
        ],
        fail: [
          "Contact page has name and phone but no history or next action.",
          "Pipeline stage is unclear.",
          "Sales tasks are hidden away from deal context."
        ]
      },
      tags: ["crm", "sales", "pipeline", "contacts"]
    },
    {
      id: "product_hrms_001",
      title: "HRMS apps must handle employee data with privacy and clarity",
      description:
        "HRMS interfaces must clearly separate employee self-service, manager actions, HR admin actions, approvals, attendance, leave, payroll, documents, and privacy-sensitive information.",
      category: "product",
      severity: "critical",
      confidence: "high",
      appliesTo: ["hrms", "employee_portal", "leave", "payroll", "attendance"],
      doNot: [
        "Do not expose private employee information without role access.",
        "Do not make leave, payroll, or approval status unclear.",
        "Do not mix employee and HR admin workflows."
      ],
      examples: {
        pass: [
          "Employee sees leave balance, requests, approval status, and payroll documents.",
          "Manager sees team approvals separately from personal HR actions.",
          "HR admin sees audit logs for sensitive changes."
        ],
        fail: [
          "Employee can access another employee's payroll details.",
          "Leave request status is unclear.",
          "Manager and employee controls are mixed on one screen."
        ]
      },
      tags: ["hrms", "employee", "privacy", "approval"]
    },
    {
      id: "product_project_management_001",
      title: "Project management apps must make ownership and progress visible",
      description:
        "Project management screens must show task ownership, priority, status, deadline, blockers, dependencies, comments, attachments, and progress in a clear workflow.",
      category: "product",
      severity: "warning",
      confidence: "high",
      appliesTo: ["project_management", "tasks", "kanban", "timeline", "collaboration"],
      doNot: [
        "Do not show tasks without owner or status.",
        "Do not hide blockers or overdue items.",
        "Do not make comments and activity history hard to find."
      ],
      examples: {
        pass: [
          "Task card shows owner, status, priority, deadline, blockers, and comments.",
          "Project page shows progress, timeline, overdue work, and next milestones."
        ],
        fail: [
          "Task list only shows task names.",
          "Blocked tasks look the same as normal tasks.",
          "No clear ownership or due date."
        ]
      },
      tags: ["project-management", "tasks", "ownership", "progress"]
    },
    {
      id: "product_analytics_platform_001",
      title: "Analytics platforms must make data trustworthy and explainable",
      description:
        "Analytics platforms must show source, filters, date range, metric definitions, comparison context, data freshness, empty states, and error states for failed data loading.",
      category: "product",
      severity: "critical",
      confidence: "high",
      appliesTo: ["analytics_platform", "reporting", "dashboards", "charts"],
      doNot: [
        "Do not show metrics without source or date range.",
        "Do not hide failed data sections.",
        "Do not show charts without labels, legends, or meaning."
      ],
      examples: {
        pass: [
          "Report shows date range, active filters, last updated time, and metric definitions.",
          "Failed chart section shows retry action without breaking the whole dashboard."
        ],
        fail: [
          "Dashboard shows numbers but no date range.",
          "Chart fails silently.",
          "Users cannot understand what a metric means."
        ]
      },
      tags: ["analytics", "reporting", "data-quality", "trust"]
    }
  ]
};