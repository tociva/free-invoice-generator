import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import serveHandler from 'serve-handler';
import puppeteer from 'puppeteer';
import { isKnownNonFatalBrowserError } from './prerender-diagnostics.mjs';

const DIST_DIR = process.env.PRERENDER_DIST ?? 'dist/free-invoice-generator/browser';
const ROUTES_FILE = process.env.PRERENDER_ROUTES_FILE ?? 'tools/prerender/prerender-routes.txt';
const REQUESTED_PORT = Number(process.env.PUPPETEER_PRERENDER_PORT ?? 0);
const HOST = '127.0.0.1';
const NAVIGATION_TIMEOUT_MS = Number(process.env.PUPPETEER_PRERENDER_NAV_TIMEOUT_MS ?? 120000);
const LAUNCH_TIMEOUT_MS = Number(process.env.PUPPETEER_PRERENDER_LAUNCH_TIMEOUT_MS ?? 120000);
const READY_TIMEOUT_MS = Number(process.env.PUPPETEER_PRERENDER_READY_TIMEOUT_MS ?? 120000);
const READY_POLL_INTERVAL_MS = Number(
  process.env.PUPPETEER_PRERENDER_READY_POLL_INTERVAL_MS ?? 100,
);
const POST_GOTO_WAIT_MS = Number(process.env.PUPPETEER_PRERENDER_POST_GOTO_WAIT_MS ?? 0);
const PRERENDER_CONCURRENCY = Number(process.env.PUPPETEER_PRERENDER_CONCURRENCY ?? 4);
const ROUTE_RETRIES = Number(process.env.PUPPETEER_PRERENDER_ROUTE_RETRIES ?? 1);
const MAX_DIAGNOSTIC_ENTRIES = 20;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const pageDiagnostics = new WeakMap();

const createPageDiagnostics = () => {
  let signalFatalError;
  const fatalErrorSignal = new Promise((resolve) => {
    signalFatalError = resolve;
  });

  return {
    entries: [],
    fatalError: null,
    fatalErrorSignal,
    route: null,
    signalFatalError,
  };
};

const resetPageDiagnostics = (page, route = null) => {
  const diagnostics = createPageDiagnostics();
  diagnostics.route = route;
  pageDiagnostics.set(page, diagnostics);
  return diagnostics;
};

const recordPageDiagnostic = (page, type, message, { fatal = false } = {}) => {
  const diagnostics = pageDiagnostics.get(page) ?? resetPageDiagnostics(page);
  diagnostics.entries.push({ message, type });
  if (diagnostics.entries.length > MAX_DIAGNOSTIC_ENTRIES) {
    diagnostics.entries.shift();
  }

  if (fatal && diagnostics.fatalError === null) {
    diagnostics.fatalError = new Error(`${type}: ${message}`);
    diagnostics.signalFatalError(diagnostics.fatalError);
  }
};

const assertNonNegativeNumber = (name, value) => {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number. Received: ${value}`);
  }
};

const assertPositiveInteger = (name, value) => {
  if (!Number.isInteger(value) || value < 1) {
    throw new Error(`${name} must be a positive integer. Received: ${value}`);
  }
};

const assertNonNegativeInteger = (name, value) => {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer. Received: ${value}`);
  }
};

if (!Number.isInteger(REQUESTED_PORT) || REQUESTED_PORT < 0 || REQUESTED_PORT > 65535) {
  throw new Error(
    `PUPPETEER_PRERENDER_PORT must be an integer between 0 and 65535. Received: ${REQUESTED_PORT}`,
  );
}
assertPositiveInteger('PUPPETEER_PRERENDER_NAV_TIMEOUT_MS', NAVIGATION_TIMEOUT_MS);
assertPositiveInteger('PUPPETEER_PRERENDER_LAUNCH_TIMEOUT_MS', LAUNCH_TIMEOUT_MS);
assertPositiveInteger('PUPPETEER_PRERENDER_READY_TIMEOUT_MS', READY_TIMEOUT_MS);
assertPositiveInteger('PUPPETEER_PRERENDER_READY_POLL_INTERVAL_MS', READY_POLL_INTERVAL_MS);
assertNonNegativeNumber('PUPPETEER_PRERENDER_POST_GOTO_WAIT_MS', POST_GOTO_WAIT_MS);
assertPositiveInteger('PUPPETEER_PRERENDER_CONCURRENCY', PRERENDER_CONCURRENCY);
assertNonNegativeInteger('PUPPETEER_PRERENDER_ROUTE_RETRIES', ROUTE_RETRIES);

