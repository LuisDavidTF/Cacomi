# Smart Recipe Planner UI - AI Agent Ruleset

> **Skills Reference**: For detailed patterns, use these skills:
> - [`smart-recipe-planner-ui`](../.agent/skills/smart-recipe-planner-ui/SKILL.md) - Project-specific UI patterns
> - [`typescript`](../.agent/skills/typescript/SKILL.md) - Const types, flat interfaces
> - [`react-19`](../.agent/skills/react-19/SKILL.md) - No useMemo/useCallback, compiler
> - [`nextjs-16`](../.agent/skills/nextjs-16/SKILL.md) - App Router, Server Actions
> - [`tailwind-4`](../.agent/skills/tailwind-4/SKILL.md) - cn() utility, no var() in className
> - [`zod-4`](../.agent/skills/zod-4/SKILL.md) - New API (z.email(), z.uuid())
> - [`zustand-5`](../.agent/skills/zustand-5/SKILL.md) - Selectors, persist middleware
> - [`ai-sdk-5`](../.agent/skills/ai-sdk-5/SKILL.md) - UIMessage, sendMessage
> - [`playwright`](../.agent/skills/playwright/SKILL.md) - Page Object Model, selectors
> - [`smart-recipe-planner-test-ui`](../.agent/skills/smart-recipe-planner-test-ui/SKILL.md) - E2E testing specific to this project
> - [`smart-recipe-planner-i18n`](../.agent/skills/smart-recipe-planner-i18n/SKILL.md) - Reactive Translation (i18n) and hardcoded texts
> - [`smart-recipe-planner-offline`](../.agent/skills/smart-recipe-planner-offline/SKILL.md) - Standards and strategies for offline capabilities

### Auto-invoke Skills

When performing these actions, ALWAYS invoke the corresponding skill FIRST:

| Action | Skill |
|--------|-------|
| App Router / Server Actions | `nextjs-16` |
| Building AI chat features | `ai-sdk-5` |
| Creating Zod schemas | `zod-4` |
| Creating/modifying UI components | `smart-recipe-planner-ui` |
| Using Zustand stores | `zustand-5` |
| Working on UI structure (actions/adapters/types/hooks) | `smart-recipe-planner-ui` |
| Working with Tailwind classes | `tailwind-4` |
| Writing Playwright E2E tests | `playwright` |
| Writing Smart Recipe Planner UI E2E tests | `smart-recipe-planner-test-ui` |
| Writing React components | `react-19` |
| Writing TypeScript types/interfaces | `typescript` |
| Adding hardcoded texts or toasts | `smart-recipe-planner-i18n` |
| Fetching data or handling offline fallbacks | `smart-recipe-planner-offline` |

---

## CRITICAL RULES - NON-NEGOTIABLE

### React

- ALWAYS: `import { useState, useEffect } from "react"`
- NEVER: `import React`, `import * as React`, `import React as *`
- NEVER: `useMemo`, `useCallback` (React Compiler handles optimization)

### Types

- ALWAYS: `const X = { A: "a", B: "b" } as const; type T = typeof X[keyof typeof X]`
- NEVER: `type T = "a" | "b"`

### Interfaces

- ALWAYS: One level depth only; object property → dedicated interface (recursive)
- ALWAYS: Reuse via `extends`
- NEVER: Inline nested objects

### Styling

- Single class: `className="bg-slate-800 text-white"`
- Merge multiple classes: `className={cn(BASE_STYLES, variant && "variant-class")}`
- Dynamic values: `style={{ width: "50%" }}`
- NEVER: `var()` in className, hex colors

### Scope Rule (ABSOLUTE)

- Used 2+ places → `lib/` or `types/` or `hooks/` (components go in `components/{domain}/`)
- Used 1 place → keep local in feature directory
- This determines ALL folder structure decisions

---

## DECISION TREES

### Component Placement

```
New/Existing UI? → shadcn/ui + Tailwind
Used 1 feature? → features/{feature}/components | Used 2+? → components/{domain}/
Needs state/hooks? → "use client" | Server component? → No directive
```

### Code Location

```
Server action → actions/{feature}/{feature}.ts
Data transform → actions/{feature}/{feature}.adapter.ts
Types (shared 2+) → types/{domain}.ts | Types (local 1) → {feature}/types.ts
Utils (shared 2+) → lib/ | Utils (local 1) → {feature}/utils/
Hooks (shared 2+) → hooks/ | Hooks (local 1) → {feature}/hooks.ts
shadcn components → components/shadcn/
```

---

## TECH STACK

Next.js 16 | React 19 | Tailwind 4 | shadcn/ui
Zod 4 | React Hook Form | Zustand 5 | NextAuth | Recharts

---

## QA CHECKLIST BEFORE COMMIT

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] Relevant E2E tests pass
- [ ] All UI states handled (loading, error, empty)
- [ ] No secrets in code
- [ ] Server-side validation present
