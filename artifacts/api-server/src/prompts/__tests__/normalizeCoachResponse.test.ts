// ─── normalizeCoachResponse — minimal test suite ───────────────────────────
// Standalone test runner using Node's built-in `assert` (no framework dep).
// Run with: tsx src/prompts/__tests__/normalizeCoachResponse.test.ts
//
// Covers the 10 mandatory checklist scenarios:
//   1. Valid new payload
//   2. Valid legacy string[] payload
//   3. Invalid JSON
//   4. Fewer than 3 options
//   5. Wrong order of types
//   6. Duplicate types
//   7. Empty label
//   8. Empty prompt
//   9. Extra fields
//  10. Full fallback triggered
//
// Each test logs PASS/FAIL and the script exits with code 1 on any failure.

import { strict as assert } from "node:assert";
import { normalizeCoachResponse } from "../normalizeCoachResponse.js";
import { COACH_PROMPT_VERSION, OPTION_TYPE_ORDER } from "../coachPrompt.js";

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

console.log("\nnormalizeCoachResponse — 10 mandatory scenarios\n");

// ─── 1. Valid new payload ──────────────────────────────────────────────────

test("01 — valid new typed payload", () => {
  const raw = JSON.stringify({
    message: "Entendi seu ponto. Vamos por partes.",
    options: [
      { type: "action", label: "Vou tentar agora", prompt: "Quero começar pelo passo 1." },
      { type: "reflection", label: "Quero pensar nisso", prompt: "Me ajuda a investigar o que está por trás." },
      { type: "alternative", label: "Outro caminho", prompt: "Prefiro abordar de outro jeito." },
    ],
  });

  const result = normalizeCoachResponse(raw);

  assert.equal(result.data.message, "Entendi seu ponto. Vamos por partes.");
  assert.equal(result.data.options.length, 3);
  assert.deepEqual(
    result.data.options.map((o) => o.type),
    ["action", "reflection", "alternative"]
  );
  assert.equal(result.meta.usedFallback, false);
  assert.deepEqual(result.meta.missingTypes, []);
  assert.deepEqual(result.meta.duplicateTypes, []);
  assert.equal(result.meta.promptVersion, COACH_PROMPT_VERSION);
  assert.equal(result.meta.parseError, undefined);
});

// ─── 2. Valid legacy string[] payload ──────────────────────────────────────

test("02 — valid legacy string[] payload (positional types)", () => {
  const raw = JSON.stringify({
    message: "Entendi.",
    options: ["Vou agir agora", "Vou refletir", "Quero outro jeito"],
  });

  const result = normalizeCoachResponse(raw);

  assert.equal(result.data.options.length, 3);
  // Position 0 → action, 1 → reflection, 2 → alternative
  assert.equal(result.data.options[0].type, "action");
  assert.equal(result.data.options[0].label, "Vou agir agora");
  assert.equal(result.data.options[1].type, "reflection");
  assert.equal(result.data.options[1].label, "Vou refletir");
  assert.equal(result.data.options[2].type, "alternative");
  assert.equal(result.data.options[2].label, "Quero outro jeito");
  assert.equal(result.meta.usedFallback, false);
});

// ─── 3. Invalid JSON ───────────────────────────────────────────────────────

test("03 — invalid JSON triggers full fallback", () => {
  const raw = "Sorry, I can't help with that.";

  const result = normalizeCoachResponse(raw);

  assert.ok(result.data.message.length > 0, "message must not be empty");
  assert.equal(result.data.options.length, 3);
  assert.deepEqual(
    result.data.options.map((o) => o.type),
    ["action", "reflection", "alternative"]
  );
  assert.equal(result.meta.usedFallback, true);
  assert.deepEqual(result.meta.missingTypes, [...OPTION_TYPE_ORDER]);
  assert.equal(result.meta.parseError, "no_json_found");
});

// ─── 4. Fewer than 3 options ───────────────────────────────────────────────

test("04 — fewer than 3 options fills missing slots", () => {
  const raw = JSON.stringify({
    message: "Vamos lá.",
    options: [
      { type: "action", label: "Começar agora", prompt: "Quero começar." },
    ],
  });

  const result = normalizeCoachResponse(raw);

  assert.equal(result.data.options.length, 3);
  assert.equal(result.data.options[0].type, "action");
  assert.equal(result.data.options[0].label, "Começar agora");
  // Missing reflection + alternative filled by fallback
  assert.equal(result.data.options[1].type, "reflection");
  assert.equal(result.data.options[2].type, "alternative");
  assert.equal(result.meta.usedFallback, true);
  assert.deepEqual(result.meta.missingTypes, ["reflection", "alternative"]);
});

// ─── 5. Wrong order of types ───────────────────────────────────────────────

test("05 — wrong order is corrected to canonical", () => {
  const raw = JSON.stringify({
    message: "Ok.",
    options: [
      { type: "alternative", label: "Outro jeito", prompt: "Outro caminho." },
      { type: "action", label: "Fazer agora", prompt: "Vou agir." },
      { type: "reflection", label: "Pensar mais", prompt: "Quero refletir." },
    ],
  });

  const result = normalizeCoachResponse(raw);

  // Must be reordered to action → reflection → alternative
  assert.deepEqual(
    result.data.options.map((o) => o.type),
    ["action", "reflection", "alternative"]
  );
  assert.equal(result.data.options[0].label, "Fazer agora");
  assert.equal(result.data.options[1].label, "Pensar mais");
  assert.equal(result.data.options[2].label, "Outro jeito");
  assert.equal(result.meta.usedFallback, false);
});

