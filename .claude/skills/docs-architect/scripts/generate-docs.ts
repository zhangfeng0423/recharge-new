#!/usr/bin/env tsx

/**
 * JSDoc to Markdown Documentation Generator (AST-based)
 *
 * This script scans a project's TypeScript files, parses JSDoc comments
 * and component props using @babel/parser, and generates Markdown files.
 */

import { Command } from "commander";
import { glob } from "glob";
import fs from "fs/promises";
import path from "path";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

// --- Types and Interfaces ---

interface Prop {
  name: string;
  type: string;
  required: boolean;
  description: string;
  defaultValue: string | null;
}

interface DocItem {
  name: string;
  type: "component" | "hook" | "function" | "type";
  description: string;
  params: { name: string; type: string; description: string }[];
  props: Prop[];
  returns: { type: string; description: string } | null;
  examples: string[];
  deprecated: string | null;
  filePath: string;
}

// --- Parser Logic ---

class DocParser {
  constructor(private projectRoot: string) {}

  async parse(): Promise<DocItem[]> {
    const files = await glob("src/**/*.{ts,tsx}", {
      cwd: this.projectRoot,
      ignore: ["node_modules/**", "**/*.test.*", "**/*.spec.*"],
      nodir: true,
    });

    const allDocs: DocItem[] = [];
    for (const file of files) {
      const items = await this.parseFile(file);
      allDocs.push(...items);
    }
    return allDocs;
  }

  private async parseFile(file: string): Promise<DocItem[]> {
    const filePath = path.join(this.projectRoot, file);
    const content = await fs.readFile(filePath, "utf-8");
    const docItems: DocItem[] = [];

    const ast = parser.parse(content, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    traverse(ast, {
      ExportNamedDeclaration: (p) => {
        const node = p.node;
        if (node.leadingComments) {
          const jsdoc = node.leadingComments.find(
            (c) => c.type === "CommentBlock" && c.value.startsWith("*"),
          );
          if (jsdoc) {
            const declaration = node.declaration;
            let name = "";
            if (declaration?.type === "VariableDeclaration") {
              name = declaration.declarations[0].id.name;
            } else if (declaration?.type === "FunctionDeclaration") {
              name = declaration.id.name;
            }

            if (name) {
              const docItem = this.createDocItem(
                name,
                jsdoc.value,
                filePath,
                declaration,
              );
              docItems.push(docItem);
            }
          }
        }
      },
    });

    return docItems;
  }

  private createDocItem(
    name: string,
    jsdoc: string,
    filePath: string,
    declaration: any,
  ): DocItem {
    const type = this.determineType(name, declaration);
    const props = type === "component" ? this.parseProps(declaration) : [];

    return {
      name,
      type,
      description: this.parseDescription(jsdoc),
      params: this.parseParams(jsdoc),
      props,
      returns: this.parseReturns(jsdoc),
      examples: this.parseExamples(jsdoc),
      deprecated: this.parseDeprecated(jsdoc),
      filePath,
    };
  }

  private determineType(name: string, declaration: any): DocItem["type"] {
    if (name.startsWith("use")) return "hook";
    if (name.match(/^[A-Z]/)) return "component";
    if (declaration?.type === "TSTypeAliasDeclaration") return "type";
    return "function";
  }

  private parseProps(declaration: any): Prop[] {
    const props: Prop[] = [];
    // This is a simplified example. A real implementation would need to
    // trace the props type definition.
    if (
      declaration?.declarations[0]?.init?.params?.[0]?.typeAnnotation
        ?.typeAnnotation?.members
    ) {
      const propTypes =
        declaration.declarations[0].init.params[0].typeAnnotation.typeAnnotation
          .members;
      for (const prop of propTypes) {
        props.push({
          name: prop.key.name,
          type: prop.typeAnnotation.typeAnnotation.type,
          required: !prop.optional,
          description:
            prop.leadingComments?.map((c) => c.value).join("\n") || "",
          defaultValue: null, // Needs more complex parsing
        });
      }
    }
    return props;
  }

  private parseDescription = (jsdoc: string) =>
    this.parseTag(jsdoc, "description");
  private parseParams = (jsdoc: string) =>
    this.parseMultiTag(jsdoc, "param", ["type", "name", "description"]);
  private parseReturns = (jsdoc: string) =>
    this.parseSingleTag(jsdoc, "returns", ["type", "description"]);
  private parseExamples = (jsdoc: string) =>
    this.parseTagWithCode(jsdoc, "example");
  private parseDeprecated = (jsdoc: string) =>
    this.parseTag(jsdoc, "deprecated");

  private parseTag(jsdoc: string, tagName: string): string {
    const regex = new RegExp(`@${tagName}\\s+(.*)`);
    const match = jsdoc.match(regex);
    if (match) return match[1].trim();

    if (tagName === "description") {
      const descRegex = /\*\s*([^@\n][\w\s.-]+)/;
      const descMatch = jsdoc.match(descRegex);
      return descMatch ? descMatch[1].trim() : "";
    }
    return "";
  }

  private parseMultiTag(jsdoc: string, tagName: string, keys: string[]): any[] {
    const regex = new RegExp(
      `@${tagName}\\s+\\{([^}]+)\\}\\s+([\\w\\.]+)\\s+-?\\s?(.*)`,
      "g",
    );
    const results = [];
    let match;
    while ((match = regex.exec(jsdoc)) !== null) {
      const obj: { [key: string]: string } = {};
      keys.forEach((key, i) => (obj[key] = match[i + 1]));
      results.push(obj);
    }
    return results;
  }

  private parseSingleTag(
    jsdoc: string,
    tagName: string,
    keys: string[],
  ): any | null {
    const regex = new RegExp(`@${tagName}\\s+\\{([^}]+)\\}\\s+(.*)`);
    const match = jsdoc.match(regex);
    if (!match) return null;

    const obj: { [key: string]: string } = {};
    keys.forEach((key, i) => (obj[key] = match[i + 1]));
    return obj;
  }

  private parseTagWithCode(jsdoc: string, tagName: string): string[] {
    const regex = new RegExp(
      `@${tagName}\\s*\\n([\\s\\S]*?)(?=\\n\\s*\\*\\s*@|\\*\\/$)`,
      "g",
    );
    const results = [];
    let match;
    while ((match = regex.exec(jsdoc)) !== null) {
      const code = match[1]
        .split("\n")
        .map((line) => line.replace(/^\s*\*\s?/, ""))
        .join("\n");
      results.push(code.trim());
    }
    return results;
  }
}

// --- Markdown Generator ---

class MarkdownGenerator {
  constructor(
    private docs: DocItem[],
    private outputDir: string,
  ) {}

