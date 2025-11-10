# Game Recharge Platform

A modern, multi-tenant game recharge platform built with Next.js 16, Supabase, and Stripe. This MVP provides a complete purchase flow for Players and role-gated dashboards for Merchants and Admins.

## 🏗️ Architecture Overview

### Core Technologies

- **Framework**: Next.js 16 with App Router and React Server Components (RSC)
- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Authentication**: Supabase Auth with Google OAuth
- **Payment**: Stripe Checkout with Webhook integration
- **Styling**: Tailwind CSS 4 with Radix UI components
- **Language**: TypeScript 5 with end-to-end type safety
- **Testing**: Vitest + React Testing Library + Playwright
- **Internationalization**: next-intl (English/Chinese)

### Key Features

- **Multi-tenant Architecture**: Strict data isolation between merchants
- **Role-based Access Control**: User, Merchant, and Admin roles
- **Complete Purchase Flow**: From product selection to payment confirmation
- **Real-time Updates**: Live order status and inventory management
- **Multi-language Support**: Full internationalization with dynamic routing
- **Secure Payment Processing**: Stripe integration with idempotency guarantees
- **Responsive Design**: Mobile-first approach with accessibility in mind

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Supabase project
- Stripe account

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd game-recharge-platform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Configure your environment variables
# See Environment Configuration section below
```

### Environment Configuration

Create `.env.local` with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DATABASE_URL=your_database_url_with_pgbouncer

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# App Configuration
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### Database Setup

```bash
# Run database migrations
pnpm supabase db push

# Create initial admin user
pnpm admin:create

# (Optional) Create test data
pnpm test:create
```

### Development

```bash
# Start development server
pnpm dev

# Run in separate terminal for Stripe webhook testing
pnpm stripe:listen
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Internationalized routes
│   │   ├── page.tsx       # Homepage (game listing)
│   │   ├── auth/          # Authentication pages
│   │   ├── games/[gameId]/ # Game details pages
│   │   ├── dashboard/     # Merchant/Admin dashboards
│   │   └── payment/       # Payment flow pages
│   └── api/               # API routes
│       └── webhooks/      # Stripe webhook handler
├── components/
│   ├── ui/               # Reusable UI components (Radix-based)
│   └── features/         # Business logic components
├── actions/              # Next.js Server Actions
├── lib/                  # Core utilities and configurations
├── stores/               # Zustand state management
├── i18n/                 # Internationalization configuration
└── types/                # TypeScript type definitions
```

## 🎮 User Roles & Access Control

### Players (USER)
- Browse games and purchase SKUs
- View order history
- Manage profile information

### Merchants (MERCHANT)
- Manage own games and SKUs
- View sales analytics and orders
- **Strict Data Tenancy**: Can only access their own data

### Administrators (ADMIN)
- Full platform oversight
- User management
- Cross-merchant analytics

## 💳 Payment Flow

1. **Product Selection**: User selects a game SKU
2. **Order Creation**: Server creates pending order with Stripe Checkout Session
3. **Payment Processing**: User completes payment via Stripe Checkout
4. **Webhook Verification**: Stripe sends payment confirmation to webhook endpoint
5. **Order Fulfillment**: System updates order status and processes fulfillment

### Security Features

- **Idempotency**: Webhook processing checks for duplicate orders
- **Signature Verification**: All webhook signatures are verified
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Data Validation**: All inputs validated using Zod schemas

## 🌍 Internationalization

The platform supports multiple languages with dynamic routing:

- **English**: `/en/...` (default)
- **Chinese**: `/zh/...`

### Adding New Languages

1. Add translation files in `messages/` directory
2. Update `src/i18n/config.ts` with new locale
3. Run `pnpm lint` to ensure consistency

## 🧪 Testing

### Unit & Integration Tests
```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test:coverage

# Watch mode
pnpm test:watch
```

### E2E Tests
```bash
# Run Playwright tests
pnpm e2e

# Run specific test
pnpm e2e -- grep "Purchase Flow"
```

### Testing Strategy

- **Server Actions**: Tested with Vitest
- **Components**: Tested with React Testing Library
- **Payment Flow**: End-to-end testing with Stripe test mode
- **RLS Policies**: Database policy testing
- **Authentication**: Full auth flow testing

## 🔒 Security Architecture

### Row Level Security (RLS)
- All database tables implement RLS policies
- Merchants can only access their own data
- Role-based access control enforced at database level

### Server Actions Security
- All actions use `next-safe-action` with Zod validation
- Input sanitization and type checking
- Rate limiting and error handling

### Payment Security
- PCI compliance through Stripe integration
- Webhook signature verification
- No sensitive data stored in client-side code

## 📊 Analytics & Monitoring

### Merchant Dashboard
- Sales overview with charts
- Order history and status tracking
- Revenue analytics by game and SKU
- Customer insights

### Admin Dashboard
- Platform-wide metrics
- Merchant management
- Financial reporting
- System health monitoring

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### Environment Variables

Ensure all variables from `.env.local` are configured in production:
- Supabase URLs and keys
- Stripe keys and webhook secret
- NextAuth secret and URL

### Database Migration

```bash
# Push schema changes to production
pnpm supabase db push --remote production
```

## 🛠️ Development Workflow

### Code Quality

```bash
# Lint and format code
pnpm lint

# Type checking
pnpm typecheck

# Run all quality checks
pnpm check
```

### Git Hooks

Pre-commit hooks run automatically:
- Biome formatting and linting
- Type checking
- Test execution on affected files

### Adding New Features

1. Create feature branch from `main`
2. Implement Server Actions in `src/actions/`
3. Create components in `src/components/features/`
4. Add tests in appropriate test directories
5. Update internationalization files
6. Run full test suite before PR

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode conventions
- Use RSCs by default, minimize `"use client"`
- Implement proper error boundaries
- Add comprehensive tests for new features
- Update documentation for API changes

## 📚 API Documentation

### Server Actions

All business logic is implemented as Server Actions:

- `auth.actions.ts` - Authentication operations
- `games.actions.ts` - Game and SKU management
- `payment.actions.ts` - Payment processing
- `order.actions.ts` - Order management

### API Routes

- `/api/webhooks/stripe` - Stripe webhook handler
- `/api/auth/[...nextauth]` - NextAuth endpoints

## 🐛 Troubleshooting

### Common Issues

**Stripe Webhook Not Working**
- Ensure webhook secret is correctly configured
- Check that Stripe CLI is running in development
- Verify webhook endpoint is accessible

**Database Connection Issues**
- Check Supabase configuration in `.env.local`
- Ensure PgBouncer URL is used for server-side clients
- Verify RLS policies are correctly implemented

**Authentication Problems**
- Check Supabase Auth configuration
- Ensure redirect URLs are configured in Supabase dashboard
- Verify NextAuth secret is set

### Debug Mode

Enable debug logging:
```bash
# Run with debug logging
DEBUG=* pnpm dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the [documentation](./docs/)
- Review the [troubleshooting guide](./docs/troubleshooting.md)

## 🔮 Roadmap

### Upcoming Features

- **Mobile App**: React Native implementation
- **Advanced Analytics**: Real-time dashboard updates
- **Multi-currency Support**: Extended currency handling
- **Subscription Management**: Recurring payment options
- **Third-party Integrations**: Game platform APIs
- **Advanced Fraud Detection**: Machine learning-based security

### Technical Improvements

- **Microservices Migration**: Service-oriented architecture
- **Caching Layer**: Redis integration for performance
- **CDN Optimization**: Global content delivery
- **Database Sharding**: Horizontal scaling capabilities

---

Built with ❤️ using modern web technologies and best practices.