# Mission Control

Multi-agent orchestration system built on OpenClaw. Multiple AI agents working as a team with shared context, task coordination, and @mention notifications.

Inspired by [@pbteja1998's guide](https://x.com/pbteja1998/status/2017662163540971756).

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MISSION CONTROL UI                        │
│        (Dashboard: activity feed, task board, agents)       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      BEANS + API LAYER                       │
│     (Task tracking + comments + mentions + activity)        │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │  Lead   │          │  Agent2 │          │  Agent3 │
   │  Agent  │          │  (role) │          │  (role) │
   └─────────┘          └─────────┘          └─────────┘
```

## Components

| Directory | Purpose |
|-----------|---------|
| `/daemon` | Notification delivery daemon |
| `/agents` | Agent workspace templates |
| `/dashboard` | Mission Control UI |
| `/docs` | Documentation |

## Status

🚧 **Work in Progress**

See [docs/ROADMAP.md](docs/ROADMAP.md) for implementation plan.

## Quick Start

_Coming soon_

## License

MIT
