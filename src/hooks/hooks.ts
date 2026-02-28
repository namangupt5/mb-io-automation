import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  AfterStep,
  Status,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { PlaywrightManager } from '../utils/playwrightManager';
import { logger } from '../utils/logger';
import { ENV } from '../config/env';
import * as fs from 'fs';

interface HookWorldContext {
  _scenarioName?: string;
  _stepIndex?: number;
  attach(data: Buffer | string, mediaType: string): void | Promise<void>;
}

/**
 * Hooks - Cucumber lifecycle hooks for browser management,
 * screenshot capture, trace collection, and cleanup.
 */

// Set default step timeout to 60 seconds
setDefaultTimeout(60000);

/**
 * Clear directory contents while preserving the directory itself.
 * Uses try-catch to handle race conditions in parallel execution.
 */
function clearDirectory(dirPath: string): void {
  try {
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true });
      logger.info(`Cleared directory: ${dirPath}`);
    }
  } catch (error) {
    // Ignore errors - may occur in parallel execution race conditions
    logger.info(`Could not clear ${dirPath} (may already be cleared by another worker)`);
  }
}

BeforeAll(async function () {
  logger.info('=== Test Suite Starting ===');
  logger.info('Browser: ' + (process.env.BROWSER || 'chromium'));
  logger.info('Base URL: ' + (process.env.BASE_URL || 'https://mb.io/'));

  // Check if running as first worker (worker 0) or single process
  const workerId = process.env.CUCUMBER_WORKER_ID;
  const isMainWorker = !workerId || workerId === '0';

  // Clear previous test results and logs only on main worker for fresh run
  if (isMainWorker) {
    const clearDirs = ['allure-results', 'test-results', 'logs'];
    for (const dir of clearDirs) {
      clearDirectory(dir);
    }
  }

  const dirs = [
    'test-results/screenshots',
    'test-results/videos',
    'test-results/traces',
    'reports',
    'allure-results',
    'logs',
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }
});

Before(async function (scenario) {
  const world = this as HookWorldContext;
  logger.info('--- Scenario: ' + scenario.pickle.name + ' ---');
  world._scenarioName = scenario.pickle.name;
  world._stepIndex = 0;

  await PlaywrightManager.launchBrowser();
  await PlaywrightManager.createContext();
  await PlaywrightManager.createPage();
});

AfterStep(async function ({ pickleStep, result }) {
  const world = this as HookWorldContext;

  if (!ENV.SCREENSHOT_EACH_STEP) {
    return;
  }

  try {
    const stepIndex = (world._stepIndex || 0) + 1;
    world._stepIndex = stepIndex;
    const scenarioName = world._scenarioName || 'scenario';
    const stepName = pickleStep?.text || `step_${stepIndex}`;
    const status = result?.status || 'UNKNOWN';

    const sanitizedName = `${scenarioName}_${stepIndex}_${status}_${stepName}`
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '');

    const screenshot = await PlaywrightManager.takeScreenshot(sanitizedName);
    await world.attach(screenshot, 'image/png');
    logger.info(`Step screenshot attached: ${stepIndex} - ${stepName}`);
  } catch (error) {
    logger.warn('Failed to capture step screenshot: ' + error);
  }
});

After(async function (scenario) {
  const scenarioName = scenario.pickle.name;
  let tracePath: string | null = null;

  if (scenario.result?.status === Status.FAILED) {
    logger.error('Scenario FAILED: ' + scenarioName);

    try {
      const screenshot = await PlaywrightManager.takeScreenshot(scenarioName.replace(/\s+/g, '_'));
      this.attach(screenshot, 'image/png');
      logger.info('Screenshot attached to report');
    } catch (error) {
      logger.warn('Failed to capture screenshot: ' + error);
    }
  } else {
    logger.info('Scenario PASSED: ' + scenarioName);
  }

  try {
    tracePath = await PlaywrightManager.saveTrace(scenarioName);
  } catch (error) {
    logger.warn('Failed to save trace: ' + error);
  }

  if (scenario.result?.status === Status.FAILED && tracePath && fs.existsSync(tracePath)) {
    try {
      const traceBuffer = fs.readFileSync(tracePath);
      this.attach(traceBuffer, 'application/zip');
      logger.info('Trace attached to report');
    } catch (error) {
      logger.warn('Failed to attach trace: ' + error);
    }
  }

  await PlaywrightManager.closePage();
  await PlaywrightManager.closeContext();
});

AfterAll(async function () {
  logger.info('=== Test Suite Completed ===');
  await PlaywrightManager.cleanup();
});
