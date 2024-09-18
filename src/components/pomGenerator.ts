// src/components/PomGenerator.ts
import { chromium, Browser, Page, ElementHandle } from 'playwright';

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
    const inputs = await this.page.$$('input[id], input[name]');
    for (const input of inputs) {
      const id = await input.getAttribute('id');
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type') || 'text';
      pageObjects.push({
        name: this.generateObjectName(id || name || 'Unknown', type),
        type: 'input',
        locator: id ? `#${id}` : `input[name="${name}"]`,
      });
    }

    // Identify buttons
    const buttons = await this.page.$$('button, input[type="button"], input[type="submit"]');
    for (const button of buttons) {
      const id = await button.getAttribute('id');
      const text = await button.innerText();
      pageObjects.push({
        name: this.generateObjectName(id || text || 'Unknown', 'button'),
        type: 'button',
        locator: id ? `#${id}` : `text=${text}`,
      });
    }

    // Identify links
    const links = await this.page.$$('a[href]');
    for (const link of links) {
      const id = await link.getAttribute('id');
      const text = await link.innerText();
      pageObjects.push({
        name: this.generateObjectName(id || text || 'Unknown', 'link'),
        type: 'link',
        locator: id ? `#${id}` : `text=${text}`,
      });
    }

    return pageObjects;
  }

  private generateObjectName(base: string, type: string): string {
    return `${base.replace(/[^a-zA-Z0-9]/g, '')}${type.charAt(0).toUpperCase() + type.slice(1)}`;
  }

  private generatePageObjectModel(title: string, url: string, pageObjects: PageObject[]): string {
    const className = `${title.replace(/[^a-zA-Z0-9]/g, '')}Page`;

    const pageObjectProperties = pageObjects.map(obj => 
      `  private ${obj.name}Locator = '${obj.locator}';`
    ).join('\n');

    const pageObjectMethods = pageObjects.map(obj => {
      switch (obj.type) {
        case 'input':
          return `
  async fill${obj.name}(value: string) {
    await this.page.fill(this.${obj.name}Locator, value);
  }

  async get${obj.name}Value(): Promise<string> {
    return await this.page.inputValue(this.${obj.name}Locator);
  }`;
        case 'button':
          return `
  async click${obj.name}() {
    await this.page.click(this.${obj.name}Locator);
  }`;
        case 'link':
          return `
  async click${obj.name}() {
    await this.page.click(this.${obj.name}Locator);
  }

  async get${obj.name}Href(): Promise<string | null> {
    return await this.page.getAttribute(this.${obj.name}Locator, 'href');
  }`;
        default:
          return '';
      }
    }).join('\n');

    return `
import { Page } from '@playwright/test';

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