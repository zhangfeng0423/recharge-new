-- =============================================================================
-- Game Recharge Platform - Initial Database Schema
-- Version: 1.0
-- Created: 2025-01-09
--
-- This migration creates the complete database schema for the game recharge
-- platform according to PRD.md requirements with full RLS support.
--
-- Tables: profiles, games, skus, orders
-- Features: Multi-tenant RLS, internationalization, audit trails
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- UTILITY FUNCTIONS
-- =============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'ADMIN'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get merchant's games for complex RLS policies
CREATE OR REPLACE FUNCTION get_merchant_game_ids(p_merchant_id UUID)
RETURNS TABLE(game_id UUID) AS $$
BEGIN
    RETURN QUERY
    SELECT g.id
    FROM public.games g
    WHERE g.merchant_id = p_merchant_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TABLES
-- =============================================================================

-- Profiles table - extends auth.users with role-based access
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('USER', 'MERCHANT', 'ADMIN')) DEFAULT 'USER',
    merchant_name VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT profiles_merchant_name_check
        CHECK (role != 'MERCHANT' OR merchant_name IS NOT NULL)
);

-- Games table - game information managed by merchants
CREATE TABLE IF NOT EXISTS public.games (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    description JSONB,
    banner_url VARCHAR(500),
    merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- JSONB validation constraints
    CONSTRAINT games_name_valid_json
        CHECK (jsonb_typeof(name) = 'object' AND name ? 'en' AND name ? 'zh'),
    CONSTRAINT games_description_valid_json
        CHECK (description IS NULL OR (jsonb_typeof(description) = 'object' AND description ? 'en' AND description ? 'zh'))
);

-- SKUs table - purchasable items within games
CREATE TABLE IF NOT EXISTS public.skus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL,
    description JSONB,
    prices JSONB NOT NULL,
    image_url VARCHAR(500),
    game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- JSONB validation constraints
    CONSTRAINT skus_name_valid_json
        CHECK (jsonb_typeof(name) = 'object' AND name ? 'en' AND name ? 'zh'),
    CONSTRAINT skus_description_valid_json
        CHECK (description IS NULL OR (jsonb_typeof(description) = 'object' AND description ? 'en' AND description ? 'zh')),
    CONSTRAINT skus_prices_valid_json
        CHECK (jsonb_typeof(prices) = 'object' AND prices ? 'usd' AND (prices->>'usd') ~ '^\d+$')
);

-- Orders table - purchase records and payment tracking
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sku_id UUID NOT NULL REFERENCES public.skus(id) ON DELETE CASCADE,
    merchant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'usd',
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed')) DEFAULT 'pending',
    stripe_checkout_session_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Profiles table indexes
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_merchant_name_idx ON public.profiles(merchant_name) WHERE merchant_name IS NOT NULL;

-- Games table indexes
CREATE INDEX IF NOT EXISTS games_merchant_id_idx ON public.games(merchant_id);
CREATE INDEX IF NOT EXISTS games_created_at_idx ON public.games(created_at);
CREATE INDEX IF NOT EXISTS games_name_gin_idx ON public.games USING GIN(name);

-- SKUs table indexes
CREATE INDEX IF NOT EXISTS skus_game_id_idx ON public.skus(game_id);
CREATE INDEX IF NOT EXISTS skus_created_at_idx ON public.skus(created_at);
CREATE INDEX IF NOT EXISTS skus_prices_gin_idx ON public.skus USING GIN(prices);

-- Orders table indexes
CREATE INDEX IF NOT EXISTS orders_user_id_idx ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS orders_sku_id_idx ON public.orders(sku_id);
CREATE INDEX IF NOT EXISTS orders_merchant_id_idx ON public.orders(merchant_id);
CREATE INDEX IF NOT EXISTS orders_status_idx ON public.orders(status);
CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_session_idx ON public.orders(stripe_checkout_session_id) WHERE stripe_checkout_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_merchant_status_idx ON public.orders(merchant_id, status);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON public.orders(created_at);

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Auto-update updated_at timestamps
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER games_updated_at BEFORE UPDATE ON public.games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER skus_updated_at BEFORE UPDATE ON public.skus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER orders_updated_at BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES
-- =============================================================================

