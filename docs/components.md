# Component Library Documentation

This document provides comprehensive documentation for all components in the Game Recharge Platform, including UI primitives and feature-specific components.

## Table of Contents

1. [UI Components (Primitives)](#ui-components-primitives)
   - [Button](#button)
   - [Card](#card)
   - [Modal](#modal)
   - [Form Components](#form-components)
   - [Navigation](#navigation)
   - [Loading States](#loading-states)
2. [Feature Components](#feature-components)
   - [GameCard](#gamecard)
   - [SkuCard](#skucard)
   - [UserStatus](#userstatus)
   - [OrderStatus](#orderstatus)
   - [Dashboard Components](#dashboard-components)
3. [Layout Components](#layout-components)
   - [Header](#header)
   - [Footer](#footer)
   - [Sidebar](#sidebar)
4. [Component Guidelines](#component-guidelines)
5. [Styling System](#styling-system)

---

## UI Components (Primitives)

UI components are reusable, accessible primitives built with Radix UI and styled with Tailwind CSS. They contain no business logic and are focused solely on presentation.

### Button

**Location**: `src/components/ui/Button.tsx`

**Description**: Accessible button component with multiple variants and sizes.

**Props**:
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean; // Render as child element
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}
```

**Variants**:
- `default`: Primary blue button
- `destructive`: Red button for destructive actions
- `outline`: Outlined button
- `secondary`: Gray secondary button
- `ghost`: Transparent background
- `link`: Link-style button

**Sizes**:
- `default`: Regular size (h-10, px-4, py-2)
- `sm`: Small size (h-9, px-3)
- `lg`: Large size (h-11, px-8)
- `icon`: Square button for icons

**Examples**:
```typescript
// Basic usage
<Button onClick={handleClick}>Click me</Button>

// With variant and size
<Button variant="outline" size="sm">Cancel</Button>

// Loading state
<Button loading={isLoading} disabled={isLoading}>
  {isLoading ? 'Processing...' : 'Submit'}
</Button>

// As child element
<Button asChild>
  <Link href="/about">About</Link>
</Button>
```

### Card

**Location**: `src/components/ui/Card.tsx`

**Description**: Flexible container component with optional header and footer.

**Components**:
- `Card`: Main container
- `CardHeader`: Header section
- `CardTitle`: Title in header
- `CardDescription`: Description in header
- `CardContent`: Main content area
- `CardFooter`: Footer section

**Props**:
```typescript
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

interface CardHeaderProps {
  className?: string;
  children: React.ReactNode;
}

// Similar props for other Card components
```

**Examples**:
```typescript
// Basic card
<Card>
  <CardContent>
    <p>This is the card content</p>
  </CardContent>
</Card>

// Card with header and footer
<Card>
  <CardHeader>
    <CardTitle>Game Title</CardTitle>
    <CardDescription>A brief description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Main content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Modal

**Location**: `src/components/ui/Modal.tsx`

**Description**: Accessible modal dialog with overlay and keyboard navigation.

**Components**:
- `Modal`: Root component
- `ModalTrigger`: Element that opens modal
- `ModalContent`: Modal content container
- `ModalHeader`: Modal header
- `ModalTitle`: Modal title
- `ModalDescription`: Modal description
- `ModalBody`: Modal body content
- `ModalFooter`: Modal footer
- `ModalClose`: Close button

**Props**:
```typescript
interface ModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface ModalContentProps {
  className?: string;
  children: React.ReactNode;
}
```

**Examples**:
```typescript
// Controlled modal
<Modal open={isOpen} onOpenChange={setIsOpen}>
  <ModalTrigger>
    <Button>Open Modal</Button>
  </ModalTrigger>
  <ModalContent>
    <ModalHeader>
      <ModalTitle>Confirm Action</ModalTitle>
      <ModalDescription>Are you sure you want to proceed?</ModalDescription>
    </ModalHeader>
    <ModalBody>
      <p>This action cannot be undone.</p>
    </ModalBody>
    <ModalFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button>Confirm</Button>
    </ModalFooter>
  </ModalContent>
</Modal>

// Uncontrolled modal (internal state)
<Modal>
  <ModalTrigger>
    <Button>Delete Item</Button>
  </ModalTrigger>
  <ModalContent>
    {/* Content */}
  </ModalContent>
</Modal>
```

### Form Components

#### Input

**Location**: `src/components/ui/Input.tsx`

**Description**: Accessible input field with various types.

**Props**:
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  className?: string;
}
```

**Examples**:
```typescript
<Input
  type="email"
  placeholder="Enter your email"
  value={email}
  onChange={setEmail}
  error={error}
/>
```

#### Label

**Location**: `src/components/ui/Label.tsx`

**Description**: Accessible label for form controls.

**Props**:
```typescript
interface LabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

**Examples**:
```typescript
<Label htmlFor="email" required>
  Email Address
</Label>
<Input id="email" type="email" />
```

#### Select

**Location**: `src/components/ui/Select.tsx`

**Description**: Accessible dropdown select component.

**Props**:
```typescript
interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}
```

**Examples**:
```typescript
<Select value={country} onValueChange={setCountry}>
  <SelectTrigger>
    <SelectValue placeholder="Select a country" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="us">United States</SelectItem>
    <SelectItem value="ca">Canada</SelectItem>
    <SelectItem value="uk">United Kingdom</SelectItem>
  </SelectContent>
</Select>
```

### Navigation

#### Navigation Menu

**Location**: `src/components/ui/Navigation.tsx`

**Description**: Responsive navigation menu with mobile support.

**Props**:
```typescript
interface NavigationProps {
  items: NavigationItem[];
  user?: User;
  onSignOut?: () => void;
}

interface NavigationItem {
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string;
}
```

**Examples**:
```typescript
<Navigation
  items={[
    { label: 'Home', href: '/' },
    { label: 'Games', href: '/games' },
    { label: 'Dashboard', href: '/dashboard' }
  ]}
  user={currentUser}
  onSignOut={handleSignOut}
/>
```

### Loading States

#### Spinner

**Location**: `src/components/ui/Spinner.tsx`

**Description**: Animated loading spinner.

**Props**:
```typescript
interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Examples**:
```typescript
<Spinner size="md" />
```

#### Skeleton

**Location**: `src/components/ui/Skeleton.tsx`

**Description**: Skeleton loading placeholder.

**Props**:
```typescript
interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}
```

**Examples**:
```typescript
<Skeleton width="100%" height="20px" className="mb-2" />
<Skeleton width="60%" height="16px" />
```

---

## Feature Components

Feature components contain business logic and are tied to specific features. They receive data via props and don't fetch data directly.

### GameCard

**Location**: `src/components/features/game-card.tsx`

**Description**: Displays game information with interactive elements.

**Props**:
```typescript
interface GameCardProps {
  game: Game & {
    skus: Sku[];
  };
  onSkuSelect?: (sku: Sku) => void;
  showMerchant?: boolean;
  className?: string;
}
```

**Features**:
- Displays game image, title, and description
- Shows available SKUs with pricing
- Click to view details and purchase
- Responsive design for mobile/desktop

**Examples**:
```typescript
<GameCard
  game={gameData}
  onSkuSelect={(sku) => {
    // Handle SKU selection
    openSkuModal(sku);
  }}
  showMerchant={true}
/>
```

### SkuCard

**Location**: `src/components/features/sku-card.tsx`

**Description**: Displays SKU information with purchase options.

**Props**:
```typescript
interface SkuCardProps {
  sku: Sku;
  game: Game;
  onPurchase?: (sku: Sku) => void;
  showStock?: boolean;
  className?: string;
}
```

**Features**:
- Shows SKU name, description, and price
- Displays stock availability
- Purchase button with loading state
- Price formatting with currency

**Examples**:
```typescript
<SkuCard
  sku={skuData}
  game={gameData}
  onPurchase={handlePurchase}
  showStock={true}
/>
```

### UserStatus

**Location**: `src/components/features/user-status.tsx`

**Description**: Displays current user information and authentication status.

**Props**:
```typescript
interface UserStatusProps {
  user?: User;
  onSignIn?: () => void;
  onSignOut?: () => void;
  showRole?: boolean;
  className?: string;
}
```

**Features**:
- Shows user avatar and email
- Displays user role badge
- Sign in/out actions
- Dropdown menu with profile options

**Examples**:
```typescript
<UserStatus
  user={currentUser}
  onSignIn={() => redirectToAuth()}
  onSignOut={handleSignOut}
  showRole={true}
/>
```

### OrderStatus

**Location**: `src/components/features/order-status.tsx`

**Description**: Displays order status with appropriate styling.

**Props**:
```typescript
interface OrderStatusProps {
  status: OrderStatus;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Status Mappings**:
- `pending`: Yellow/orange with clock icon
- `completed`: Green with checkmark icon
- `failed`: Red with X icon
- `refunded`: Gray with refund icon

**Examples**:
```typescript
<OrderStatus
  status="completed"
  showIcon={true}
  size="md"
/>
```

### Dashboard Components

#### SalesChart

**Location**: `src/components/features/dashboard/sales-chart.tsx`

**Description**: Chart component for displaying sales analytics.

**Props**:
```typescript
interface SalesChartProps {
  data: SalesData[];
  period?: 'day' | 'week' | 'month' | 'year';
  type?: 'line' | 'bar' | 'area';
  className?: string;
}

interface SalesData {
  date: string;
  revenue: number;
  orders: number;
}
```

**Features**:
- Multiple chart types (line, bar, area)
- Period selection
- Responsive design
- Interactive tooltips

**Examples**:
```typescript
<SalesChart
  data={salesData}
  period="month"
  type="line"
/>
```

#### MetricsCard

**Location**: `src/components/features/dashboard/metrics-card.tsx`

**Description**: Card displaying key metrics with trend indicators.

**Props**:
```typescript
interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: React.ComponentType;
  className?: string;
}
```

**Examples**:
```typescript
<MetricsCard
  title="Total Revenue"
  value="$12,345"
  change={{
    value: 12.5,
    type: 'increase',
    period: 'vs last month'
  }}
  icon={DollarIcon}
/>
```

#### OrderTable

**Location**: `src/components/features/dashboard/order-table.tsx`

**Description**: Table displaying orders with filtering and pagination.

**Props**:
```typescript
interface OrderTableProps {
  orders: Order[];
  loading?: boolean;
  onOrderClick?: (order: Order) => void;
  onFilterChange?: (filters: OrderFilters) => void;
  onPageChange?: (page: number) => void;
  className?: string;
}

interface OrderFilters {
  status?: OrderStatus;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
}
```

**Features**:
- Sortable columns
- Status filtering
- Date range selection
- Search functionality
- Pagination

**Examples**:
```typescript
<OrderTable
  orders={ordersData}
  loading={isLoading}
  onOrderClick={handleOrderClick}
  onFilterChange={handleFilterChange}
  onPageChange={handlePageChange}
/>
```

---

## Layout Components

Layout components provide structure and consistent positioning across the application.

### Header

**Location**: `src/components/layout/header.tsx`

**Description**: Main application header with navigation and user controls.

**Props**:
```typescript
interface HeaderProps {
  user?: User;
  navigation?: NavigationItem[];
  onSignOut?: () => void;
  className?: string;
}
```

**Features**:
- Logo and branding
- Main navigation menu
- User account menu
- Mobile responsive
- Search functionality

**Examples**:
```typescript
<Header
  user={currentUser}
  navigation={navigationItems}
  onSignOut={handleSignOut}
/>
```

### Footer

**Location**: `src/components/layout/footer.tsx`

**Description**: Application footer with links and information.

**Props**:
```typescript
interface FooterProps {
  links?: FooterLink[];
  copyright?: string;
  className?: string;
}

interface FooterLink {
  label: string;
  href: string;
  category?: string;
}
```

**Examples**:
```typescript
<Footer
  links={[
    { label: 'About', href: '/about', category: 'Company' },
    { label: 'Contact', href: '/contact', category: 'Support' }
  ]}
  copyright={`© ${new Date().getFullYear()} Game Recharge Platform`}
/>
```

### Sidebar

**Location**: `src/components/layout/sidebar.tsx`

**Description**: Collapsible sidebar navigation for dashboard sections.

**Props**:
```typescript
interface SidebarProps {
  items: SidebarItem[];
  isOpen?: boolean;
  onToggle?: () => void;
  activeItem?: string;
  className?: string;
}

interface SidebarItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType;
  badge?: string;
  children?: SidebarItem[];
}
```

**Examples**:
```typescript
<Sidebar
  items={sidebarItems}
  isOpen={isSidebarOpen}
  onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
  activeItem={currentPath}
/>
```

---

## Component Guidelines

### Design Principles

1. **Accessibility First**: All components must be accessible with proper ARIA labels and keyboard navigation.
2. **Mobile Responsive**: Components should work seamlessly across all device sizes.
3. **Consistent Styling**: Use Tailwind CSS classes and design tokens consistently.
4. **Type Safety**: All props should be properly typed with TypeScript.
5. **Performance**: Components should be optimized for performance with proper memoization.

### Naming Conventions

- **PascalCase** for component names: `GameCard`, `UserStatus`
- **camelCase** for prop names: `onSkuSelect`, `showMerchant`
- **kebab-case** for file names: `game-card.tsx`, `user-status.tsx`
- **Descriptive names**: Use clear, descriptive names that indicate purpose

### File Structure

```
src/components/
├── ui/                           # Reusable UI primitives
│   ├── Button.tsx               # Button component
│   ├── Button.test.tsx          # Button tests
│   ├── Modal.tsx                # Modal component
│   └── index.ts                 # Barrel exports
├── features/                    # Business logic components
│   ├── game-card.tsx           # Game card feature
│   ├── sku-card.tsx            # SKU card feature
│   └── dashboard/              # Dashboard-specific components
│       ├── sales-chart.tsx
│       └── metrics-card.tsx
└── layout/                      # Layout components
    ├── header.tsx
    ├── footer.tsx
    └── sidebar.tsx
```

### Component Development Best Practices

#### 1. Composition over Inheritance
```typescript
// Good: Compose smaller components
<Card>
  <CardHeader>
    <GameTitle>{game.name}</GameTitle>
  </CardHeader>
  <CardContent>
    <GameDescription>{game.description}</GameDescription>
  </CardContent>
</Card>

// Avoid: Monolithic components
<CompleteGameComponent game={game} />
```

#### 2. Props Interface
```typescript
// Define clear props interface
interface GameCardProps {
  game: Game;
  onSkuSelect: (sku: Sku) => void;
  variant?: 'default' | 'compact';
  className?: string;
}

// Use default props for optional values
const GameCard: React.FC<GameCardProps> = ({
  game,
  onSkuSelect,
  variant = 'default',
  className
}) => {
  // Component implementation
};
```

#### 3. Error Boundaries
```typescript
// Wrap components in error boundaries
const GameCardWithErrorBoundary: React.FC<GameCardProps> = (props) => (
  <ErrorBoundary
    fallback={<div>Failed to load game information</div>}
  >
    <GameCard {...props} />
  </ErrorBoundary>
);
```

#### 4. Loading States
```typescript
// Show loading states appropriately
const GameCard: React.FC<GameCardProps> = ({ game, loading }) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Skeleton width="100%" height="200px" />
          <Skeleton width="80%" height="20px" className="mt-2" />
        </CardContent>
      </Card>
    );
  }

  return <GameCardContent game={game} />;
};
```

### Testing Guidelines

#### 1. Unit Tests
```typescript
// Test component rendering
describe('GameCard', () => {
  it('renders game information correctly', () => {
    const mockGame = createMockGame();
    render(<GameCard game={mockGame} onSkuSelect={jest.fn()} />);

    expect(screen.getByText(mockGame.name)).toBeInTheDocument();
    expect(screen.getByText(mockGame.description)).toBeInTheDocument();
  });

  it('calls onSkuSelect when SKU is clicked', () => {
    const mockOnSkuSelect = jest.fn();
    const mockGame = createMockGame();

    render(<GameCard game={mockGame} onSkuSelect={mockOnSkuSelect} />);

    fireEvent.click(screen.getByText('Purchase'));
    expect(mockOnSkuSelect).toHaveBeenCalledWith(mockGame.skus[0]);
  });
});
```

#### 2. Accessibility Tests
```typescript
// Test accessibility
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should be accessible', async () => {
  const { container } = render(<GameCard game={mockGame} onSkuSelect={jest.fn()} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

#### 3. Integration Tests
```typescript
// Test component integration
describe('Purchase Flow', () => {
  it('completes purchase flow from game selection to payment', async () => {
    const mockGame = createMockGame();
    const mockOnSkuSelect = jest.fn();

    render(<GameCard game={mockGame} onSkuSelect={mockOnSkuSelect} />);

    // Click purchase button
    fireEvent.click(screen.getByText('Purchase'));

    // Verify SKU selection handler is called
    expect(mockOnSkuSelect).toHaveBeenCalledWith(mockGame.skus[0]);

    // Mock successful payment
    await waitFor(() => {
      expect(screen.getByText('Payment Successful')).toBeInTheDocument();
    });
  });
});
```

---

## Styling System

### Tailwind CSS Configuration

The project uses Tailwind CSS with custom configuration:

```typescript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... more color definitions
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
```

### CSS Variables

CSS variables are used for consistent theming:

```css
/* globals.css */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --primary-foreground: 222.2 47.4% 11.2%;
  --border: 217.2 32.6% 17.5%;
}
```

### Design Tokens

Consistent spacing, typography, and colors:

```typescript
// Design tokens
const SPACING = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
};

const TYPOGRAPHY = {
  xs: ['0.75rem', '1rem'],    // 12px / 16px
  sm: ['0.875rem', '1.25rem'], // 14px / 20px
  base: ['1rem', '1.5rem'],    // 16px / 24px
  lg: ['1.125rem', '1.75rem'], // 18px / 28px
  xl: ['1.25rem', '1.75rem'],  // 20px / 28px
  '2xl': ['1.5rem', '2rem'],   // 24px / 32px
};
```

### Responsive Design

All components should be responsive using Tailwind's responsive prefixes:

```typescript
// Example: Responsive GameCard
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {games.map(game => (
    <GameCard key={game.id} game={game} />
  ))}
</div>

// Example: Responsive Button
<Button className="w-full sm:w-auto">
  Purchase
</Button>
```

### Animation and Transitions

Use consistent animations and transitions:

```typescript
// Example: Modal animations
<ModalContent className="animate-in fade-in-0 zoom-in-95">
  {/* Content */}
</ModalContent>

// Example: Hover states
<Button className="transition-all duration-200 hover:scale-105">
  Hover me
</Button>
```

This component library provides a comprehensive foundation for building consistent, accessible, and maintainable user interfaces in the Game Recharge Platform.