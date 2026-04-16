```
---
name: react-19
description: >
  React 19 patterns with React Compiler.
  Trigger: When writing| React 18 | 19.1 | Async components, React Compiler (no useMemo/useCallback) |
| Next.js | Astro 6 | Moved from Next.js App Router to Astro SSR |
| NextUI | HeroUI 2.8.4 | Package rename only, same API |
license: Apache-2.0
metadata:
  author: prowler-cloud
  version: "1.0"
  scope: [root, ui]
  auto_invoke: "Writing React components"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task
---

## No Manual Memoization (REQUIRED)

```typescript
// ✅ React Compiler handles optimization automatically
function Component({ items }) {
  const filtered = items.filter(x => x.active);
  const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name));

  const handleClick = (id) => {
    console.log(id);
  };

  return <List items={sorted} onClick={handleClick} />;
}

// ❌ NEVER: Manual memoization
const filtered = useMemo(() => items.filter(x => x.active), [items]);
const handleClick = useCallback((id) => console.log(id), []);
```

## Imports (REQUIRED)

```typescript
// ✅ ALWAYS: Named imports
import { useState, useEffect, useRef } from "react";

// ❌ NEVER
import React from "react";
import * as React from "react";
```

## Server Components First

```typescript
// ✅ Server Component (default) - no directive
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />;
}

// ✅ Client Component - only when needed
"use client";
export function Interactive() {
  const [state, setState] = useState(false);
  return <button onClick={() => setState(!state)}>Toggle</button>;
}
```

## When to use "use client"

- useState, useEffect, useRef, useContext
- Event handlers (onClick, onChange)
- Browser APIs (window, localStorage)

## use() Hook

```typescript
import { use } from "react";

// Read promises (suspends until resolved)
function Comments({ promise }) {
  const comments = use(promise);
  return comments.map(c => <div key={c.id}>{c.text}</div>);
}

// Conditional context (not possible with useContext!)
function Theme({ showTheme }) {
  if (showTheme) {
    const theme = use(ThemeContext);
    return <div style={{ color: theme.primary }}>Themed</div>;
  }
  return <div>Plain</div>;
}
```

## Actions & useActionState

```typescript
"use server";
async function submitForm(formData: FormData) {
  await saveToDatabase(formData);
  revalidatePath("/");
}

// With pending state
import { useActionState } from "react";

function Form() {
  const [state, action, isPending] = useActionState(submitForm, null);
  return (
    <form action={action}>
      <button disabled={isPending}>
        {isPending ? "Saving..." : "Save"}
      </button>
    </form>
  );
}
```

## ref as Prop (No forwardRef)

```typescript
// ✅ React 19: ref is just a prop
function Input({ ref, ...props }) {
  return <input ref={ref} {...props} />;
}

// ❌ Old way (unnecessary now)
const Input = forwardRef((props, ref) => <input ref={ref} {...props} />);
```

---

## Stale Closures in Timers — Stable Ref Pattern (REQUIRED)

When you schedule a `setTimeout` or `setInterval` inside a `useCallback`, the callback captures the function references **at the time the closure was created**. If React recreates callbacks between the time the timer is scheduled and when it fires, the stale closure will run the old version.

```typescript
// ❌ NEVER: capture the callback directly in the closure
const scheduleSync = useCallback(() => {
    setTimeout(() => {
        syncToBackend(); // ← stale if syncToBackend was recreated
    }, 4000);
}, [syncToBackend]); // if syncToBackend changes mid-timer, closure is stale

// ✅ CORRECT: declare a stable ref at the top of the hook, keep it updated
const syncToBackendRef = useRef<() => Promise<void>>(async () => {});
useEffect(() => { syncToBackendRef.current = syncToBackend; }, [syncToBackend]);

const scheduleSync = useCallback(() => {
    setTimeout(() => {
        syncToBackendRef.current(); // ← always calls the latest version
    }, 4000);
}, []); // no longer depends on syncToBackend
```

> [!CAUTION]
> **AVOID** capturing `useCallback` functions directly inside `setTimeout`/`setInterval` closures.
> **BECAUSE** if the callback's identity changes (due to dep change) between scheduling and firing, the timer still executes the **old stale closure**, which may have outdated state like `isAuthenticated = false`.
> **CORRECT APPROACH**: Declare a `useRef` of the same type, update it via `useEffect([dep])`, and call `ref.current()` inside the timer. This always calls the latest version regardless of re-renders.

---

## useEffect Cleanup — Unmount vs Dep Change (REQUIRED)

A `useEffect`'s **cleanup function runs in two situations**:
1. When the component **actually unmounts** (desired)
2. Before the effect **re-runs** because a dependency changed (often undesired)

This is the source of "false-positive unmount" bugs.

```typescript
// ❌ BUG: cleanup fires every time syncToBackend recreates (dep change)
const isUnmounting = useRef(false);
useEffect(() => {
    return () => {
        isUnmounting.current = true; // ← set permanently on EVERY dep change!
        syncToBackend();
    };
}, [syncToBackend]); // cleanup runs when syncToBackend recreates, not only on unmount

// ✅ CORRECT: use [] so cleanup only runs once on actual unmount
// use a stable ref inside so you still call the latest callback version
useEffect(() => {
    return () => {
        isUnmounting.current = true;
        syncToBackendRef.current(); // stable ref, no deps needed
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // only unmount
```

> [!CAUTION]
> **AVOID** using non-empty deps arrays in `useEffect` whose cleanup sets permanent flags like `isUnmounting = true` or unregisters listeners meant to last the full component lifetime.
> **BECAUSE** React runs that cleanup function not only on unmount but **before every re-run** of the effect. Any side effect in the cleanup (like setting a boolean flag) will execute on every dependency change, permanently polluting state.
> **CORRECT APPROACH**: Use `[]` for effects whose cleanup should only run on unmount. Inside the cleanup, access dynamic values via **stable refs** (updated by separate `useEffect([dep])` calls) rather than including them in the deps of the outer effect.

---

## Observables and Conditionally Rendered DOM Nodes (REQUIRED)

When attaching generic observers (like `IntersectionObserver`, `ResizeObserver`) to a DOM ref inside a `useEffect`, you must ensure that the observer is re-attached if the DOM element mounts or unmounts conditionally.

```typescript
// ❌ BUG: Observer breaks if `isLoading` unmounts the node, and it remounts when `false`.
// The effect won't re-run to re-attach the observer because `isLoading` is missing from deps.
useEffect(() => {
    if (status !== 'success') return;
    const observer = new IntersectionObserver(() => { /* ... */ });
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
}, [status]); // Missing `isLoading`

// ✅ CORRECT: Add `isLoading` to track the lifecycle of the conditional node
useEffect(() => {
    // ...
}, [status, isLoading]);
```

> [!CAUTION]
> **AVOID** omitting state variables (like `isLoading`) from `useEffect` dependencies if those variables govern the conditional rendering of the DOM node you are trying to observe.
> **BECAUSE** when the condition hides and then restores the node, the DOM element is destroyed and recreated. If the effect doesn't re-run, React will not attach the observer to the newly created element, breaking interactions like infinite scrolling.
> **CORRECT APPROACH**: Include any state variable that causes the target DOM node to mount/unmount in the dependency array of the `useEffect` that initializes the observer.
