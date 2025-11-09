---
name: docs-architect
description: Documentation architect specializing in creating and maintaining project documentation. This skill generates Markdown documentation from JSDoc comments in the codebase and creates comprehensive documentation systems. Use when you need to document components, functions, APIs, or establish documentation workflows for software projects.
---

# Documentation Architect

## Overview

This skill focuses on creating and maintaining clear, comprehensive, and easy-to-navigate documentation for software projects. It bridges the gap between code and understanding by automatically generating documentation from source code comments, ensuring that documentation stays in sync with the codebase.

## Core Capabilities

### 1. Automated Documentation Generation
- Scan TypeScript/JavaScript source files for JSDoc comments
- Parse information about functions, components, types, parameters, and return values
- Generate structured Markdown files for each documented item
- Extract and document React component props and TypeScript interfaces

### 2. Content Strategy
- Define a clear structure for documentation, including API references, component libraries, and getting-started guides
- Promote a "docs-as-code" philosophy, where documentation lives in the same repository as the code it describes
- Create hierarchical documentation with proper navigation and cross-references

### 3. Maintainability
- Link documentation directly to the source code to simplify the process of keeping docs up-to-date
- Encourage developers to write well-documented code as a natural part of their workflow
- Generate documentation indices and table of contents automatically

## Workflow

1. **Scan Codebase**: Search for `/** ... */` JSDoc blocks above exported functions, classes, or types
2. **Parse Comments**: Extract the description, `@param`, and `@returns` tags
3. **Generate Markdown**: Create separate Markdown files with consistent structure, including props tables for components
4. **Create Index**: Generate an `index.md` file that links to all individual documentation pages

## Usage Examples

### Example 1: React Component Documentation
When documenting a React component library:
- Use the script to scan all component files in the `src/components/` directory
- Generate documentation for each component with prop types and descriptions
- Create a component gallery with examples and usage notes

### Example 2: API Endpoint Documentation
When documenting backend API endpoints:
- Generate documentation from controller method JSDoc comments
- Include request/response type definitions and examples
- Create an API reference guide organized by resource type

### Example 3: Utility Function Library
When documenting shared utility functions:
- Scan utility files for JSDoc comments describing function behavior
- Generate function reference with parameter types and return values
- Include code examples and usage patterns for each function

## Resources

### scripts/
Scripts for automating documentation tasks:
- **`generate-docs.ts`**: A command-line tool that scans the project codebase for JSDoc comments and generates Markdown documentation from them. It's an effective way to ensure your documentation is a direct reflection of your code.
  - **Usage**: `npx tsx ./scripts/generate-docs.ts <path-to-project> -o <output-dir>`