// ─── 6. Duplicate types ────────────────────────────────────────────────────

test("06 — duplicate types: first kept, duplicates recorded", () => {
  const raw = JSON.stringify({
    message: "Ok.",
    options: [
      { type: "action", label: "Primeira ação", prompt: "Primeira." },
      { type: "action", label: "Segunda ação", prompt: "Segunda." },
      { type: "reflection", label: "Refletir", prompt: "Refletir." },
    ],
  });

  const result = normalizeCoachResponse(raw);

  // First action wins
  assert.equal(result.data.options[0].label, "Primeira ação");
  // Reflection kept
  assert.equal(result.data.options[1].label, "Refletir");
  // Alternative missing → fallback
  assert.equal(result.data.options[2].type, "alternative");
  // Duplicates recorded in meta
  assert.deepEqual(result.meta.duplicateTypes, ["action"]);
  assert.deepEqual(result.meta.missingTypes, ["alternative"]);
  assert.equal(result.meta.usedFallback, true);
});

// ─── 7. Empty label ────────────────────────────────────────────────────────

test("07 — option with empty label is dropped", () => {
  const raw = JSON.stringify({
    message: "Ok.",
    options: [
      { type: "action", label: "  ", prompt: "Vazio." },
      { type: "reflection", label: "Refletir", prompt: "Quero refletir." },
      { type: "alternative", label: "Outro", prompt: "Outro caminho." },
    ],
  });

  const result = normalizeCoachResponse(raw);

  // Empty action dropped → filled by fallback
  assert.equal(result.data.options[0].type, "action");
  assert.notEqual(result.data.options[0].label, "  ");
  assert.equal(result.data.options[1].label, "Refletir");
  assert.equal(result.data.options[2].label, "Outro");
  assert.deepEqual(result.meta.missingTypes, ["action"]);
});

// ─── 8. Empty prompt ───────────────────────────────────────────────────────

test("08 — option with empty prompt falls back to label", () => {
  const raw = JSON.stringify({
    message: "Ok.",
    options: [
      { type: "action", label: "Fazer", prompt: "" },
      { type: "reflection", label: "Pensar", prompt: "Pensar a respeito." },
      { type: "alternative", label: "Outro", prompt: "Outro jeito." },
    ],
  });

  const result = normalizeCoachResponse(raw);

  // Empty prompt should fall back to label
  assert.equal(result.data.options[0].label, "Fazer");
  assert.equal(result.data.options[0].prompt, "Fazer");
  assert.equal(result.meta.usedFallback, false);
  assert.deepEqual(result.meta.missingTypes, []);
});

// ─── 9. Extra fields ───────────────────────────────────────────────────────

test("09 — extra unknown fields are ignored", () => {
  const raw = JSON.stringify({
    message: "Ok.",
    options: [
      { type: "action", label: "Fazer", prompt: "Vou fazer.", randomField: 42, nested: { x: 1 } },
      { type: "reflection", label: "Pensar", prompt: "Vou pensar." },
      { type: "alternative", label: "Outro", prompt: "Outro jeito." },
    ],
    extraTopLevel: "ignored",
  });

  const result = normalizeCoachResponse(raw);

  assert.equal(result.data.options.length, 3);
  assert.equal((result.data.options[0] as any).randomField, undefined);
  assert.equal((result.data.options[0] as any).nested, undefined);
  assert.equal(result.meta.usedFallback, false);
});

// ─── 10. Full fallback ─────────────────────────────────────────────────────

test("10 — completely malformed input triggers full fallback with all 3 fallback options", () => {
  const raw = "{ this is not even close to valid JSON [[[";

  const result = normalizeCoachResponse(raw);

  assert.equal(result.data.options.length, 3);
  assert.equal(result.data.options[0].type, "action");
  assert.equal(result.data.options[1].type, "reflection");
  assert.equal(result.data.options[2].type, "alternative");
  assert.ok(result.data.message.length > 0);
  assert.equal(result.meta.usedFallback, true);
  assert.deepEqual(result.meta.missingTypes, [...OPTION_TYPE_ORDER]);
  assert.ok(typeof result.meta.parseError === "string");
});

// ─── Bonus: empty message after sanitization is replaced ───────────────────

test("11 — message that sanitizes to empty is replaced by default", () => {
  const raw = JSON.stringify({
    message: "   ",  // whitespace-only
    options: [
      { type: "action", label: "A", prompt: "A." },
      { type: "reflection", label: "B", prompt: "B." },
      { type: "alternative", label: "C", prompt: "C." },
    ],
  });

  const result = normalizeCoachResponse(raw);

  // validateShape rejects whitespace-only message → full fallback path
  assert.ok(result.data.message.trim().length > 0, "message must never be empty");
});

// ─── Summary ───────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
process.exit(failed > 0 ? 1 : 0);
