#!/usr/bin/env tsx

/**
 * Next.js Performance Optimizer (Advanced, Non-Interactive)
 * Analyzes and optimizes Next.js application performance using professional tools.
 */

import fs from "fs/promises";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";
import { Command } from "commander";
import { glob } from "glob";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";

const execAsync = promisify(exec);

// --- Helper Functions ---

const runCommand = async (command: string, cwd: string) => {
  try {
    const { stdout, stderr } = await execAsync(command, { cwd });
    if (stderr) console.warn(`⚠️ STDERR: ${stderr}`);
    return stdout;
  } catch (error) {
    console.error(`❌ Error executing command: ${command}`);
    throw error;
  }
};

// --- Analysis Modules ---

const analyzeUnusedImports = async (projectRoot: string) => {
  console.log("🔍 Finding unused exports with ts-prune...");
  try {
    const output = await runCommand("npx ts-prune", projectRoot);
    return output
      .trim()
      .split("\n")
      .filter((line) => line.includes(" - "));
  } catch (error: any) {
    if (error.stdout?.includes("Project has no unused exports")) {
      return [];
    }
    console.error("ts-prune analysis failed.");
    return ["Error running ts-prune."];
  }
};

const analyzeBundle = async (projectRoot: string) => {
  console.log("📦 Building project and analyzing bundle...");
  const nextConfigPath = path.join(projectRoot, "next.config.js");
  const originalConfig = await fs
    .readFile(nextConfigPath, "utf-8")
    .catch(() => "module.exports = {};");

  const analyzerConfig = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
module.exports = withBundleAnalyzer(${originalConfig.replace("module.exports =", "")});
  `;

  await fs.writeFile(nextConfigPath, analyzerConfig);

  try {
    await runCommand("cross-env ANALYZE=true npm run build", projectRoot);
    console.log(
      "📊 Bundle analysis complete. Reports generated in .next/analyze/",
    );
  } finally {
    // Restore original config
    await fs.writeFile(nextConfigPath, originalConfig);
  }
};

const analyzeComponentStructure = async (projectRoot: string) => {
  const files = await glob("src/**/*.{ts,tsx}", {
    cwd: projectRoot,
    ignore: "node_modules/**",
  });
  const suggestions = [];

  for (const file of files) {
    const content = await fs.readFile(path.join(projectRoot, file), "utf-8");
    const ast = parser.parse(content, {
      sourceType: "module",
      plugins: ["typescript", "jsx"],
    });

    let hasMemo = false;
    let componentName = "";

    traverse(ast, {
      VariableDeclarator(path) {
        if (
          path.node.init?.type === "CallExpression" &&
          path.node.init.callee.name === "memo"
        ) {
          hasMemo = true;
        }
        if (path.get("id").isIdentifier()) {
          componentName = path.get("id").node.name;
        }
      },
    });

    if (componentName && !hasMemo && content.includes("React.FC")) {
      suggestions.push(
        `💡 Consider wrapping \`${componentName}\` in \`React.memo\` in ${file}`,
      );
    }
  }
  return suggestions;
};

// --- Autofix Modules ---

const fixUnusedImports = async (projectRoot: string, unused: string[]) => {
  console.log("🔧 Attempting to fix unused imports...");
  for (const issue of unused) {
    const [filePath, importName] = issue.split(" - ");
    if (!filePath || !importName) continue;

    const fullPath = path.join(projectRoot, filePath);
    let content = await fs.readFile(fullPath, "utf-8");

    // This is a simple regex, a more robust solution would use an AST transformation
    const importRegex = new RegExp(
      `import\\s+{[^}]*${importName}[^}]*}\\s+from\\s+['"][^'"]+['"];?`,
      "g",
    );
    const newContent = content.replace(importRegex, ""); // This is a simplification

    if (newContent !== content) {
      await fs.writeFile(fullPath, newContent);
      console.log(`✅ Removed (potentially) ${importName} from ${filePath}`);
    }
  }
};

// --- Main CLI ---

async function main() {
  const program = new Command();

  program
    .name("performance-optimizer")
    .description("Advanced Next.js Performance Optimizer")
    .option(
      "-p, --project <path>",
      "Path to your Next.js project",
      process.cwd(),
    )
    .option("--unused", "Analyze for unused exports")
    .option("--bundle", "Analyze bundle size (requires build)")
    .option("--components", "Suggest component optimizations")
    .option("--fix", "Automatically fix issues (experimental)")
    .action(async (options) => {
      console.log("--- Advanced Next.js Performance Optimizer ---");

      if (options.unused) {
        const unused = await analyzeUnusedImports(options.project);
        if (unused.length > 0) {
          console.log("\n--- Unused Exports ---");
          unused.forEach((line) => console.log(line));
          if (options.fix) {
            await fixUnusedImports(options.project, unused);
          }
        } else {
          console.log("✅ No unused exports found.");
        }
      }

      if (options.bundle) {
        await analyzeBundle(options.project);
      }

      if (options.components) {
        const suggestions = await analyzeComponentStructure(options.project);
        if (suggestions.length > 0) {
          console.log("\n--- Component Structure Suggestions ---");
          suggestions.forEach((line) => console.log(line));
        } else {
          console.log("✅ No immediate component structure suggestions.");
        }
      }

      console.log("\n🎉 Performance analysis complete.");
    });

  await program.parseAsync(process.argv);
}

main().catch((error) => {
  console.error("\n❌ An unexpected error occurred:");
  console.error(error);
  process.exit(1);
});
