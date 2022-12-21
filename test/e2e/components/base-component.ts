import { Locator } from "@playwright/test";

export abstract class BaseComponent<T extends BaseComponent<T>> {

    constructor(protected readonly componentLocator: Locator) {
    }

    protected locator(selector: string): Locator {
        return this.componentLocator.locator(selector);
    }

    async waitFor(): Promise<T> {
        await this.componentLocator.waitFor();
        return this as unknown as T;
    }
}
