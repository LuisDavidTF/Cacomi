---
name: smart-recipe-planner-git
description: >
  Git workflow standards, conventional commits, and Pull Request management.
  Trigger: When creating commits, writing PR descriptions, managing branches, or verifying code before push (CI simulation).
license: Apache-2.0
metadata:
  author: ant-gravity
  version: "1.0"
  scope: [root]
  auto_invoke:
    - "Create a PR with gh pr create"
    - "Fill PR template"
    - "Review PR requirements"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, WebFetch, WebSearch, Task, RunCommand
---

## Conventional Commits

**Format**: `<type>[scope]: <description>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting, missing semi-colons (no code change)
- `refactor`: Refactoring code (no API change)
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Build/tool updates

**Examples**:
- `feat(auth): add login page component`
- `fix(api): handle 404 error in recipe fetch`
- `docs(readme): update installation instructions`

## Pull Request Guidelines

When asking the agent to create or manage a PR:

1.  **Branch Naming**:
    -   `feat/feature-name`
    -   `fix/bug-name`
    -   `chore/task-name`

2.  **Description Template**:
    When writing a PR description, include:
    -   **Summary**: What does this change?
    -   **Type**: (Feat/Fix/Refactor/...)
    -   **Testing**: How was this tested?
    -   **Screenshots**: (If UI)

3.  **Local CI/Verification (Pre-Push)**:
    Before pushing or creating a PR, ALWAYS run:
    ```bash
    npm run lint
    npm run typecheck
    # If UI changes:
    # npm run test:e2e
    ```

## CLI Workflow (gh)

If the `gh` CLI is available, use it to streamline flows:

```bash
# Check status
gh pr status

# Create PR
gh pr create --title "feat(user): add profile page" --body-file description.md

```bash
# View current PR
gh pr view --web
```

## Mandatory Deployment Protocol

> [!IMPORTANT]
> **NEVER push to the `main` branch or perform any production deployment unless the user explicitly types the command: "Despliega cambios".**
> 
> This rule is strict and must be followed regardless of the task completion status. No automatic deployments are allowed.
