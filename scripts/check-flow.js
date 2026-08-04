const assert = require("node:assert/strict");
const {
  isProgramEligible,
} = require("../dist/modules/recommendation/recommendation.service");
const {
  programComparisonSchema,
} = require("../dist/modules/recommendation/recommendation.validation");

const matriculation = {
  totalScore: 500,
  myanmar: 80,
  english: 80,
  mathematics: 80,
  physics: 80,
  chemistry: 80,
  biology: null,
};
const program = {
  minScore: 400,
  status: "ACTIVE",
  requirements: [{ biology: 50 }],
};

assert.equal(isProgramEligible(matriculation, program), false);
assert.equal(
  isProgramEligible({ ...matriculation, biology: 80 }, program),
  true,
);
assert.equal(
  isProgramEligible(
    { ...matriculation, biology: 80 },
    { ...program, status: "INACTIVE" },
  ),
  false,
);
assert.equal(
  programComparisonSchema.safeParse({ programIds: [1, 1] }).success,
  false,
);

console.log("Recommendation and application flow checks passed.");
