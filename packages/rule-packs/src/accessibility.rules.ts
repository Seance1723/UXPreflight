import type { UXPreflightRulePack } from "@uxpreflight/core";

export const accessibilityRules: UXPreflightRulePack = {
  id: "accessibility-rules",
  name: "Accessibility Rules",
  description:
    "Practical accessibility rules that help AI agents create more readable, usable, keyboard-friendly, and inclusive interfaces.",
  version: "0.1.0",
  category: "accessibility",
  rules: [
    {
      id: "a11y_visible_label_001",
      title: "Inputs must have visible labels",
      description:
        "Every input, select, textarea, checkbox, radio, and upload control must have a visible label that explains what the field is for.",
      category: "accessibility",
      severity: "critical",
      confidence: "high",
      appliesTo: ["forms", "settings_pages", "login_pages", "admin_panels", "all_projects"],
      doNot: [
        "Do not use placeholder text as the only label.",
        "Do not create unlabeled form controls."
      ],
      examples: {
        pass: [
          "Email Address label is visible above the email input.",
          "Upload Resume label is visible before the file upload control."
        ],
        fail: [
          "An input only shows placeholder text: Enter name.",
          "A dropdown appears without any visible label."
        ]
      },
      tags: ["forms", "labels", "inputs"]
    },
    {
      id: "a11y_focus_state_001",
      title: "Interactive elements need visible focus states",
      description:
        "Buttons, links, inputs, tabs, dropdowns, cards, and custom controls must show a visible focus state when navigated by keyboard.",
      category: "accessibility",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens", "interactive_components"],
      doNot: [
        "Do not remove outline without replacing it with a visible focus style.",
        "Do not make keyboard focus invisible."
      ],
      examples: {
        pass: [
          "Focused button shows a clear outline or ring.",
          "Focused tab has a visible border or highlight."
        ],
        fail: [
          "CSS uses outline: none with no replacement.",
          "Keyboard users cannot see where focus is."
        ]
      },
      tags: ["keyboard", "focus", "interaction"]
    },
    {
      id: "a11y_keyboard_access_001",
      title: "UI must support keyboard navigation",
      description:
        "All important actions and interactive components must be reachable and usable with keyboard navigation.",
      category: "accessibility",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens", "interactive_components"],
      doNot: [
        "Do not create clickable divs without keyboard support.",
        "Do not create custom controls that only work with mouse."
      ],
      examples: {
        pass: [
          "Modal can be opened, used, and closed using keyboard.",
          "Tabs can be changed using keyboard navigation."
        ],
        fail: [
          "A card is clickable by mouse but not focusable by keyboard.",
          "Dropdown cannot be opened without a mouse."
        ]
      },
      tags: ["keyboard", "navigation", "controls"]
    },
    {
      id: "a11y_color_contrast_001",
      title: "Text must have readable contrast",
      description:
        "Text, labels, helper text, buttons, status chips, and error messages must use readable contrast against their background.",
      category: "accessibility",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens", "visual_design"],
      doNot: [
        "Do not use low-contrast pastel text on light backgrounds.",
        "Do not use gray text so light that users struggle to read it."
      ],
      examples: {
        pass: [
          "Primary text uses a dark color on a light background.",
          "Error text is readable and not dependent only on color."
        ],
        fail: [
          "Light gray text on white background.",
          "Pale yellow text on white card."
        ]
      },
      tags: ["contrast", "readability", "color"]
    },
    {
      id: "a11y_status_not_color_only_001",
      title: "Status must not depend only on color",
      description:
        "Statuses such as success, warning, error, pending, completed, failed, and disabled must use text, icon, or label in addition to color.",
      category: "accessibility",
      severity: "critical",
      confidence: "high",
      appliesTo: ["status_badges", "tables", "dashboards", "forms", "all_projects"],
      doNot: [
        "Do not show status only through red, green, or yellow color.",
        "Do not rely on color alone to communicate important meaning."
      ],
      examples: {
        pass: [
          "A failed status badge shows icon plus text: Failed.",
          "A completed process shows a check icon and Completed label."
        ],
        fail: [
          "A row turns red but has no error label.",
          "Green dot means active but no text explains it."
        ]
      },
      tags: ["status", "color", "badges"]
    },
    {
      id: "a11y_error_message_001",
      title: "Error messages must be clear and specific",
      description:
        "Error messages must explain what went wrong and how the user can fix it, placed close to the related field or action.",
      category: "accessibility",
      severity: "critical",
      confidence: "high",
      appliesTo: ["forms", "uploads", "settings_pages", "all_projects"],
      doNot: [
        "Do not show only generic error messages.",
        "Do not place form errors far away from the field."
      ],
      examples: {
        pass: [
          "Password must be at least 8 characters.",
          "Upload failed. Only PDF and DOCX files are allowed."
        ],
        fail: [
          "Invalid input.",
          "Something went wrong."
        ]
      },
      tags: ["errors", "forms", "recovery"]
    },
    {
      id: "a11y_icon_label_001",
      title: "Icon-only actions need accessible labels",
      description:
        "Icon-only buttons and controls must have an accessible name or visible tooltip that clearly explains the action.",
      category: "accessibility",
      severity: "warning",
      confidence: "high",
      appliesTo: ["buttons", "tables", "toolbars", "dashboards", "all_projects"],
      doNot: [
        "Do not create icon-only buttons without labels.",
        "Do not use decorative icons as functional controls without explanation."
      ],
      examples: {
        pass: [
          "Trash icon button has aria-label: Delete project.",
          "Eye icon button has label: View details."
        ],
        fail: [
          "A button only contains an SVG icon with no label.",
          "A toolbar has multiple unlabeled icon buttons."
        ]
      },
      tags: ["icons", "buttons", "labels"]
    },
    {
      id: "a11y_touch_target_001",
      title: "Touch targets must be easy to tap",
      description:
        "Buttons, links, checkboxes, radio controls, chips, tabs, and action icons must have enough size and spacing for touch interaction.",
      category: "accessibility",
      severity: "warning",
      confidence: "high",
      appliesTo: ["mobile", "responsive", "buttons", "navigation", "forms"],
      doNot: [
        "Do not create very small action icons without spacing.",
        "Do not place destructive and safe actions too close together."
      ],
      examples: {
        pass: [
          "Mobile buttons are large enough to tap comfortably.",
          "Table row actions have spacing between icons."
        ],
        fail: [
          "Small 16px delete icon with no touch padding.",
          "Approve and Delete buttons are placed too close on mobile."
        ]
      },
      tags: ["mobile", "touch", "responsive"]
    },
    {
      id: "a11y_motion_safety_001",
      title: "Motion must be purposeful and safe",
      description:
        "Animations and transitions must be subtle, purposeful, and should not block users from completing tasks.",
      category: "accessibility",
      severity: "warning",
      confidence: "medium",
      appliesTo: ["all_projects", "animations", "dashboards", "landing_pages"],
      doNot: [
        "Do not use excessive motion for critical workflows.",
        "Do not animate important content in a way that reduces readability."
      ],
      examples: {
        pass: [
          "Button hover animation is subtle and fast.",
          "Loading animation communicates progress without distracting the user."
        ],
        fail: [
          "Dashboard cards constantly animate while user is reading.",
          "Important form fields move unexpectedly."
        ]
      },
      tags: ["motion", "animation", "comfort"]
    },
    {
      id: "a11y_semantic_structure_001",
      title: "Page structure must be meaningful",
      description:
        "Screens must use meaningful headings, sections, lists, buttons, links, and form elements so the interface remains understandable and structured.",
      category: "accessibility",
      severity: "critical",
      confidence: "high",
      appliesTo: ["all_projects", "all_screens", "html", "react"],
      doNot: [
        "Do not use divs for everything when semantic elements are available.",
        "Do not skip heading hierarchy randomly."
      ],
      examples: {
        pass: [
          "Page uses one main heading and clear section headings.",
          "Actions use button elements instead of clickable divs."
        ],
        fail: [
          "Every element is a div with click handlers.",
          "Heading levels jump randomly from h1 to h5."
        ]
      },
      tags: ["semantic-html", "structure", "headings"]
    }
  ]
};