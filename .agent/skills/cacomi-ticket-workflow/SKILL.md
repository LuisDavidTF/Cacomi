---
name: cacomi-ticket-workflow
description: >
  Standardized workflow for ticket-based development.
  Trigger: When starting a new ticket, finishing a ticket, or completing a feature/module.
license: Apache-2.0
metadata:
  author: ant-gravity
  version: "1.0"
  scope: [git]
  auto_invoke:
    - "Start a new ticket"
    - "Finish a ticket"
    - "Release feature to main"
allowed-tools: RunCommand, Git
---

## 1. Branch Naming Convention

When starting a ticket, create a branch from `dev` (create `dev` from `main` if it doesn't exist).

**Format**: `<type>/<TICKET-ID>-<description>`

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance/Setup
- `refactor`: Code restructuring

**Examples**:
- `feat/CSF-101-login-page`
- `fix/CSF-105-header-alignment`
- `chore/CSF-001-setup-eslint`

**Command**:
```bash
git checkout dev
git pull origin dev
git checkout -b feat/CSF-123-description
```

## 2. Commit Messages

Follow the `cacomi-git` skill for commit messages.
**Format**: `<type>(<scope>): <description>`

## 3. Workflow Lifecycle

### A. Start Ticket
1.  Ensure you are on `dev`.
2.  Create the standardized branch.

### B. Development
1.  Make periodic commits following conventional commits.
2.  Run tests locally.

### C. Finish Ticket (Merge to Dev)
When the ticket is complete:
1.  Switch to `dev`.
2.  Pull latest changes.
3.  Merge the ticket branch.
4.  Push `dev`.

```bash
git checkout dev
git pull origin dev
git merge --no-ff feat/CSF-123-description
git push origin dev
```

### D. Feature/Module Complete (PR to Main)
When a full feature or module is completed on `dev`:
1.  **Legal Audit**: Run the `legal-compliance` skill to verify T&C and Privacy adherence.
2.  Create a Pull Request from `dev` to `main`.
3.  Title: `Release: <Feature Name> (Module <X>)`
4.  Description: List of included tickets/changes.

```bash
gh pr create --base main --head dev --title "Release: User Auth Module" --body "Includes tickets CSF-101, CSF-102... Verified Legal Compliance."
```
