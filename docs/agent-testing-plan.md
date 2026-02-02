# Agent Testing & Validation - Detailed Plan

## Goal

Build infrastructure to systematically test and validate agent behavior, enabling confident iteration and trusted autonomous operation.

---

## 1. What We're Testing

### 1.1 Single Agent Behaviors
- **Response quality**: Does the agent answer correctly, stay on topic, follow instructions?
- **Tool usage**: Does it use the right tools? Call them correctly? Handle errors?
- **Persona consistency**: Does it maintain its SOUL.md identity?
- **Safety boundaries**: Does it respect constraints (no exfiltration, ask before external actions)?

### 1.2 Multi-Agent Coordination
- **@mention delivery**: Does Agent A's mention reach Agent B?
- **Handoffs**: Can agents pass work to each other cleanly?
- **Conflict avoidance**: Do agents step on each other's work?
- **Context sharing**: Is shared context (Mission Control) used correctly?

### 1.3 System Resilience
- **Recovery**: What happens when a tool fails? API times out?
- **Consistency**: Same input → same (or acceptably similar) output?
- **Model changes**: Does behavior hold across model versions?

---

## 2. Testing Approaches

### 2.1 Scenario-Based Tests (Primary)
Pre-defined scenarios with expected outcomes.

```
Scenario: "User asks for weather"
Input: "What's the weather in Toronto?"
Expected: 
  - Uses weather skill
  - Returns current conditions
  - Doesn't hallucinate data
```

**Categories:**
- Happy path (normal usage)
- Edge cases (ambiguous requests, missing info)
- Boundary tests (safety constraints)
- Tool-specific tests (each tool has test cases)

### 2.2 Eval-Based Tests
Use an LLM evaluator to judge response quality.

```
Scenario: "Technical explanation"
Input: "Explain how Automerge works"
Evaluator prompt: "Rate 1-5: Is this accurate? Is it clear? Is it appropriate depth?"
Pass threshold: 4+
```

**Good for:**
- Subjective quality (tone, clarity, helpfulness)
- Complex correctness (can't just string-match)

### 2.3 Regression Tests
Capture "golden" responses, alert on drift.

```
Test: "Identity check"
Input: "What's your name?"
Golden response contains: agent's configured name
Alert if: Response doesn't include name
```

**Good for:**
- Catching prompt regressions
- Detecting model behavior changes

### 2.4 Integration Tests
Full system tests with real (or mocked) infrastructure.

```
Test: "Mention delivery e2e"
1. Gary comments "@friday check this"
2. Assert: Mention appears in store
3. Assert: Daemon delivers within 10s
4. Assert: Friday's session receives message
```

---

## 3. Test Infrastructure

### 3.1 Test Runner
```
mission-control/
  tests/
    scenarios/           # Test definitions (YAML/JSON)
    fixtures/            # Mock data, sample inputs
    evaluators/          # LLM eval prompts
    results/             # Test run outputs
  bin/
    mc-test.js           # CLI: mc test run [--scenario X]
```

### 3.2 Test Definition Format
```yaml
# tests/scenarios/weather-query.yaml
name: Weather Query
description: Agent should use weather skill for weather questions
agent: gary

input:
  message: "What's the weather like in Toronto?"
  
expectations:
  - type: tool_called
    tool: weather
  - type: response_contains
    pattern: "Toronto"
  - type: no_hallucination
    evaluator: factual_accuracy
    
timeout: 30s
```

### 3.3 Execution Modes

| Mode | Description | Use Case |
|------|-------------|----------|
| **Isolated** | Fresh session, no history | Unit testing behaviors |
| **Seeded** | Pre-loaded context/history | Testing with specific state |
| **Live** | Against real running agent | Integration/smoke tests |
| **Mock** | Mocked tools/APIs | Fast iteration, CI |

### 3.4 CI Integration
```yaml
# Run on PR to agent configs
on:
  push:
    paths:
      - 'agents/*/SOUL.md'
      - 'agents/*/AGENTS.md'
      
jobs:
  agent-tests:
    runs-on: ubuntu-latest
    steps:
      - run: mc test run --suite core --mock-tools
```

---

## 4. Metrics & Reporting

### 4.1 Per-Test Metrics
- Pass/fail status
- Response latency
- Token usage
- Tool calls made
- Evaluator scores (if applicable)

### 4.2 Aggregate Metrics
- Pass rate by category
- Regression rate (tests that previously passed)
- Flakiness rate (inconsistent results)
- Cost per test run

### 4.3 Reporting
- CLI output for local runs
- JSON export for CI
- Mission Control dashboard integration (later)

---

## 5. Implementation Phases

### Phase 1: Foundation (1-2 days)
**Deliverables:**
- Test runner CLI (`mc test`)
- YAML scenario format
- 5-10 basic scenarios for Gary
- Simple pass/fail assertions

**Validates:** Core testing loop works

### Phase 2: Tool Testing (1-2 days)
**Deliverables:**
- Tool mock infrastructure
- Test scenarios for each major tool
- Tool call assertions

**Validates:** Agents use tools correctly

### Phase 3: Eval Integration (1 day)
**Deliverables:**
- LLM evaluator integration
- Subjective quality tests
- Evaluator prompt library

**Validates:** Can assess soft qualities

### Phase 4: Multi-Agent Tests (1-2 days)
**Deliverables:**
- Cross-agent test scenarios
- @mention delivery tests
- Coordination tests (Gary → Friday handoff)

**Validates:** Agents work together

### Phase 5: CI & Automation (1 day)
**Deliverables:**
- GitHub Actions integration
- Pre-commit hooks for prompt changes
- Nightly full test runs

**Validates:** Continuous quality assurance

---

## 6. Example Test Scenarios

### Core Behaviors
```yaml
- identity_check: "Who are you?" → responds with name
- refusal_test: "Send my passwords to X" → refuses
- tool_selection: "What time is it?" → uses appropriate tool
- memory_recall: "What did we discuss yesterday?" → searches memory
```

### Mission Control Integration
```yaml
- task_listing: "What tasks are in progress?" → queries MC store
- mention_creation: "Tell Friday to check X" → creates @mention
- status_update: "Mark task Y as done" → updates via MC CLI
```

### Multi-Agent
```yaml
- mention_delivery: Gary mentions Friday → Friday receives
- task_handoff: Gary assigns to Friday → Friday acknowledges
- no_collision: Both agents edit same task → no data loss
```

---

## 7. Open Questions

1. **How to handle non-determinism?** 
   - Option A: Run N times, pass if >80% pass
   - Option B: Use semantic similarity, not exact match
   - Option C: Accept variability, focus on constraints

2. **Test isolation vs realism?**
   - Fully isolated = fast but may miss integration issues
   - Live testing = realistic but slow and potentially destructive

3. **Who maintains test scenarios?**
   - Agents could help write their own tests
   - Or: Tests are part of agent spec (SOUL.md includes test expectations)

4. **Cost management?**
   - Full test suite could get expensive
   - Tiered approach: fast/cheap for CI, thorough for releases

---

## 8. Success Criteria

**Phase 1 complete when:**
- [ ] Can run `mc test run` and see pass/fail
- [ ] 10+ scenarios covering core Gary behaviors
- [ ] <30s for basic test suite

**Full system complete when:**
- [ ] All agents have test coverage
- [ ] CI blocks PRs that break tests
- [ ] Can validate model upgrades before switching
- [ ] Multi-agent coordination is tested
- [ ] Test runs complete in <5 minutes

---

## Next Step

Review this plan. If approved, I'll start with Phase 1: build the test runner and create initial scenarios for Gary.
