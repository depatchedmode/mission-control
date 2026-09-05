## Learned User Preferences

- When clarifying product requirements or scenarios, ask one question at a time rather than batching many questions together.
- When implementing work from an attached plan, do not edit the plan file; use the existing todo list, mark items in progress, and avoid recreating todos.
- Prefer small commits that are atomic, logically scoped, and semantically grouped when the user asks for a commit pass.
- Breaking migrations and intentional backwards-incompatible changes are acceptable when nothing external depends on the repo and prior installs are considered stale.

## Learned Workspace Facts

- Hook runtime state under `.cursor/hooks/state/` is gitignored so Cursor metadata stays out of git while hook scripts under `.cursor/hooks/` can still be shared if desired.
- Continual-learning incremental transcript indexing for this repo uses `.cursor/hooks/state/continual-learning-index.json`.
- Multi-replica Automerge/sync planning and validation should be reconciled against branch `cursor/native-automerge-ws-sync-cda6`, not only `main`, to avoid plan drift.
- Product vocabulary uses "Actor" as the umbrella term for human users and agents in the UI and related APIs.
