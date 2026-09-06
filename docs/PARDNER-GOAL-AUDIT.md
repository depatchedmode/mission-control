# Pardner milestone completion audit

Status: **complete for the agreed automated milestone**. The uninterrupted 20-seed gate, isolated fresh-checkout verification, artifact/timing audit, and candidate fingerprint checks passed. The two-machine/two-real-agent rehearsal is prepared and remains a separate human signoff exercise.

The milestone table and original evidence below describe the **schema 2** candidate.
The schema 3 review fixes have separate qualification at the end of this audit.

| Requirement | Implementation and direct evidence | Final gate |
| --- | --- | --- |
| Two humans and two agents coordinate as registered Actors; Actor identity differs from replica identity | `workspace-schema.js`, `workspace-commands.js`; CLI handoff workflow; UC2 same Actor on two replicas; acceptance uses Alice, Bob, Builder, Reviewer | 20 seeds passed |
| Pardner package, executable, environment variables, storage, UI vocabulary | `package.json`, `bin/pardner.js`, `local-service.js`, built UI; branding executable/install and legacy-data-isolation tests | Regression passed |
| Complete machine-readable task context and assignee queries | `cli.js`, `workspace-schema.js`; CLI workflow, full-context operation tests; acceptance workers inspect assigned task lists and substantial descriptions/comments/history/revisions | 20 seeds passed |
| One attributed operation layer; atomic handoff, comments, mentions, history; safe retries | `workspace-commands.js`, `workspace.js`; atomicity, stale-write, lost-response, and worker effect replay tests | Regression passed; 20 seeds passed |
| Disjoint edits merge; competing field alternatives retain authors; explicit resolution and expected revisions | `workspace-schema.js`, `workspace-commands.js`; serialization/late-change qualification, production partition test, two-browser acceptance conflict resolution | Regression passed; 20 seeds passed |
| Backlog, up-next, in-progress, review, completed; accepted aliases | Schema status normalization and full lifecycle regression | Passed |
| Actor-scoped observed-comment-revision receipts, merged as a union | Schema receipt keys; unseen concurrent revision tests; same Actor across replicas; acceptance partitions two halves of Alice’s receipts and checks Bob remains unread | Regression passed; acceptance passed |
| Per-machine service shared by browser and CLI, persisted native Automerge replicas | `local-service.js`, `workspace-runtime.js`, `durable-repo.js`; local HTTP UI, native wire, runtime, CLI, and acceptance tests | Regression passed; 20 seeds passed |
| Offline enrolled restart without hub HTTP; fresh reconnect tickets; directory ownership | `workspace-runtime.js`, `ticket-network-adapter.js`, `storage-lease.js`; runtime cold-start, repeated reconnect, second-owner and SIGKILL tests | Passed; 20 seeds passed |
| Built UI served locally, credentials entered at runtime, HTTP mutation acknowledgements, broadcasts to all subscribers | `Pardner.jsx`, server routes; real-browser regression and production WebSocket tests | Passed; 20 seeds passed |
| Saved locally follows disk persistence; acknowledged changes survive SIGKILL | `atomic-file.js`, `nodefs-storage-adapter.js`, `durable-repo.js`; injected save failures and subprocess persistence tests | Passed; 20 seeds passed |
| Synced requires hub persisted-head coverage; earlier acknowledgement cannot clear newer work | Runtime acknowledgement loop, head comparison in UI; runtime older-head and offline/pending assertions | Passed; 20 seeds passed |
| Hub-only transactional delivery ledger; token validation, tombstones, durable inbox-before-ack, idempotent fake effects | `delivery-ledger.js`, runtime forwarding, agent worker SQLite stores; lease/restart/deletion tests; acceptance crashes before ack and after effects | Regression passed; 20 seeds passed |
| Schema incompatibility is explicit; no migration or destructive changes to old data | Runtime/schema checks and preserved-file rejection tests; old store and normalizers removed | Passed |
| 100 tasks, 400 substantial comments, 200 scripted operations, real processes/browsers/transports | `scripts/acceptance.js` and `support/acceptance/`; completed development scenario, strengthened final scenario passed for all 20 seeds | 20 seeds passed |
| Local acknowledgement/visibility ≤2 s, offline start ≤5 s, convergence ≤10 s | Hard assertions in the runner, including checking convergence elapsed time before accepting success | Passed; all final reports audited |
| Independent pre-send manifest checks acknowledged operations and effects, not just replica equality | `expected-operations.js`; deliberately missing effect is rejected; full scenario checks fields, comments, handoffs, provenance and receipts before comparing hashes | Passed; all final reports audited |
| Repeatable verification without skipped failures or forced exit, traceable to a single candidate | `npm test`, `scripts/verify.js`, candidate source/build/lock hashes; cleanup reports errors; development `verify` passed | Fresh checkout passed; 20 seeds passed |
| Applicable auth/task/comment/mention/trace/branch behaviors retained through new schema | Migrated regression files exercise production runtime; no tests import retired store | 163 tests passed in the clean checkout |
| Two-machine/two-real-agent rehearsal guide prepared | `docs/PARDNER-REHEARSAL.md` | Written; manual execution/signoff deliberately separate |

