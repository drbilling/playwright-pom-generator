// tests/UrlParser.test.ts
import { UrlParser } from '../src/components/urlParser';
import fs from 'fs';

jest.mock('fs');

describe('UrlParser', () => {
  const urlParser = new UrlParser();

  it('should parse a single URL', async () => {
    const result = await urlParser.parseUrls('http://example.com');
    expect(result).toEqual(['http://example.com']);
  });

  it('should parse URLs from a CSV file', async () => {
    (fs.promises.readFile as jest.Mock).mockResolvedValue('http://example1.com\nhttp://example2.com');
    const result = await urlParser.parseUrls(undefined, 'urls.csv');
    expect(result).toEqual(['http://example1.com', 'http://example2.com']);
  });

  it('should throw an error if no URL or file is provided', async () => {
    await expect(urlParser.parseUrls()).rejects.toThrow('No URL or file provided');
  });
});