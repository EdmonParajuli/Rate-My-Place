# Issue tracker: Local Markdown

Issues and PRDs for this repo live as markdown files in `.scratch/`. Chosen over
GitHub Issues on 2026-08-11 to keep planning artifacts (wayfinder maps/tickets,
PRDs) off the repo's GitHub Issues, which aren't otherwise in use — actual code
review still happens via GitHub PRs as it always has.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`
- The PRD is `.scratch/<feature-slug>/PRD.md`
- Implementation issues are `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01`
- Triage state is recorded as a `Status:` line near the top of each issue file (see `triage-labels.md` for the role strings)
- Comments and conversation history append to the bottom of the file under a `## Comments` heading

## When a skill says "publish to the issue tracker"

Create a new file under `.scratch/<feature-slug>/` (creating the directory if needed).

## When a skill says "fetch the relevant ticket"

Read the file at the referenced path. The user will normally pass the path or the issue number directly.

## Wayfinding operations

A wayfinder effort gets its own directory: `.scratch/<effort-slug>/`.

- **The map** is `.scratch/<effort-slug>/MAP.md` — the file itself is the map, no
  separate label needed.
- **Tickets** are `.scratch/<effort-slug>/tickets/<NN>-<slug>.md`, numbered from `01`
  in creation order. Each ticket file starts with a small header block:

  ```markdown
  # <Ticket title>

  Type: research | prototype | grilling | task
  Status: open | closed
  Claimed by: (none) | <name>
  Blocked by: (none) | [<ticket title>](../tickets/<NN>-<slug>.md), ...

  ## Question

  <the decision or investigation this ticket resolves>

  ## Resolution

  <filled in on close>

  ## Comments

  <conversation history, if any>
  ```

- **Claiming**: set `Claimed by:` to the working session's identity before starting
  work on a ticket.
- **Blocking**: no native dependency graph in flat files, so `Blocked by:` is the
  body convention — a ticket is unblocked when every ticket it names is
  `Status: closed`.
- **The frontier**: open, unblocked, unclaimed tickets. To find it, list
  `.scratch/<effort-slug>/tickets/*.md`, keep `Status: open` and `Claimed by: (none)`,
  and drop any whose `Blocked by:` list isn't all-closed.
- **Resolving a ticket**: fill in `## Resolution`, flip `Status:` to `closed`, then
  add a one-line pointer under the map's `## Decisions so far`.
