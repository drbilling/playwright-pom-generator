// tests/PomGenerator.test.ts
import { PomGenerator } from '../src/components/pomGenerator';
import { Page, Locator } from 'playwright';

// Mock Playwright
jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn(),
        title: jest.fn().mockResolvedValue('Test Page'),
        $$: jest.fn().mockImplementation((selector) => {
          if (selector === 'input:visible, textarea:visible') {
            return [mockLocator({ id: 'username', type: 'text' })];
          }
          if (selector === 'button:visible, input[type="button"]:visible, input[type="submit"]:visible') {
            return [mockLocator({ type: 'submit', textContent: 'Submit' })];
          }
          if (selector === 'a:visible') {
            return [mockLocator({ href: '/home', textContent: 'Home' })];
          }
          return [];
        }),
      }),
    }),
  },
}));

function mockLocator(attributes: Record<string, string>): Locator {
  return {
    getAttribute: jest.fn((attr: string) => Promise.resolve(attributes[attr] || null)),
    innerText: jest.fn(() => Promise.resolve(attributes.textContent || '')),
    evaluate: jest.fn(() => Promise.resolve(getLocatorString(attributes))),
  } as unknown as Locator;
}

function getLocatorString(attributes: Record<string, string>): string {
  if (attributes.id) return `#${attributes.id}`;
  if (attributes.textContent) return `text=${attributes.textContent}`;
  return 'Unknown';
}

describe('PomGenerator', () => {
  let pomGenerator: PomGenerator;

  beforeEach(async () => {
    pomGenerator = new PomGenerator();
    await pomGenerator.initialize();
  });

  afterEach(async () => {
    await pomGenerator.cleanup();
  });

  it('should generate a POM with identified page objects using Playwright locators', async () => {
    const pom = await pomGenerator.generate('http://example.com');
    
    expect(pom).toContain('class TestPagePage');
    expect(pom).toContain('usernameInput = this.page.locator(\'#username\');');
    expect(pom).toContain('async fillUsernameInput(value: string)');
    expect(pom).toContain('submitButton = this.page.locator(\'text=Submit\');');
    expect(pom).toContain('async clickSubmitButton()');
    expect(pom).toContain('homeLink = this.page.locator(\'text=Home\');');
    expect(pom).toContain('async clickHomeLink()');
  });

  it('should handle pages with no identifiable elements', async () => {
    jest.spyOn(pomGenerator as any, 'identifyPageObjects').mockResolvedValue([]);
    const pom = await pomGenerator.generate('http://empty-page.com');
    
    expect(pom).toContain('class EmptyPagePage');
    expect(pom).not.toContain('this.page.locator');
  });

  it('should use fallback locators when ideal locators are not available', async () => {
    jest.spyOn(pomGenerator as any, 'identifyPageObjects').mockResolvedValue([
      { name: 'unknownElement', type: 'input', locator: 'Unknown' }
    ]);
    const pom = await pomGenerator.generate('http://fallback-page.com');
    
    expect(pom).toContain('unknownElementInput = this.page.locator(\'Unknown\');');
  });
});