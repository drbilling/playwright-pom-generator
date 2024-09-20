import { chromium, Browser, Page, Locator, ElementHandle } from 'playwright';

interface PageObject {
  name: string;
  type: string;
  locator: string;
}

export class PomGenerator {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async initialize() {
    this.browser = await chromium.launch();
    this.page = await this.browser.newPage();
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async generate(url: string): Promise<string> {
    if (!this.browser || !this.page) {
      await this.initialize();
    }

    if (!this.page) {
      throw new Error('Failed to initialize Playwright');
    }

    await this.page.goto(url);

    const title = await this.page.title();
    const pageObjects = await this.identifyPageObjects();

    return this.generatePageObjectModel(title, url, pageObjects);
  }

  private async identifyPageObjects(): Promise<PageObject[]> {
    if (!this.page) {
      throw new Error('Page is not initialized');
    }

    const pageObjects: PageObject[] = [];

    // Identify inputs
    const inputs = await this.page.$$('input:visible, textarea:visible');
    for (const input of inputs) {
      const name = await this.getElementName(input);
      const locator = await this.generateReliableLocator(input);
      pageObjects.push({
        name: this.generateObjectName({ base: name, type: 'input' }),
        type: 'input',
        locator,
      });
    }

    // Identify buttons
    const buttons = await this.page.$$('button:visible, input[type="button"]:visible, input[type="submit"]:visible');
    for (const button of buttons) {
      const name = await this.getElementName(button);
      const locator = await this.generateReliableLocator(button);
      pageObjects.push({
        name: this.generateObjectName({ base: name, type: 'button' }),
        type: 'button',
        locator,
      });
    }

    // Identify links
    const links = await this.page.$$('a:visible');
    for (const link of links) {
      const name = await this.getElementName(link);
      const locator = await this.generateReliableLocator(link);
      pageObjects.push({
        name: this.generateObjectName({ base: name, type: 'link' }),
        type: 'link',
        locator,
      });
    }

    return pageObjects;
  }

  private async getElementName(element: ElementHandle<SVGElement | HTMLElement>): Promise<string> {
    const id = await element.getAttribute('id');
    const name = await element.getAttribute('name');
    const text = await element.innerText();
    return id || name || text || 'Unknown';
  }

  private async generateReliableLocator(element: ElementHandle<SVGElement | HTMLElement>): Promise<string> {
    // Using Playwright's built-in locator strategy
    const locators = [
      await element.evaluate((el) => {
        // This function runs in the browser context
        const getSelector = (e: Element): string | null => {
          if (e.id) return `#${e.id}`;
          if (e.className) return `.${e.className.split(' ').join('.')}`;
          return null;
        };

        const selector = getSelector(el);
        if (selector) return selector;

        const text = el.textContent?.trim();
        if (text) return `text=${text}`;

        const role = el.getAttribute('role');
        if (role) return `[role="${role}"]`;

        return null;
      }),
    ];

    return locators.filter(Boolean)[0] || 'Unknown';
  }

  private generateObjectName({ base, type }: { base: string; type: string; }): string {
    return `${base.replace(/[^a-zA-Z0-9]/g, '')}${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }

  private generatePageObjectModel(title: string, url: string, pageObjects: PageObject[]): string {
    const className = `${title.replace(/[^a-zA-Z0-9]/g, '')}Page`;

    const pageObjectProperties = pageObjects.map(obj => 
      `  ${obj.name} = this.page.locator('${obj.locator}');`
    ).join('\n');

    const pageObjectMethods = pageObjects.map(obj => {
      switch (obj.type) {
        case 'input':
          return `
  async fill${obj.name}(value: string) {
    await this.${obj.name}.fill(value);
  }

  async get${obj.name}Value(): Promise<string> {
    return await this.${obj.name}.inputValue();
  }`;
        case 'button':
        case 'link':
          return `
  async click${obj.name}() {
    await this.${obj.name}.click();
  }`;
        default:
          return '';
      }
    }).join('\n');

    return `
import { Page, Locator } from '@playwright/test';

export class ${className} {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('${url}');
  }

${pageObjectProperties}

${pageObjectMethods}
}`;
  }
} 