#!/usr/bin/env tsx

/**
 * Next.js Security Scanner
 *
 * Analyzes a Next.js project for common security vulnerabilities and best practices.
 * This script is designed to be a practical tool for developers to quickly identify
 * potential security weaknesses in their Next.js applications.
 */

import { Command } from "commander";
import { glob } from "glob";
import fs from "fs/promises";
import path from "path";
import { z } from "zod";

// --- Types and Interfaces ---

interface Issue {
  file: string;
  line: number;
  message: string;
  severity: "error" | "warning" | "info";
  ruleId: string;
  snippet: string;
}

interface Rule {
  id: string;
  description: string;
  severity: "error" | "warning" | "info";
  pattern: RegExp;
  recommendation: string;
}

// --- Security Rules ---

const rules: Rule[] = [
  {
    id: "hardcoded-secret",
    description: "Detects hardcoded secrets or keys.",
    severity: "error",
    pattern:
      /(['"](secret|password|token|key)['"]\s*:\s*['"][\w-]{20,})|((?:SECRET|PASSWORD|TOKEN|KEY)=['"]["\w-]{20,})/gi,
    recommendation:
      "Use environment variables (e.g., process.env.MY_SECRET) and a .env.local file.",
  },
  {
    id: "dangerously-set-inner-html",
    description:
      "Detects usage of dangerouslySetInnerHTML, which can lead to XSS.",
    severity: "error",
    pattern: /dangerouslySetInnerHTML/g,
    recommendation:
      "Avoid dangerouslySetInnerHTML. Sanitize HTML content if you must use it, with a library like DOMPurify.",
  },
  {
    id: "insecure-api-route",
    description:
      "Detects API routes that do not check req.method, leading to potential vulnerabilities.",
    severity: "warning",
    pattern:
      /export\s+default\s+function\s+\w+\(req,\s*res\)\s*{[^}]*((?!req\.method)[^}])*}/gms,
    recommendation:
      "Always check req.method at the beginning of your API route handlers to prevent unintended access.",
  },
  {
    id: "exposed-server-logic",
    description: "Detects server-only modules imported into client components.",
    severity: "error",
    pattern:
      /import\s+.*\s+from\s+['"].*\/server.*['"](;?)\s*\n'use client';|'use client';\s*\nimport\s+.*\s+from\s+['"].*\/server.*['"]/g,
    recommendation:
      'Ensure server-only code (e.g., using `server-only` package) is not imported into files marked with `"use client"`.',
  },
  {
    id: "weak-crypto-algorithm",
    description:
      "Detects usage of weak cryptographic algorithms like MD5 or SHA1.",
    severity: "warning",
    pattern: /crypto\.(createHash\('md5'\)|createHash\('sha1'\))/g,
    recommendation:
      "Use strong hashing algorithms like SHA-256, or preferably bcrypt/scrypt for passwords.",
  },
  {
    id: "console-log-in-api",
    description:
      "Detects console.log in API routes, which may leak sensitive information.",
    severity: "info",
    pattern: /\s*console\.log/g,
    recommendation:
      "Use a structured logger (e.g., Pino, Winston) instead of console.log in production API routes.",
  },
];

// --- Scanner Logic ---

class SecurityScanner {
  constructor(private projectRoot: string) {}

  async scan(): Promise<Issue[]> {
    const files = await glob("**/{*.ts,*.tsx,*.js,*.jsx,next.config.js}", {
      cwd: this.projectRoot,
      ignore: ["node_modules/**", ".next/**", "public/**"],
      nodir: true,
    });

    const allIssues: Issue[] = [];
    for (const file of files) {
      const issues = await this.scanFile(file);
      allIssues.push(...issues);
    }
    return allIssues;
  }

  private async scanFile(file: string): Promise<Issue[]> {
    const issues: Issue[] = [];
    const filePath = path.join(this.projectRoot, file);
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");

    for (const rule of rules) {
      if (
        rule.id === "console-log-in-api" &&
        !filePath.includes("/pages/api/")
      ) {
        continue;
      }
      let match;
      while ((match = rule.pattern.exec(content)) !== null) {
        const line = this.getLineNumber(content, match.index);
        issues.push({
          file,
          line,
          message: rule.description,
          severity: rule.severity,
          ruleId: rule.id,
          snippet: lines[line - 1].trim(),
        });
      }
    }
    return issues;
  }

  private getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split("\n").length;
  }
}

