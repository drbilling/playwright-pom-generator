import { Command } from 'commander';
import { UrlParser } from './components/urlParser';
import { PomGenerator } from './components/pomGenerator';
import { FileWriter } from './components/fileWriter';

const program = new Command();

program
  .version('1.0.0')
  .description('Generate Playwright/TypeScript Page Object Models from URLs')
  .option('-u, --url <url>', 'Single URL to process')
  .option('-f, --file <path>', 'Path to CSV file containing URLs')
  .parse(process.argv);

const options = program.opts();

export async function main() {
  const urlParser = new UrlParser();
  const pomGenerator = new PomGenerator();
  const fileWriter = new FileWriter();

  const urls = await urlParser.parseUrls(options.url, options.file);
  
  for (const url of urls) {
    const pom = await pomGenerator.generate(url);
    const filePath = await fileWriter.write(pom, url);
    console.log(`POM file saved to: ${filePath}`);
  }
  
  console.log('Page Object Models generated successfully!');
  process.exit(0); // Ensure the process exits after completion
}

if (require.main === module) {
  main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
  });
}