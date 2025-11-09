# React Patterns Reference

## Common React Patterns

### 1. Custom Hooks Pattern

```typescript
// useApiClient.ts
import { useState, useEffect } from 'react';

export function useApiClient<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(url)
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [url]);

  return { data, loading, error };
}
```

### 2. Compound Components Pattern

```typescript
// Card.tsx
interface CardContextType {
  variant: 'primary' | 'secondary';
}

const CardContext = createContext<CardContextType>({ variant: 'primary' });

export function Card({ children, variant = 'primary' }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div className={`card card--${variant}`}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card__header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card__body">{children}</div>;
};
```

### 3. Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string;
  children: (props: { data: T | null; loading: boolean; error: string | null }) => React.ReactNode;
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, loading, error } = useApiClient<T>(url);

  return <>{children({ data, loading, error })}</>;
}

// Usage
<DataFetcher<User> url="/api/user">
  {{ data, loading, error }} => {
    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    return <div>Hello, {data?.name}</div>;
  }}
</DataFetcher>
```

### 4. Higher-Order Component Pattern

```typescript
// withLoading.tsx
export function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoading({ loading, ...props }: P & { loading: boolean }) {
    if (loading) {
      return <div>Loading...</div>;
    }
    return <Component {...(props as P)} />;
  };
}

// Usage
const UserProfileWithLoading = withLoading(UserProfile);
```

## Next.js Specific Patterns

### 1. Server Actions Pattern

```typescript
// app/actions/user.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function updateUser(userId: string, data: UpdateUserData) {
  try {
    // Update user in database
    const updatedUser = await db.user.update({
      where: { id: userId },
      data,
    });

    revalidatePath('/users');
    return { success: true, user: updatedUser };
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

### 2. Dynamic Imports Pattern

```typescript
// components/HeavyComponent.tsx
export default function HeavyComponent() {
  return <div>Heavy component content</div>;
}

// Usage in page
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), {
  loading: () => <div>Loading heavy component...</div>,
  ssr: false, // Optional: disable server-side rendering
});
```

### 3. Route Handlers Pattern

```typescript
// app/api/users/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  const users = await db.user.findMany();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  const user = await db.user.create({ data });
  return NextResponse.json(user, { status: 201 });
}
```

## Performance Patterns

### 1. Memoization Pattern

```typescript
import { memo, useMemo, useCallback } from 'react';

// Component memoization
const ExpensiveComponent = memo(function ExpensiveComponent({
  data,
  onUpdate
}: ExpensiveComponentProps) {
  const processedData = useMemo(() => {
    return data.map(item => expensiveCalculation(item));
  }, [data]);

  const handleClick = useCallback((id: string) => {
    onUpdate(id);
  }, [onUpdate]);

  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} item={item} onClick={handleClick} />
      ))}
    </div>
  );
});
```

### 2. Virtual Scrolling Pattern

```typescript
import { FixedSizeList as List } from 'react-window';

const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => (
  <div style={style}>
    Row {index}
  </div>
);

export function VirtualizedList({ items }: { items: any[] }) {
  return (
    <List
      height={600}
      itemCount={items.length}
      itemSize={50}
      width="100%"
    >
      {Row}
    </List>
  );
}
```

## State Management Patterns

### 1. Zustand Store Pattern

```typescript
// stores/useUserStore.ts
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
  user: null,
  loading: false,

  login: async (email, password) => {
    set({ loading: true });
    try {
      const user = await api.login(email, password);
      set({ user, loading: false });
    } catch (error) {
      set({ loading: false });
      throw error;
    }
  },

  logout: () => {
    set({ user: null });
  },
}));
```

### 2. Context + Reducer Pattern

```typescript
// context/AppContext.tsx
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  loading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'SET_LOADING'; payload: boolean };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}
```

## Testing Patterns

### 1. Component Testing Pattern

```typescript
// Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 2. Hook Testing Pattern

```typescript
// useApiClient.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useApiClient } from './useApiClient';

// Mock fetch
global.fetch = jest.fn();

describe('useApiClient', () => {
  it('fetches data successfully', async () => {
    const mockData = { id: 1, name: 'Test' };
    (fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockData),
    });

    const { result } = renderHook(() => useApiClient('/api/test'));

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData);
      expect(result.current.loading).toBe(false);
    });
  });
});
```