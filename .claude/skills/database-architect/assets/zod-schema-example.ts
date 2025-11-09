/**
 * This is an example database schema definition using Zod.
 * This file can be used as input for the `schemaValidator.ts` script
 * in this skill to generate TypeScript types, SQL DDL, and ORM schemas.
 *
 * To use with the script:
 * tsx ./scripts/schemaValidator.ts validate ./assets/zod-schema-example.ts
 */

import { z } from "zod";

// Zod schema for a database column
const columnSchema = z.object({
  type: z.enum(["string", "text", "number", "boolean", "date", "json", "uuid"]),
  primaryKey: z.boolean().optional(),
  unique: z.boolean().optional(),
  nullable: z.boolean().optional().default(false),
  default: z.any().optional(),
  references: z
    .object({
      table: z.string(),
      column: z.string(),
    })
    .optional(),
});

// Zod schema for a database table
const tableSchema = z.object({
  columns: z.record(z.string(), columnSchema),
  indexes: z
    .record(
      z.string(),
      z.object({
        columns: z.array(z.string()).min(1),
        unique: z.boolean().optional(),
      }),
    )
    .optional(),
  rlsOwner: z.string().optional(),
});

// Zod schema for the entire database
const databaseSchema = z.record(z.string(), tableSchema);

// Define the actual database schema
const mySchema: z.infer<typeof databaseSchema> = {
  users: {
    columns: {
      id: { type: "uuid", primaryKey: true, default: `uuid_generate_v4()` },
      email: { type: "string", unique: true },
      name: { type: "string", nullable: true },
      passwordHash: { type: "string" },
      createdAt: { type: "date", default: "now()" },
    },
    indexes: {
      email_idx: { columns: ["email"], unique: true },
    },
  },
  posts: {
    columns: {
      id: { type: "uuid", primaryKey: true, default: `uuid_generate_v4()` },
      title: { type: "string" },
      content: { type: "text" },
      published: { type: "boolean", default: false },
      authorId: {
        type: "uuid",
        references: { table: "users", column: "id" },
      },
      createdAt: { type: "date", default: "now()" },
    },
    indexes: {
      author_idx: { columns: ["authorId"] },
      published_idx: { columns: ["published"] },
    },
    rlsOwner: "authorId",
  },
  comments: {
    columns: {
      id: { type: "uuid", primaryKey: true, default: `uuid_generate_v4()` },
      content: { type: "text" },
      postId: {
        type: "uuid",
        references: { table: "posts", column: "id" },
      },
      authorId: {
        type: "uuid",
        references: { table: "users", column: "id" },
      },
      createdAt: { type: "date", default: "now()" },
    },
    indexes: {
      post_author_idx: { columns: ["postId", "authorId"] },
    },
    rlsOwner: "authorId",
  },
};

export default mySchema;

// You can validate the schema against the Zod definition like this:
// try {
//   databaseSchema.parse(mySchema);
//   console.log("Schema is valid!");
// } catch (error) {
//   console.error("Schema validation failed:", error);
// }
