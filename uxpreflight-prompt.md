# UXPreflight Agent Prompt

You are working inside a project that uses UXPreflight.

Before generating or modifying any UI, frontend code, layout, component, style, or design system file, you must follow the project design constitution below.

Target Agent: codex
Output Expected: React + SCSS implementation


## Project Context

- Project Name: UXPreflight Project
- Product Type: saas_admin
- Platform: responsive
- Frontend Stack: react
- Design Tone: modern enterprise SaaS
- Strictness: strict
- Screen Name: Billing Settings
- Screen Type: billing_page

## User Requirement

Create or improve the Billing Settings screen while strictly following the UXPreflight design constitution.


## Design Tokens Must Be Followed

Use only the project design tokens unless the user explicitly asks to evolve the design system.

### Colors

- Primary: #5B5FEF
- Secondary: #16A3B8
- Background: #F7F8FC
- Surface: #FFFFFF
- Text Primary: #101828
- Text Secondary: #667085
- Success: #12B76A
- Warning: #F79009
- Danger: #F04438
- Info: #2E90FA

### Typography

- Font Family: Inter, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif
- Font Sizes: xs: 12px, sm: 14px, base: 16px, lg: 18px, xl: 24px, 2xl: 32px, 3xl: 40px

### Spacing

- Base Unit: 8px
- Scale: 4px, 8px, 12px, 16px, 24px, 32px, 40px, 48px, 64px

### Radius

- sm: 8px
- md: 12px
- lg: 18px
- xl: 24px
- full: 999px

### Shadows

- card: 0 12px 32px rgba(16, 24, 40, 0.08)
- modal: 0 24px 64px rgba(16, 24, 40, 0.18)
- dropdown: 0 16px 40px rgba(16, 24, 40, 0.12)


## Required States

Every relevant screen/component must consider these states:

- default
- loading
- skeleton
- empty
- error
- success
- disabled
- permission_denied
- partial_data
- slow_network
- mobile
- long_content
- api_failed
- processing
- unsaved_changes
- expired_session


## Universal UX Rules

- [CRITICAL] Screen goal must be clear
- [CRITICAL] Primary action must be obvious
- [CRITICAL] System status must be visible
- [CRITICAL] Errors must explain recovery
- [CRITICAL] Use consistent patterns
- [WARNING] Reduce cognitive load
- [CRITICAL] Empty states must guide action
- [CRITICAL] Mobile behavior must be defined
- [WARNING] Use clear and human-friendly content
- [BLOCKER] Dangerous actions need confirmation

## Accessibility Rules

- [CRITICAL] Inputs must have visible labels
- [CRITICAL] Interactive elements need visible focus states
- [CRITICAL] UI must support keyboard navigation
- [CRITICAL] Text must have readable contrast
- [CRITICAL] Status must not depend only on color
- [CRITICAL] Error messages must be clear and specific
- [WARNING] Icon-only actions need accessible labels
- [WARNING] Touch targets must be easy to tap
- [WARNING] Motion must be purposeful and safe
- [CRITICAL] Page structure must be meaningful

## State Coverage Rules

- [CRITICAL] Loading state is required
- [CRITICAL] Empty state must explain next action
- [CRITICAL] Error state must show recovery path
- [WARNING] Success state must confirm completion
- [WARNING] Disabled state must explain why
- [CRITICAL] Permission denied state is required for restricted areas
- [CRITICAL] Partial data state must be handled
- [WARNING] Slow network state must provide feedback
- [CRITICAL] Mobile state must be designed
- [CRITICAL] Unsaved changes state is required

## Component Rules

- [CRITICAL] Buttons must follow clear action hierarchy
- [CRITICAL] Forms must be structured and recoverable
- [CRITICAL] Tables must support real data states
- [WARNING] Cards must have clear purpose
- [CRITICAL] Modals must be used only for focused decisions
- [WARNING] Tabs must separate sibling sections
- [CRITICAL] Upload components must show file-wise status
- [CRITICAL] Status badges must combine text and visual signal
- [WARNING] KPI cards must show value with context
- [CRITICAL] AI activity timeline must show agent progress honestly

## Product-Type Rules

