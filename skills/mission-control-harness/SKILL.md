---
name: mission-control-harness
description: Use Mission Control from an external agent harness via the `mc` CLI. Trigger when an agent needs to poll mentions, claim or release mention leases, acknowledge delivery, inspect tasks or comments, or record attributed commits without Mission Control orchestrating the agent runtime.
---

# Mission Control Harness

Use this skill when an external agent harness needs to participate in Mission Control.

## Contract

- Mission Control is a coordination surface, not an agent orchestrator.
- The harness must interact with Mission Control only through `mc`.
- Do not call Mission Control internals or expect Mission Control to launch, wake, or message agents.
- The harness is responsible for its own session model, message delivery, retries, and transcript storage.

## Required environment

- `MC_SYNC_SERVER`: Base URL of the running Mission Control sync server.
- `MC_API_TOKEN`: Shared API token for the sync server.
- `MC_AGENT`: Agent name used for task and comment attribution.

Optional trace context:

- `MC_AGENT_MODEL`: Model name recorded by `mc commit`.
- `MC_AGENT_SESSION_KEY`: Harness session identifier recorded by `mc commit`.

Legacy trace aliases are still accepted:

- `OPENCLAW_MODEL`
- `OPENCLAW_SESSION_KEY`

## Mention workflow

Claim the next available mention for one agent:

```bash
mc mentions claim-next --agent "$MC_AGENT" --json
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
mc mentions ack "<mention-id>" --claim-token "<claim-token>" --json
```

- On failure that should be retried:

```bash
mc mentions release "<mention-id>" --claim-token "<claim-token>" --error "short reason" --json
```

Notes:

- Mention claims are leases. If the harness crashes, the mention becomes pending again after the lease expires.
- `MC_MENTION_CLAIM_TTL_MS` is configured on the sync server, not in the harness.
- Use `mention.idempotency_key` for harness-side dedupe if delivery can be replayed.

## Common read operations

List pending mentions without claiming:

```bash
mc mentions pending --agent "$MC_AGENT" --json
```

Inspect a task:

```bash
mc show "<task-id>"
mc comments "<task-id>"
mc diff "<task-id>"
```

List tasks:

```bash
mc tasks
mc tasks --assignee "$MC_AGENT"
mc timeline --agent "$MC_AGENT" --limit 20
```

## Common write operations

Add a comment:

```bash
mc comment "<task-id>" "message text" --agent "$MC_AGENT"
```

Update a task:

```bash
mc update "<task-id>" --status in-progress --agent "$MC_AGENT"
```

Create a task:

```bash
mc task create "Short title" --priority p2 --assignee "$MC_AGENT" --agent "$MC_AGENT"
```

## Commit attribution

Use `mc commit` instead of `git commit` when the harness should record provenance:

```bash
mc commit -m "message" --task "<task-id>" --agent "$MC_AGENT"
```

`mc commit` records:

- agent name
- model
- session key
- linked task
- diff stats

## Operational rules

- Prefer `--json` for any command the harness will parse programmatically.
- Treat non-zero exit codes as command failures.
- When a command fails because the sync server is unreachable, stop and surface the error instead of mutating local state outside Mission Control.
- Keep retry logic in the harness, but only after a successful `release` or after lease expiry.
- If the harness needs richer agent behavior, define that in a separate skill; this skill is only for the Mission Control CLI contract.
