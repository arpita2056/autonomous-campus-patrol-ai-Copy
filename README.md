# AEGIS-PATROL // Autonomous Patrol & Surveillance Agent System

An advanced, production-grade **Live Operational Command Dashboard** and **Analytics Benchmark Suite** for autonomous campus surveillance and multi-agent coordination.

---

## 1. System Architecture & Tech Stack

```
                                  +-----------------------+
                                  |   Frontend Dashboard  |
                                  | React 18 + TypeScript |
                                  |      Tailwind CSS     |
                                  +-----------+-----------+
                                              |
                     +------------------------+------------------------+
                     |                                                 |
         +-----------v-----------+                         +-----------v-----------+
         | Simulation / Ops Hub  |                         |   Analytics Engine    |
         | Interactive Canvas/SVG|                         | Comparative Curves &  |
         | Real-time Map Overlay |                         | Latency Distributions |
         +-----------+-----------+                         +-----------+-----------+
                     |                                                 |
                     +------------------------+------------------------+
                                              |
                                  +-----------v-----------+
                                  |   Utility AI Engine   |
                                  | Multi-Agent Scheduler |
                                  |  Dijkstra Pathfinding |
                                  +-----------------------+
```

* **Frontend:** React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite
* **Map & Physics Engine:** Vector SVG Map Canvas with heading indicators, trail breadcrumbs, starvation heatmaps, and dynamic risk rings
* **Pathfinding:** Dijkstra Shortest Path algorithm on bidirectional campus graph
* **Decision Optimization:** Multi-Objective Weighted Utility AI Engine vs Fixed-Route Loop vs Random Stochastic Walk

---

## 2. Mathematical Utility Specification

Every unvisited zone $z_i$ is evaluated by agent $A_k$ at time step $t$ using the objective scoring function:

$$U(z_i, A_k, t) = w_C \cdot C(z_i) + w_U \cdot \frac{t - T_{\text{last}}(z_i)}{T_{\text{max}}} + w_R \cdot R(z_i) + w_A \cdot I(z_i) - \frac{\text{dist}(z_{\text{current}}, z_i)}{D_{\text{max}}} - P_{\text{batt}}(A_k)$$

### Variable & Component Definitions

* **$C(z_i)$ (Coverage Gain):** $1.0$ if the zone has never been visited, decaying sigmoidal recovery if visited recently.
* **$\frac{t - T_{\text{last}}(z_i)}{T_{\text{max}}}$ (Revisit Urgency):** Normalized starvation latency elapsed since zone $z_i$ was last patrolled.
* **$R(z_i)$ (Base Risk):** Static security vulnerability rating ($0.0 - 1.0$).
* **$I(z_i)$ (Incident Multiplier):** Elevated priority ($1.0 - 2.4\times$) if an unresolved incident is active.
* **$\frac{\text{dist}(z_{\text{current}}, z_i)}{D_{\text{max}}}$ (Distance Cost):** Dijkstra shortest-path travel distance normalized to campus maximum.
* **$P_{\text{batt}}(A_k)$ (Battery Penalty):** Directs agents to inductive charging hubs when battery drops below threshold $w_{\text{batt}}$.

---

## 3. Key Capabilities & Page Architecture

### Section A: Global Navigation & Header Bar
* Real-time UTC clock & shift elapsed timer.
* Active status indicators: `SIMULATION LIVE`, `SYSTEMS NOMINAL`, Active Fleet Count, Tick Index.
* Top-level tactical controls: **Emergency Halt**, **Global Reset**, and **Manual Simulation Alert Trigger**.
* Quick View Switcher: **Live Ops Command** vs. **Analytics Benchmark Suite**.

### Section B: Main Command Workspace
1. **Interactive Schematic Map & Canvas:**
   * 11 Physical Campus Nodes: Main Security Gate & Dock Alpha, Academic Complex, Central Library, Campus Hospital & Trauma Clinic, North & South Hostels, Autonomous Systems Research Park, Solar Substation Dock Beta, Sports Pavilion, Visitor & Fleet Parking Lots.
   * Road network with arterial avenues, perimeter loops, and pedestrian walkways.
   * Smooth agent interpolation with heading rotation cones, status rings, and fading breadcrumb trails.
   * Toggleable layers: Roads, Starvation Heatmap, Risk Rings, Node Labels, Connection Paths, and Trails.
   * Speed multiplier controls: $1\times, 2\times, 5\times, 10\times$.
2. **Patrol Strategy & Real-Time AI Control Panel:**
   * Strategy Selector: **Utility-Based AI**, **Fixed Route**, **Random Patrol**.
   * Fleet Slider: Dynamically scale active units from 1 to 6.
   * Real-time sliders for $w_C$, $w_U$, $w_R$, $w_A$, $w_{\text{batt}}$ with instant formula preview.
   * Simulation controls: Play / Pause / Single-Step.
3. **Fleet Health & Telemetry Panel:**
   * Agent cards per active unit with live battery meter, color transitions (Green $\rightarrow$ Amber $\rightarrow$ Red), charging animations, current $\rightarrow$ target route, distance, steps, and cleared incidents.
4. **Incident Management & Autonomous Decision Stream:**
   * Active incident queue with severity tags (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), elapsed timer, and manual clear buttons.
   * Real-time decision stream explaining the exact mathematical reasoning behind every agent redirect.

### Section C: Analytics & Benchmarking Dashboard
* **KPI Summary Cards:** % Campus Coverage Rate, Average Zone Revisit Interval, Average Incident Response Latency, and Energy Consumption Efficiency.
* **Comparative Visual Charts:**
  * Coverage Efficiency Curve (% area covered over time across 3 strategies).
  * Incident Clearance Latency comparison.
* **Head-to-Head Benchmark Battle Lab:**
  * 3-way automated evaluation runner proving Utility AI superiority over deterministic fixed loops and random walks under identical stress conditions.

---

## 4. Running the Application Locally

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