const indexHtmlPath = path.join(DIST_DIR, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  throw new Error(`index.html not found at ${indexHtmlPath}. Run "pnpm build" first.`);
}
const indexHtml = fs.readFileSync(indexHtmlPath);

const readRouteList = (filePath) =>
  fs
    .readFileSync(filePath, 'utf8')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((route) => (route.startsWith('/') ? route : `/${route}`));

const templateLibraryRoutes = () => {
  const catalogPath = path.join(DIST_DIR, 'invoice-templates', 'templates.json');
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Template catalog not found at ${catalogPath}.`);
  }

  const groups = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  if (!Array.isArray(groups)) {
    throw new Error(`Template catalog at ${catalogPath} must be an array.`);
  }

  const slugs = new Set();
  for (const group of groups) {
    for (const item of group?.items ?? []) {
      const slug = item?.docs?.slug;
      if (typeof slug === 'string' && slug.trim()) {
        slugs.add(slug.trim());
      }
    }
  }

  return [...slugs].sort().map((slug) => `/docs/template-library/${slug}`);
};

const routes = [...new Set([...readRouteList(ROUTES_FILE), ...templateLibraryRoutes()])];

if (routes.length === 0) {
  throw new Error(`No prerender routes found in ${ROUTES_FILE}.`);
}

const isAssetRequest = (url) =>
  url === '/favicon.ico' ||
  url.startsWith('/assets/') ||
  url.startsWith('/invoice-templates/') ||
  url.endsWith('.js') ||
  url.endsWith('.css') ||
  url.endsWith('.map') ||
  url.endsWith('.png') ||
  url.endsWith('.jpg') ||
  url.endsWith('.jpeg') ||
  url.endsWith('.svg') ||
  url.endsWith('.webp') ||
  url.endsWith('.woff') ||
  url.endsWith('.woff2') ||
  url.endsWith('.ttf') ||
  url.endsWith('.json') ||
  url.endsWith('.txt') ||
  url.endsWith('.xml') ||
  url.endsWith('.ico');

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://${HOST}`).pathname;

  if (isAssetRequest(url)) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    // serve-handler@6.1.6 leaks its pre-opened file stream on ETag-driven 304 responses.
    return serveHandler(req, res, { etag: false, public: DIST_DIR });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(indexHtml);
});

await new Promise((resolve, reject) => {
  const handleError = (error) => reject(error);
  server.once('error', handleError);
  server.listen(REQUESTED_PORT, HOST, () => {
    server.off('error', handleError);
    resolve();
  });
});

const serverAddress = server.address();
if (serverAddress === null || typeof serverAddress === 'string') {
  throw new Error('Unable to resolve the prerender server address.');
}
const serverPort = serverAddress.port;
console.log(`prerender: server = http://${HOST}:${serverPort}`);

const puppeteerCli = () =>
  path.join(
    process.cwd(),
    'node_modules',
    '.bin',
    process.platform === 'win32' ? 'puppeteer.cmd' : 'puppeteer',
  );

const chromeCandidatesInVersionDir = (versionDir) => [
  path.join(
    versionDir,
    'chrome-mac-arm64',
    'Google Chrome for Testing.app',
    'Contents',
    'MacOS',
    'Google Chrome for Testing',
  ),
  path.join(
    versionDir,
    'chrome-mac-x64',
    'Google Chrome for Testing.app',
    'Contents',
    'MacOS',
    'Google Chrome for Testing',
  ),
  path.join(versionDir, 'chrome-linux64', 'chrome'),
  path.join(versionDir, 'chrome-linux', 'chrome'),
  path.join(versionDir, 'chrome-win64', 'chrome.exe'),
  path.join(versionDir, 'chrome-headless-shell-mac-arm64', 'chrome-headless-shell'),
  path.join(versionDir, 'chrome-headless-shell-mac-x64', 'chrome-headless-shell'),
  path.join(versionDir, 'chrome-headless-shell-linux64', 'chrome-headless-shell'),
];

const findChromeInCache = (cacheDir) => {
  if (!cacheDir || !fs.existsSync(cacheDir)) {
    return null;
  }

  for (const browser of ['chrome', 'chrome-headless-shell']) {
    const root = path.join(cacheDir, browser);
    if (!fs.existsSync(root)) {
      continue;
    }

    const versions = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .sort((left, right) => right.name.localeCompare(left.name, undefined, { numeric: true }));

    for (const version of versions) {
      const versionDir = path.join(root, version.name);
      for (const candidate of chromeCandidatesInVersionDir(versionDir)) {
        if (fs.existsSync(candidate)) {
          return candidate;
        }
      }
    }
  }

  return null;
};

