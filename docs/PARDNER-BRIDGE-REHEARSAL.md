# Real Codex bridge rehearsal

This opt-in test makes real model requests through the signed-in Codex CLI account.
It creates a dedicated App Server, two new threads, two disposable Git worktrees,
and a fresh Pardner service. The existing workspace and live Desktop threads are
not used. Threads use the configured model unless explicitly overridden; the
report records the selected model, reasoning effort, and effective permissions.

```sh
# Real builder → reviewer → human round trip, busy queue, duplicate notifications
node scripts/bridge-real-rehearsal.js --run

# Select a newer installed binary without changing the global CLI or model
node scripts/bridge-real-rehearsal.js --run \
  --codex /Applications/ChatGPT.app/Contents/Resources/codex

# Also drop a real accepted dispatch reply, SIGKILL the bridge, and restart it
node scripts/bridge-real-rehearsal.js --run --drop-dispatch-reply

# Use Luna with the lightest effort supported by the installed Codex server
node scripts/bridge-real-rehearsal.js --run \
  --codex /Applications/ChatGPT.app/Contents/Resources/codex \
  --model gpt-5.6-luna --reasoning-effort low --drop-dispatch-reply

# Add a real one-hour idle observation after the round trip
node scripts/bridge-real-rehearsal.js --run --idle-seconds 3600

# Exercise completion guards, then crash and recover during real archival
node scripts/bridge-real-rehearsal.js --run \
  --codex /Applications/ChatGPT.app/Contents/Resources/codex \
  --model gpt-5.6-luna --reasoning-effort low --completion-lifecycle
```

Without `--run`, the script prints usage and makes no model requests. Each run
has fresh task IDs and a random challenge. It stops its test-owned process groups
on success or failure and retains evidence under
`.pardner/bridge-rehearsals/RUN_ID/`. Inspect `report.json` for the result and
unqualified scenarios. An idle test omitted from the command is recorded as
`not-run`, never as a pass.

`--model` and `--reasoning-effort` apply only to the new test sessions. The harness
validates the requested settings against the installed server's model catalog,
checks the settings returned at thread creation and resume, and never substitutes
a model. Omit these options to inherit the user's configuration.

`--completion-lifecycle` adds a third related task and a fourth real model turn.
After verifying the coding handoff, it completes tasks individually and proves
that the remaining open task blocks archival. It then holds the real builder
turn behind a file barrier, completes the final task, and observes that cleanup
still waits. Once released, it drops a successful archive response and kills the
bridge before restarting it against the durable retirement record. The test
compares all fixture file hashes and Git status before and after worktree moves,
reruns tests from the archived locations, and restarts again after the moves.
The archived threads and worktrees belong only to that isolated rehearsal.

The fixed `runId` and `challenge` are now explicit in every coding-task handoff
instruction, separate from per-write operation IDs. Validation still requires
their exact original values.

The frozen application copy is fingerprinted before and after the run. Installed
dependencies are shared read-only by convention; do not install or modify them
while qualification is running. The tiny coding fixture uses a separate Git
repository with builder and reviewer worktrees. Those worktrees have independent
files and Git indexes.

The builder implements a deterministic task-selection function and tests it. It
publishes the full source, hash, test evidence, and challenge through a Pardner
handoff. The reviewer reconstructs that artifact from the handoff in its own
worktree and writes independent tests. The orchestrator checks both files against
additional assertions and verifies attribution, worktree scope, hashes, actual
turn receipts, and the final human handoff. Model-generated claims alone cannot
pass the test.

A second task is assigned while the builder is active. Its dispatch must wait
until the first turn completes. The protocol relay duplicates real status
notifications; the expected run still has exactly two builder turns and one
reviewer turn. With `--drop-dispatch-reply`, the relay withholds one successful
reply from the actual Codex server and restarts the bridge. It never fabricates
model responses or turn receipts.