-- Profiles table RLS policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
    FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Games table RLS policies
DROP POLICY IF EXISTS "Everyone can view active games" ON public.games;
CREATE POLICY "Everyone can view active games" ON public.games
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all games" ON public.games;
CREATE POLICY "Admins can manage all games" ON public.games
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Merchants can manage own games" ON public.games;
CREATE POLICY "Merchants can manage own games" ON public.games
    FOR ALL USING (
        auth.uid() = merchant_id AND
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'MERCHANT'
        )
    );

-- SKUs table RLS policies
DROP POLICY IF EXISTS "Everyone can view SKUs" ON public.skus;
CREATE POLICY "Everyone can view SKUs" ON public.skus
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage all SKUs" ON public.skus;
CREATE POLICY "Admins can manage all SKUs" ON public.skus
    FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "Merchants can manage own game SKUs" ON public.skus;
CREATE POLICY "Merchants can manage own game SKUs" ON public.skus
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.games g
            WHERE g.id = game_id
            AND g.merchant_id = auth.uid()
            AND EXISTS (
                SELECT 1 FROM public.profiles
                WHERE id = auth.uid() AND role = 'MERCHANT'
            )
        )
    );

-- Orders table RLS policies
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders" ON public.orders
    FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Users can view own orders" ON public.orders;
CREATE POLICY "Users can view own orders" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Merchants can view orders for their games" ON public.orders;
CREATE POLICY "Merchants can view orders for their games" ON public.orders
    FOR SELECT USING (
        auth.uid() = merchant_id OR
        EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
            AND p.role = 'MERCHANT'
            AND merchant_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;
CREATE POLICY "Admins can update all orders" ON public.orders
    FOR UPDATE USING (is_admin());

DROP POLICY IF EXISTS "System can insert orders" ON public.orders;
CREATE POLICY "System can insert orders" ON public.orders
    FOR INSERT WITH CHECK (true);

-- =============================================================================
-- INITIAL DATA & SEEDING
-- =============================================================================

-- Create admin user profile if it doesn't exist (requires auth.users entry)
-- This will be executed manually after setting up auth
-- INSERT INTO public.profiles (id, role, merchant_name)
-- SELECT auth.uid(), 'ADMIN', NULL
-- WHERE NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());

-- =============================================================================
-- VIEWS FOR ANALYTICS
-- =============================================================================

-- Merchant dashboard view
CREATE OR REPLACE VIEW merchant_analytics AS
SELECT
    p.id as merchant_id,
    p.merchant_name,
    COUNT(DISTINCT g.id) as total_games,
    COUNT(DISTINCT s.id) as total_skus,
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.amount), 0) as total_revenue,
    COUNT(DISTINCT CASE WHEN o.status = 'completed' THEN o.id END) as completed_orders,
    MAX(o.created_at) as last_order_date
FROM public.profiles p
LEFT JOIN public.games g ON p.id = g.merchant_id
LEFT JOIN public.skus s ON g.id = s.game_id
LEFT JOIN public.orders o ON p.id = o.merchant_id
WHERE p.role = 'MERCHANT'
GROUP BY p.id, p.merchant_name;

-- =============================================================================
-- MIGRATION COMPLETION
-- =============================================================================

-- Optional: Create schema_migrations table for tracking
-- Comment this out if using Supabase's built-in migration tracking
-- CREATE TABLE IF NOT EXISTS public.schema_migrations (
--     version VARCHAR(255) PRIMARY KEY,
--     applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
-- );

-- Record migration completion (uncomment if using custom migration tracking)
-- INSERT INTO public.schema_migrations (version, applied_at)
-- VALUES ('20250109_001_initial_schema', NOW())
-- ON CONFLICT (version) DO NOTHING;