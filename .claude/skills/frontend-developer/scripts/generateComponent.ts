#!/usr/bin/env tsx

/**
 * Next.js Component Generator (Non-Interactive)
 * Generates modern, accessible, and performant React/Next.js components
 * with TypeScript, Storybook, tests, and more, suitable for automation.
 */

import fs from "fs/promises";
import path from "path";
import { Command } from "commander";

// --- Utility Functions ---

const toPascalCase = (str: string) =>
  str
    .replace(/(\w)(\w*)/g, (g0, g1, g2) => g1.toUpperCase() + g2.toLowerCase())
    .replace(/[^a-zA-Z0-9]/g, "");

// --- Template Generators ---

const templates = {
  component: (
    name: string,
    type: "client" | "server",
    withCssModules: boolean,
  ) => {
    const isClient = type === "client";
    const className = withCssModules
      ? `styles.${name.toLowerCase()}`
      : `"${name.toLowerCase()}"`;

    return `${isClient ? "'use client';\n\n" : ""}import React from 'react';
${withCssModules ? `import styles from './${name}.module.css';\n` : ""}
export interface ${name}Props {
  children?: React.ReactNode;
  className?: string;
}

/**
 * A modern, accessible, and performant ${name} component.
 * ${isClient ? "This is a Client Component." : "This is a Server Component."}
 */
export const ${name} = ({ children, className }: ${name}Props) => {
  const combinedClassName = [${className}, className].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
};
`;
  },

  index: (name: string) => `export * from './${name}';\n`,

  storybook: (
    name: string,
  ) => `import type { Meta, StoryObj } from '@storybook/react';
import { ${name} } from './${name}';

const meta: Meta<typeof ${name}> = {
  title: 'Components/${name}',
  component: ${name},
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
    className: { control: 'text' },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: '${name} Content',
  },
};
`,

  test: (
    name: string,
  ) => `import { render, screen } from '@testing-library/react';
import { ${name} } from './${name}';

describe('${name}', () => {
  it('renders children correctly', () => {
    render(<${name}>Test Child</${name}>);
    expect(screen.getByText('Test Child')).toBeInTheDocument();
  });

  it('applies additional class names', () => {
    const { container } = render(<${name} className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
`,

  cssModule: (name: string) => `.${name.toLowerCase()} {
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
}
`,

  hook: (name: string) => `import { useState, useCallback } from 'react';

export const use${name} = () => {
  const [value, setValue] = useState(null);

  const updateValue = useCallback((newValue: any) => {
    setValue(newValue);
  }, []);

  return { value, updateValue };
};
`,
};

// --- Main Generator Class ---

interface ComponentGeneratorOptions {
  name: string;
  type: "client" | "server";
  path: string;
  storybook: boolean;
  css: boolean;
  hook: boolean;
  force: boolean;
}

class ComponentGenerator {
  constructor(private options: ComponentGeneratorOptions) {}

  async run() {
    const { name, path: outPath, force } = this.options;
    const componentDir = path.join(process.cwd(), outPath, name);

    if (!force && (await this.directoryExists(componentDir))) {
      console.error(
        `❌ Directory ${componentDir} already exists. Use --force to overwrite.`,
      );
      process.exit(1);
    }

    await fs.mkdir(componentDir, { recursive: true });

    const generationTasks = [
      this.createFile(
        componentDir,
        `${name}.tsx`,
        templates.component(name, this.options.type, this.options.css),
      ),
      this.createFile(componentDir, "index.ts", templates.index(name)),
      this.createFile(componentDir, `${name}.test.tsx`, templates.test(name)),
    ];

    if (this.options.storybook) {
      generationTasks.push(
        this.createFile(
          componentDir,
          `${name}.stories.tsx`,
          templates.storybook(name),
        ),
      );
    }
    if (this.options.css) {
      generationTasks.push(
        this.createFile(
          componentDir,
          `${name}.module.css`,
          templates.cssModule(name),
        ),
      );
    }
    if (this.options.hook && this.options.type === "client") {
      generationTasks.push(
        this.createFile(componentDir, `use${name}.ts`, templates.hook(name)),
      );
    }

    await Promise.all(generationTasks);
    console.log(
      `\n🎉 Component '${name}' generated successfully at ${componentDir}`,
    );
  }

  private async createFile(dir: string, fileName: string, content: string) {
    await fs.writeFile(path.join(dir, fileName), content);
    console.log(`✅ Created ${fileName}`);
  }

  private async directoryExists(dirPath: string) {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }
}

// --- CLI ---

async function main() {
  const program = new Command();

  program
    .name("component-generator")
    .description("Generate a new Next.js component.")
    .requiredOption(
      "-n, --name <name>",
      "Component name (PascalCase)",
      toPascalCase,
    )
    .option("-p, --path <path>", "Output path", "src/components")
    .option("-t, --type <type>", "Component type", "client")
    .option("-s, --storybook", "Include Storybook story", false)
    .option("-c, --css", "Include CSS module", false)
    .option("-h, --hook", "Include custom hook (client components only)", false)
    .option("-f, --force", "Overwrite existing directory", false)
    .action(async (options) => {
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(options.name)) {
        console.error(
          "❌ Component name must be in PascalCase (e.g., MyComponent)",
        );
        process.exit(1);
      }
      try {
        const generator = new ComponentGenerator(options);
        await generator.run();
      } catch (error) {
        console.error("❌ Error generating component:", error);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

main();