// --- Report Generator ---

function generateReport(issues: Issue[]) {
  console.log("--- Next.js Security Scan Report ---");
  if (issues.length === 0) {
    console.log("✅ No security issues found. Great job!");
    return;
  }

  const sortedIssues = issues.sort((a, b) => {
    const severities = { error: 2, warning: 1, info: 0 };
    return severities[b.severity] - severities[a.severity];
  });

  sortedIssues.forEach((issue) => {
    const color =
      issue.severity === "error"
        ? "\x1b[31m"
        : issue.severity === "warning"
          ? "\x1b[33m"
          : "\x1b[34m";
    console.log(
      `${color}[${issue.severity.toUpperCase()}]\x1b[0m ${issue.message} (\x1b[35m${issue.ruleId}\x1b[0m)`,
    );
    console.log(`  \x1b[2m> File: ${issue.file}:${issue.line}\x1b[0m`);
    console.log(`  \x1b[2m> Snippet: ${issue.snippet}\x1b[0m`);
    console.log("");
  });

  const errorCount = issues.filter((i) => i.severity === "error").length;
  const warningCount = issues.filter((i) => i.severity === "warning").length;
  console.log("--- Summary ---");
  console.log(
    `\x1b[31m${errorCount} error(s)\x1b[0m, \x1b[33m${warningCount} warning(s)\x1b[0m found.`,
  );
  console.log("Recommendation: Address errors first, then warnings.");
}

// --- Security Config Generator with Zod ---

function generateSecurityHelpers(): string {
  return `// Generated by securityValidator.ts
import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Validates environment variables on server startup.
 * Call this in your next.config.js or a server-side entry point.
 */
export function validateEnvironment() {
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    AUTH_SECRET: z.string().min(32),
    // Add other critical environment variables here
  });

  try {
    envSchema.parse(process.env);
    console.log('✅ Environment variables are valid.');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:', error.format());
      process.exit(1);
    }
  }
}

/**
 * A Zod schema for validating a user signup request body.
 * Use this in your API routes to validate incoming data.
 */
export const signupBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

/**
 * An example of a secure API handler using Zod for validation.
 */
export async function secureSignupHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).setHeader('Allow', 'POST').json({ message: 'Method Not Allowed' });
  }

  const parseResult = signupBodySchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({ errors: parseResult.error.format() });
  }

  const { email, password } = parseResult.data;

  // Hash the password with bcrypt/scrypt before saving to the database
  // const hashedPassword = await hashPassword(password);
  
  // ... create user logic ...

  return res.status(201).json({ message: 'User created successfully' });
}
`;
}

// --- CLI ---

async function main() {
  const program = new Command();

  program
    .name("security-scanner")
    .description("A security scanner for Next.js applications.");

  program
    .command("scan")
    .description("Scan a project directory for security issues.")
    .argument("[path]", "Path to the Next.js project", ".")
    .action(async (projectPath) => {
      const fullPath = path.resolve(projectPath);
      console.log(`Scanning project at: ${fullPath}\n`);
      const scanner = new SecurityScanner(fullPath);
      const issues = await scanner.scan();
      generateReport(issues);
      console.log(
        "\nDependency Check: Run `npm audit`, `yarn audit`, or `pnpm audit` to check for vulnerabilities in your dependencies.",
      );
    });

  program
    .command("generate-helpers")
    .description("Generate a security helpers file with Zod-based validation.")
    .option(
      "-o, --output <path>",
      "Output file path",
      "lib/security-helpers.ts",
    )
    .action(async (options) => {
      const content = generateSecurityHelpers();
      const outputPath = path.resolve(options.output);
      await fs.mkdir(path.dirname(outputPath), { recursive: true });
      await fs.writeFile(outputPath, content);
      console.log(`✅ Security helpers generated at: ${outputPath}`);
      console.log("💡 Import and use these helpers in your application.");
    });

  await program.parseAsync(process.argv);
}

main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});

export { SecurityScanner, generateReport, generateSecurityHelpers };
