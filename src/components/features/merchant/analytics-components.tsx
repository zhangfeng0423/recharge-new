"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type {
  MerchantAnalytics,
  MerchantRevenueByGame,
  Order,
  RecentOrder,
  TopSku,
} from "@/lib/merchant-analytics-types";
import {
  CurrencyFormatter,
  DateFormatter,
} from "@/lib/merchant-analytics-types";

// Date Range Filter Component
export function DateRangeFilter({ merchantId }: { merchantId: string }) {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale;

  const [dateRange, setDateRange] = useState({
    start_date: "",
    end_date: "",
  });

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    setDateRange((prev) => ({
      ...prev,
      [type === "start" ? "start_date" : "end_date"]: value,
    }));
  };

  const applyDateRange = () => {
    if (dateRange.start_date && dateRange.end_date) {
      const params = new URLSearchParams({
        start_date: dateRange.start_date,
        end_date: dateRange.end_date,
      });
      window.location.href = `/${locale}/dashboard/merchant/analytics?${params.toString()}`;
    }
  };

  const clearDateRange = () => {
    window.location.href = `/${locale}/dashboard/merchant/analytics`;
  };

  // Predefined date ranges
  const presetRanges = [
    { label: t("analytics.last7Days"), days: 7 },
    { label: t("analytics.last30Days"), days: 30 },
    { label: t("analytics.last90Days"), days: 90 },
  ];

  const applyPresetRange = (days: number) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const params = new URLSearchParams({
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
    });
    window.location.href = `/${locale}/dashboard/merchant/analytics?${params.toString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {t("analytics.dateRangeFilter")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Preset Ranges */}
          <div className="flex flex-wrap gap-2">
            {presetRanges.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                size="sm"
                onClick={() => applyPresetRange(preset.days)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("analytics.startDate")}
              </label>
              <input
                type="date"
                value={dateRange.start_date}
                onChange={(e) => handleDateRangeChange("start", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#359EFF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("analytics.endDate")}
              </label>
              <input
                type="date"
                value={dateRange.end_date}
                onChange={(e) => handleDateRangeChange("end", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#359EFF]"
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={applyDateRange} size="sm">
                {t("analytics.apply")}
              </Button>
              <Button variant="outline" onClick={clearDateRange} size="sm">
                {t("analytics.clear")}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analytics Cards Component
export function AnalyticsCards({
  analytics,
}: {
  analytics: MerchantAnalytics;
}) {
  const t = useTranslations();

  const cards = [
    {
      title: t("analytics.totalRevenue"),
      value: CurrencyFormatter.formatCurrency(analytics.total_revenue),
      change: analytics.today_revenue - analytics.yesterday_revenue,
      changeLabel: t("analytics.fromYesterday"),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-green-100 text-green-600",
      bgColor: "bg-green-50 border-green-200",
    },
    {
      title: t("analytics.totalOrders"),
      value: analytics.total_orders.toLocaleString(),
      change: analytics.today_orders - analytics.yesterday_orders,
      changeLabel: t("analytics.fromYesterday"),
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      color: "bg-[#359EFF]/20 text-[#359EFF]",
      bgColor: "bg-[#359EFF]/10 border-[#359EFF]/30",
    },
    {
      title: t("analytics.conversionRate"),
      value: `${analytics.conversion_rate.toFixed(1)}%`,
      change: null,
      changeLabel: t("analytics.completionRate"),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      color: "bg-purple-100 text-purple-600",
      bgColor: "bg-purple-50 border-purple-200",
    },
    {
      title: t("analytics.averageOrderValue"),
      value: CurrencyFormatter.formatCurrency(
        analytics.average_order_value * 100,
      ),
      change: null,
      changeLabel: t("analytics.perOrder"),
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
          />
        </svg>
      ),
      color: "bg-orange-100 text-orange-600",
      bgColor: "bg-orange-50 border-orange-200",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bgColor} border`}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {card.value}
                </p>
                {card.change !== null && (
                  <div className="flex items-center mt-2">
                    <span
                      className={`text-sm font-medium ${
                        card.change >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {card.change >= 0 ? "+" : ""}
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">
                      {card.changeLabel}
                    </span>
                  </div>
                )}
                {card.change === null && card.changeLabel && (
                  <p className="text-sm text-gray-500 mt-2">
                    {card.changeLabel}
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-full ${card.color}`}>
                {card.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Revenue Chart Component
export function RevenueChart({
  revenueData,
  analytics,
}: {
  revenueData: MerchantRevenueByGame;
  analytics: MerchantAnalytics;
}) {
  const t = useTranslations();

  // Prepare chart data for daily sales
  const dailySalesData = analytics.daily_sales.map((day) => ({
    date: DateFormatter.formatDate(day.date),
    revenue: CurrencyFormatter.centsToDollars(day.revenue),
    orders: day.orders,
  }));

  // Calculate max values for scaling
  const maxRevenue = Math.max(
    ...dailySalesData.map((d) => parseFloat(d.revenue)),
  );
  const _maxOrders = Math.max(...dailySalesData.map((d) => d.orders));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("analytics.revenueChart")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Revenue Bar Chart */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {t("analytics.dailyRevenue")}
            </h4>
            <div className="space-y-2">
              {dailySalesData.slice(-7).map((day, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-16 text-sm text-gray-600">{day.date}</div>
                  <div className="flex-1">
                    <div className="relative h-6 bg-gray-100 rounded">
                      <div
                        className="absolute left-0 top-0 h-full bg-[#359EFF] rounded"
                        style={{
                          width: `${(parseFloat(day.revenue) / maxRevenue) * 100}%`,
                        }}
                      />
                      <span className="absolute right-2 top-0.5 text-xs text-white font-medium">
                        ${day.revenue}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {t("analytics.orderStatusBreakdown")}
            </h4>
            <div className="grid grid-cols-3 gap-4">
              {analytics.order_status_breakdown.map((status, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`w-full h-20 rounded-lg flex items-center justify-center ${
                      status.status === "completed"
                        ? "bg-green-100"
                        : status.status === "pending"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                    }`}
                  >
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {status.count}
                      </div>
                      <div className="text-sm text-gray-600">
                        {status.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {status.percentage.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Game */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              {t("analytics.revenueByGame")}
            </h4>
            <div className="space-y-2">
              {analytics.revenue_by_game.map((game, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-gray-900">
                      {game.game_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {game.order_count} {t("analytics.orders")}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">
                      {CurrencyFormatter.formatCurrency(game.total_revenue)}
                    </div>
                    <div className="text-sm text-gray-600">
                      {game.sku_count} {t("analytics.products")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Orders Table Component
export function RecentOrdersTable({
  orders,
}: {
  orders: RecentOrder[] | Order[];
}) {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale;

  if (orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("analytics.recentOrders")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {t("analytics.noRecentOrders")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {t("analytics.recentOrders")}
          </CardTitle>
          <Link href={`/${locale}/dashboard/merchant/orders`}>
            <Button variant="outline" size="sm">
              {t("analytics.viewAll")}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  {t("analytics.order")}
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  {t("analytics.customer")}
                </th>
                <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">
                  {t("analytics.product")}
                </th>
                <th className="text-right py-3 px-2 text-sm font-medium text-gray-700">
                  {t("analytics.amount")}
                </th>
                <th className="text-center py-3 px-2 text-sm font-medium text-gray-700">
                  {t("analytics.status")}
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any, index: number) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-2">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        #{(order.order_id || "").slice(-8)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {DateFormatter.formatRelativeTime(order.created_at)}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm text-gray-900">
                      {order.customer_email}
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {order.sku_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.game_name}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-2 text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {CurrencyFormatter.formatCurrency(order.amount)}
                    </div>
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {t(`common.${order.status}`)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Top Products Table Component
export function TopProductsTable({
  products,
  analytics,
}: {
  products: TopSku[];
  analytics: MerchantAnalytics;
}) {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale;

  if (products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {t("analytics.topProducts")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            {t("analytics.noProducts")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">
            {t("analytics.topProducts")}
          </CardTitle>
          <Link href={`/${locale}/dashboard/merchant/products`}>
            <Button variant="outline" size="sm">
              {t("analytics.manageProducts")}
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.slice(0, 5).map((product, index) => (
            <div
              key={product.sku_id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-[#359EFF]/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[#359EFF]">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {product.sku_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.game_name}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {CurrencyFormatter.formatCurrency(product.total_revenue)}
                </div>
                <div className="text-sm text-gray-600">
                  {product.order_count} {t("analytics.orders")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
