# Architecture Design Document

## Overview

The Game Recharge Platform is built on a modern, scalable architecture using Next.js 16, Supabase, and Stripe. This document outlines the technical decisions, architectural patterns, and design principles that guide the platform's development.

## Core Architectural Principles

### 1. Server-First Approach (RSC)
- **React Server Components (RSC)** are used by default
- Client-side interactivity is minimized and explicitly marked with `"use client"`
- Data fetching occurs server-side for optimal performance and security

### 2. Type Safety End-to-End
- **TypeScript 5** in strict mode throughout the application
- **Supabase type generation** for database schemas
- **Zod validation** for all external inputs
- **next-safe-action** for type-safe Server Actions

### 3. Security by Default
- **Row Level Security (RLS)** enforced at database level
- **Input validation** on all Server Actions
- **Environment-based configuration** with proper secrets management
- **OWASP compliance** for web application security

### 4. Multi-tenant Architecture
- **Strict data isolation** between merchant accounts
- **Role-based access control (RBAC)** with USER, MERCHANT, ADMIN roles
- **PgBouncer** for connection pooling and performance

## Technology Stack

### Frontend Layer
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Architecture                      │
├─────────────────────────────────────────────────────────────┤
│  Next.js 16 (App Router)                                    │
│  ├── React Server Components (RSC)                           │
│  ├── Server Actions (Data Mutations)                         │
│  └── Client Components (Interactive UI)                      │
│                                                             │
│  Styling & UI                                               │
│  ├── Tailwind CSS 4 (Utility-first CSS)                     │
│  ├── Radix UI (Accessible primitives)                       │
│  └── Zustand (Client state management)                      │
│                                                             │
│  Internationalization                                       │
│  └── next-intl (Dynamic routing + translations)             │
└─────────────────────────────────────────────────────────────┘
```

### Backend Layer
```
┌─────────────────────────────────────────────────────────────┐
│                    Backend Architecture                       │
├─────────────────────────────────────────────────────────────┤
│  Supabase Platform                                          │
│  ├── PostgreSQL (Database)                                  │
│  ├── Supabase Auth (Authentication)                         │
│  ├── Row Level Security (Data access control)               │
│  └── PgBouncer (Connection pooling)                         │
│                                                             │
│  Payment Processing                                         │
│  ├── Stripe Checkout (Secure payments)                      │
│  ├── Stripe Webhooks (Async processing)                     │
│  └── Idempotency handling (Duplicate prevention)            │
│                                                             │
│  Business Logic                                             │
│  ├── Server Actions (Type-safe mutations)                   │
│  ├── Zod Schemas (Input validation)                         │
│  └── Error Handling (Comprehensive error management)        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Request Flow
```
User Request
    ↓
Next.js Route (RSC)
    ↓
Server Action (if mutation)
    ↓
Zod Validation
    ↓
Supabase Client (with RLS)
    ↓
PostgreSQL (with RLS policies)
    ↓
Response (with TypeScript types)
```

### Purchase Flow
```
1. Product Selection
   └── Game Details Page (RSC)
       └── SKU Selection (Client Component)

2. Order Creation
   └── payment.actions.ts (Server Action)
       ├── Zod Validation
       ├── Stripe Checkout Session Creation
       └── Order Record Creation (pending status)

3. Payment Processing
   └── Stripe Checkout (Hosted payment page)
       └── User completes payment

4. Order Fulfillment
   └── Stripe Webhook (API Route)
       ├── Signature Verification
       ├── Idempotency Check
       └── Order Status Update (completed)

5. User Notification
   └── Payment Success Page (RSC)
       └── Order Confirmation Display
```

## Database Architecture

### Schema Design
```sql
-- Users and Authentication
profiles (id, email, role, merchant_name, created_at)

-- Game Catalog
games (id, merchant_id, name_json, description_json, image_url, created_at)
skus (id, game_id, name_json, description_json, price_json, created_at)

-- Order Management
orders (id, user_id, game_id, sku_id, status, stripe_session_id, total_amount, created_at)

-- Audit and Analytics
order_events (id, order_id, event_type, event_data, created_at)
```

