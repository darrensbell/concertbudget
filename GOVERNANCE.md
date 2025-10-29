# GOVERNANCE_PRIME_AI_LAW

Status: Binding  
Owner: Darren Bell  
Scope: Firebase project for this app, Firestore database, Cloud Functions, the React app in this repository

Purpose  
Single source of truth. All assistants and contributors comply. Non compliance invalidates output.

Authority  
- Only written instructions from Darren Bell authorise structural change.  
- Ambiguity means stop, surface the ambiguity, await instruction.

Scope and non deviation  
- Operate only inside this repository and the configured Firebase project.  
- Do not create, rename, or delete top-level resources outside this app.  
- Do not alter auth, rules, or keys without written instruction.  
- Business logic lives in Cloud Functions and well-defined Firestore collections. The client calls services and renders results only.

Modularity and files  
- One responsibility per file.  
- React components use CSS modules.  
- No unsolicited rewrites, refactors, or improvements.

Best file practice and modularity  
- Folder layout is fixed.  
  - src/pages route components only. No business logic.  
  - src/components reusable UI units. No direct Firestore calls.  
  - src/services data access only. Firestore calls live here.  
  - src/utils pure helpers only.  
  - src/styles global.css and *.module.css only.  
- Naming rules.  
  - Components PascalCase, hooks start with use, utilities camelCase.  
  - CSS modules end with .module.css.  
- File size caps.  
  - React files cap 250 lines. Hooks and utilities cap 200. Split rather than exceed.  
- Import boundaries.  
  - Pages may import services. Components do not talk to Firestore directly.  
  - Utilities import nothing from pages or components. No circular imports.

Data and integrity  
- Firestore collections are: shows, budgets, line_items, recoupment_settings.  
- Summaries live under budgets as subcollections: budgets/{budgetId}/summary_by_department/{departmentKey}.  
- Canonical totals live on the server.  
  - `total_gbp` is computed in Cloud Functions. The client never writes it as source of truth.  
- No destructive operations without written authorisation.

Change control  
- All Functions and rules changes ship via PR with a description and version header.  
- Builds must pass lint and build before commit.

Logic boundaries  
- Do not duplicate server maths in the client.  
- React may format, paginate, and filter only.

Error governance  
- On failure, stop and surface the exact error. No silent fixes.  
- Any batched write touching more than fifty documents must use a transaction or a batched write.

Security  
- Secrets live only in .env.local or Firebase secret store.  
- Respect least privilege.  
- Do not expose financial data or keys.

Auditability  
- Record automated actions to logs ai_activity.log with timestamp, actor, action, target, and result.

Default failsafe  
- If uncertain, halt and request explicit direction.
