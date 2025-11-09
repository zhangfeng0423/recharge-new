# Reference: RLS Policy Testing

This document provides a template for testing database Row-Level Security (RLS) policies, particularly for Supabase, but the principles apply to any database that supports RLS.

**Key Idea:** RLS testing is a form of integration testing. You need a real or test database. The goal is to create different database clients that simulate different user roles and assert that they can only access the data they are permitted to see.

## RLS Policy Testing Template

Let's assume you have a `projects` table and a policy that only allows users to see projects they are a member of.

```sql
-- Example RLS Policy in Supabase SQL
CREATE POLICY "Users can view their own projects."
ON public.projects FOR SELECT
USING (auth.uid() IN (
  SELECT user_id FROM project_members WHERE project_id = projects.id
));
```

### Test Template

The test requires two database clients:
1.  `supabaseAdmin`: A client initialized with the `service_role` key to set up test data.
2.  `supabaseUser`: A client initialized with a mock user's JWT to simulate a real user.

```typescript
// tests/rls.test.ts
import { createClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll } from 'vitest';

// These would be in your .env.test file
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!;

// A mock JWT for a test user. In a real scenario, you'd generate this.
const MOCK_USER_JWT = 'your-mock-user-jwt-here'; 

describe('RLS Policies for Projects', () => {
  let supabaseAdmin;
  let testProjectId;
  let otherProjectId;

  // Use beforeAll to set up the test data once
  beforeAll(async () => {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

    // Clean up any old test data
    await supabaseAdmin.from('projects').delete().neq('id', 0);

    // Create two projects: one the user is a member of, one they are not
    const { data: project1 } = await supabaseAdmin.from('projects').insert({ name: 'My Project' }).select().single();
    testProjectId = project1.id;

    const { data: project2 } = await supabaseAdmin.from('projects').insert({ name: 'Other Project' }).select().single();
    otherProjectId = project2.id;

    // Add the user to the first project's members
    // Assumes your JWT corresponds to a user with id 'user-id-123'
    await supabaseAdmin.from('project_members').insert({ project_id: testProjectId, user_id: 'user-id-123' });
  });

  it('should allow a user to select a project they are a member of', async () => {
    // Create a client that simulates the logged-in user
    const supabaseUser = createClient(SUPABASE_URL, MOCK_USER_JWT);

    const { data, error } = await supabaseUser
      .from('projects')
      .select('*')
      .eq('id', testProjectId);

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(testProjectId);
  });

  it('should NOT allow a user to select a project they are not a member of', async () => {
    // Create a client that simulates the logged-in user
    const supabaseUser = createClient(SUPABASE_URL, MOCK_USER_JWT);

    const { data, error } = await supabaseUser
      .from('projects')
      .select('*')
      .eq('id', otherProjectId);

    expect(error).toBeNull(); // RLS doesn't return an error, just an empty array
    expect(data).toHaveLength(0);
  });

  it('should return only the projects the user is a member of when selecting all', async () => {
    const supabaseUser = createClient(SUPABASE_URL, MOCK_USER_JWT);

    const { data, error } = await supabaseUser.from('projects').select('*');

    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data[0].id).toBe(testProjectId);
  });
});
```
