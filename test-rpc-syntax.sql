-- Test script to validate the fixed RPC function syntax
-- This script checks for the specific column ambiguity issues we fixed

-- Test the fixed top_skus_data CTE
WITH 
merchant_orders AS (
    SELECT 
        'sku-1'::text as sku_id,
        'SKU 1'::text as sku_name, 
        'Game 1'::text as game_name,
        '{"usd": "10.00"}'::jsonb as prices,
        1000::bigint as amount,
        'completed'::text as status
),
top_skus_query AS (
    SELECT
        sku_id,
        sku_name,
        game_name,
        prices,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS total_revenue,
        COUNT(*) AS order_count
    FROM merchant_orders
    WHERE status = 'completed'
    GROUP BY sku_id, sku_name, game_name, prices
    ORDER BY total_revenue DESC
    LIMIT 10
),
top_skus_data AS (
    SELECT
        jsonb_agg(
            jsonb_build_object(
                'sku_id', top_skus_query.sku_id,
                'sku_name', top_skus_query.sku_name,
                'game_name', top_skus_query.game_name,
                'total_revenue', top_skus_query.total_revenue,
                'order_count', top_skus_query.order_count
            ) ORDER BY top_skus_query.total_revenue DESC
        ) AS top_skus
    FROM top_skus_query
)
SELECT * FROM top_skus_data;

-- Test the fixed revenue_by_game_data CTE  
WITH 
merchant_orders AS (
    SELECT 
        'game-1'::text as game_id,
        'Game 1'::text as game_name,
        1000::bigint as amount,
        'completed'::text as status
),
game_revenue AS (
    SELECT
        game_id,
        game_name,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) AS total_revenue,
        COUNT(*) AS order_count,
        COUNT(DISTINCT game_id) AS sku_count
    FROM merchant_orders
    WHERE status = 'completed'
    GROUP BY game_id, game_name
    ORDER BY total_revenue DESC
),
revenue_by_game_data AS (
    SELECT
        jsonb_agg(
            jsonb_build_object(
                'game_id', game_revenue.game_id,
                'game_name', game_revenue.game_name,
                'total_revenue', game_revenue.total_revenue,
                'order_count', game_revenue.order_count,
                'sku_count', game_revenue.sku_count
            ) ORDER BY game_revenue.total_revenue DESC
        ) AS revenue_by_game
    FROM game_revenue
)
SELECT * FROM revenue_by_game_data;
