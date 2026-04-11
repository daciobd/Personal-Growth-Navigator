// ─── coachAdaptiveSignals — V1 heuristic test suite ───────────────────────
// Standalone, no framework dep. Run with:
//   tsx src/prompts/__tests__/coachAdaptiveSignals.test.ts

import { strict as assert } from "node:assert";
import {
  buildAdaptiveFallback,
  buildAdaptivePromptBlock,
  decidePriority,
} from "../coachAdaptiveSignals.js";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void): void {
  try {
    fn();
    passed++;
    console.log(`  PASS  ${name}`);
  } catch (err) {
    failed++;
    console.error(`  FAIL  ${name}`);
    console.error(`        ${err instanceof Error ? err.message : String(err)}`);
  }
}

console.log("\ncoachAdaptiveSignals — V1 heuristic\n");

// ─── Hard rules ────────────────────────────────────────────────────────────

test("01 — yes + stuck → action / ready_but_stuck", () => {
  const d = decidePriority({ onboardingCommitment: "yes", emotionalState: "stuck" });
  assert.equal(d.priorityType, "action");
  assert.equal(d.reason, "ready_but_stuck");
});

test("02 — maybe + confused → reflection / uncertain_and_confused", () => {
  const d = decidePriority({ onboardingCommitment: "maybe", emotionalState: "confused" });
  assert.equal(d.priorityType, "reflection");
  assert.equal(d.reason, "uncertain_and_confused");
});

test("03 — not_yet → alternative / low_readiness_or_emotional", () => {
  const d = decidePriority({ onboardingCommitment: "not_yet" });
  assert.equal(d.priorityType, "alternative");
  assert.equal(d.reason, "low_readiness_or_emotional");
});

test("04 — emotional state alone → alternative / low_readiness_or_emotional", () => {
  const d = decidePriority({ emotionalState: "emotional" });
  assert.equal(d.priorityType, "alternative");
  assert.equal(d.reason, "low_readiness_or_emotional");
});

// ─── Behavior-based ────────────────────────────────────────────────────────

test("05 — clicks dominated by action → behavior_prefers_action", () => {
  const d = decidePriority({
    recentClicksByType: { action: 5, reflection: 2, alternative: 1 },
  });
  assert.equal(d.priorityType, "action");
  assert.equal(d.reason, "behavior_prefers_action");
});

test("06 — clicks dominated by reflection → behavior_prefers_reflection", () => {
  const d = decidePriority({
    recentClicksByType: { action: 1, reflection: 4, alternative: 2 },
  });
  assert.equal(d.priorityType, "reflection");
  assert.equal(d.reason, "behavior_prefers_reflection");
});

test("07 — clicks dominated by alternative → behavior_prefers_alternative", () => {
  const d = decidePriority({
    recentClicksByType: { action: 0, reflection: 1, alternative: 3 },
  });
  assert.equal(d.priorityType, "alternative");
  assert.equal(d.reason, "behavior_prefers_alternative");
});

// ─── Default ───────────────────────────────────────────────────────────────

test("08 — empty signals → default_action", () => {
  const d = decidePriority({});
  assert.equal(d.priorityType, "action");
  assert.equal(d.reason, "default_action");
});

test("09 — calm + yes (no other signals) → default_action", () => {
  const d = decidePriority({ onboardingCommitment: "yes", emotionalState: "calm" });
  assert.equal(d.priorityType, "action");
  assert.equal(d.reason, "default_action");
});

// ─── Precedence ────────────────────────────────────────────────────────────

test("10 — hard rule beats behavior signal", () => {
  // not_yet → alternative regardless of click history
  const d = decidePriority({
    onboardingCommitment: "not_yet",
    recentClicksByType: { action: 99 },
  });
  assert.equal(d.priorityType, "alternative");
  assert.equal(d.reason, "low_readiness_or_emotional");
});

// ─── Prompt block ──────────────────────────────────────────────────────────

test("11 — prompt block mentions priorityType + reason", () => {
  const block = buildAdaptivePromptBlock({
    priorityType: "action",
    reason: "ready_but_stuck",
  });
  assert.ok(block.includes("PRIORIDADE ADAPTATIVA"));
  assert.ok(block.includes("action"));
  assert.ok(block.includes("ready_but_stuck"));
});

test("12 — reflection block has different framing than action block", () => {
  const a = buildAdaptivePromptBlock({ priorityType: "action", reason: "default_action" });
  const r = buildAdaptivePromptBlock({ priorityType: "reflection", reason: "default_action" });
  assert.notEqual(a, r);
  assert.ok(r.includes("reflection"));
});

// ─── Adaptive fallback ─────────────────────────────────────────────────────

test("13 — adaptive fallback always returns 3 options in canonical order", () => {
  const fb = buildAdaptiveFallback({ priorityType: "action", reason: "default_action" });
  assert.equal(fb.options.length, 3);
  assert.equal(fb.options[0].type, "action");
  assert.equal(fb.options[1].type, "reflection");
  assert.equal(fb.options[2].type, "alternative");
});

test("14 — adaptive fallback promotes the prioritized type's label", () => {
  const fbAction = buildAdaptiveFallback({ priorityType: "action", reason: "default_action" });
  const fbReflection = buildAdaptiveFallback({ priorityType: "reflection", reason: "default_action" });
  // The action fallback's action label should differ from the reflection fallback's action label
  // (because only the prioritized type gets the promoted label)
  assert.equal(fbAction.options[0].label, "Fazer algo agora");
  assert.equal(fbReflection.options[1].label, "Organizar o que sinto");
});

test("15 — adaptive fallback message reflects the priority", () => {
  const fbAction = buildAdaptiveFallback({ priorityType: "action", reason: "default_action" });
  const fbAlternative = buildAdaptiveFallback({ priorityType: "alternative", reason: "default_action" });
  assert.notEqual(fbAction.message, fbAlternative.message);
  assert.ok(fbAction.message.length > 0);
  assert.ok(fbAlternative.message.length > 0);
});

// ─── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