New test sessions use workspace-write and on-request approvals. Network access is
enabled for these sessions so their CLI can reach the isolated loopback service.
No global Codex configuration is changed. The bridge pins the actual returned
approval and sandbox policy. Unexpected approval or input requests fail visibly;
the script never auto-answers them. This run does not qualify a usable approval UI.

Evidence includes:

- `report.json`: result, candidate fingerprint, session models and permissions,
  checks, dispatch latency, total round-trip time, and cleanup outcome.
- `protocol-events.json`: observed dispatches, real acceptance receipts, completion
  events, duplicate notifications, and injected transport failures.
- `task-context.json`: final task history, attributed handoffs, and transferred source.
- `builder-verification.json` and `reviewer-verification.json`: independently rerun
  tests, external assertions, and actual Git diffs.
- `inbox-status.json`: durable bridge state before teardown.

The run directory also contains private runtime data, including service connection
credentials. Do not publish the directory wholesale. Summary files redact the
service token. The script uses existing Codex authentication without copying it
into the run directory.

This is **co-host qualification**. Separate-machine replicas, hub partition and
recovery, approval round trips, and other harness adapters remain separate gates.
The standard `npm run verify` suite and protocol mocks remain useful regressions;
neither substitutes for the real model run.

## Recorded local qualification

On September 6, 2026, both real runs passed using `gpt-6-astra` through the
installed application binary, Codex CLI 0.153.4:

| Scenario | Run ID | Initial dispatch | Round trip |
| --- | --- | --- | --- |
| Normal handoff | `4244eea5-88c6-4045-bcdf-c276973cd318` | 239 ms | 217.7 s |
| Lost reply and bridge SIGKILL | `2ac8dfb2-738e-4080-b77e-08260792b5f7` | 239 ms | 206.0 s |

Each run recorded exactly three dispatch attempts and three distinct accepted
turns, passed independent artifact tests, exercised busy delivery and duplicate
notifications, and reported no cleanup errors. Reports bind results to each
frozen candidate; this table does not qualify later code changes. The hour-long
idle observation and the other gates above were not run.

The global CLI 0.131.0 could not run the configured model. These runs selected
the newer installed binary without changing the model or global installation:

```sh
node scripts/bridge-real-rehearsal.js --run \
  --codex /Applications/ChatGPT.app/Contents/Resources/codex \
  --drop-dispatch-reply
```

The same day, the scenarios were rerun with `gpt-5.6-luna` and reasoning `low`,
the lightest effort advertised by the installed Codex server. Creation and resume
receipts confirmed those settings for both Actors:

- Normal run `b5691cd2-441b-4e4d-a99b-2a67f943dc21` passed, with a 242 ms initial
  dispatch and a 138.9 s round trip, including independent tests, busy delivery,
  and duplicate notifications.
- Lost-reply run `1e26fab6-f6aa-4654-ab0f-e882dc4718bf` failed evidence validation:
  both coding-task Actors supplied new run IDs rather than preserving the
  rehearsal run ID. The bridge restarted and recorded three dispatches without
  a duplicate attempt, but the overall scenario did not pass.

Both runs cleaned up without errors. These two observations do not establish a
model reliability rate or attribute the evidence failure to crash recovery.

The full completion lifecycle then passed in run
`3f465c70-06d5-4722-8c1c-0f9151985500`, also using Luna with low reasoning.
Initial dispatch was 216 ms. The run verified the open-task and active-thread
guards, recovered after losing a successful archive reply and killing the bridge,
preserved all fixture file hashes and Git status across both worktree moves,
reran artifact tests from the archived locations, and restarted successfully
after the moves. It recorded four model dispatches, two archive requests, and
no process cleanup errors. Both Actors preserved the explicit run ID in this run;
this single observation does not establish a reliability rate.

The subsequent review pass completed `npm run verify`: production UI build,
212 tests, and the complete seed-1 acceptance scenario (100 tasks, 400 comments,
200 operations). The identity guard and reopening checks also passed an
18-test focused run. An earlier acceptance attempt was discarded because a
test edit changed its candidate fingerprint during execution; the successful
rerun used unchanged source throughout acceptance.
