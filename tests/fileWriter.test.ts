// tests/FileWriter.test.ts
import { FileWriter } from '../src/components/fileWriter';
import fs from 'fs';
import path from 'path';
import os from 'os';

jest.mock('fs');
jest.mock('path');
jest.mock('os');

describe('FileWriter', () => {
  const fileWriter = new FileWriter();

  beforeEach(() => {
    (os.homedir as jest.Mock).mockReturnValue('/home/user');
    (path.join as jest.Mock).mockImplementation((...args) => args.join('/'));
  });

  it('should write content to a file in the downloads folder', async () => {
    const expectedPath = '/home/user/Downloads/example_com_POM.ts';
    const writtenPath = await fileWriter.write('POM content', 'http://example.com');
    
    expect(fs.promises.writeFile).toHaveBeenCalledWith(expectedPath, 'POM content');
    expect(writtenPath).toBe(expectedPath);
  });

  it('should handle different platforms', async () => {
    const platforms = ['win32', 'darwin', 'linux'];
    for (const platform of platforms) {
      Object.defineProperty(process, 'platform', { value: platform });
      await fileWriter.write('POM content', 'http://example.com');
      expect(path.join).toHaveBeenCalledWith('/home/user', 'Downloads', 'example_com_POM.ts');
    }
  });

  it('should throw an error for unsupported platforms', async () => {
    Object.defineProperty(process, 'platform', { value: 'unsupported' });
    await expect(fileWriter.write('POM content', 'http://example.com')).rejects.toThrow('Unsupported platform');
  });
});