### Row Level Security (RLS) Policies
```sql
-- Profiles: Users can only see their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Games: Merchants can only see their own games
CREATE POLICY "Merchants can view own games" ON games
    FOR SELECT USING (auth.jwt() ->> 'role' = 'MERCHANT' AND merchant_id = auth.uid());

-- Orders: Users can see their orders, merchants can see orders for their games
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Merchants can view game orders" ON orders
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'MERCHANT' AND
        game_id IN (SELECT id FROM games WHERE merchant_id = auth.uid())
    );
```

## Security Architecture

### Authentication Flow
```
1. User initiates login
   └── Google OAuth (Supabase Auth)
       └── JWT Token Generation

2. Token Validation
   └── Server-side JWT verification
       └── Role extraction (USER/MERCHANT/ADMIN)

3. Session Management
   └── Secure cookie handling
       └── Automatic token refresh

4. Authorization
   └── RLS policy enforcement
       └── Server Action permission checks
```

### Input Validation Strategy
```typescript
// Zod Schema Example
const createOrderSchema = z.object({
  gameId: z.string().uuid(),
  skuId: z.string().uuid(),
  quantity: z.number().min(1).max(10),
});

// Server Action with validation
export const createOrder = actionClient
  .schema(createOrderSchema)
  .action(async ({ parsedInput }) => {
    // Safe to use parsedInput here
    // Types are inferred and validated
  });
```

### Payment Security
```
1. PCI Compliance
   └── Stripe Hosted Checkout
       └── No credit card data touches our servers

2. Webhook Security
   └── Stripe Signature Verification
       └── Replay attack prevention

3. Idempotency
   └── Duplicate order prevention
       └── Atomic status updates
```

## Component Architecture

### Directory Structure
```
src/components/
├── ui/                    # Reusable UI primitives
│   ├── Button.tsx        # Radix-based button
│   ├── Modal.tsx         # Accessible modal
│   ├── Card.tsx          # Card container
│   └── Form.tsx          # Form components
│
├── features/             # Business logic components
│   ├── game-card.tsx     # Game display card
│   ├── sku-card.tsx      # Product selection card
│   ├── order-status.tsx  # Order status display
│   └── dashboard/        # Dashboard components
│       ├── sales-chart.tsx
│       ├── order-table.tsx
│       └── metrics-card.tsx
│
└── layout/               # Layout components
    ├── header.tsx
    ├── navigation.tsx
    └── footer.tsx
```

### Component Design Patterns

#### 1. Server Components (Default)
```typescript
// Game listing page - Server Component
export default async function GamesPage() {
  const games = await getGames(); // Server-side data fetching

  return (
    <div>
      <h1>Available Games</h1>
      {games.map(game => (
        <GameCard key={game.id} game={game} />
      ))}
    </div>
  );
}
```

#### 2. Client Components (Interactive)
```typescript
// "use client" directive for interactivity
"use client";

export function SkuModal({ game }: { game: Game }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalContent>
        <SkuSelector game={game} />
      </ModalContent>
    </Modal>
  );
}
```

#### 3. Component Composition
```typescript
// Compose smaller components into larger features
export function GameCard({ game }: { game: Game }) {
  return (
    <Card>
      <CardHeader>
        <GameImage src={game.image_url} alt={game.name} />
        <GameTitle>{game.name}</GameTitle>
      </CardHeader>
      <CardContent>
        <GameDescription>{game.description}</GameDescription>
        <SkuModal game={game} />
      </CardContent>
    </Card>
  );
}
```

## State Management Architecture

### Zustand Store Pattern
```typescript
// SKU Modal State Management
interface SkuModalStore {
  isOpen: boolean;
  selectedGame: Game | null;
  openModal: (game: Game) => void;
  closeModal: () => void;
}

export const useSkuModalStore = create<SkuModalStore>((set) => ({
  isOpen: false,
  selectedGame: null,
  openModal: (game) => set({ isOpen: true, selectedGame: game }),
  closeModal: () => set({ isOpen: false, selectedGame: null }),
}));
```

### Data Fetching Strategy
```typescript
// Server-side data fetching in RSC
async function getGames(): Promise<Game[]> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      skus (*)
    `);

  if (error) throw error;
  return data;
}

// Client-side data passing via props
export default function GamesPage() {
  const games = getGames(); // Server-side fetch

  return <GameList games={games} />; // Pass data to client
}
```

## Internationalization Architecture

### Route Structure
```
/
├── en/            # English (default)
│   ├── page.tsx
│   ├── auth/
│   └── games/
└── zh/            # Chinese
    ├── page.tsx
    ├── auth/
    └── games/
