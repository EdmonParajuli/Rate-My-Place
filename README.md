# Rate My Place

A two-sided reviews marketplace: regular users discover and review local businesses,
business owners manage listings and respond to reviews. Backend is a GraphQL API
(Node/TypeScript/Apollo/Sequelize/PostgreSQL); frontend hasn't been started yet.

Monorepo: `backend/` (the GraphQL API) and `frontend/` (not yet scaffolded) as two
independent apps, `docs/` shared at the root.

## Getting started

```bash
cd backend
npm install
cp .env.example .env   # fill in DB + JWT + app config
npm run db:migrate
npm run start:dev
```

GraphQL playground/introspection is served at `http://localhost:<PORT>/graphql`.

## Project docs

See [docs/README.md](./docs/README.md) for the full design doc set: product vision
(derived from the Figma prototype), current-state audit, architecture, data model,
roadmap, frontend plan, and testing/CI/security/ops guidance. Start there before
picking up the next piece of work.
