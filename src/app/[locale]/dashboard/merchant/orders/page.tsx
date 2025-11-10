import { useTranslations } from "next-intl";
import { Suspense } from "react";
import { getMerchantOrdersOverview } from "@/actions/merchant-analytics.actions";
import { OrderDetailsSkeleton } from "@/components/features/merchant/dashboard-skeletons";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  CurrencyFormatter,
  DateFormatter,
} from "@/lib/merchant-analytics-types";

// Orders Table Component
async function OrdersTableContent() {
  const t = useTranslations();

  try {
    // TODO: Get merchant ID from auth context
    const merchantId = "temp-merchant-id";

    let ordersData;
    try {
      ordersData = await getMerchantOrdersOverview({
        merchant_id: merchantId,
        limit: 50,
        offset: 0,
      });
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

    const { orders } = ordersData;

    if (orders.length === 0) {
      return (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("merchant.orders")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t("merchant.noOrdersYet")}
              </h3>
              <p className="text-gray-500">
                {t("merchant.noOrdersDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("merchant.orders")}</CardTitle>
          <p className="text-sm text-gray-600">
            {t("merchant.orderManagementDescription")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    {t("analytics.order")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    {t("analytics.customer")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    {t("analytics.product")}
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700">
                    {t("analytics.amount")}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    {t("analytics.status")}
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">
                    {t("common.createdAt")}
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order: any, _index: number) => (
                  <tr
                    key={order.order_id}
                    className="border-b hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          #{order.order_id.slice(-8)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {DateFormatter.formatRelativeTime(order.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {order.customer_email}
                        </div>
                        <div className="text-xs text-gray-500">
                          Order #{order.order_id?.slice(-8)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900">
                          {order.sku_name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {order.game_name}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {CurrencyFormatter.formatCurrency(order.amount)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {CurrencyFormatter.formatCurrency(
                          parseInt(order.price, 10) * 100,
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
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
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        {DateFormatter.formatDate(order.created_at)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {DateFormatter.formatDateTime(order.created_at)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button variant="outline" size="sm">
                        {t("common.viewDetails")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
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

// Main Orders Page
export default function OrdersPage() {
  const t = useTranslations();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t("merchant.orders")}
          </h1>
          <p className="text-gray-600">
            {t("merchant.orderManagementDescription")}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
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
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {t("merchant.exportOrders")}
          </Button>
          <Button variant="outline">
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            {t("merchant.filterOrders")}
          </Button>
        </div>
      </div>

      {/* Orders Table */}
      <Suspense fallback={<OrderDetailsSkeleton />}>
        <OrdersTableContent />
      </Suspense>
    </div>
  );
}