- [CRITICAL] SaaS admin panels must prioritize control, clarity, and auditability
- [CRITICAL] AI agent apps must show transparency and control
- [CRITICAL] Hiring platforms must separate recruiter, candidate, and admin flows
- [CRITICAL] Assessment tools must protect integrity and time-bound flows
- [WARNING] Dashboard apps must prioritize insight over decoration
- [CRITICAL] E-commerce apps must reduce purchase friction and increase trust
- [WARNING] CRM apps must make relationship context easy to act on
- [CRITICAL] HRMS apps must handle employee data with privacy and clarity
- [WARNING] Project management apps must make ownership and progress visible
- [CRITICAL] Analytics platforms must make data trustworthy and explainable

## Screen-Type Rules

- [CRITICAL] Dashboards must prioritize insight and action
- [CRITICAL] Settings pages must be grouped by purpose
- [CRITICAL] Project detail pages must show summary, progress, files, and actions
- [CRITICAL] Billing screens must show usage, rules, invoices, and auditability
- [CRITICAL] Upload and processing screens must show file-wise progress
- [CRITICAL] Table and list screens must support search, filter, sort, and states
- [CRITICAL] Create and edit forms must protect user input
- [CRITICAL] Wizard flows must show progress and allow safe navigation
- [CRITICAL] Login screens must be clear, secure, and role-aware when needed
- [CRITICAL] Analytics screens must show data context and trust signals

## Global Do-Not Rules

