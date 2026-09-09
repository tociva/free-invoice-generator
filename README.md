# FreeInvoiceGenerator20

Angular 22 invoice generator using Reactive Forms, NgRx Signal Store, TailNG and Tailwind CSS 4.

Requires Node **>=22.22.3 <23** and **pnpm 10.34.5**. See [migration notes](MIGRATION.md) for dependency compatibility, changes and validation.

## Install dependencies

```bash
pnpm install
```

## Development server

To start a local development server, run:

```bash
pnpm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
pnpm build
```

This will compile your project and store the build artifacts in the `dist/free-invoice-generator/browser/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
pnpm test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
pnpm test:e2e
```

Playwright uses installed Microsoft Edge on Windows and Chromium elsewhere. On Linux, install the test browser with `pnpm exec playwright install --with-deps chromium`. The test command starts the local development server automatically.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
