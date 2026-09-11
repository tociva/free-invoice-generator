# 🧾 Free Invoice Generator

Angular 22 invoice generator using Reactive Forms, NgRx Signal Store, TailNG and Tailwind CSS 4.

Requires Node **>=22.22.3 <23** and **pnpm 10.34.5**. See [migration notes](MIGRATION.md) for dependency compatibility, changes and validation.

## Install dependencies

```bash
pnpm install
```

## ✨ Features

✅ Completely free and open source  
✅ Simple, user-friendly interface  
✅ Customizable invoice details (client info, items, tax, discounts)  
✅ Automatic calculation of totals and taxes  
✅ PDF generation and download  
✅ Multiple currencies and date formats  
✅ Clean, professional invoice templates  
✅ Works offline (PWA-ready, if configured)  
✅ Mobile-friendly design  

---

## 🚀 Demo

You can try it out here (replace this with your actual link if hosted):

**[Live Demo](https://free-invoice-generator.app)**


## 🛠️ Getting Started

Clone the repository and run it locally:

```bash
pnpm start
```

## ✅ Lint the Code
```
yarn lint
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
