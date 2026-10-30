# Repository Guidelines

## Project Structure & Module Organization

This is an Angular 21 application using standalone components, signals, Angular Material 3, and SCSS.

- `src/app/core/`: authentication, guards, interceptors, layout, and infrastructure services.
- `src/app/modules/`: features such as `usuarios`, `login`, `dashboard`, and `config`. Larger features separate `pages/`, `components/`, `services/`, and `models/`.
- `src/app/shared/`: reusable models, pipes, and services. Move cross-feature code here or into `core` instead of importing one feature into another.
- `src/environments/`: build-specific API configuration; `public/`: static assets.
- Tests live beside their implementation as `*.spec.ts`. Docker and Nginx configuration lives in `.docker/`; CI lives in `.github/workflows/ci.yml`.

## Build, Test, and Development Commands

Use Node.js 24, matching CI, and npm (pinned in `package.json`).

- `npm ci`: install dependencies from the lockfile.
- `npm start`: serve locally at `http://localhost:4200` with development configuration.
- `npm run watch`: rebuild continuously with development settings.
- `npm run lint`: check TypeScript and Angular templates with ESLint.
- `npm test`: run Angular's Vitest suite.
- `npm test -- --watch=false`: run tests once, as in CI.
- `npm run build`: produce the production bundle in `dist/coeur-web/browser`.

## Coding Style & Naming Conventions

Use four-space indentation, UTF-8, and final newlines per `.editorconfig`. Prettier uses single quotes and a 100-character print width. Keep TypeScript strict and follow the Angular/TypeScript ESLint rules, including template accessibility checks.

Use kebab-case filenames with descriptive suffixes, such as `user-list.component.ts` and `user.service.ts`. Component selectors use `app-` plus kebab-case; directive selectors use the `app` prefix with camelCase. Prefer standalone components and signals for UI state. Use configured aliases such as `@core/*`, `@shared/*`, and `@env`.

## Testing Guidelines

Use Vitest and Angular `TestBed`. Cover meaningful behavior, API failure paths, and loading states when changing services or components. Use `vi.fn()` for mocks and signal-based dependency stubs where appropriate. No numeric coverage threshold is configured. Run lint, non-watch tests, and the production build before submitting.

## Commit & Pull Request Guidelines

Follow existing Conventional Commit messages: `feat(usuarios): ...`, `refactor(usuarios): ...`, or `fix: ...`. Recent descriptions are in Portuguese. Keep each commit focused.

PRs should describe the behavior changed, link relevant issues, report validation, and include screenshots for UI changes. CI runs lint, tests, and builds for PRs targeting `main` or `development`.

## Configuration Notes

Configure API URLs through environment files; never commit credentials or tokens. Check implementation before relying on README architecture details: authentication currently uses bearer tokens and refresh handling in `AuthService` and `AuthTokenInterceptor`.
