import type { PlaywrightTestConfig } from '@playwright/test';
import { devices, expect } from '@playwright/test';
import { appUrl, MIN, SEC } from './constants';
import { matchers } from './utils/custom-matchers';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

expect.extend({ ...matchers });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  // Fonts are not rendered correctly in CI screenshots. So screenshots need to be clipped to exclude text.
  snapshotPathTemplate: '{testDir}/__expected-screenshots__/{testFilePath}/{arg}-{projectName}{ext}',

  /* Maximum time one test can run for. For individual slower tests use test.slow(). */
  timeout: 40 * SEC,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5 * SEC,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Global setup for things like logging in users and saving login cookies */
  globalSetup: require.resolve('./global-setup'),
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Our current state management prevents an LF-user from working on different projects simultaneously.
  Instead, we use Playwright's sharding feature to parallelize tests accross multiple environments. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  outputDir: 'test-results', // referenced in pull-request.yml
  reporter: process.env.CI
    ? [['github'], ['list']]
    // Putting the HTML report in a subdirectory of the main output directory results in a warning log
    // stating that it will "lead to artifact loss" but the warning in this case is not accurate
    // pnpx playwright show-report test-results/_html-report
    : [['html', { outputFolder: 'test-results/_html-report', open: 'never' }]],

  reportSlowTests: {
    max: 10,
    threshold: 1 * MIN,
  },

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: appUrl,

    /* See https://playwright.dev/docs/trace-viewer */
    trace: 'on',
    screenshot: 'on',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },

    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },
  ],

  /**
   * This config is intended for starting the application server and waiting for it to be ready.
   * However, it seems preferable to start the application explicitly in the makefile (then we also get the complete build output).
   * So:
   * - In CI we only use this feature to wait until the application is ready.
   * - In dev environments this is a handy fallback for starting the application automatically.
   *
   * `command` has to live until `url` is returning responses.
   * 'docker attach e2e-app' is an os-independent way to make that happen.
   *
   * The environment variable DEBUG=pw:webserver can be used to get full output from `command`.
   */
  webServer: {
    get command() {
      if (process.env.CI) {
        return 'docker attach e2e-app';
      }
      if (!process.env._loggedAppStartup) { // Provide some feedback
        process.env._loggedAppStartup = '1';
        const timeout = (this as any).timeout;
        console.log(`Building and starting e2e-app if not already running (timeout: ${timeout / MIN}m)\n\n`);
      }
      return 'make e2e-app && docker attach e2e-app';
    },
    cwd: '../..', // navigate to makefile
    url: appUrl,
    reuseExistingServer: true,
    timeout: 3 * MIN,
  },
};


export default config;
