---
name: legal-compliance
description: >
  Ensures application changes comply with Terms & Conditions, Privacy Policy (GDPR/ARCO), and data protection standards.
  Trigger: Before merging PRs, when modifying data storage (db/cookies), or adding user-facing disclaimers.
license: Apache-2.0
metadata:
  author: ant-gravity
  version: "1.0"
  scope: [compliance, security, legal]
  auto_invoke:
    - "Release feature to main"
    - "Modify database schema"
    - "Add new cookie"
    - "Modify privacy.astro or terms.astro"
allowed-tools: GrepSearch, ViewFile
---

## 1. Compliance Checklist

Before finalizing a feature or merging to `main`, run this audit:

### A. Data Protection (Privacy Policy)
1. **Minimization**: Are we collecting ONLY necessary data?
2. **Consent**: Do new forms/cookies require explicit user consent?
3. **Storage**: Is sensitive data (PII) stored securely?
   - *Check*: No PII in `localStorage` without encryption?
   - *Check*: No logging of passwords or tokens in console/server logs?
4. **ARCO Rights**: Does the user have a way to Delete/Modify this new data?
   - *Example*: If adding `pantryItems`, can the user delete them? (Yes/No)

### B. Terms & Conditions (Liability)
1. **AI Disclaimers**: If adding AI features, is the "AS IS" / "Verification Required" disclaimer visible?
2. **User generated content**: If users upload images/text, is the "Rights & Responsibility" clause visible?
3. **Age Verification**: Does the new feature allow restricted access to minors without checks?

## 2. Mandatory Verification Steps

When running this skill, you must verifying the following files:

1. `context/SettingsContext.js` -> Ensure translations for disclaimers exist.
2. `lib/db.ts` or Database Schema -> Ensure no unconsented tracking fields.
3. `middleware.ts` / `headers` -> Ensure Security Headers (CSP, HSTS) are maintained.

## 3. Audit Report Format

If requested, generate a brief report:

```markdown
## ⚖️ Legal Compliance Audit
- [x] **Data Privacy**: No new PII exposed.
- [x] **Consent**: Cookie banner covers new tracking (if any).
- [x] **Disclaimers**: AI disclaimer added to "Magic Generation".
- [x] **Right to Delete**: User can delete their own recipes/pantry items.
```

## 4. Specific Clauses Reference
- **Clause 5.1 (AI)**: "Health & Allergy Warning" -> Must be on all AI recipe generations.
- **Clause 7 (Liability)**: "Software provided AS IS" -> Standard footer/settings link.
- **Privacy Section 3**: "International Transfer" -> Vercel/Neon/Koyeb storage verification.

## 5. Legal Versioning (CRITICAL)

Whenever `privacy.astro` or `terms.astro` are modified, you MUST create a point-in-time backup to maintain a historical record of changes:

1. **Location**: `legal_archive/` (at project root).
2. **Format**: `policy-YYYY-MM-DD.astro` or `terms-YYYY-MM-DD.astro`.
3. **Execution**: Ensure the directory exists before saving the new version.
