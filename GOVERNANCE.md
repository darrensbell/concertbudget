GOVERNANCE_PRIME_AI_LAW

Status: Binding
Owner: Darren Bell
Scope: Firebase project for this app, Firestore database, Cloud Functions, React app in this repository

⸻

1. PURPOSE

Single source of truth. All assistants, agents, and contributors must comply in full. Non-compliance invalidates all outputs.

The purpose of this governance file is to prevent structural drift, ensure absolute consistency between logic layers, and stop recursive or unsolicited operations after task completion.

⸻

2. AUTHORITY
	•	Only written instructions from Darren Bell authorise any structural change.
	•	No assumption, inference, or contextual “correction” may override a written command.
	•	Ambiguity means stop. Surface the ambiguity, request explicit instruction, and await confirmation.

⸻

3. SCOPE AND NON-DEVIATION
	•	Operate strictly inside this repository and its configured Firebase project.
	•	Do not create, rename, or delete top-level resources outside this app.
	•	Do not alter authentication, rules, keys, or hosting configuration without written authorisation.
	•	Business logic resides only in Cloud Functions and defined Firestore collections.
	•	The React client calls services and renders results; it never performs business logic directly.

⸻

4. MODULARITY AND FILE STRUCTURE

Single Responsibility: Each file serves one purpose only.

Folder Structure (fixed):
	•	src/pages → route components only. No business logic.
	•	src/components → reusable UI units. No direct Firestore calls.
	•	src/services → data access only. Firestore calls live here.
	•	src/utils → pure helper functions only.
	•	src/styles → global.css and *.module.css only.

Naming Rules:
	•	Components: PascalCase.
	•	Hooks: start with use.
	•	Utilities: camelCase.
	•	CSS Modules: end with .module.css.

File Size Caps:
	•	React files: ≤ 250 lines.
	•	Hooks and utilities: ≤ 200 lines.
Split before exceeding these limits.

Import Boundaries:
	•	Pages may import services.
	•	Components never access Firestore or services directly.
	•	Utilities never import from pages or components.
	•	No circular imports of any kind.

⸻

5. DATA INTEGRITY

Firestore Structure:
	•	Collections: shows, budgets, line_items, recoupment_settings.
	•	Subcollections: budgets/{budgetId}/summary_by_department/{departmentKey}.

Canonical Rules:
	•	Canonical totals live on the server.
	•	total_gbp is computed in Cloud Functions.
	•	The client may not write or override canonical totals.

Destructive Operations:
	•	Any destructive change requires written authorisation.
	•	All deletions must be reversible via Firestore backups.

⸻

6. CHANGE CONTROL
	•	All Functions, rules, and configuration changes must be committed via Pull Request (PR) with description and version header.
	•	PRs must pass lint and build checks before merge.
	•	No auto-merging, no silent commits.

⸻

7. LOGIC AND EXECUTION BOUNDARIES
	•	Do not duplicate server-side calculations in the client.
	•	React may only format, paginate, or filter.
	•	Cloud Functions own all computational logic.
	•	Never alter a logic layer (e.g., Firestore rule, React view) to compensate for an error elsewhere.

⸻

8. ERROR AND EXECUTION GOVERNANCE
	•	On any failure, halt immediately and surface the exact error message.
	•	No silent fixes, retries, or workarounds.
	•	Any batched write touching more than 50 documents must use a transaction or batched write.
	•	Always confirm success before proceeding to next task.

Post-Completion Rule:
After completing an assigned operation, the AI must terminate execution for that task. It must not re-open, revise, or “improve” any past task or file unless explicitly commanded. Any autonomous attempt to “correct,” “re-optimise,” or “fix” past work constitutes a governance breach.

⸻

9. SECURITY AND SECRETS
	•	Secrets may only exist in .env.local or Firebase Secret Store.
	•	Use least-privilege access for all keys and tokens.
	•	Do not expose financial data, API keys, or credentials in any output.
	•	No inline secrets or hardcoded tokens.

⸻

10. AUDITABILITY
	•	All automated actions must log to ai_activity.log.
	•	Log format: {timestamp} | {actor} | {action} | {target} | {result}.
	•	Logs must persist for a minimum of 90 days and be immutable by the AI.

⸻

11. DEFAULT FAILSAFE

If uncertain, halt execution and request explicit direction.
If external data or context is unavailable, do not assume. Use only verifiable local truth.

⸻

12. CHANGE MANAGEMENT LAW

The Mandate of Comprehensive Implementation

Principle:
No modification, deletion, renaming, or refactoring is complete until its full project-wide impact has been identified, addressed, and verified.

Rules for AI:
	1.	Impact Analysis First: Before any modification, perform a project-wide search for all dependent files, components, and code blocks. Clearly state the full impact before executing.
	2.	Atomic Execution: Apply all related changes as one atomic operation. Partial or broken states are invalid.
	3.	Verification Before Report: Confirm application stability and absence of errors before declaring completion.

⸻

13. QUALITY AND CONSISTENCY LAWS

Law of Correctness:
Every output must be syntactically valid, correctly indented, and free of typographical, grammatical, or logical errors.

Law of Consistency:
File paths, imports, and names must always match existing project structure and casing. No placeholder paths or invented directories.

Law of Persistence:
After executing a command, the AI must retain awareness of file locations, naming, and version numbers for the duration of the task. Memory loss or path confusion invalidates the operation.

Law of Non-Recursion:
The AI may not self-trigger new edits or revisit prior instructions unless Darren Bell explicitly commands a return to those items.

Law of Immutable Output:
Once marked “complete” and verified, no revision occurs without written re-authorisation. “Perfectionism loops” are prohibited.

Law of Structural Priority:
Functional correctness outweighs elegance, brevity, or refactor aesthetics. Never rewrite working code for stylistic reasons.

Law of Deterministic Completion:
Every task must end with a deterministic, finalised state. No open conditions or “pending follow-ups” allowed.

⸻

14. LANGUAGE AND FORMATTING
	•	Use exact spelling, syntax, and casing from existing files.
	•	Respect indentation and line breaks.
	•	Do not auto-reformat JSON, SQL, or JSX.
	•	Maintain UTF-8 encoding.
	•	Enforce trailing newline at EOF.
	•	No smart quotes or typographic replacements.

⸻

15. OPERATIONAL SANITY CLAUSE

If two rules appear in conflict, precedence is as follows:
	1.	Written instruction from Darren Bell.
	2.	Law of Correctness.
	3.	Law of Consistency.
	4.	Law of Non-Recursion.
	5.	All other clauses.

⸻

16. ENFORCEMENT

Violation of any clause invalidates the resulting code or output until corrected.
The AI must flag any detected breach and halt execution until direction is given.