import assert from 'assert';
import { SEED_PAGES, SEED_LINKS } from '../src/constants/seedData.js';
import { computePageRank } from '../src/engine/pagerank.js';
import { runSurferTrials } from '../src/engine/randomSurfer.js';

console.log('--- RUNNING MINI GOOGLE VERIFICATION SUITE ---');

// 1. Verify Seed Pages
console.log('1. Checking Seed Pages...');
assert.strictEqual(SEED_PAGES.length, 6, 'Must have exactly 6 seed pages');
const expectedDomains = [
  'pune-food-guide.com',
  'best-pizza-pune.com',
  'college-canteen-blog.com',
  'pizza-recipes-home.com',
  'cheap-eats-pune.com',
  'pizza-pizza-pizza.com'
];
SEED_PAGES.forEach((p, idx) => {
  assert.strictEqual(p.id, idx + 1);
  assert.strictEqual(p.domain, expectedDomains[idx]);
});
console.log('✓ Seed pages match prompt specification exactly.');

// 2. Verify Seed Links
console.log('2. Checking Seed Directed Links...');
const expectedLinks = [
  [1, 2],
  [2, 1],
  [2, 3],
  [3, 2],
  [3, 4],
  [4, 2],
  [4, 5],
  [5, 2],
  [6, 1]
];
assert.strictEqual(SEED_LINKS.length, 9, 'Must have 9 directed seed links');
expectedLinks.forEach(([src, tgt]) => {
  const found = SEED_LINKS.some(l => l.source === src && l.target === tgt);
  assert.ok(found, `Missing link ${src} -> ${tgt}`);
});
console.log('✓ Seed directed links match prompt specification exactly.');

// 3. Verify PageRank Computation & Acceptance Criteria Order
console.log('3. Checking PageRank Algorithm and Acceptance Criteria...');
const prResult = computePageRank(SEED_PAGES, SEED_LINKS, { damping: 0.85, epsilon: 1e-6 });

console.log('PageRank Results:');
prResult.rankings.forEach(r => {
  console.log(`  #${r.rank}: ID ${r.id} (${r.domain}) -> Score: ${r.score.toFixed(5)} (${r.percentage}%), in-degree: ${r.inDegree}`);
});

const actualOrder = prResult.rankings.map(r => r.id);
const expectedOrder = [2, 1, 3, 4, 5, 6];

assert.deepStrictEqual(actualOrder, expectedOrder, `Ranking order must strictly be [2, 1, 3, 4, 5, 6], got ${JSON.stringify(actualOrder)}`);
assert.strictEqual(prResult.isAcceptanceCriteriaMet, true, 'isAcceptanceCriteriaMet must be true');

// Verify #1 rank is best-pizza-pune.com
assert.strictEqual(prResult.rankings[0].id, 2);
assert.strictEqual(prResult.rankings[0].domain, 'best-pizza-pune.com');

// Verify #6 rank is pizza-pizza-pizza.com and has 0 incoming links
assert.strictEqual(prResult.rankings[5].id, 6);
assert.strictEqual(prResult.rankings[5].domain, 'pizza-pizza-pizza.com');
assert.strictEqual(prResult.inDegrees[6], 0, 'Page 6 must have 0 incoming links');

console.log('✓ Acceptance criteria verified: 2 > 1 > 3 > 4 > 5 > 6');

// 4. Verify Random Surfer Monte Carlo Trials
console.log('4. Testing Random Surfer 10,000 trials simulation...');
const surferResult = runSurferTrials(SEED_PAGES, SEED_LINKS, 20000);
console.log('Surfer Trial Results (top 3):');
surferResult.rankings.slice(0, 3).forEach(r => {
  console.log(`  #${r.rank}: ID ${r.id} (${r.domain}) -> ${r.count} visits (${r.percentage}%)`);
});
assert.strictEqual(surferResult.rankings[0].id, 2, 'best-pizza-pune.com should rank #1 in Monte Carlo random surfer trials');
console.log('✓ Random Surfer simulation verified successfully.');

console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');

