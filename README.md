# URL to Page Object Model Generator

This command-line application generates Playwright/TypeScript Page Object Models (POMs) from URLs. It uses Playwright's built-in locator strategies to identify page elements such as inputs, buttons, and links, and creates a structured, resilient POM file for each URL provided.

## Features

- Generate Page Object Models from a single URL or a CSV file containing multiple URLs
- Utilize Playwright's locator strategies for reliable and resilient element identification
- Automatically identify common page elements (inputs, buttons, links)
- Create structured TypeScript classes with methods for interacting with identified elements
- Save generated POMs to the local downloads folder
- Cross-platform support (Windows, macOS, Linux)

## Prerequisites

- Node.js (version 14 or later)
- npm (usually comes with Node.js)

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/playwright-pom-generator.git
   cd playwright-pom-generator
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Install Playwright browsers:
   ```
   npx playwright install
   ```

4. Build the project:
   ```
   npm run build
   ```

## Usage

You can run the application using npm:

1. To generate a POM from a single URL:
   ```
   npm start -- -u http://example.com
   ```

2. To generate POMs from multiple URLs stored in a CSV file:
   ```
   npm start -- -f path/to/urls.csv
   ```

The generated POM files will be saved in your downloads folder. The application will print the file path for each generated POM in the console.

## CSV File Format

If you're using a CSV file to provide multiple URLs, the file should have one URL per line. For example:

```
http://example.com
http://another-example.com
http://yet-another-example.com
```

## Generated POM Structure

The generated Page Object Model files now use Playwright's `Locator` class for more reliable element interactions. Here's an example of the structure:

```typescript
import { Page, Locator } from '@playwright/test';

export class ExamplePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('http://example.com');
  }

  usernameInput = this.page.locator('#username');
  submitButton = this.page.locator('text=Submit');
  homeLink = this.page.locator('text=Home');

  async fillUsernameInput(value: string) {
    await this.usernameInput.fill(value);
  }

  async getUsernameInputValue(): Promise<string> {
    return await this.usernameInput.inputValue();
  }

  async clickSubmitButton() {
    await this.submitButton.click();
  }

  async clickHomeLink() {
    await this.homeLink.click();
  }
}
```

The POM generator uses several strategies to create reliable locators:
1. ID-based selectors
2. Class-based selectors
3. Text-based selectors
4. Role-based selectors

This approach ensures that the generated POMs are more resilient to changes in the page structure.

## Dependencies

This project relies on the following main dependencies:

- Playwright: For browser automation and element location
- TypeScript: For static typing and improved developer experience
- Commander: For parsing command-line arguments

You can find the full list of dependencies in the `package.json` file.

## Running Tests

To run the unit tests for this project:

```
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.