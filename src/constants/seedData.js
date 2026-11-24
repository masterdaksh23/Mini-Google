// Seed data as strictly specified in the prompt:
// Pages (id, domain, color hint):
// 1 pune-food-guide.com
// 2 best-pizza-pune.com (must rank #1 — highlight it green)
// 3 college-canteen-blog.com
// 4 pizza-recipes-home.com
// 5 cheap-eats-pune.com
// 6 pizza-pizza-pizza.com (ranks last — highlight it red, 0 incoming links)
//
// Directed links (source -> target):
// 1 -> 2
// 2 -> 1, 2 -> 3
// 3 -> 2, 3 -> 4
// 4 -> 2, 4 -> 5
// 5 -> 2
// 6 -> 1

export const SEED_PAGES = [
  {
    id: 1,
    domain: 'pune-food-guide.com',
    title: 'Pune Food Guide',
    description: 'Comprehensive culinary reviews and food trails across Pune city.',
    colorHint: '#38bdf8', // sky blue
    initialCategory: 'Food Blog'
  },
  {
    id: 2,
    domain: 'best-pizza-pune.com',
    title: 'Best Pizza in Pune',
    description: 'Award-winning artisan woodfired sourdough pizzas in KP and Baner.',
    colorHint: '#22c55e', // emerald green (Rank #1)
    isTopHint: true,
    initialCategory: 'Pizzeria'
  },
  {
    id: 3,
    domain: 'college-canteen-blog.com',
    title: 'College Canteen Blog',
    description: 'Student guide to budget bites and late-night snacks around Pune colleges.',
    colorHint: '#a855f7', // purple
    initialCategory: 'Student Life'
  },
  {
    id: 4,
    domain: 'pizza-recipes-home.com',
    title: 'Home Pizza Recipes',
    description: 'DIY Neapolitan pizza dough, secret sauces, and baking steel tips.',
    colorHint: '#f97316', // orange
    initialCategory: 'Recipes'
  },
  {
    id: 5,
    domain: 'cheap-eats-pune.com',
    title: 'Pune Cheap Eats',
    description: 'Unbeatable street food deals, misal joints, and pocket-friendly pizza.',
    colorHint: '#eab308', // yellow
    initialCategory: 'Budget Food'
  },
  {
    id: 6,
    domain: 'pizza-pizza-pizza.com',
    title: 'Pizza Pizza Pizza',
    description: 'Spammy auto-generated affiliate site with zero incoming links from reputable sites.',
    colorHint: '#ef4444', // red (Rank last, 0 incoming links)
    isBottomHint: true,
    initialCategory: 'Spam / Isolated'
  }
];

export const SEED_LINKS = [
  { id: '1-2', source: 1, target: 2 },
  { id: '2-1', source: 2, target: 1 },
  { id: '2-3', source: 2, target: 3 },
  { id: '3-2', source: 3, target: 2 },
  { id: '3-4', source: 3, target: 4 },
  { id: '4-2', source: 4, target: 2 },
  { id: '4-5', source: 4, target: 5 },
  { id: '5-2', source: 5, target: 2 },
  { id: '6-1', source: 6, target: 1 }
];

export const PRESETS = [
  {
    id: 'pune-pizza',
    name: 'Pune Pizza Network (Default Seed)',
    description: 'The exact prompt seed network: best-pizza-pune ranks #1, pizza-pizza-pizza ranks last.',
    pages: SEED_PAGES,
    links: SEED_LINKS
  },
  {
    id: 'star-hub',
    name: 'Star Authority Hub',
    description: 'Multiple peripheral blogs pointing into one central university portal.',
    pages: [
      { id: 1, domain: 'pune-university.edu', title: 'Pune University Main', colorHint: '#22c55e' },
      { id: 2, domain: 'eng-dept.pune.edu', title: 'Engineering Dept', colorHint: '#38bdf8' },
      { id: 3, domain: 'library.pune.edu', title: 'Campus Library', colorHint: '#a855f7' },
      { id: 4, domain: 'student-union.org', title: 'Student Union', colorHint: '#f97316' },
      { id: 5, domain: 'alumni-network.in', title: 'Alumni Network', colorHint: '#eab308' },
      { id: 6, domain: 'campus-housing.com', title: 'Campus Housing', colorHint: '#ef4444' }
    ],
    links: [
      { id: 'l1', source: 2, target: 1 },
      { id: 'l2', source: 3, target: 1 },
      { id: 'l3', source: 4, target: 1 },
      { id: 'l4', source: 5, target: 1 },
      { id: 'l5', source: 6, target: 1 },
      { id: 'l6', source: 1, target: 2 },
      { id: 'l7', source: 1, target: 3 }
    ]
  },
  {
    id: 'circular-ring',
    name: 'Circular Web Ring',
    description: 'A symmetric loop where every site has 1 in-link and 1 out-link (equal PageRank).',
    pages: [
      { id: 1, domain: 'tech-review-1.org', title: 'Tech Review A', colorHint: '#38bdf8' },
      { id: 2, domain: 'tech-review-2.org', title: 'Tech Review B', colorHint: '#22c55e' },
      { id: 3, domain: 'tech-review-3.org', title: 'Tech Review C', colorHint: '#a855f7' },
      { id: 4, domain: 'tech-review-4.org', title: 'Tech Review D', colorHint: '#f97316' },
      { id: 5, domain: 'tech-review-5.org', title: 'Tech Review E', colorHint: '#eab308' },
      { id: 6, domain: 'tech-review-6.org', title: 'Tech Review F', colorHint: '#ec4899' }
    ],
    links: [
      { id: 'r1', source: 1, target: 2 },
      { id: 'r2', source: 2, target: 3 },
      { id: 'r3', source: 3, target: 4 },
      { id: 'r4', source: 4, target: 5 },
      { id: 'r5', source: 5, target: 6 },
      { id: 'r6', source: 6, target: 1 }
    ]
  },
  {
    id: 'spider-trap',
    name: 'Link Farm vs Quality Seed',
    description: 'Demonstrates why spam link farms with low authority cannot outrank high-authority sites.',
    pages: [
      { id: 1, domain: 'trusted-news-portal.com', title: 'Trusted Daily News', colorHint: '#22c55e' },
      { id: 2, domain: 'gov-regulator.gov', title: 'Official Regulator', colorHint: '#38bdf8' },
      { id: 3, domain: 'spam-blog-1.biz', title: 'Spam Blog Alpha', colorHint: '#ef4444' },
      { id: 4, domain: 'spam-blog-2.biz', title: 'Spam Blog Beta', colorHint: '#ef4444' },
      { id: 5, domain: 'spam-blog-3.biz', title: 'Spam Blog Gamma', colorHint: '#ef4444' },
      { id: 6, domain: 'shady-target.biz', title: 'Spam Target Page', colorHint: '#f97316' }
    ],
    links: [
      { id: 's1', source: 2, target: 1 },
      { id: 's2', source: 1, target: 2 },
      { id: 's3', source: 3, target: 6 },
      { id: 's4', source: 4, target: 6 },
      { id: 's5', source: 5, target: 6 },
      { id: 's6', source: 6, target: 3 },
      { id: 's7', source: 3, target: 4 }
    ]
  }
];

