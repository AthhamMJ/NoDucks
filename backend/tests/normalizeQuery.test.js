import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { normalizeQuery, normalizeAliases } from "../src/utils/normalizeQuery.js";

describe("normalizeQuery Utility", () => {
  test("acceptance criteria: 'Newton's second law', 'newtons second law', and 'NEWTON’S SECOND LAW' all normalize to the same string", () => {
    const q1 = normalizeQuery("Newton's second law");
    const q2 = normalizeQuery("newtons second law");
    const q3 = normalizeQuery("NEWTON’S SECOND LAW");

    assert.equal(q1, "newtons second law");
    assert.equal(q2, "newtons second law");
    assert.equal(q3, "newtons second law");
    assert.equal(q1, q2);
    assert.equal(q2, q3);
  });

  test("converts various stylized and curly apostrophes accurately", () => {
    assert.equal(normalizeQuery("Kepler’s First Law"), "keplers first law");
    assert.equal(normalizeQuery("Kepler‘s First Law"), "keplers first law");
    assert.equal(normalizeQuery("Kepler`s First Law"), "keplers first law");
    assert.equal(normalizeQuery("Kepler′s First Law"), "keplers first law");
  });

  test("normalizes unicode diacritics / accents via NFKD", () => {
    assert.equal(normalizeQuery("Schrödinger's Equation"), "schrodingers equation");
    assert.equal(normalizeQuery("Bernoulli’s Principle"), "bernoullis principle");
  });

  test("strips punctuation while retaining numbers and letters", () => {
    assert.equal(
      normalizeQuery("Newton's 2nd Law - (Mechanics: Physics!)"),
      "newtons 2nd law mechanics physics"
    );
  });

  test("collapses multiple spaces, tabs, and trims ends", () => {
    assert.equal(
      normalizeQuery("   photosynthesis    and   cellular   respiration   "),
      "photosynthesis and cellular respiration"
    );
  });

  test("handles null, undefined, empty string, and non-string inputs safely", () => {
    assert.equal(normalizeQuery(""), "");
    assert.equal(normalizeQuery(null), "");
    assert.equal(normalizeQuery(undefined), "");
    assert.equal(normalizeQuery(12345), "");
  });
});

describe("normalizeAliases Utility", () => {
  test("normalizes comma-separated string of aliases into deduplicated array", () => {
    const input = "Newton's 2nd Law, newtons second law, NEWTON’S SECOND LAW, F = ma";
    const aliases = normalizeAliases(input);

    assert.deepEqual(aliases, [
      "newtons 2nd law",
      "newtons second law",
      "f ma",
    ]);
  });

  test("normalizes array of aliases and removes empty strings", () => {
    const input = ["Newton's Second Law", "   ", "!@#$%", "newtons second law"];
    const aliases = normalizeAliases(input);

    assert.deepEqual(aliases, ["newtons second law"]);
  });

  test("handles empty and null inputs safely", () => {
    assert.deepEqual(normalizeAliases(null), []);
    assert.deepEqual(normalizeAliases(""), []);
  });
});