const cacheDirectories = () =>
  [
    process.env.PUPPETEER_CACHE_DIR,
    path.join(os.homedir(), '.cache', 'puppeteer'),
  ].filter((directory, index, all) => directory && all.indexOf(directory) === index);

const resolveInstalledChrome = () => {
  try {
    const executablePath = puppeteer.executablePath();
    if (executablePath && fs.existsSync(executablePath)) {
      return executablePath;
    }
  } catch {
    // Puppeteer throws when the pinned Chrome build is missing from its cache.
  }

  for (const cacheDir of cacheDirectories()) {
    const cachedPath = findChromeInCache(cacheDir);
    if (cachedPath !== null) {
      return cachedPath;
    }
  }

  return null;
};

const installChrome = () => {
  console.log('prerender: Chrome not found, installing...');
  const result = spawnSync(puppeteerCli(), ['browsers', 'install', 'chrome'], {
    encoding: 'utf8',
    env: process.env,
  });
  if (result.stdout) {
    process.stdout.write(result.stdout);
  }
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  if (result.status !== 0) {
    throw new Error(
      'Failed to install Chrome for prerender. Run: pnpm exec puppeteer browsers install chrome',
    );
  }

  const installedFromOutput = result.stdout?.match(/chrome@\S+\s+(\/\S+)/)?.[1];
  if (installedFromOutput && fs.existsSync(installedFromOutput)) {
    return installedFromOutput;
  }

  return null;
};

const ensureChrome = () => {
  const explicitPath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (explicitPath) {
    if (!fs.existsSync(explicitPath)) {
      throw new Error(`PUPPETEER_EXECUTABLE_PATH does not exist: ${explicitPath}`);
    }
    return explicitPath;
  }

  let installedPath = resolveInstalledChrome();
  if (installedPath === null) {
    installedPath = installChrome() ?? resolveInstalledChrome();
  }

  if (installedPath === null) {
    throw new Error(
      'Chrome was installed but Puppeteer still cannot find it. Set PUPPETEER_EXECUTABLE_PATH.',
    );
  }

  return installedPath;
};

const absolutizeAssets = (html) =>
  html.replace(
    /(href|src)=["']([^"']+\.(?:css|js|map|woff2?|ttf|svg|png|jpe?g|webp|ico)(?:\?[^"']*)?)["']/gi,
    (match, attr, value) =>
      value.startsWith('/') ||
      value.startsWith('http') ||
      value.startsWith('//') ||
      value.startsWith('data:')
        ? match
        : `${attr}="/${value}"`,
  );

const configurePage = async (page) => {
  resetPageDiagnostics(page);
  page.setDefaultNavigationTimeout(NAVIGATION_TIMEOUT_MS);
  page.setDefaultTimeout(READY_TIMEOUT_MS);
  await page.setCacheEnabled(true);
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  page.on('console', (message) => {
    if (message.type() === 'error') {
      const text = message.text();
      recordPageDiagnostic(page, 'console.error', text, {
        fatal: !isKnownNonFatalBrowserError(text),
      });
    }
  });
  page.on('error', (error) => {
    recordPageDiagnostic(page, 'page-crash', error.message, { fatal: true });
  });
  page.on('pageerror', (error) => {
    recordPageDiagnostic(page, 'pageerror', error.message, {
      fatal: !isKnownNonFatalBrowserError(error.message),
    });
  });
  page.on('requestfailed', (request) => {
    recordPageDiagnostic(
      page,
      'requestfailed',
      `${request.url()} (${request.failure()?.errorText ?? 'unknown error'})`,
    );
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      recordPageDiagnostic(page, 'http-error', `${response.status()} ${response.url()}`);
    }
  });
  await page.evaluateOnNewDocument(() => {
    globalThis.__INVOICE_GENERATOR_PRERENDER__ = true;
  });
};

const createPage = async (browser) => {
  const page = await browser.newPage();
  await configurePage(page);
  return page;
};

const waitForRenderReady = async (page) => {
  const diagnostics = pageDiagnostics.get(page) ?? resetPageDiagnostics(page);
  const readiness = page
    .waitForFunction(
      () => {
        const routeReady = document.documentElement.dataset['routeReady'];
        const appRoot = document.querySelector('app-root[ng-version]');
        const routeLoading = document.querySelector('[aria-busy="true"]');
        const codeHighlighting = document.querySelector('[data-highlighting="pending"]');

        return (
          routeReady === globalThis.location.pathname &&
          appRoot !== null &&
          routeLoading === null &&
          codeHighlighting === null
        );
      },
      { polling: READY_POLL_INTERVAL_MS, timeout: READY_TIMEOUT_MS },
    )
    .then(() => null);
  const fatalError =
    diagnostics.fatalError ?? (await Promise.race([readiness, diagnostics.fatalErrorSignal]));

  if (fatalError !== null) {
    throw fatalError;
  }

  if (POST_GOTO_WAIT_MS > 0) {
    await sleep(POST_GOTO_WAIT_MS);
  }
};

