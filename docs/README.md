# Rate My Place — Project Docs

This folder is the living design/reference doc set for the project. It exists so that
work can pause and resume without losing context on *why* things are built the way they are.

Read in this order:

1. **[01-vision-and-scope.md](./01-vision-and-scope.md)** — what we're building and why, derived from the Figma prototype. The product feature inventory lives here.
2. **[02-current-state.md](./02-current-state.md)** — an honest audit of what exists in the repo today, mapped against the scope in doc 1, plus specific bugs/gaps found while reading the code.
3. **[03-architecture.md](./03-architecture.md)** — the backend architecture and conventions already in place, the data model/ERD (current + proposed), and GraphQL schema design principles.
4. **[04-roadmap.md](./04-roadmap.md)** — the phased plan to go from "auth + places API" to a complete product, backend and frontend together.
5. **[05-frontend-plan.md](./05-frontend-plan.md)** — recommended stack and structure for the frontend, which doesn't exist yet.
6. **[06-quality-and-ops.md](./06-quality-and-ops.md)** — testing, CI/CD, security, observability, deployment. The stuff that makes a project "excellent" instead of "working."

## Keeping this alive

These docs will go stale the moment they stop being updated. Treat doc 2 (current state)
and doc 4 (roadmap) as living documents — update them as part of any PR that finishes a
roadmap item or changes the plan. Docs 1, 3, 5, 6 are more stable (vision, architecture,
stack, ops philosophy) and should only change on a deliberate decision, not a routine PR.
