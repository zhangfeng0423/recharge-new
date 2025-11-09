# Modern Schema Design Patterns

A guide to common and effective schema design patterns for relational (SQL) and non-relational (NoSQL) databases.

## 1. Relational (SQL) Design Patterns

### Normalization
The process of organizing columns and tables in a relational database to minimize data redundancy.

- **First Normal Form (1NF):** Ensures that the table is a flat file with no repeating groups. Each cell holds a single value.
- **Second Normal Form (2NF):** Is in 1NF and all non-key attributes are fully functional dependent on the primary key. This applies to tables with composite primary keys.
- **Third Normal Form (3NF):** Is in 2NF and all attributes are dependent only on the primary key, not on other non-key attributes (no transitive dependencies).

**Rule of thumb:** Normalize for data integrity and to reduce redundancy. Denormalize for performance. Most applications are well-served by 3NF.

### Indexing Strategies
- **Index Foreign Keys:** Always place indexes on foreign key columns to speed up joins.
- **Use Composite Indexes:** For queries that filter on multiple columns, create a composite index. The order of columns in the index matters. Place the column with the highest cardinality (most unique values) first.
- **Use Partial Indexes:** For large tables where you frequently query a small subset of rows (e.g., `WHERE status = 'active'`), a partial index can be much smaller and faster.
- **Avoid Over-indexing:** Indexes speed up reads but slow down writes (INSERT, UPDATE, DELETE). Don't index every column.

### Handling Hierarchical Data
- **Adjacency List:** A simple approach where each item has a `parent_id` column. Easy to understand and manage, but can be slow for deep queries.
- **Nested Set:** More complex, involving storing `left` and `right` pointers. Very fast for reads (finding all descendants), but slow for writes.
- **Materialized Path:** Store the entire path from the root to the current node in a column (e.g., `1.2.5.`). Good balance of read/write performance and easy to understand.
- **Closure Table:** A separate table that stores all ancestor-descendant relationships. Powerful and flexible, but requires more storage and joins.

## 2. NoSQL Design Patterns

NoSQL design is driven by application query patterns, not by minimizing redundancy.

### Denormalization & Data Duplication
- **Principle:** Duplicate data to where it is needed to avoid expensive joins.
- **Example (MongoDB):** Instead of joining `users` and `posts`, embed the author's name and avatar directly into the post document.
  ```json
  {
    "_id": "post123",
    "title": "My Post",
    "content": "...",
    "author": {
      "userId": "user456",
      "name": "John Doe",
      "avatar": "url-to-avatar.jpg"
    }
  }
  ```
- **Trade-off:** Faster reads, but writes are more complex (you may need to update the author's name in all their posts if it changes).

### The Attribute Pattern (Polymorphic Schemas)
- **Use Case:** For collections where documents have many similar fields but also some that vary.
- **Example (E-commerce):** A `products` collection can have common fields (`name`, `price`) and specific fields for different product types.
  ```json
  // Product 1: A book
  { "name": "The Book", "price": 19.99, "attributes": { "pages": 300, "author": "Jane Doe" } }
  // Product 2: A t-shirt
  { "name": "The Shirt", "price": 29.99, "attributes": { "color": "blue", "sizes": ["S", "M", "L"] } }
  ```
- **Benefit:** Avoids creating separate collections for each product type. You can create indexes on fields within the `attributes` object.

### The Bucket Pattern (Time-Series Data)
- **Use Case:** For IoT, analytics, or any time-series data to reduce the number of documents.
- **Principle:** Group measurements from a short time period into a single document instead of having one document per measurement.
- **Example (Sensor Data):**
  ```json
  {
    "sensorId": "sensor-A1",
    "hour": "2023-10-27T10:00:00Z",
    "measurementCount": 60,
    "measurements": [
      { "timestamp": "...", "value": 21.5 },
      { "timestamp": "...", "value": 21.6 }
      // ... 58 more
    ]
  }
  ```
- **Benefit:** Reduces index size and improves read performance for data from a specific time range.

### The Schema Versioning Pattern
- **Use Case:** For applications where the schema evolves over time and you need to handle documents with different structures.
- **Principle:** Add a `schemaVersion` field to your documents.
  ```json
  {
    "_id": "user123",
    "name": "John Doe",
    "schemaVersion": 1
  }
  ```
- **Application Logic:** Your application code can check the `schemaVersion` and handle the data accordingly, or run a migration script to update older documents to the new schema.