const describeRenderFailure = async (page, route, error) => {
  const diagnostics = pageDiagnostics.get(page);
  let snapshot = null;

  try {
    snapshot = await page.evaluate(() => ({
      appRootReady: document.querySelector('app-root[ng-version]') !== null,
      busyElements: Array.from(document.querySelectorAll('[aria-busy="true"]')).map((element) => ({
        className: element.getAttribute('class'),
        tagName: element.tagName.toLowerCase(),
      })),
      finalPathname: globalThis.location.pathname,
      highlightingPending: Array.from(
        document.querySelectorAll('[data-highlighting="pending"]'),
      ).map((element) => ({
        className: element.getAttribute('class'),
        tagName: element.tagName.toLowerCase(),
      })),
      routeReady: document.documentElement.dataset['routeReady'] ?? null,
    }));
  } catch (snapshotError) {
    snapshot = { snapshotError: snapshotError?.message ?? String(snapshotError) };
  }

  const details = [
    `requested route: ${route}`,
    `final URL: ${page.url()}`,
    `readiness: ${JSON.stringify(snapshot)}`,
  ];
  if (diagnostics?.entries.length > 0) {
    details.push(`browser diagnostics: ${JSON.stringify(diagnostics.entries)}`);
  }

  return new Error(`${error?.message ?? String(error)}\n${details.join('\n')}`, { cause: error });
};

const renderRoute = async (page, route) => {
  resetPageDiagnostics(page, route);
  const url = `http://${HOST}:${serverPort}${route}`;
  try {
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: NAVIGATION_TIMEOUT_MS,
    });

    if (response === null || !response.ok()) {
      throw new Error(`Navigation returned ${response?.status() ?? 'no response'} for ${route}.`);
    }

    await waitForRenderReady(page);

    const html = absolutizeAssets(await page.content());
    const dir = path.join(DIST_DIR, route === '/' ? '' : route);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
  } catch (error) {
    throw await describeRenderFailure(page, route, error);
  }
};

const closeServer = async () => {
  if (!server.listening) {
    return;
  }

  await new Promise((resolve, reject) => {
    server.close((error) => (error === undefined ? resolve() : reject(error)));
  });
};

let browser;
try {
  const chromeExecutablePath = ensureChrome();
  console.log(`prerender: browser executable = ${chromeExecutablePath}`);

  browser = await puppeteer.launch({
    headless: true,
    timeout: LAUNCH_TIMEOUT_MS,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: chromeExecutablePath,
  });

  const workerCount = Math.min(PRERENDER_CONCURRENCY, routes.length);
  let nextRouteIndex = 0;
  let completedRouteCount = 0;
  let firstFailure = null;

  console.log(`prerender: routes = ${routes.length}, workers = ${workerCount}`);

  const runWorker = async (workerId) => {
    let page = await createPage(browser);

    try {
      while (firstFailure === null) {
        const routeIndex = nextRouteIndex;
        nextRouteIndex += 1;
        if (routeIndex >= routes.length) {
          return;
        }

        const route = routes[routeIndex];
        const startedAt = Date.now();
        const maxAttempts = ROUTE_RETRIES + 1;
        for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
          try {
            await renderRoute(page, route);
            completedRouteCount += 1;
            console.log(
              `[${completedRouteCount}/${routes.length}] prerendered ${route} ` +
                `(${Date.now() - startedAt}ms, worker ${workerId})`,
            );
            break;
          } catch (error) {
            if (attempt === maxAttempts) {
              firstFailure ??= { error, route };
              break;
            }

            console.warn(
              `prerender: ${route} failed on attempt ${attempt}/${maxAttempts}: ` +
                `${error?.message ?? String(error)}; retrying with a fresh page`,
            );
            await page.close();
            page = await createPage(browser);
          }
        }
      }
    } finally {
      await page.close();
    }
  };

  await Promise.all(Array.from({ length: workerCount }, (_, index) => runWorker(index + 1)));

  if (firstFailure !== null) {
    throw new Error(
      `Failed to prerender ${firstFailure.route}: ${firstFailure.error?.message ?? String(firstFailure.error)}`,
      { cause: firstFailure.error },
    );
  }

  console.log(`prerender complete: ${completedRouteCount} routes`);
} finally {
  await browser?.close();
  await closeServer();
}