```

### Translation System
```typescript
// Server-side translation
export default async function HomePage({ params: { locale } }: Props) {
  const t = await getTranslations('HomePage');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}

// Client-side translation via props
function GameCard({ game, translations }: {
  game: Game;
  translations: Translations
}) {
  return (
    <Card>
      <h3>{game.name[translations.locale]}</h3>
      <p>{game.description[translations.locale]}</p>
    </Card>
  );
}
```

## Error Handling Architecture

### Server Actions Error Handling
```typescript
export const createOrder = actionClient
  .schema(createOrderSchema)
  .action(async ({ parsedInput }) => {
    try {
      const order = await createOrderInDB(parsedInput);
      return { success: true, order };
    } catch (error) {
      // Handle specific error types
      if (error instanceof StripeError) {
        throw new ActionError('Payment processing failed');
      }

      // Log error for debugging
      console.error('Order creation failed:', error);

      // Generic error for user
      throw new ActionError('Failed to create order');
    }
  });
```

### Global Error Boundaries
```typescript
// Error boundary for route segments
export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <Link href="/">Go back home</Link>
    </div>
  );
}
```

## Performance Optimization

### 1. Server Components Benefits
- **Reduced bundle size**: No client-side JavaScript for static content
- **Faster page loads**: Direct HTML rendering
- **Better SEO**: Search engine friendly content

### 2. Database Optimization
```sql
-- Optimized queries with proper indexes
CREATE INDEX idx_games_merchant_id ON games(merchant_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);

-- Efficient data fetching with specific columns
SELECT id, name, price FROM games WHERE merchant_id = $1;
```

### 3. Caching Strategy
```typescript
// Supabase client with caching
const supabase = createSupabaseServerClient({
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Cache-Control': 'public, max-age=300', // 5 minute cache
    },
  },
});
```

## Testing Architecture

### Test Pyramid
```
E2E Tests (Playwright)
├── User purchase flow
├── Merchant dashboard
└── Authentication flows

Integration Tests (Vitest + RTL)
├── Server Actions
├── Component interactions
└── API endpoints

Unit Tests (Vitest)
├── Utility functions
├── Zod schemas
└── Business logic
```

### Test Organization
```
tests/
├── e2e/
│   ├── purchase-flow.spec.ts
│   ├── auth-flow.spec.ts
│   └── merchant-dashboard.spec.ts
├── integration/
│   ├── actions/
│   │   ├── auth.actions.test.ts
│   │   └── payment.actions.test.ts
│   └── components/
│       ├── game-card.test.tsx
│       └── sku-modal.test.tsx
└── unit/
    ├── lib/
    │   ├── auth-utils.test.ts
    │   └── permissions.test.ts
    └── schemas/
        └── order.schema.test.ts
```

## Deployment Architecture

### Production Environment
```
Vercel (Frontend & API)
├── Next.js Application
├── API Routes
└── Static Assets

Supabase (Backend)
├── PostgreSQL Database
├── Authentication Service
├── Real-time Subscriptions
└── Edge Functions (if needed)

Stripe (Payment Processing)
├── Payment Gateway
├── Webhook Processing
└── Fraud Detection
```

### Environment Configuration
```typescript
// Environment-specific configuration
const config = {
  development: {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  },
  production: {
    // Production URLs and keys
    // Additional monitoring and logging
  },
};
```

## Monitoring and Observability

### Error Tracking
- **Sentry** integration for error monitoring
- **Console logging** with structured data
- **Performance metrics** tracking

### Analytics
- **User behavior** tracking
- **Conversion funnel** monitoring
- **Business metrics** dashboard

## Future Architecture Considerations

### Scalability
1. **Database Sharding**: Horizontal scaling for large merchant bases
2. **Microservices**: Service decomposition for specific domains
3. **CDN Integration**: Global content delivery
4. **Caching Layer**: Redis for session and data caching

### Feature Expansion
1. **Multi-currency Support**: Enhanced payment processing
2. **Subscription Management**: Recurring billing capabilities
3. **Third-party Integrations**: Game platform APIs
4. **Mobile Applications**: React Native implementation

This architecture provides a solid foundation for the Game Recharge Platform while maintaining flexibility for future growth and feature additions.