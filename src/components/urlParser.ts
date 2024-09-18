// src/components/UrlParser.ts
import fs from 'fs';
import { parse } from 'csv-parse/sync';

export class UrlParser {
  async parseUrls(url?: string, filePath?: string): Promise<string[]> {
    if (url) {
      return [url];
    } else if (filePath) {
      const content = await fs.promises.readFile(filePath, 'utf-8');
      return parse(content, { columns: false }).flat();
    }
    throw new Error('No URL or file provided');
  }
}