// tests/PomGenerator.test.ts
import { PomGenerator } from '../src/components/pomGenerator';
import { Page } from 'playwright';

jest.mock('playwright', () => ({
  chromium: {
    launch: jest.fn().mockResolvedValue({
      newPage: jest.fn().mockResolvedValue({
        goto: jest.fn(),
        title: jest.fn().mockResolvedValue('Test Page'),
        $$eval: jest.fn().mockResolvedValue(['Button1', 'Button2']),
      }),
    }),
  },
}));

describe('PomGenerator', () => {
  const pomGenerator = new PomGenerator();

  beforeEach(async () => {
    await pomGenerator.initialize();
  });

 // afterEach(async () => {
 //   await pomGenerator.cleanup();
 // });

  it('should generate a POM', async () => {
    const pom = await pomGenerator.generate('http://example.com');
    expect(pom).toContain('class TestPagePage');
    expect(pom).toContain('clickButton1Button');
    expect(pom).toContain('clickButton2Button');
  });
});