- Do not create screens where all actions look equally important.
- Do not use vague headings that fail to explain the screen purpose.
- Do not show multiple primary buttons competing with each other.
- Do not hide the main action inside a dropdown unless the action is secondary.
- Do not leave users guessing after they click an action.
- Do not show fake progress or unclear loading indicators.
- Do not show raw technical errors as the only message.
- Do not show only 'Something went wrong' without a next action.
- Do not create new button styles when existing variants are available.
- Do not change spacing, colors, radius, or typography randomly between screens.
- Do not show all advanced settings at once when they can be grouped.
- Do not overload the user with too many equal-priority cards, filters, or actions.
- Do not show a blank area when there is no data.
- Do not use only 'No data found' without context or action.
- Do not create fixed-width layouts that break on mobile.
- Do not keep wide tables unchanged on small screens.
- Do not use vague labels like Submit, Click Here, or Manage without context.
- Do not use technical jargon unless the target user expects it.
- Do not allow destructive action with one accidental click.
- Do not use vague confirmation text for high-risk actions.
- Do not use placeholder text as the only label.
- Do not create unlabeled form controls.
- Do not remove outline without replacing it with a visible focus style.
- Do not make keyboard focus invisible.
- Do not create clickable divs without keyboard support.
- Do not create custom controls that only work with mouse.
- Do not use low-contrast pastel text on light backgrounds.
- Do not use gray text so light that users struggle to read it.
- Do not show status only through red, green, or yellow color.
- Do not rely on color alone to communicate important meaning.
- Do not show only generic error messages.
- Do not place form errors far away from the field.
- Do not create icon-only buttons without labels.
- Do not use decorative icons as functional controls without explanation.
- Do not create very small action icons without spacing.
- Do not place destructive and safe actions too close together.
- Do not use excessive motion for critical workflows.
- Do not animate important content in a way that reduces readability.
- Do not use divs for everything when semantic elements are available.
- Do not skip heading hierarchy randomly.
- Do not leave blank space while data is loading.
- Do not allow users to click the same action repeatedly while loading.
- Do not show only 'No data found'.
- Do not leave the screen visually empty without explanation.
- Do not show raw server errors as the only message.
- Do not show an error without retry, edit, re-upload, or support action.
- Do not silently complete important actions without feedback.
- Do not show vague success messages that do not explain what happened.
- Do not disable important actions without explanation.
- Do not make disabled controls look like broken UI.
- Do not show a broken screen when the user lacks access.
- Do not hide permission problems behind generic errors.
- Do not fail the entire screen when only one section fails.
- Do not hide item-level failures.
- Do not show an endless spinner without context for long tasks.
- Do not allow users to think the app is frozen.
- Do not keep wide desktop tables unchanged on mobile.
- Do not create fixed-width layouts that cause horizontal scrolling.
- Do not allow users to accidentally lose unsaved work.
- Do not reset form values without warning.
- Do not use multiple primary buttons in the same section.
- Do not use vague button labels like Submit, Click Here, or Proceed without context.
- Do not create new button colors outside the design tokens.
- Do not use placeholder as the only label.
- Do not show all form errors only at the top.
- Do not reset user input after validation errors.
- Do not create a static table without loading or empty state.
- Do not hide important row actions without clear affordance.
- Do not create decorative cards without business purpose.
- Do not use inconsistent card radius, shadow, or padding.
- Do not overload one card with unrelated content.
- Do not put long workflows inside a modal.
- Do not create destructive confirmation without explaining consequences.
- Do not create modals without close/cancel behavior.
- Do not use tabs for sequential steps.
- Do not hide critical errors inside inactive tabs without indicator.
- Do not create tabs that become unusable on mobile.
- Do not show one generic loader for multiple uploaded files.
- Do not fail all files silently when one file fails.
- Do not hide accepted file type and size limit.
- Do not communicate status using color only.
- Do not create different labels for the same state across screens.
- Do not use random status colors outside tokens.
- Do not show numbers without context.
- Do not use too many KPI cards with equal priority.
- Do not use charts or trends that do not explain anything.
- Do not hide what the AI agent is doing.
- Do not show fake completion or fake progress.
- Do not hide failed AI steps without reason and recovery action.
- Do not mix unrelated admin settings in one long page.
- Do not allow high-risk changes without confirmation.
- Do not hide audit information for sensitive changes.
- Do not hide AI activity behind a generic loader.
- Do not show fake progress.
- Do not allow AI to make high-impact changes without user review.
- Do not expose internal recruiter scores to candidates unless explicitly allowed.
- Do not mix candidate and recruiter workflows in the same UI.
- Do not show sensitive candidate data without role-based access.
- Do not let candidates restart completed assessments unless explicitly allowed.
- Do not hide expiry or deadline rules.
- Do not make submission status unclear.
- Do not show too many KPI cards with equal importance.
- Do not show numbers without labels, comparison, or context.
- Do not use charts only for decoration.
- Do not hide price, delivery, return, or stock information.
- Do not make checkout steps unclear.
- Do not create cart actions that can accidentally remove items without recovery.
- Do not show contact records without next action.
- Do not hide ownership or last activity.
- Do not mix leads, accounts, and deals without clear structure.
- Do not expose private employee information without role access.
- Do not make leave, payroll, or approval status unclear.
- Do not mix employee and HR admin workflows.
- Do not show tasks without owner or status.
- Do not hide blockers or overdue items.
- Do not make comments and activity history hard to find.
- Do not show metrics without source or date range.
- Do not hide failed data sections.
- Do not show charts without labels, legends, or meaning.
- Do not show too many KPI cards with equal priority.
- Do not show numbers without labels, context, or comparison.
- Do not place all settings in one long confusing scroll.
- Do not allow dangerous settings to change without confirmation.
- Do not hide unsaved changes.
- Do not show project information without current status.
- Do not hide file-level processing status.
- Do not hide failed process details.
- Do not hide token/API usage impact on billing.
- Do not allow billing rule changes without confirmation.
- Do not omit failed sync, empty invoice, or audit states.
- Do not show one generic spinner for many files.
- Do not hide which files failed.
- Do not skip accepted file type and size information.
- Do not create static tables without loading or empty states.
- Do not hide important row actions.
- Do not keep wide tables unchanged on mobile.
- Do not clear user input after validation errors.
- Do not allow users to lose unsaved changes silently.
- Do not let users proceed without required step validation.
- Do not lose previous step data when navigating back.
- Do not show vague login errors.
- Do not ask for role selection unless it has real product purpose.
- Do not show metrics without date range or source.
- Do not break the full page if one chart fails.


## Mandatory Agent Behavior

- Read and follow the design constitution before generating UI.
- Do not introduce new colors, spacing, typography, radius, shadows, or component styles unless the user explicitly requests design evolution.
- Reuse existing component patterns before creating new ones.
- Include loading, empty, error, success, disabled, permission denied, partial data, slow network, and mobile states where relevant.
- Do not generate decorative UI without product purpose.
- Do not hide errors, failed AI steps, failed uploads, billing risks, permission issues, or destructive-action consequences.
- Do not rewrite unrelated files or redesign the whole application unless requested.
- If the task is small, modify only the necessary component or screen.
- If a design-system change is required, mention it clearly before applying it.

## Final Output Requirement

Return the requested solution using the existing project design constitution.

The output must be:
- Consistent with design tokens
- Responsive
- Accessible
- State-aware
- Component-consistent
- Product-aware
- Screen-type-aware
- Ready for production-level implementation
