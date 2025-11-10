# API Reference Documentation

This document provides comprehensive API documentation for the Game Recharge Platform, including Server Actions, API routes, and database schemas.

## Table of Contents

1. [Server Actions](#server-actions)
   - [Authentication Actions](#authentication-actions)
   - [Game Management Actions](#game-management-actions)
   - [Payment Actions](#payment-actions)
   - [Order Actions](#order-actions)
2. [API Routes](#api-routes)
   - [Webhook Endpoints](#webhook-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
3. [Database Schema](#database-schema)
   - [Table Definitions](#table-definitions)
   - [Row Level Security Policies](#row-level-security-policies)
4. [Error Handling](#error-handling)
5. [Type Definitions](#type-definitions)

---

## Server Actions

Server Actions are the primary way to perform data mutations in this application. They use `next-safe-action` for type safety and input validation.

### Authentication Actions

Location: `src/actions/auth.actions.ts`

#### `signInWithGoogle`
**Description**: Initiates Google OAuth authentication flow.

**Input Schema**:
```typescript
{
  redirectTo?: string; // Optional redirect URL after login
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: {
    url: string; // Google OAuth URL
  };
  error?: string;
}
```

**Example Usage**:
```typescript
import { signInWithGoogle } from '@/actions/auth.actions';

const result = await signInWithGoogle({
  redirectTo: '/dashboard'
});

if (result.success) {
  window.location.href = result.data.url;
}
```

#### `signOut`
**Description**: Signs out the current user and clears session.

**Input Schema**: None

**Returns**:
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `updateProfile`
**Description**: Updates user profile information.

**Input Schema**:
```typescript
{
  merchantName?: string; // Only for MERCHANT role
  email?: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: Profile;
  error?: string;
}
```

### Game Management Actions

Location: `src/actions/games.actions.ts`

#### `createGame`
**Description**: Creates a new game for a merchant.

**Required Role**: MERCHANT or ADMIN

**Input Schema**:
```typescript
{
  name: Record<string, string>; // Multilingual names { en: "Game Name", zh: "游戏名称" }
  description: Record<string, string>; // Multilingual descriptions
  imageUrl: string;
  category?: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: Game;
  error?: string;
}
```

**Example Usage**:
```typescript
const result = await createGame({
  name: { en: "Super Game", zh: "超级游戏" },
  description: {
    en: "An exciting game adventure",
    zh: "刺激的游戏冒险"
  },
  imageUrl: "https://example.com/game.jpg",
  category: "action"
});
```

#### `updateGame`
**Description**: Updates an existing game.

**Required Role**: MERCHANT (own games) or ADMIN

**Input Schema**:
```typescript
{
  gameId: string;
  name?: Record<string, string>;
  description?: Record<string, string>;
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: Game;
  error?: string;
}
```

#### `deleteGame`
**Description**: Deletes a game and its associated SKUs.

**Required Role**: MERCHANT (own games) or ADMIN

**Input Schema**:
```typescript
{
  gameId: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  error?: string;
}
```

#### `createSku`
**Description**: Creates a new SKU for a game.

**Required Role**: MERCHANT (own games) or ADMIN

**Input Schema**:
```typescript
{
  gameId: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: Record<string, number>; // { USD: 999 } = $9.99
  currency: string; // ISO currency code
  stock?: number;
  isActive?: boolean;
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: Sku;
  error?: string;
}
```

### Payment Actions

Location: `src/actions/payment.actions.ts`

#### `createCheckoutSession`
**Description**: Creates a Stripe Checkout Session for payment.

**Required Role**: USER

**Input Schema**:
```typescript
{
  skuId: string;
  quantity?: number; // Default: 1
  successUrl?: string; // Custom success URL
  cancelUrl?: string; // Custom cancel URL
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: {
    sessionId: string;
    url: string; // Stripe Checkout URL
  };
  error?: string;
}
```

**Example Usage**:
```typescript
const result = await createCheckoutSession({
  skuId: "sku_123456789",
  quantity: 2,
  successUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/payment/cancel`
});

if (result.success) {
  window.location.href = result.data.url;
}
```

#### `validatePayment`
**Description**: Validates payment status after checkout completion.

**Required Role**: USER

**Input Schema**:
```typescript
{
  sessionId: string; // Stripe Checkout Session ID
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: {
    orderId: string;
    status: 'completed' | 'pending' | 'failed';
  };
  error?: string;
}
```

### Order Actions

Location: `src/actions/order.actions.ts`

#### `getOrders`
**Description**: Retrieves orders for the current user or merchant.

**Input Schema**:
```typescript
{
  page?: number; // Default: 1
  limit?: number; // Default: 20
  status?: 'pending' | 'completed' | 'failed';
  gameId?: string; // Filter by game (for merchants)
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: {
    orders: Order[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}
```

#### `getOrderDetails`
**Description**: Retrieves detailed information about a specific order.

**Input Schema**:
```typescript
{
  orderId: string;
}
```

**Returns**:
```typescript
{
  success: boolean;
  data?: Order & {
    game: Game;
    sku: Sku;
    events: OrderEvent[];
  };
  error?: string;
}
```

---

## API Routes

### Webhook Endpoints

#### `POST /api/webhooks/stripe`
**Description**: Handles Stripe webhook events for payment processing.

**Authentication**: Stripe signature verification

**Headers**:
```
stripe-signature: <Stripe webhook signature>
content-type: application/json
```

**Supported Events**:
- `checkout.session.completed`: Payment successful
- `checkout.session.expired`: Payment expired
- `payment_intent.payment_failed`: Payment failed

**Request Body** (Stripe event object):
```typescript
{
  id: string;
  type: string;
  data: {
    object: {
      id: string; // Checkout Session ID
      metadata: {
        orderId: string;
        userId: string;
      };
      payment_status: 'paid' | 'unpaid';
    };
  };
}
```

**Response**:
```typescript
{
  received: boolean;
  processed: boolean;
  error?: string;
}
```

**Security**: This endpoint verifies Stripe signatures and implements idempotency checks to prevent duplicate order processing.

### Authentication Endpoints

#### `GET /api/auth/[...nextauth]`
**Description**: NextAuth.js authentication handler for OAuth flows.

**Query Parameters**:
- `provider`: OAuth provider (google)
- `callbackUrl`: URL to redirect after authentication
- `error`: Error code if authentication failed

**Response**: Redirects to appropriate URL based on authentication state.

#### `POST /api/auth/signout`
**Description**: Signs out the current user.

**Request Body**:
```typescript
{
  csrfToken: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  url?: string; // Redirect URL
}
```

#### `GET /api/auth/session`
**Description**: Retrieves current user session information.

**Response**:
```typescript
{
  user?: {
    id: string;
    email: string;
    role: 'USER' | 'MERCHANT' | 'ADMIN';
  };
  expires?: string;
}
```

---

## Database Schema

### Table Definitions

#### `profiles`
User profiles with authentication and role information.

```typescript
interface Profile {
  id: string; // UUID, primary key
  email: string; // User email
  role: 'USER' | 'MERCHANT' | 'ADMIN'; // User role
  merchant_name?: string; // Only for MERCHANT role
  avatar_url?: string;
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}
```

**Indexes**:
- Primary key: `id`
- Unique index: `email`

#### `games`
Game information managed by merchants.

```typescript
interface Game {
  id: string; // UUID, primary key
  merchant_id: string; // Foreign key to profiles.id
  name: Record<string, string>; // Multilingual names
  description: Record<string, string>; // Multilingual descriptions
  image_url: string;
  category?: string;
  is_active: boolean; // Default: true
  created_at: string;
  updated_at: string;
}
```

**Indexes**:
- Primary key: `id`
- Foreign key: `merchant_id`
- Index: `category`
- Index: `is_active`

#### `skus`
Stock Keeping Units for games.

```typescript
interface Sku {
  id: string; // UUID, primary key
  game_id: string; // Foreign key to games.id
  name: Record<string, string>; // Multilingual names
  description: Record<string, string>; // Multilingual descriptions
  price: Record<string, number>; // { USD: 999 } = $9.99
  currency: string; // ISO currency code
  stock?: number; // Inventory quantity
  is_active: boolean; // Default: true
  created_at: string;
  updated_at: string;
}
```

**Indexes**:
- Primary key: `id`
- Foreign key: `game_id`
- Index: `currency`
- Index: `is_active`

#### `orders`
Customer order records.

```typescript
interface Order {
  id: string; // UUID, primary key
  user_id: string; // Foreign key to profiles.id
  game_id: string; // Foreign key to games.id
  sku_id: string; // Foreign key to skus.id
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripe_session_id?: string; // Stripe Checkout Session ID
  total_amount: number; // Amount in cents (e.g., 999 = $9.99)
  currency: string; // ISO currency code
  quantity: number; // Default: 1
  created_at: string;
  updated_at: string;
}
```

**Indexes**:
- Primary key: `id`
- Foreign keys: `user_id`, `game_id`, `sku_id`
- Index: `status`
- Index: `stripe_session_id` (unique)
- Index: `created_at`

#### `order_events`
Audit trail for order status changes.

```typescript
interface OrderEvent {
  id: string; // UUID, primary key
  order_id: string; // Foreign key to orders.id
  event_type: 'created' | 'payment_completed' | 'payment_failed' | 'refunded';
  event_data: Record<string, any>; // Event-specific data
  created_at: string;
}
```

**Indexes**:
- Primary key: `id`
- Foreign key: `order_id`
- Index: `event_type`
- Index: `created_at`

### Row Level Security Policies

#### Profiles RLS Policies

```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Only authenticated users can insert profiles
CREATE POLICY "Authenticated users can insert profile" ON profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### Games RLS Policies

```sql
-- All users can view active games
CREATE POLICY "Anyone can view active games" ON games
    FOR SELECT USING (is_active = true);

-- Merchants can view their own games (including inactive)
CREATE POLICY "Merchants can view own games" ON games
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'MERCHANT' AND
        merchant_id = auth.uid()
    );

-- Admins can view all games
CREATE POLICY "Admins can view all games" ON games
    FOR SELECT USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Merchants can insert their own games
CREATE POLICY "Merchants can insert own games" ON games
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' IN ('MERCHANT', 'ADMIN') AND
        merchant_id = auth.uid()
    );

-- Merchants can update their own games
CREATE POLICY "Merchants can update own games" ON games
    FOR UPDATE USING (
        auth.jwt() ->> 'role' IN ('MERCHANT', 'ADMIN') AND
        merchant_id = auth.uid()
    );

-- Merchants can delete their own games
CREATE POLICY "Merchants can delete own games" ON games
    FOR DELETE USING (
        auth.jwt() ->> 'role' IN ('MERCHANT', 'ADMIN') AND
        merchant_id = auth.uid()
    );
```

#### Orders RLS Policies

```sql
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

-- Merchants can view orders for their games
CREATE POLICY "Merchants can view game orders" ON orders
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'MERCHANT' AND
        game_id IN (
            SELECT id FROM games
            WHERE merchant_id = auth.uid()
        )
    );

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
    FOR SELECT USING (auth.jwt() ->> 'role' = 'ADMIN');

-- Users can create orders for themselves
CREATE POLICY "Users can create own orders" ON orders
    FOR INSERT WITH CHECK (
        auth.jwt() ->> 'role' = 'USER' AND
        user_id = auth.uid()
    );
```

---

## Error Handling

### Standard Error Response Format

All Server Actions return a consistent error response format:

```typescript
{
  success: false;
  error: {
    code: string; // Error code for client handling
    message: string; // User-friendly error message
    details?: any; // Additional error details
  };
}
```

### Common Error Codes

| Error Code | Description | HTTP Status |
|------------|-------------|-------------|
| `UNAUTHORIZED` | User not authenticated | 401 |
| `FORBIDDEN` | User lacks permission | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Input validation failed | 400 |
| `PAYMENT_ERROR` | Payment processing failed | 402 |
| `STOCK_ERROR` | Insufficient inventory | 409 |
| `DUPLICATE_ORDER` | Order already exists | 409 |
| `RATE_LIMIT_EXCEEDED` | Too many requests | 429 |
| `INTERNAL_ERROR` | Server error | 500 |

### Error Handling Examples

```typescript
// Client-side error handling
const result = await createCheckoutSession({ skuId });

if (!result.success) {
  switch (result.error?.code) {
    case 'UNAUTHORIZED':
      // Redirect to login
      redirectToLogin();
      break;
    case 'STOCK_ERROR':
      // Show out of stock message
      showNotification('Product is out of stock');
      break;
    case 'PAYMENT_ERROR':
      // Show payment error
      showNotification('Payment processing failed');
      break;
    default:
      // Generic error
      showNotification('Something went wrong');
  }
}
```

---

## Type Definitions

### Core Types

```typescript
// User and Authentication
type UserRole = 'USER' | 'MERCHANT' | 'ADMIN';

interface Profile {
  id: string;
  email: string;
  role: UserRole;
  merchant_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Game and SKU Types
interface Game {
  id: string;
  merchant_id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  image_url: string;
  category?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface Sku {
  id: string;
  game_id: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: Record<string, number>;
  currency: string;
  stock?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Order Types
type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded';

interface Order {
  id: string;
  user_id: string;
  game_id: string;
  sku_id: string;
  status: OrderStatus;
  stripe_session_id?: string;
  total_amount: number;
  currency: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

interface OrderEvent {
  id: string;
  order_id: string;
  event_type: 'created' | 'payment_completed' | 'payment_failed' | 'refunded';
  event_data: Record<string, any>;
  created_at: string;
}

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface PaginatedResponse<T> extends ApiResponse<{
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {}

// Payment Types
interface CheckoutSession {
  id: string;
  url: string;
  payment_status: 'paid' | 'unpaid';
  metadata: {
    orderId: string;
    userId: string;
  };
}
```

### Input Schema Types

```typescript
// Authentication Inputs
interface SignInInput {
  redirectTo?: string;
}

interface UpdateProfileInput {
  merchantName?: string;
  email?: string;
}

// Game Management Inputs
interface CreateGameInput {
  name: Record<string, string>;
  description: Record<string, string>;
  imageUrl: string;
  category?: string;
}

interface UpdateGameInput {
  gameId: string;
  name?: Record<string, string>;
  description?: Record<string, string>;
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
}

interface CreateSkuInput {
  gameId: string;
  name: Record<string, string>;
  description: Record<string, string>;
  price: Record<string, number>;
  currency: string;
  stock?: number;
  isActive?: boolean;
}

// Payment Inputs
interface CreateCheckoutSessionInput {
  skuId: string;
  quantity?: number;
  successUrl?: string;
  cancelUrl?: string;
}

interface ValidatePaymentInput {
  sessionId: string;
}

// Order Inputs
interface GetOrdersInput {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  gameId?: string;
}

interface GetOrderDetailsInput {
  orderId: string;
}
```

---

## Usage Examples

### Complete Purchase Flow

```typescript
// 1. Create checkout session
const checkoutResult = await createCheckoutSession({
  skuId: "sku_123456789",
  quantity: 1,
  successUrl: `${window.location.origin}/payment/success`,
  cancelUrl: `${window.location.origin}/payment/cancel`
});

if (checkoutResult.success) {
  // 2. Redirect to Stripe Checkout
  window.location.href = checkoutResult.data.url;
}

// 3. After payment completion (on success page)
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  const validationResult = await validatePayment({ sessionId });

  if (validationResult.success) {
    console.log('Payment completed:', validationResult.data.orderId);
  }
}

// 4. Get order details
const orderDetails = await getOrderDetails({
  orderId: validationResult.data.orderId
});
```

### Merchant Dashboard Data Fetching

```typescript
// Get merchant's games
const games = await getGames(); // Automatically filtered by merchant_id

// Get orders for merchant's games
const orders = await getOrders({
  page: 1,
  limit: 20,
  status: 'completed'
});

// Create new game
const newGame = await createGame({
  name: { en: "New Game", zh: "新游戏" },
  description: {
    en: "An exciting new game",
    zh: "令人兴奋的新游戏"
  },
  imageUrl: "https://example.com/new-game.jpg",
  category: "puzzle"
});
```

This API reference provides comprehensive documentation for integrating with the Game Recharge Platform. All endpoints are type-safe and include proper error handling and security measures.