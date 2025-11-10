import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { getPlatformAnalytics } from "@/actions/admin.actions";
import { AdminDashboardSkeleton } from "@/components/features/dashboard-skeletons";
import { Button } from "@/components/ui/Button";
import { AdminDashboardStatsClient } from "./admin-dashboard-stats-client";

// Separate component for the actual stats content
async function AdminDashboardStatsContent() {
  const analyticsResult = await getPlatformAnalytics();

  if (!analyticsResult.success) {
    throw new Error(analyticsResult.message || "Failed to load analytics data");
  }

  // Validate data structure
  const data = analyticsResult.data;
  if (!data || typeof data !== "object") {
    throw new Error("Invalid data structure received from server");
  }

  // Helper function to validate numeric data
  const validateNumericData = (
    value: any,
    defaultValue: number = 0,
  ): number => {
    if (value === null || value === undefined) return defaultValue;
    const num = Number(value);
    return isNaN(num) ? defaultValue : Math.max(0, num);
  };

  // Ensure all required fields exist with proper defaults
  const validatedData = {
    totalUsers: validateNumericData(data.totalUsers),
    totalMerchants: validateNumericData(data.totalMerchants),
    totalGames: validateNumericData(data.totalGames),
    totalSkus: validateNumericData(data.totalSkus),
    totalOrders: validateNumericData(data.totalOrders),
    totalRevenue: validateNumericData(data.totalRevenue),
    orderStatusBreakdown: {
      pending: validateNumericData(data.orderStatusBreakdown?.pending),
      completed: validateNumericData(data.orderStatusBreakdown?.completed),
      failed: validateNumericData(data.orderStatusBreakdown?.failed),
      refunded: validateNumericData(data.orderStatusBreakdown?.refunded),
      ...data.orderStatusBreakdown,
    },
    averageOrderValue: validateNumericData(data.averageOrderValue),
  };

  return validatedData;
}

// Main Admin Dashboard Stats Component
async function AdminDashboardStats() {
  const data = await AdminDashboardStatsContent();
  return <AdminDashboardStatsClient data={data} />;
}

// Main Admin Dashboard Page
export default async function AdminDashboardPage() {
  const t = await getTranslations();
  const locale = await getLocale();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("admin.title")}
          </h1>
          <p className="text-gray-600">{t("admin.platformOverview")}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href={`/${locale}/dashboard/admin/merchants`}>
          <Button variant="outline" className="w-full justify-start">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {t("admin.merchants")}
          </Button>
        </Link>

        <Link href={`/${locale}/dashboard/admin/games`}>
          <Button variant="outline" className="w-full justify-start">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            {t("admin.games")}
          </Button>
        </Link>

        <Link href={`/${locale}/dashboard/admin/orders`}>
          <Button variant="outline" className="w-full justify-start">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            {t("admin.orders")}
          </Button>
        </Link>
      </div>

      {/* Dashboard Stats with enhanced error handling and loading states */}
      <AdminDashboardStats />
    </div>
  );
}
