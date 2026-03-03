---
name: learning-loop
description: Protocol for QA, error verification, and skill evolution to prevent recurring bugs.
---

# Learning Loop & Quality Assurance

This skill defines the protocol for verifying fixes and updating the knowledge base to prevent future errors.

## 1. Verification Protocol
**Trigger**: Immediately after applying a fix for a reported or discovered error (compiler error, runtime crash, logic bug).

**Action**:
1. You **MUST** ask the user to manually verify the fix. Draft a message explicitly saying: *"Please confirm if the fix works so we can proceed with the learning-loop, or let me know what new errors appear in the console/logs."*
2. Wait for the user's confirmation. DO NOT execute the learning loop until the user explicitly says it works.

## 2. Skill Evolution (The "Clause")
**Trigger**: User confirms the fix worked. Note: If the user says "it works, now do X", you MUST execute the learning loop for the fix BEFORE starting task X.

**Action**:
1. Identify the **Root Cause Skill**. (e.g., likely `tailwind-4` for styling issues, `typescript` for type errors, or `astro-6` for architecture issues).
2. If no specific skill fits, update the most relevant `AGENTS.md` or ask to create a new skill.
3. **Append** a new rule to the documentation using the strict `[!CAUTION]` format below.
4. Inform the user what you just added/modified so they can corroborate the learning loop executed successfully.

## 3. Rule Format (Strict)
You must document **WHY** it failed and **HOW** to solve it correcty.

```markdown
> [!CAUTION]
> **AVOID** [Specific Pattern/Code]
> **BECAUSE** [Reason/Context/Side-effect]
> **CORRECT APPROACH**: [Solution/Best Practice]
```

### Example
If the error was an invalid hook call inside a Server Component:

**Target File**: `.agent/skills/nextjs-16/SKILL.md`

**Append**:
```markdown
> [!CAUTION]
> **AVOID** using React hooks (`useState`, `useEffect`) directly in Server Components.
> **BECAUSE** Next.js 16 defaults to Server Components where client-only hooks cannot run, causing a runtime error.
> **CORRECT APPROACH**: Add `"use client"` at the very top of the file, or extract the interactive piece into a smaller Client Component.
```

## 3. Execution
When you encounter a similar task in the future, **ALWAYS** check the relevant `SKILL.md` for these `[!CAUTION]` blocks before generating code.

## 4. Skill Categorization (Modularity)
The protocol does not store everything in a single giant file. By separating content into folders (e.g., `.agent/skills/nextjs-16/`, `.agent/skills/tailwind-4/`, `.agent/skills/typescript/`), information is fragmented into digestible pieces.

**Benefit**: I only read the "Skill" relevant to the current task, saving memory and processing time.

## 5. Rule Refactoring
When a list of `[!CAUTION]` blocks becomes too long, the protocol evolves:

**From Rules to Patterns**: If there are 10 distinct errors about handling dates, instead of 10 separate warnings, create a single "Standard Operating Procedure" (SOP) in the `SKILL.md` summarizing the definitive way to work with dates.

**Hierarchy**: Critical rules (system-breaking) remain at the top; subtler ones are archived or integrated into style guides.

## 6. The Project "Brain"
As the project grows, the repository becomes an engineering asset.

**For You**: It serves as an encyclopedia of *why* certain technical decisions were made (historical context).

**For New Developers (or IAs)**: Instead of weeks of training, they simply read the Skills to understand exactly what **NOT** to do.

## 7. Missing Skill Clause
If a problem arises that does not fit into any existing skill, it likely indicates a missing skill category.

**Action**:
1. Identify that the issue requires a new skill.
2. **Consult the User**: Ask for permission before creating a new skill.
3. Upon approval, create the skill and document the error/rule within it.
4. **LINK THE SKILL**: You MUST edit the relevant specific component agent file (e.g., `ui/AGENTS.md`) to append the new skill to the `Skills Reference` and `Auto-invoke Skills` tables.
5. **NEW AGENT CREATION**: If there is no suitable `AGENTS.md` file for the new skill (e.g., it belongs to a completely new domain like `backend/` or `cron/`), you must create a new `AGENTS.md` file in that directory outlining its specific rules. Then, you MUST link this newly created `AGENTS.md` file into the root `GEMINI.md` file. Do NOT bloat the root `GEMINI.md` with every micro-skill. `GEMINI.md` routes to `AGENTS.md` (Domain Agents), and `AGENTS.md` routes to `SKILL.md` (Micro-skills).
