# Repository Guidelines

## Project Structure & Module Organization

Primary application code lives in `src/`. `src/app` holds App Router routes and server actions, `src/components` stores reusable UI in PascalCase directories, `src/lib` centralizes shared business logic, `src/stores` defines Zustand stores, `src/locales` contains translations (EN/AR/FR), and `src/content` maintains narrative copy. Database schema lives in `prisma/schema.prisma`; update it alongside any API changes. Static assets and Tailwind styles sit under `public/`. Automation utilities live in `scripts/` (e.g., `update-titles.js`). Unit tests belong either beside their subject or in `tests/` when cross-cutting.

## Build, Test, and Development Commands

- `pnpm dev` – launches the Next.js 15 dev server with hot reload.
- `pnpm build` – generates Prisma client then compiles the production bundle.
- `pnpm lint` / `pnpm lint:fix` – runs ESLint with the shared accessibility rules.
- `pnpm test`, `pnpm test:watch`, `pnpm test:coverage` – executes Vitest suites (happy-dom environment).
- `pnpm typecheck` – verifies TypeScript signatures without emitting files.
- `pnpm db:generate` / `pnpm db:studio` – regenerates Prisma client or inspects data.

## Coding Style & Naming Conventions

Use TypeScript across the app with Prettier enforcing 2-space indentation, 120-character wrap, and double quotes. Keep React component files PascalCase (e.g., `SessionPanel.tsx`) and hooks camelCase (`useSessionStore.ts`). Favor named exports except where Next.js routing requires default exports. Sort Tailwind utilities logically; Prettier’s Tailwind plugin handles order. ESLint already ignores generated code-do not disable rules in source without a comment explaining why.

## Testing Guidelines

Vitest is the default runner; place specs alongside the module or in `tests/` when sharing fixtures. Name files `<feature>.spec.ts` and use `describe` blocks mirroring the user-facing behavior. For UI logic rely on Testing Library helpers available through `src/test-setup.ts`. Target at least smoke coverage for new routes and stores, and extend `test:coverage` thresholds when adding critical flows. Add Playwright scenarios when behavior spans multiple pages.

## Commit & Pull Request Guidelines

Commits remain short and imperative (`updated content layout`); keep scopes narrow and avoid batching unrelated files. Reference Jira or Linear identifiers in the subject when available. Every PR should include: summary of intent, screenshots for UI changes, affected env vars, test plan with exact commands run, and a note on Supabase migrations if applicable. Request review before merging; feature branches target `develop`.

## Security & Configuration Tips

Never commit secrets-populate `.env.local` from the shared vault and keep encryption keys out of git. When touching CBT or AI pipelines, audit `src/lib/ai/mirael-core/v2/` for prompt regressions and mention mitigations in the PR. Supabase schema updates must ship with migration files and a rollback note.
