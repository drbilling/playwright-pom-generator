# URL to Page Object Model Generator

This command-line application generates Playwright/TypeScript Page Object Models (POMs) from URLs. It identifies common page elements such as inputs, buttons, and links, and creates a structured POM file for each URL provided.

## Features

- Generate Page Object Models from a single URL or a CSV file containing multiple URLs
- Automatically identify common page elements (inputs, buttons, links)
- Create structured TypeScript classes with methods for interacting with identified elements
- Save generated POMs to the local downloads folder
- Cross-platform support (Windows, macOS, Linux)

## Prerequisites

- Node.js (version 14 or later)
- npm (usually comes with Node.js)
- Playwright

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/url-to-pom-generator.git
   cd url-to-pom-generator
   ```

2. Install the dependencies:
   ```
   npm install
   ```

3. Build the project:
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

The generated Page Object Model files will have the following structure:

- A class named after the page title
- Properties for each identified element's locator
- Methods for interacting with each element:
  - For inputs: methods to fill and get the input value
  - For buttons: click methods
  - For links: click methods and methods to get the href attribute

Example:

```typescript
import { Page } from '@playwright/test';

export class ExamplePage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('http://example.com');
  }

  private usernameInputLocator = '#username';
  private submitButtonLocator = 'text=Submit';
  private homeLinkLocator = 'text=Home';

  async fillUsernameInput(value: string) {
    await this.page.fill(this.usernameInputLocator, value);
  }

  async getUsernameInputValue(): Promise<string> {
    return await this.page.inputValue(this.usernameInputLocator);
  }

  async clickSubmitButton() {
    await this.page.click(this.submitButtonLocator);
  }

  async clickHomeLink() {
    await this.page.click(this.homeLinkLocator);
  }

  async getHomeLinkHref(): Promise<string | null> {
    return await this.page.getAttribute(this.homeLinkLocator, 'href');
  }
}
```

## Running Tests

To run the unit tests for this project:

```
npm test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.