  async generate() {
    await fs.mkdir(this.outputDir, { recursive: true });

    for (const docItem of this.docs) {
      const markdown = this.generateMarkdownForItem(docItem);
      const fileName = `${docItem.name}.md`;
      const filePath = path.join(this.outputDir, fileName);
      await fs.writeFile(filePath, markdown);
      console.log(
        `✅ Generated documentation for ${docItem.name}: ${filePath}`,
      );
    }

    await this.generateIndex();
  }

  private generateMarkdownForItem(item: DocItem): string {
    let md = `# ${item.name}\n\n`;
    if (item.deprecated) {
      md += `> **Deprecated:** ${item.deprecated}\n\n`;
    }
    md += `**Type:** \`${item.type}\`\n`;
    md += `**Source:** [${item.filePath}](${item.filePath})\n\n`;
    md += `${item.description}\n\n`;

    if (item.props.length > 0) {
      md += `## Props\n\n`;
      md += `| Name | Type | Required | Default | Description |\n`;
      md += `| ---- | ---- | -------- | ------- | ----------- |\n`;
      item.props.forEach((p) => {
        md += `| \`${p.name}\` | \`${p.type}\` | ${p.required} | \`${p.defaultValue || ""}\` | ${p.description} |\n`;
      });
      md += `\n`;
    }

    if (item.params.length > 0) {
      md += `## Parameters\n\n`;
      md += `| Name | Type | Description |\n`;
      md += `| ---- | ---- | ----------- |\n`;
      item.params.forEach((p) => {
        md += `| \`${p.name}\` | \`${p.type}\` | ${p.description} |\n`;
      });
      md += `\n`;
    }

    if (item.returns) {
      md += `## Returns\n\n`;
      md += `**Type:** \`${item.returns.type}\`\n\n`;
      md += `${item.returns.description}\n`;
    }

    if (item.examples.length > 0) {
      md += `## Examples\n\n`;
      item.examples.forEach((example) => {
        md += "```tsx\n";
        md += `${example}\n`;
        md += "```\n\n";
      });
    }

    return md;
  }

  private async generateIndex() {
    let indexMd = `# Documentation Index\n\n`;
    this.docs
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((item) => {
        indexMd += `- [${item.name}](./${item.name}.md) - *${item.type}*\n`;
      });
    const indexPath = path.join(this.outputDir, "index.md");
    await fs.writeFile(indexPath, indexMd);
    console.log(`✅ Generated documentation index: ${indexPath}`);
  }
}

// --- CLI ---

async function main() {
  const program = new Command();

  program
    .name("docs-generator")
    .description("Generate Markdown documentation from JSDoc comments and AST.")
    .argument(
      "<path>",
      "Path to the project root containing a src directory",
      ".",
    )
    .option(
      "-o, --output <dir>",
      "Output directory for markdown files",
      "docs/generated",
    )
    .action(async (projectPath, options) => {
      const fullPath = path.resolve(projectPath);
      const outputDir = path.resolve(options.output);
      console.log(`🔍 Scanning project at: ${fullPath}`);
      console.log(`✍️ Outputting docs to: ${outputDir}\n`);

      try {
        const parser = new DocParser(fullPath);
        const docs = await parser.parse();

        if (docs.length === 0) {
          console.log(
            "No JSDoc comments found on exported members to generate documentation from.",
          );
          return;
        }

        const generator = new MarkdownGenerator(docs, outputDir);
        await generator.generate();

        console.log(`\n🎉 Documentation generation complete!`);
      } catch (error) {
        console.error(
          "\n❌ An error occurred during documentation generation:",
        );
        console.error(error);
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}

main();
