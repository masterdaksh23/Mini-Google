# 🌐 Mini Google — PageRank 3D Network Explorer

An interactive web application demonstrating Google's classic **PageRank algorithm** and the **Random Surfer (Dice Game)** with an immersive Three.js 3D force-directed visualization. Everything runs 100% client-side in the browser.

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Open in your browser (usually http://localhost:3000 or http://localhost:5173)
```

To run the verification test suite:
```bash
npm test
```

To build for production:
```bash
npm run build
npm run preview
```

---

## 🍕 Seed Network & Expected Results

The default seed dataset models a competitive web ecosystem in Pune:

### Seed Websites:
1. `pune-food-guide.com` (Culinary reviews)
2. `best-pizza-pune.com` (**Rank #1** — highlighted in **Green**)
3. `college-canteen-blog.com` (Student food blog)
4. `pizza-recipes-home.com` (DIY recipes)
5. `cheap-eats-pune.com` (Budget eats)
6. `pizza-pizza-pizza.com` (**Rank last** — highlighted in **Red**, 0 incoming links)

### Directed Hyperlinks:
- `1 -> 2`
- `2 -> 1`, `2 -> 3`
- `3 -> 2`, `3 -> 4`
- `4 -> 2`, `4 -> 5`
- `5 -> 2`
- `6 -> 1`

### Verified Ranking Order (Acceptance Criteria):
$$\text{best-pizza-pune.com (\#2)} > \text{pune-food-guide.com (\#1)} > \text{college-canteen-blog.com (\#3)} > \text{pizza-recipes-home.com (\#4)} > \text{cheap-eats-pune.com (\#5)} > \text{pizza-pizza-pizza.com (\#6)}$$

| Rank | Domain | PageRank Score | PR % | In-Degree | Out-Degree |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **#1** | **best-pizza-pune.com** | `0.3929` | **39.29%** | 4 in | 2 out |
| **#2** | **pune-food-guide.com** | `0.2132` | **21.32%** | 2 in | 1 out |
| **#3** | **college-canteen-blog.com** | `0.1920` | **19.20%** | 1 in | 2 out |
| **#4** | **pizza-recipes-home.com** | `0.1066` | **10.66%** | 1 in | 2 out |
| **#5** | **cheap-eats-pune.com** | `0.0703` | **7.03%** | 1 in | 1 out |
| **#6** | **pizza-pizza-pizza.com** | `0.0250` | **2.50%** | **0 in** | 1 out |

---

## ⚙️ Ranking Engine: Two Modes

### 1. PageRank (Algorithm) Mode
- Classic power-iteration PageRank algorithm:
  $$PR(u) = \frac{1 - d}{N} + d \sum_{v \in \text{In}(u)} \frac{PR(v)}{\text{Out}(v)} + \frac{d \cdot \text{DanglingSum}}{N}$$
- Damping factor $d = 0.85$, convergence threshold $\epsilon = 10^{-6}$.
- Dangling nodes (0 out-degree) redistribute their mass equally across all $N$ pages.
- Dynamic incoming authority breakdown showing exactly what percentage each linking page contributed.

### 2. Random Surfer (Dice Game) Mode
Simulates the exact physical board/dice game rules:
1. **Start:** Roll a die (1–6); that page is your starting page — add a **"|"** line for it.
2. **Each turn, roll again:**
   - **Roll 6 (16.7% boredom):** Teleport! Roll again and jump to that page.
   - **Roll 1–5:** Follow an outgoing link of current page. If the page has 2 links, roll again:
     - **Odd (1, 3, 5)** $\rightarrow$ 1st link
     - **Even (2, 4, 6)** $\rightarrow$ 2nd link
     - *(Single link $\rightarrow$ follow it; dead end $\rightarrow$ teleport).*
3. **20-Line Game:** Every visited page gets a "|" mark. Stops at 20 lines with animated tally bars.
4. **Run 10,000 Trials:** Aggregates empirical visit counts using Monte Carlo simulation, demonstrating how the physical dice game converges directly to PageRank's stationary distribution!

---

## 🎨 3D Visualization & Design

- **3D Force-Directed Layout:** Using `d3-force-3d` to compute continuous $x, y, z$ positions with node repulsion, link springs, and center gravity.
- **Glowing Spheres:** Node radius scales dynamically with PageRank score.
  - #1 Rank (`best-pizza-pune.com`): Emerald green emissive aura + orbiting halo ring.
  - 0-Incoming Rank (`pizza-pizza-pizza.com`): Crimson red emissive aura + warning ring.
- **Curved Directed Edges:** 3D quadratic Bezier curves offset with normal vectors so bidirectional edges ($A \to B$ and $B \to A$) arch separately and never collide.
- **Flow Effect:** Luminous animated particles flowing along edges in the link direction.
- **Interactive Hover & Click:** Hovering a node highlights incoming edges (green) and outgoing edges (amber), while dimming unrelated edges.
- **Surfer 3D Token:** Animated golden surfer orb traveling smoothly between pages during dice simulation.
- **Search Mini Google:** Built-in search engine simulator showing how keyword-stuffed spam pages are eliminated by PageRank authority.

---

## 🛠️ Tech Stack

- **React 18**
- **Vite 5**
- **Tailwind CSS 3**
- **Three.js + @react-three/fiber + @react-three/drei**
- **d3-force-3d**
- **Lucide Icons**
- **Canvas Confetti**

