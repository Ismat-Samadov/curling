# 🥌 CurlMaster

A polished, full-stack curling browser game built with **Next.js 16**, **TypeScript**, and **Tailwind CSS**. Slide granite stones on procedurally-rendered ice, apply curl, and outscore a challenging AI opponent over 8 ends.

---

## Features

- **Realistic curling physics** — friction, curl (rotation-driven lateral drift), and elastic stone collisions on a simulated HTML5 Canvas ice sheet
- **Complete game rules** — 8 ends, 8 stones per team, standard scoring (closest stone wins + count), blank ends, hammer hand
- **AI opponent** with three difficulty tiers:
  - 😊 **Easy** — large aim/power noise, often misses the house
  - 🤔 **Medium** — moderate accuracy, occasional takeout attempts
  - 😤 **Hard** — near-perfect draw weight, strategic takeouts
- **Dual control schemes**:
  - Mouse/keyboard: arrow keys to aim, slider or keys for power, `Z`/`X` to set curl, `Enter`/`Space` to confirm/throw
  - Touch: on-screen sliders and buttons for full mobile play
- **Procedural sound effects** — throw scrape, stone collision thunk, score fanfare, UI clicks (Web Audio API — no audio files)
- **Background music** toggle — generative ambient ice music
- **Responsive layout** — adapts from mobile portrait to ultrawide desktop; no horizontal scrolling
- **Glassmorphism dark theme** — neon accents on deep navy ice
- **Animated end-score modal** — result after every end with point totals
- **Confetti win screen** — animated celebration for player victory
- **Pause menu** — resume, restart, toggle sound/music
- **High score** persisted to `localStorage`
- **Themed SVG favicon**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| Rendering | HTML5 Canvas (2D) |
| Audio | Web Audio API (procedural) |
| Deploy | Vercel (zero config) |

---

## Controls

### Keyboard (Desktop)
| Key | Action |
|---|---|
| `←` / `→` | Adjust aim angle |
| `Z` / `X` | Curl direction (in-turn / out-turn) |
| `Enter` / `Space` | Confirm aim → set power → throw |
| `↑` / `↓` | Adjust power (in power phase) |
| `P` | Pause / resume |

### Touch / Mouse (Mobile + Desktop)
- **Aim slider** — drag to set angle
- **Curl buttons** — tap In-turn or Out-turn
- **Set Power button** — confirms aim, opens power phase
- **Power slider** — drag to set throw strength
- **Throw button** — releases the stone

---

## How to Run Locally

**Prerequisites:** Node.js 18+ and npm

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd curling

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Production build
npm run build
npm start
```

---

## Vercel Deployment

This project is **zero-config Vercel ready** — just connect your GitHub repo in the [Vercel dashboard](https://vercel.com/new) and deploy. No environment variables are required.

```bash
# Or deploy via CLI
npx vercel
```

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + metadata
│   ├── page.tsx            # Entry point → GameOrchestrator
│   └── globals.css         # Tailwind + custom range input styles
├── components/game/
│   ├── GameOrchestrator.tsx # Main wiring: state + physics + UI
│   ├── CurlingCanvas.tsx    # Canvas renderer (ice, rings, stones, aim line)
│   ├── GameControls.tsx     # Aim/power/curl/throw UI panels
│   ├── ScoreBoard.tsx       # Per-end score grid + totals
│   ├── EndScoreModal.tsx    # Post-end result modal
│   ├── EndScreen.tsx        # Game-over + confetti
│   ├── MenuScreen.tsx       # Title screen + difficulty picker
│   └── PauseMenu.tsx        # Pause overlay with settings
├── hooks/
│   ├── useGameState.ts      # Central reducer (all game logic)
│   └── usePhysicsLoop.ts    # RAF-based physics tick
├── lib/
│   ├── physics.ts           # Stone movement, friction, curl, collisions
│   ├── scoring.ts           # House scoring + stone-in-house detection
│   ├── ai.ts                # AI shot computation per difficulty
│   ├── sounds.ts            # Procedural Web Audio SFX + music
│   └── constants.ts         # Sheet dimensions, physics params, colours
└── types/
    └── game.ts              # All TypeScript interfaces and union types
```

---

## Curling Rules (simplified)

- Two teams take turns throwing 8 stones each per **end** (round)
- The **non-hammer** team (does not have last-rock advantage) throws first
- After all 16 stones are thrown, the team with the **stone closest to the button** (centre) scores **1 point per stone** that is closer than the nearest opposition stone
- A **blank end** scores nothing; the hammer stays with the same team
- The team that scores an end **gives the hammer** to the opponent for the next end
- The team with the most points after 8 ends wins

---

## License

MIT — free to use, modify, and deploy.
