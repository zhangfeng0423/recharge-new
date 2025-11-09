# Reference: Server Action Testing

This document provides a template for testing Next.js Server Actions.

**Key Idea:** Test Server Actions as regular asynchronous functions. You can call them directly in your tests. The main challenge is mocking dependencies they might have, such as database clients or external APIs.

## Server Action Testing Template

Let's assume you have a Server Action like this:

```typescript
// app/actions.ts
'use server';
import { z } from 'zod';
import { db } from '@/lib/db'; // Your database client (e.g., Prisma)

const FormSchema = z.object({
  email: z.string().email(),
});

export async function subscribeToNewsletter(prevState: any, formData: FormData) {
  const validatedFields = FormSchema.safeParse({
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return { message: 'Invalid email address.' };
  }

  try {
    await db.subscriber.create({
      data: { email: validatedFields.data.email },
    });
    return { message: 'Successfully subscribed!' };
  } catch (error) {
    return { message: 'Failed to subscribe.' };
  }
}
```

### Test Template

You would test this action by mocking the `db` client.

```typescript
// tests/actions.test.ts
import { describe, it, expect, vi } from 'vitest';
import { subscribeToNewsletter } from '../app/actions';
import { db } from '../lib/db';

// Mock the entire database client module
vi.mock('../lib/db', () => ({
  db: {
    subscriber: {
      create: vi.fn(),
    },
  },
}));

describe('Server Action: subscribeToNewsletter', () => {

  it('should return a success message when the email is valid', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('email', 'test@example.com');
    
    // Mock the successful database call
    vi.mocked(db.subscriber.create).mockResolvedValue({ id: '1', email: 'test@example.com' });

    // Act
    const result = await subscribeToNewsletter(null, formData);

    // Assert
    expect(db.subscriber.create).toHaveBeenCalledWith({ data: { email: 'test@example.com' } });
    expect(result.message).toBe('Successfully subscribed!');
  });

  it('should return an error message for an invalid email', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('email', 'invalid-email');

    // Act
    const result = await subscribeToNewsletter(null, formData);

    // Assert
    expect(db.subscriber.create).not.toHaveBeenCalled();
    expect(result.message).toBe('Invalid email address.');
  });

  it('should return an error message if the database call fails', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('email', 'test@example.com');

    // Mock the failed database call
    vi.mocked(db.subscriber.create).mockRejectedValue(new Error('Database error'));

    // Act
    const result = await subscribeToNewsletter(null, formData);

    // Assert
    expect(result.message).toBe('Failed to subscribe.');
  });
});
```
