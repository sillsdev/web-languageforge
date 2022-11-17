// playwright.config.ts
import { FullConfig } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';
import { initUser } from './user-tools';
import { usersToCreate } from './e2e-users';

export default async function globalSetup(config: FullConfig) {
  try {
    for (const project of config.projects) {
      const baseURL = project.use?.baseURL ?? (
        config.webServer.port
          ? `http://localhost:${config.webServer.port}`
          : config.webServer.url
      );
      const browserName = project.use?.browserName ?? project.use?.defaultBrowserType;
      const projectBrowser = (
        browserName === 'chromium' ? chromium :
          browserName === 'firefox' ? firefox :
            browserName === 'webkit' ? webkit :
              chromium
      );
      const browser = await projectBrowser.launch();
      for (const user of usersToCreate) {
        const context = await browser.newContext({ baseURL });
        await initUser(context, user);
        await context.close();
      }
    }
  } catch (error) {
    throw new Error(`Error in Playwright global setup: ${error}.\n`);
  }
}
