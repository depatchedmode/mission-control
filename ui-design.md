# Mission Control UI Design

## Vision: Patchwork meets Spatial Kanban

Inspired by Ink & Switch Patchwork + tldraw infinite canvas for visual task coordination.

## UI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MISSION CONTROL UI                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    AUTOMERGE BACKEND                         │
│        (Real-time sync, 33 migrated tasks, agents)          │
└─────────────────────────────────────────────────────────────┘
```

## Core Views

### 1. **Spatial Kanban** (Primary View)
- **tldraw infinite canvas** with task cards as draggable shapes
- **Flexible columns**: Not rigid - place tasks anywhere spatially  
- **Visual connections**: Draw arrows between related tasks
- **Project clusters**: Group related tasks visually
- **Zoom levels**: 30,000-foot roadmap ↔ detailed task specs

### 2. **Timeline View** (Patchwork-inspired)
- **Chronological agent activity** with AI-generated summaries
- **Branch visualization**: Show task experiments and merges
- **Comment threads** integrated with timeline
- **Filter by agent, project, time range**

### 3. **Task Detail** (Enhanced)
- **Inline commenting** with universal pointer system
- **Branch picker**: Try different approaches to same task
- **Visual diff**: Compare task versions over time
- **Dependency graph**: Visual task relationships

## Tech Stack

```javascript
// Frontend: React + tldraw + Automerge
import { Tldraw } from '@tldraw/tldraw'
import { useDocument } from '@automerge/automerge-repo-react-hooks'

// Real-time sync
const doc = useDocument(MISSION_CONTROL_URL)

// Custom task card shapes for tldraw
const TaskCard = {
  type: 'task-card',
  props: {
    title: string,
    status: 'todo' | 'in-progress' | 'completed',
    assignee: string,
    comments: Comment[]
  }
}
```

## Implementation Plan

### Phase 1: Basic Spatial Kanban
- React app with tldraw canvas
- Task cards as custom tldraw shapes
- Real-time sync with our Automerge backend
- Drag & drop task status updates

### Phase 2: Patchwork Features  
- Timeline view with activity feed
- Task branching UI (fork/merge buttons)
- Visual diffs for task changes
- Universal commenting system

### Phase 3: Advanced Coordination
- Agent presence indicators (cursors)
- Voice notes on tasks  
- Screen recording for task demos
- AI summaries of changes

## UI Mockup Concepts

### Spatial Kanban Layout:
```
┌─────────────────── Infinite Canvas ───────────────────┐
│                                                        │
│  [TODO Column]     [IN-PROGRESS]      [COMPLETED]     │
│  ┌─────────────┐   ┌─────────────┐    ┌─────────────┐ │
│  │ Way2 Brand  │   │ Mission Ctl │    │ Design      │ │
│  │ @writer     │ → │ @friday     │    │ Guidelines  │ │
│  └─────────────┘   └─────────────┘    └─────────────┘ │
│                                                        │
│                    [Project Cluster]                   │
│                    ┌─────────────────────────────────┐ │
│                    │     Resilient Networks          │ │
│                    │  ┌──────┐  ┌──────┐  ┌──────┐   │ │
│                    │  │ Home │→ │ Mood │→ │ Brand│   │ │
│                    │  │ Page │  │Board │  │ Sys  │   │ │
│                    │  └──────┘  └──────┘  └──────┘   │ │
│                    └─────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

### Timeline View:
```
┌─── Agent Timeline ─────────────────────────────────────┐
│ [Gary] [Friday] [Writer] [All]                         │
│                                                        │
│ ● 2m ago - Friday: Started Patchwork UX work         │
│   ├─ Comment: "Foundation ready, building features"   │
│   └─ @gary mention created                            │
│                                                        │
│ ● 15m ago - System: Migration completed               │
│   ├─ 33 tasks imported from .beans                    │
│   └─ 0 errors, all metadata preserved                 │
│                                                        │
│ ● 1h ago - Gary: Approved Automerge plan             │
│   └─ Branch: Mission Control evolution started        │
└────────────────────────────────────────────────────────┘
```

## Key Features

### 🎨 **Spatial Intelligence**
- Place related tasks near each other
- Draw connections between dependencies  
- Cluster tasks by project/milestone
- Infinite zoom for different detail levels

### ⚡ **Real-Time Collaboration**
- See other agents' cursors and selections
- Live updates as tasks move between states
- Instant comment notifications
- Shared document state across all sessions

### 🌿 **Task Branching** (Patchwork-inspired)
- Right-click task → "Create Branch" → experiment safely
- Visual indicators for branched tasks
- Merge successful approaches back to main
- Diff view showing what changed

### 🕰️ **Rich History**
- Timeline view of all agent activity
- AI-generated change summaries
- Visual diffs for task evolution
- Revert to any previous state

## Next Steps

1. **Create React + tldraw prototype** with our Automerge backend
2. **Import real task data** we just migrated
3. **Test real-time collaboration** between multiple browser sessions
4. **Add Patchwork features** incrementally

Want me to start building this? The foundation is perfect - we have real data, real-time sync, and proven Automerge integration. Time to make it visual! 🎨