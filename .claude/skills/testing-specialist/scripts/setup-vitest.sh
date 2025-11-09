#!/usr/bin/env tsx
import { Command } from 'commander';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

// --- Templates ---
const templates = {
  vitestConfig: (isSrc: boolean) => `
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './${isSrc ? 'src' : ''}'),
    },
  },
});
`,
  vitestSetup: `
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/router', () => require('next-router-mock'));
`,
  componentTest: (isSrc: boolean) => `
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Home from '@/${isSrc ? '' : 'pages/'}index';

describe('Home Component', () => {
  it('renders a heading', () => {
    render(<Home />);
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
`,
  playwrightConfig: `
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
`,
  playwrightTest: `
import { test, expect } from '@playwright/test';

test('should navigate to the about page', async ({ page }) => {
  await page.goto('/');
  await page.click('text=About');
  await expect(page).toHaveURL('/about');
  await expect(page.locator('h1')).toContainText('About Page');
});
`,
};

// --- Main ---
async function main() {
  const program = new Command();

  program
    .name('testing-setup')
    .description('Automated testing setup for Next.js projects.')
    .option('--pm <manager>', 'Package manager to use (npm, yarn, pnpm)', 'npm')
    .option('--src', 'Indicates the project uses a `src` directory')
    .option('--no-playwright', 'Skip Playwright setup for E2E testing')
    .action(async (options) => {
        console.log('🚀 Next.js Testing Setup Assistant');

        if (!await fileExists('package.json')) {
            console.error('❌ No package.json found. Please run this in a Next.js project root.');
            return;
        }

        await setupVitest(options.pm, options.src);
        if (options.playwright) {
            await setupPlaywright(options.pm);
        }

        console.log('\n🎉 Setup complete! Run your tests with `npm test` and `npm run test-e2e`.');
    });

  await program.parseAsync(process.argv);
}

async function setupVitest(pm: string, isSrc: boolean) {
  console.log('\nSetting up Vitest...');
  const installCmd = getInstallCommand(pm, true);
  const deps = ['vitest', '@vitejs/plugin-react', 'jsdom', '@testing-library/react', '@testing-library/jest-dom', 'next-router-mock'];
  
  await runCommand(`${installCmd} ${deps.join(' ')}`);
  console.log('✅ Testing dependencies installed.');

  await createAndWriteFile('vitest.config.ts', templates.vitestConfig(isSrc));
  await createAndWriteFile('vitest.setup.ts', templates.vitestSetup);
  await createAndWriteFile(path.join('__tests__', 'Home.test.tsx'), templates.componentTest(isSrc));
  
  await runCommand(`npm pkg set scripts.test="vitest"`);
  console.log('✅ `test` script added to package.json.');
}

async function setupPlaywright(pm: string) {
    console.log('\nSetting up Playwright...');
    const installCmd = getInstallCommand(pm, true);
    await runCommand(`${installCmd} @playwright/test`);
    await runCommand(`npx playwright install --with-deps`);
    console.log('✅ Playwright dependencies installed.');

    await createAndWriteFile('playwright.config.ts', templates.playwrightConfig);
    await createAndWriteFile(path.join('e2e', 'example.spec.ts'), templates.playwrightTest);

    await runCommand(`npm pkg set scripts.test-e2e="playwright"`);
    console.log('✅ `test-e2e` script added to package.json.');
}


// --- Helpers ---
const getInstallCommand = (pm: string, isDev: boolean) => 
  `${pm} add ${isDev ? '-D' : ''}`;

const createAndWriteFile = async (filePath: string, content: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  console.log(`✅ Created ${filePath}`);
};

const fileExists = async (filePath: string) => {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
};

const runCommand = async (command: string) => {
  try {
    await execAsync(command);
  } catch (error) {
    console.error(`❌ Failed to execute: ${command}`);
    throw error;
  }
};

main().catch(err => console.error(err));

