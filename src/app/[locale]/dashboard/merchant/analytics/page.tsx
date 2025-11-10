import { useTranslations } from "next-intl";
import { Suspense } from "react";
import {
  getDashboardAnalytics,
  getRecentOrders,
  getRevenueTrends,
  getTopPerformingProducts,
} from "@/actions/merchant-analytics.actions";
import {
  AnalyticsCards,
  DateRangeFilter,
  RecentOrdersTable,
  RevenueChart,
  TopProductsTable,
} from "@/components/features/merchant/analytics-components";
import { MerchantDashboardSkeleton } from "@/components/features/merchant/dashboard-skeletons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// Analytics Dashboard Content Component
async function AnalyticsDashboardContent({
  merchantId,
  dateRange,
}: {
  merchantId: string;
  dateRange?: { start_date: string; end_date: string };
}) {
  const t = useTranslations();

  try {
    // Fetch all analytics data in parallel
    let analyticsData;
    let recentOrdersData;
    let topProductsData;
    let revenueTrendsData;

    try {
      analyticsData = await getDashboardAnalytics({ merchantId });
    } catch (error) {
      analyticsData = null;
    }

    try {
      recentOrdersData = await getRecentOrders({ merchantId, limit: 10 });
    } catch (error) {
      recentOrdersData = { orders: [] };
    }

    try {
      topProductsData = await getTopPerformingProducts({
        merchantId,
        days: 30,
      });
    } catch (error) {
      topProductsData = { top_skus: [] };
    }

    try {
      revenueTrendsData = await getRevenueTrends({
        merchantId,
        days: 30,
        granularity: "day",
      });
    } catch (error) {
      revenueTrendsData = { daily_sales: [], revenue_by_game: [] };
    }

    if (!analyticsData) {
      return (
        <Card className="p-6 bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-800">
              {t("admin.errorOccurred")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-600 text-sm">
              Failed to fetch analytics data
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Date Range Filter */}
        <DateRangeFilter merchantId={merchantId} />

        {/* Analytics Cards */}
        <AnalyticsCards analytics={analyticsData.data!} />

        {/* Revenue Chart */}
        <RevenueChart
          revenueData={{
            revenue_data: (revenueTrendsData?.revenue_by_game || []).map(
              (game) => ({
                game_id: game.game_id,
                game_name: game.game_name,
                period: new Date().toISOString(),
                order_count: game.order_count,
                completed_orders: Math.floor(game.order_count * 0.8), // Estimate
                revenue: game.total_revenue,
                unique_customers: Math.floor(game.order_count * 0.9), // Estimate
                average_order_value:
                  game.order_count > 0
                    ? game.total_revenue / game.order_count / 100
                    : 0,
              }),
            ),
            summary: {
              total_games: analyticsData.data?.revenue_by_game?.length || 0,
              active_games: analyticsData.data?.revenue_by_game?.length || 0,
              total_revenue: analyticsData.data?.total_revenue || 0,
              total_orders: analyticsData.data?.total_orders || 0,
              completed_orders: analyticsData.data?.completed_orders || 0,
              unique_customers: analyticsData.data?.unique_customers || 0,
              top_game: analyticsData.data?.revenue_by_game?.[0]
                ? {
                    game_id: analyticsData.data.revenue_by_game[0].game_id,
                    game_name: analyticsData.data.revenue_by_game[0].game_name,
                    revenue:
                      analyticsData.data.revenue_by_game[0].total_revenue,
                  }
                : null,
              period_breakdown:
                revenueTrendsData?.daily_sales?.map((sale) => ({
                  period: sale.date,
                  revenue: sale.revenue,
                  orders: sale.orders,
                })) || [],
              date_range: {
                start_date: new Date(
                  Date.now() - 30 * 24 * 60 * 60 * 1000,
                ).toISOString(),
                end_date: new Date().toISOString(),
              },
              group_by: "day" as const,
            },
          }}
          analytics={analyticsData.data!}
        />

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <RecentOrdersTable orders={recentOrdersData?.orders || []} />

          {/* Top Products */}
          <TopProductsTable
            products={analyticsData.data?.top_skus || []}
            analytics={analyticsData.data!}
          />
        </div>

        {/* Additional Analytics Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("analytics.orderStatusDistribution")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.data?.order_status_breakdown.map(
                  (status: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium capitalize">
                          {t(`common.${status.status}`)}
                        </span>
                        <span className="text-sm text-gray-600">
                          {status.count} ({status.percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            status.status === "completed"
                              ? "bg-green-500"
                              : status.status === "pending"
                                ? "bg-yellow-500"
                                : "bg-red-500"
                          }`}
                          style={{ width: `${status.percentage}%` }}
                        />
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>

          {/* Revenue by Game */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("analytics.revenueByGame")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analyticsData.data?.revenue_by_game.map(
                  (game: any, index: number) => {
                    const totalRevenue = analyticsData.data?.total_revenue || 0;
                    const percentage =
                      totalRevenue > 0
                        ? (game.total_revenue / totalRevenue) * 100
                        : 0;

                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">
                            {game.game_name}
                          </span>
                          <span className="text-sm text-gray-600">
                            ${(game.total_revenue / 100).toFixed(2)} (
                            {percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-[#359EFF]"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500">
                          {game.order_count} orders • {game.sku_count} products
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hourly Sales Pattern */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {t("analytics.hourlySalesPattern")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-24 gap-1">
                {analyticsData.data?.hourly_sales.map(
                  (hour: any, index: number) => {
                    const maxRevenue = Math.max(
                      ...(analyticsData.data?.hourly_sales || []).map(
                        (h: any) => h.revenue,
                      ),
                    );
                    const barHeight =
                      maxRevenue > 0 ? (hour.revenue / maxRevenue) * 100 : 0;

                    return (
                      <div key={index} className="flex flex-col items-center">
                        <div className="w-full bg-gray-100 rounded-t flex-1 min-h-20 relative">
                          {hour.revenue > 0 && (
                            <div
                              className="absolute bottom-0 w-full bg-[#359EFF] rounded-t"
                              style={{ height: `${barHeight}%` }}
                              title={`${hour.hour}:00 - $${(hour.revenue / 100).toFixed(2)}`}
                            />
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {hour.hour}
                        </div>
                      </div>
                    );
                  },
                )}
              </div>
              <div className="text-sm text-gray-600 text-center">
                {t("analytics.hourlySalesDescription")}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-800">
            {t("admin.errorOccurred")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">
            {error instanceof Error ? error.message : t("common.error")}
          </p>
        </CardContent>
      </Card>
    );
  }
}

// Main Analytics Dashboard Page
export default function AnalyticsDashboardPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams?: {
    start_date?: string;
    end_date?: string;
  };
}) {
  const t = useTranslations();

  // TODO: Get merchant ID from auth context
  const merchantId = "temp-merchant-id"; // This should come from authentication

  const dateRange =
    searchParams?.start_date && searchParams?.end_date
      ? {
          start_date: searchParams.start_date,
          end_date: searchParams.end_date,
        }
      : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("merchant.analytics")}
          </h1>
          <p className="text-gray-600">{t("merchant.analyticsDescription")}</p>
        </div>
      </div>

      {/* Analytics Dashboard */}
      <Suspense fallback={<MerchantDashboardSkeleton />}>
        <AnalyticsDashboardContent
          merchantId={merchantId}
          dateRange={dateRange}
        />
      </Suspense>
    </div>
  );
}
