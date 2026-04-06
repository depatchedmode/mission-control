---
name: gameplan-harness
description: Use Gameplan from an external agent harness via the `mc` CLI. Trigger when an agent needs to poll mentions, claim or release mention leases, acknowledge delivery, inspect tasks or comments, or record attributed commits without Gameplan orchestrating the agent runtime.
---

# Gameplan Harness

Use this skill when an external agent harness needs to participate in Gameplan.

## Contract

- Gameplan is a coordination surface, not an agent orchestrator.
- The harness must interact with Gameplan only through `mc`.
- Do not call Gameplan internals or expect Gameplan to launch, wake, or message agents.
- The harness is responsible for its own session model, message delivery, retries, and transcript storage.

## Required environment

- `GP_SYNC_SERVER`: Base URL of the running Gameplan sync server.
- `GP_API_TOKEN`: Shared API token for the sync server.
- `GP_AGENT`: Agent name used for task and comment attribution.

Optional trace context:

- `GP_AGENT_MODEL`: Model name recorded by `gp commit`.
- `GP_AGENT_SESSION_KEY`: Harness session identifier recorded by `gp commit`.

Legacy trace aliases are still accepted:

- `OPENCLAW_MODEL`
- `OPENCLAW_SESSION_KEY`

## Mention workflow

Claim the next available mention for one agent:

```bash
gp mentions claim-next --agent "$GP_AGENT" --json
```

Interpret the JSON like this:

- If `claimed` is `false`, there is no claimable work right now.
- If `claimed` is `true`, use:
  - `mention.id`
  - `mention.taskId`
  - `mention.from_agent`
  - `mention.to_agent`
  - `mention.content`
  - `mention.idempotency_key`
  - `claimToken`
  - `claimExpiresAt`

After the harness handles the mention:

- On success:

```bash
gp mentions ack "<mention-id>" --claim-token "<claim-token>" --json
```

- On failure that should be retried:

```bash
gp mentions release "<mention-id>" --claim-token "<claim-token>" --error "short reason" --json
```

Notes:

- Mention claims are leases. If the harness crashes, the mention becomes pending again after the lease expires.
- `GP_MENTION_CLAIM_TTL_MS` is configured on the sync server, not in the harness.
- Use `mention.idempotency_key` for harness-side dedupe if delivery can be replayed.

## Common read operations

List pending mentions without claiming:

```bash
gp mentions pending --agent "$GP_AGENT" --json
```

Inspect a task:

```bash
gp show "<task-id>"
gp comments "<task-id>"
gp diff "<task-id>"
```

List tasks:

```bash
gp tasks
gp tasks --assignee "$GP_AGENT"
gp timeline --agent "$GP_AGENT" --limit 20
```

## Common write operations

Add a comment:

```bash
gp comment "<task-id>" "message text" --agent "$GP_AGENT"
```

Update a task:

```bash
gp update "<task-id>" --status in-progress --agent "$GP_AGENT"
```

Create a task:

```bash
gp task create "Short title" --priority p2 --assignee "$GP_AGENT" --agent "$GP_AGENT"
```

## Commit attribution

Use `gp commit` instead of `git commit` when the harness should record provenance:

```bash
gp commit -m "message" --task "<task-id>" --agent "$GP_AGENT"
```

`gp commit` records:

- agent name
- model
- session key
- linked task
- diff stats

## Operational rules

- Prefer `--json` for any command the harness will parse programmatically.
- Treat non-zero exit codes as command failures.
- When a command fails because the sync server is unreachable, stop and surface the error instead of mutating local state outside Gameplan.
- Keep retry logic in the harness, but only after a successful `release` or after lease expiry.
- If the harness needs richer agent behavior, define that in a separate skill; this skill is only for the Gameplan CLI contract.
