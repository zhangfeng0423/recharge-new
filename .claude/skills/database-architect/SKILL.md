---
name: database-architect
description: Expert database architecture skill specializing in data layer design, technology selection, and scalable schema modeling using modern, code-first approaches with Zod. This skill should be used when designing database systems, creating schemas, or making data architecture decisions in a TypeScript environment. Use PROACTIVELY for database architecture or data modeling decisions.
---

# Database Architecture Expert

## Overview

This skill provides comprehensive expertise in designing scalable, performant, and maintainable data layers. It masters both greenfield architecture and re-architecture of existing systems, specializing in technology selection, migration planning, and **modern, code-first schema modeling using Zod as a single source of truth.**

## Core Capabilities

### 1. Technology Selection & Evaluation
Choose the right database technology for your needs:
- Relational (PostgreSQL, MySQL), NoSQL (MongoDB, Redis), and specialized databases.
- Decision frameworks based on CAP theorem, performance, cost, and complexity.

### 2. Data Modeling & Schema Design
- **Code-First with Zod**: Define schemas in TypeScript using Zod.
- **Relational Modeling**: Normalization, indexing strategies, and handling hierarchical data.
- **NoSQL Patterns**: Denormalization, attribute pattern, bucket pattern, and schema versioning.

### 3. (New) Row-Level Security (RLS)
- Design and generate multi-tenancy security policies for Supabase/PostgreSQL.
- Tie data access rules directly to user authentication (`auth.uid()`).

### 4. (New) Database Functions (RPC)
- Create performant PostgreSQL functions for server-side data aggregation and analytics.
- Encapsulate complex queries into reusable Remote Procedure Calls (RPCs).

### 5. Scalability & Performance Design
- Plan for growth with partitioning, sharding, and replication strategies.
- Implement multi-layer caching architectures.

### 6. Migration Planning & Strategy
- Execute zero-downtime migrations using patterns like blue-green deployments.
- Version-control schema changes.

## Resources

### scripts/
Database automation and schema management scripts:
- **`schemaValidator.ts`**: A powerful, Zod-based toolkit for database schema definition and generation. It allows you to:
    - Define your entire database schema in a single TypeScript file using Zod.
    - Automatically infer TypeScript types from your schema.
    - **Generate SQL DDL** (e.g., `CREATE TABLE`) for PostgreSQL.
    - **(New) Generate Supabase RLS Policies** for multi-tenancy based on an `rlsOwner` field in your schema.
    - **(New) Generate PostgreSQL RPC Functions** for server-side analytics and data aggregation.

### references/
Technical documentation:
- **`database-comparison.md`**: Decision guides for choosing a database.
- **`schema-design-patterns.md`**: Best practices for SQL and NoSQL schema design.
- Migration planning templates.
- Performance tuning guides.

### assets/
Design templates and examples:
- **`zod-schema-example.ts`**: A practical example of how to define a database schema using Zod, ready to be used with the script.
- ERD diagram templates.