## Boundaries

Delivery leases govern message delivery, not exclusive task execution. Arbitrary external side effects require harness-level idempotency. The automated agents are deterministic subprocesses, not live model calls. No claim is made for power-loss durability, federation, presence, capability-based authorization, browser-only storage, rich collaborative text editing, or old-install migration.

## Final evidence

- `npm run test:acceptance -- --repeat 20 --seed 1` exited with status 0, with all seeds 1–20 completed in one run. There were 20 distinct operation schedules and **14,380 acknowledged operations** (719 per seed).
- `npm ci`, `npm ci --prefix ui-prototype`, and `npm run verify` passed from an isolated clean Git checkout of this implementation candidate: UI build, 163 regression tests, and one full acceptance scenario. Evidence is preserved in `output/acceptance/fresh-checkout-2026-09-05/`.
- Source, test/harness, dependency-lock, and built-UI fingerprint before/after acceptance and in the fresh checkout: `a24cbbd03c3b2e14ecb1c76c3b9e8c26c2ea6c4f6b8aa410f36da28380738fc6`.
- All reports and snapshot hashes were recomputed and matched. Each seed has two browser traces, three service logs, manifests, matching heads/snapshots for all three services, and two completed durable agent inbox/effect entries. No skipped seeds, cleanup errors, timing violations, or missing acknowledged operations were found.
- Final report directory: `output/acceptance/2026-09-05T02-39-58.873Z/`; summary: `summary.json`; independent artifact/timing inspection: `audit.json`.

| Measured maximum across 20 seeds | Result | Required bound |
| --- | --- | --- |
| Local operation acknowledgement | 293 ms | 2,000 ms |
| Offline UI visibility | 66 ms | 2,000 ms |
| Offline cold restart | 2,016 ms | 5,000 ms |
| Convergence after reconnection | 2,776 ms | 10,000 ms |
| Agent-effect acknowledgement | 211 ms | 2,000 ms |

At completion of this audit, no changes had been committed or pushed to the user’s repository. The temporary Git repository used for fresh-checkout verification contains only an isolated candidate snapshot.

## Schema 3 review-fix qualification — 2026-09-06

`npm run verify` passed the built UI, all **176 regression tests**, and one complete
seed-1 acceptance scenario. The fixture still includes 100 tasks, 400 comments,
200 scripted operations, persisted replicas, partitions, and process restarts.

The added regressions cover concurrent task/comment/branch creation retries,
late changes and explicit conflict resolution, Actor namespace collisions,
stalled WebSocket handshake recovery, stale browser snapshots and handoff drafts,
and preservation/rejection of version 2 storage. Further regressions cover branch
retries against divergent parent bases, preservation of those bases through
conflict resolution, linear task/comment revision storage, and late replays of
intermediate edits. Public operation history keeps its existing field-change format.

Superseded field revisions are recorded once in a shared map. Branch revisions
reference immutable base snapshots, keeping merge comparisons tied to the bases
that produced the revisions rather than the winning task metadata.

- Acceptance artifacts: `output/acceptance/2026-09-06T04-17-29.376Z/`.
- Source, test, dependency-lock, and UI-build fingerprint: `940181b05f70548e4b5f972b58fee7ba6824223637664bd5ff93ada1f847eae0`.
- Schema 3 requires fresh workspace directories; incompatible prior data is preserved.
- The earlier 20-seed gate, isolated fresh-checkout qualification, and VM/real-agent rehearsals were **not rerun for schema 3**.

The qualification above includes the final readability cleanup of revision
filtering and branch-merge comparisons. The source fingerprint was checked
against the complete candidate before opening the follow-up PR.
