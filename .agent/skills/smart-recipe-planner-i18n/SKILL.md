---
name: smart-recipe-planner-i18n
description: Reactive Translation (i18n) and hardcoded text standards for Smart Recipe Planner.
---

# Reactive Translation (i18n) Pattern

Smart Recipe Planner supports multiple languages and uses a **reactive `t` object** provided by a Zustand store via React Context.

## Core Rules

1. **NO Hardcoded Strings in Components**: Always check if a relevant translated string exists. If not, add the key to the `SettingsContext.jsx` file rather than hardcoding it in the component.
2. **Accessing Translations**: Use the `useSettings` hook to load translations.
3. **Safe Access & Fallbacks**: Always use optional chaining and a robust fallback text when referring to deep translation keys, especially for translations that might not exist in all languages yet.

## Adding New Translations

1. Open `context/SettingsContext.jsx`.
2. Locate the main translation dictionary (`S` object).
3. Inside `es` (Spanish), `en` (English), and `fr` (French), add the new translation key logically grouped (e.g., inside `common`, `auth`, `feed`, `settings`, etc.).
4. Keep the keys consistent across all languages.

## Component Implementation

### In React Components (Next.js & Astro Islands):

```jsx
import { useSettings } from '@context/SettingsContext';

export function ExampleComponent() {
    const { t } = useSettings();

    // GOOD: Reactive and safe fallback
    return (
        <button>{t.common?.save || 'Guardar'}</button>
    );

    // BAD: Hardcoded text
    // return <button>Guardar</button>;
}
```

### In Astro Pages/Components (Static Server):

Astro files `.astro` run on the server and do not directly subscribe to the client-side Zustand store.

If an Astro page must display reactive translation strings (e.g., the 404 page or Policy pages), **extract the translated elements into a React Client Component** (`"use client"`) and inject it into the Astro page using the `client:load` directive.

```astro
---
import { TranslatedComponent } from '@components/TranslatedComponent';
---

<!-- Ensure it runs reactively on the client -->
<TranslatedComponent client:load />
```

## Toasts and Alerts

Toast notifications must also be translated:

```javascript
import { useSettings } from '@context/SettingsContext';
import { useToast } from '@context/ToastContext';

export function useExampleHook() {
   const { t } = useSettings();
   const { showToast } = useToast();

   const doAction = () => {
       showToast(t.common?.success || 'Operación exitosa', 'success');
   };
}
```
