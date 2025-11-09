# Reference: Component Testing

This document provides templates and best practices for testing React components (both Server and Client) in a Next.js project using Vitest and React Testing Library.

## Client Component Testing

**Key Idea:** Test the component's behavior from a user's perspective. Find elements on the "screen", interact with them, and assert that the UI updates as expected.

### Template

```typescript
// tests/MyClientComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyClientComponent } from '../components/MyClientComponent';

describe('MyClientComponent', () => {
  it('should render the initial state correctly', () => {
    render(<MyClientComponent title="Test Title" />);
    
    // Assert that the title is rendered
    expect(screen.getByRole('heading', { name: /test title/i })).toBeInTheDocument();
    
    // Assert that interactive elements are present
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call the onAction prop when the button is clicked', () => {
    const onActionMock = vi.fn();
    render(<MyClientComponent title="Action Test" onAction={onActionMock} />);
    
    const button = screen.getByRole('button', { name: /click me/i });
    fireEvent.click(button);
    
    // Assert that the mock function was called
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });
});
```

## Server Component (RSC) Testing

**Key Idea:** Server Components often fetch data. To test them, you must mock the data-fetching functions they rely on. Since they are async, you need to handle the asynchronous rendering.

### Template

```typescript
// tests/MyServerComponent.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MyServerComponent } from '../components/MyServerComponent';
import { getDataForComponent } from '../lib/data'; // The data fetching function used by the component

// Mock the data fetching module
vi.mock('../lib/data', () => ({
  getDataForComponent: vi.fn(),
}));

describe('MyServerComponent', () => {
  it('should render the data when fetching is successful', async () => {
    // Arrange: Mock the successful data response
    const mockData = { message: 'Hello from the server!' };
    vi.mocked(getDataForComponent).mockResolvedValue(mockData);

    // Act: Render the component. Note that it returns a promise.
    render(await MyServerComponent());

    // Assert: Wait for the async rendering to complete and check the result
    await waitFor(() => {
      expect(screen.getByText(mockData.message)).toBeInTheDocument();
    });
  });

  it('should render an error message when fetching fails', async () => {
    // Arrange: Mock the failed data response
    vi.mocked(getDataForComponent).mockRejectedValue(new Error('Failed to fetch'));

    // Act
    render(await MyServerComponent());

    // Assert
    await waitFor(() => {
      expect(screen.getByText(/error loading data/i)).toBeInTheDocument();
    });
  });
});
```
