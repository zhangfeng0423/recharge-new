import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { getCurrentUser } from "@/actions/auth.actions";
import { getDashboardAnalytics } from "@/actions/merchant-analytics.actions";
import {
  AnalyticsCards,
  RecentOrdersTable,
  RevenueChart,
  TopProductsTable,
} from "@/components/features/merchant/analytics-components";
import { MerchantDashboardSkeleton } from "@/components/features/merchant/dashboard-skeletons";
import { MerchantDashboardError } from "@/components/features/merchant/merchant-dashboard-error";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

async function MerchantDashboardStats() {
  const t = await getTranslations();
  const user = await getCurrentUser();

  if (!user) {
    return (
      <MerchantDashboardError
        error={{ type: "permission", message: t("merchant.userNotAuthenticated") }}
      />
    );
  }

  if (user.role !== "MERCHANT") {
    return (
      <MerchantDashboardError
        error={{
          type: "permission",
          message: t("merchant.userNotMerchantRole"),
        }}
      />
    );
  }

  const result = await getDashboardAnalytics({ merchantId: user.id });

  if (result.serverError || result.validationErrors) {
    return (
      <MerchantDashboardError
        error={{
          type: "server_error",
          message: result.serverError || t("merchant.validationFailed"),
        }}
      />
    );
  }

  if (!result.data) {
    return (
      <MerchantDashboardError
        error={{
          type: "data_unavailable",
          message: "No analytics data available.",
        }}
      />
    );
  }

  const analytics = result.data;

  return (
    <div className="space-y-6">
      <AnalyticsCards analytics={analytics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart
            revenueData={{
              revenue_data: analytics.revenue_by_game.map((game: any) => ({
                game_id: game.game_id,
                game_name: game.game_name,
                period: new Date().toISOString(),
                order_count: game.order_count,
                completed_orders: analytics.completed_orders,
                revenue: game.total_revenue,
                unique_customers: analytics.unique_customers,
                average_order_value: analytics.average_order_value,
              })),
              summary: {
                total_games: analytics.revenue_by_game.length,
                active_games: analytics.revenue_by_game.length,
                total_revenue: analytics.total_revenue,
                total_orders: analytics.total_orders,
                completed_orders: analytics.completed_orders,
                unique_customers: analytics.unique_customers,
                top_game:
                  analytics.revenue_by_game.length > 0
                    ? {
                        game_id: analytics.revenue_by_game[0].game_id,
                        game_name: analytics.revenue_by_game[0].game_name,
                        revenue: analytics.revenue_by_game[0].total_revenue,
                      }
                    : null,
                period_breakdown: [
                  {
                    period: new Date().toISOString(),
                    revenue: analytics.today_revenue,
                    orders: analytics.today_orders,
                  },
                ],
                date_range: {
                  start_date: new Date(
                    Date.now() - 30 * 24 * 60 * 60 * 1000,
                  ).toISOString(),
                  end_date: new Date().toISOString(),
                },
                group_by: "day" as const,
              },
            }}
            analytics={analytics}
          />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("merchant.todayStats")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("merchant.revenue")}
                  </span>
                  <span className="font-medium">
                    ${(analytics.today_revenue / 100).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("merchant.orders")}
                  </span>
                  <span className="font-medium">{analytics.today_orders}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    {t("merchant.customers")}
                  </span>
                  <span className="font-medium">
                    {analytics.unique_customers}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {t("merchant.orderStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.order_status_breakdown.map((status, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <span className="text-sm text-gray-600 capitalize">
                      {t(`common.${status.status}`)}
                    </span>
                    <span className="font-medium">{status.count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentOrdersTable orders={analytics.recent_orders} />
        <TopProductsTable products={analytics.top_skus} analytics={analytics} />
      </div>
    </div>
  );
}

export default async function MerchantDashboardPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const t = await getTranslations();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("merchant.title")}
          </h1>
          <p className="text-gray-600 mt-1">
            {t("merchant.dashboardDescription")}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href={`/${locale}/dashboard/merchant/analytics`}>
            <Button variant="outline">{t("merchant.viewAnalytics")}</Button>
          </Link>
          <Link href={`/${locale}/dashboard/merchant/games/create`}>
            <Button>{t("merchant.createNewGame")}</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href={`/${locale}/dashboard/merchant/games`}>
          <Button variant="outline" className="w-full justify-start h-16">
            <div className="text-left">
              <div className="font-medium">{t("merchant.games")}</div>
              <div className="text-xs text-gray-500">
                {t("merchant.manageGames")}
              </div>
            </div>
          </Button>
        </Link>

        <Link href={`/${locale}/dashboard/merchant/orders`}>
          <Button variant="outline" className="w-full justify-start h-16">
            <div className="text-left">
              <div className="font-medium">{t("merchant.orders")}</div>
              <div className="text-xs text-gray-500">
                {t("merchant.viewOrders")}
              </div>
            </div>
          </Button>
        </Link>

        <Link href={`/${locale}/dashboard/merchant/analytics`}>
          <Button variant="outline" className="w-full justify-start h-16">
            <div className="text-left">
              <div className="font-medium">{t("merchant.analytics")}</div>
              <div className="text-xs text-gray-500">
                {t("merchant.viewAnalytics")}
              </div>
            </div>
          </Button>
        </Link>

        <Link href={`/${locale}/dashboard/merchant/profile`}>
          <Button variant="outline" className="w-full justify-start h-16">
            <div className="text-left">
              <div className="font-medium">{t("nav.profile")}</div>
              <div className="text-xs text-gray-500">
                {t("merchant.accountSettings")}
              </div>
            </div>
          </Button>
        </Link>
      </div>

      <Suspense fallback={<MerchantDashboardSkeleton />}>
        <MerchantDashboardStats />
      </Suspense>
    </div>
  );
}
