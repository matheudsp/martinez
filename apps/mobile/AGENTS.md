# AGENTS.md

This file provides guidance to AI agents when working with code in this repository.

Scoped guidance:

- `src/components/AGENTS.md` — component organization, HeroUI Native, Uniwind, and safe-area containers.
- `src/screens/AGENTS.md` — screen and route composition rules.

Repository knowledge:

- `docs/agents/local-validation.md` — procedure for starting local servers, validating changes through the simulator preview with Browser Use, running checks, and cleaning up.
- `docs/adr/` — durable architecture and workflow decisions, including test layout and test-data builders.

## Commands

`package.json` scripts are the source of truth. Common workflows:

```bash
bun install              # Install workspace dependencies

bun run check            # Lint + Prettier check + TypeScript
bun run lint             # Expo ESLint only
bun run test             # Jest app tests 

bun run test:app:types   # Type-check frontend tests
bun run typecheck        # App, frontend test,
bun run format           # Prettier write


bun ios                  # Start the iOS app server / simulator
bun android              # Start the Android app server / emulator
bun web                  # Start Expo web

bun run rename           # Rename project and bundle IDs
bun expo prebuild        # Generate native projects
```

## Architecture

This is a BUN monorepo with two TypeScript projects:

- **App (`src/`)** — Expo SDK 55 / React Native 0.83 / React 19 app using Expo Router, Uniwind, HeroUI Native, TanStack Form, TanStack Query



## Skills

Invoke relevant skills proactively:

- `heroui-native` — HeroUI Native components and theming.
- `react-doctor` — React correctness, security, and performance checks after React changes.

## Known tradeoffs

### Pinned versions (do not bump casually)

- `react-native-screens` is pinned to `4.24.0` for safe-area fixes.
- `react-native-keyboard-controller` uses `~1.21.6`, currently compatible with SDK 55.
