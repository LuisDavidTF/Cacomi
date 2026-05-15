---
name: cacomi-daily-content
description: >
  Protocol for daily updates to the recommended menu and other periodic content.
  Trigger: When the user requests a "daily menu update" or modifies `astro_src/constants/recommendedMenu.ts`.
license: Apache-2.0
metadata:
  author: ant-gravity
  version: "1.0"
  scope: [content, deployment, workflow]
---

## 1. Context

During the pre-backend feature phase, the "Recommended Daily Menu" is managed manually via a TypeScript constant. This requires a daily deployment to refresh the feed for all users.

## 2. Target Files

- **Recommended Menu**: `astro_src/constants/recommendedMenu.ts`

## 3. Workflow Protocol

Whenever a change is detected in the target files, follow this sequence:

### A. Verification
1. Ensure the `RECOMMENDED_DAILY_MENU` array contains exactly **5 recipes** (standard daily structure).
2. Verify all `recipeUUID`s and `imageUrl`s are valid and existing.
3. Check that `mealType` covers the full range (BREAKFAST, LUNCH, DINNER, and 2 SNACKs).

### B. Commit Standard
Use the following conventional commit format:
`feat(content): update daily recommended menu for YYYY-MM-DD`

### C. Deployment Branching
1. Create a temporary branch: `feat/daily-menu-update-YYYY-MM-DD`.
2. Commit the changes.
3. Merge into `main` using fast-forward.
4. Push to `origin main` to trigger CI/CD deployment.

## 4. Automation Template

When the user says "actualiza el menú", automatically perform the git sequence above using the current local date.

```powershell
git checkout -b feat/daily-menu-update-$(Get-Date -Format "yyyy-MM-dd")
git add astro_src/constants/recommendedMenu.ts
git commit -m "feat(content): update daily recommended menu for $(Get-Date -Format "yyyy-MM-dd")"
git checkout main
git merge feat/daily-menu-update-$(Get-Date -Format "yyyy-MM-dd")
git push origin main
```
