# Repository Guidelines

## How to Use This Guide

- Start here for cross-project norms.
- Each component has an `AGENTS.md` file with specific guidelines (e.g., `ui/AGENTS.md`).
- Component docs override this file when guidance conflicts.

## Available Skills

Use these skills for detailed patterns on-demand:

### Generic Skills
| Skill | Description | URL |
|-------|-------------|-----|
| `typescript` | Const types, flat interfaces, best practices | [SKILL.md](.agent/skills/typescript/SKILL.md) |
| `react-19` | React 19 patterns (no useMemo/useCallback) | [SKILL.md](.agent/skills/react-19/SKILL.md) |
| `astro-6` | Astro 6 SSR, Islands, Routing and API Endpoints | [SKILL.md](.agent/skills/astro-6/SKILL.md) |
| `tailwind-4` | Tailwind CSS 4 patterns | [SKILL.md](.agent/skills/tailwind-4/SKILL.md) |
| `playwright` | E2E testing patterns | [SKILL.md](.agent/skills/playwright/SKILL.md) |
| `zod-4` | Schema validation (v4 API) | [SKILL.md](.agent/skills/zod-4/SKILL.md) |
| `zustand-5` | State management patterns | [SKILL.md](.agent/skills/zustand-5/SKILL.md) |
| `ai-sdk-5` | Vercel AI SDK patterns | [SKILL.md](.agent/skills/ai-sdk-5/SKILL.md) |
| `learning-loop` | Protocol for QA, error verification, and skill evolution | [SKILL.md](.agent/skills/learning-loop/SKILL.md) |
| `cacomi-ui` | UI components and styling conventions | [SKILL.md](.agent/skills/cacomi-ui/SKILL.md) |
| `cacomi-test-ui` | Frontend E2E testing patterns | [SKILL.md](.agent/skills/cacomi-test-ui/SKILL.md) |
| `cacomi-git` | Git, Commits, and PR workflow | [SKILL.md](.agent/skills/cacomi-git/SKILL.md) |
| `cacomi-ticket-workflow` | Ticket-based branching and merging workflow | [SKILL.md](.agent/skills/cacomi-ticket-workflow/SKILL.md) |

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| Astro Pages / API / Layouts | `astro-6` |
| Building AI chat features | `ai-sdk-5` |
| After fixing ANY error or bug | `learning-loop` |
| Creating Zod schemas | `zod-4` |
| Creating/modifying UI components | `cacomi-ui` |
| Managing Commits / PRs | `cacomi-git` |
| Using Zustand stores | `zustand-5` |
| Working with Tailwind classes | `tailwind-4` |
| Writing Playwright E2E tests | `playwright` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |

---

## Project Overview

Cacomi is a modern web application for managing recipes and meal planning.

| Component | Location | Tech Stack |
|-----------|----------|------------|
| UI/App | `src/pages/`, `src/layouts/`, `ui/` | Astro 6, React 19, Tailwind 4 |
| Skills | `.agent/skills/` | Agentic Skills Definitions |

### Translation Rule (CRITICAL)
- **Every new UI text MUST be translated**. Always add new translations to `astro_src/context/SettingsContext.jsx` for all available languages (e.g., `es`, `en`, `fr`). Do not hardcode strings in Astro or React components. For `.astro` files, use `prerender = false` and read the `cacomi_language` cookie to extract strings from the exported `translations` object.

### Security Rule (CRITICAL - BFF Pattern)
- **NEVER use `PUBLIC_` prefix for Backend URLs or Secrets**. Vite/Astro will bundle any `PUBLIC_` variable into the client-side JS.
- **Always use the BFF (Backend For Frontend) Proxy Pattern**:
    - Backend URLs must be private (e.g., `BACKEND_URL`).
    - Client-side code must call local Astro API routes (e.g., `/api/proxy/*`).
    - Sensitive validation (like PIN checks) must happen on the server (`src/pages/api/*`).

---

### Branch Protection Rule (CRITICAL)
- **NEVER push directly to the `main` branch**. 
- Always create a separate branch for any fix, feature, or modification (e.g., `fix/offline-issues`, `feat/new-ui`).
- **Verify the changes** in the branch first.
- Only merge to `main` after confirming that everything works correctly, to avoid disrupting the experience for existing users.

## Commit & Pull Request Guidelines

Follow conventional-commit style: `<type>[scope]: <description>`

**Types:** `feat`, `fix`, `docs`, `chore`, `perf`, `refactor`, `style`, `test`

Before creating a PR:
1. Run all relevant tests and linters
2. Link screenshots for UI changes
