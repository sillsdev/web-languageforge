import { chromium, firefox, FullConfig, webkit } from '@playwright/test';
import { users } from '../constants';
import { initE2EUser } from './user-tools';

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
      for (const user of Object.values(users)) {
        const context = await browser.newContext({ baseURL });
        const page = await context.newPage();
        await initE2EUser(page, user);
        await context.close();
      }
    }
  } catch (error) {
    throw new Error(`Error in Playwright global setup: ${error}.\n`);
  }
}
