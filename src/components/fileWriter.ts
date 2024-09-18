// src/components/FileWriter.ts
import fs from 'fs';
import path from 'path';
import os from 'os';

export class FileWriter {
  async write(content: string, url: string): Promise<string> {
    const downloadsFolder = this.getDownloadsFolder();
    const fileName = `${new URL(url).hostname.replace(/\./g, '_')}_POM.ts`;
    const filePath = path.join(downloadsFolder, fileName);
    
    await fs.promises.writeFile(filePath, content);
    return filePath;
  }

  private getDownloadsFolder(): string {
    const homeDir = os.homedir();
    switch (process.platform) {
      case 'win32':
        return path.join(homeDir, 'Downloads');
      case 'darwin':
        return path.join(homeDir, 'Downloads');
      case 'linux':
        return path.join(homeDir, 'Downloads');
      default:
        throw new Error('Unsupported platform');
    }
  }
}
