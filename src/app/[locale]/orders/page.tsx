import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/actions/auth.actions";
import { getUserRecentOrders } from "@/actions/order.actions";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface OrdersPageProps {
  params: Promise<{
    locale: string;
  }>;
}

// 订单状态显示组件
function OrderStatusBadge({ status }: { status: string }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "已完成";
      case "pending":
        return "待支付";
      case "failed":
        return "失败";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
        status,
      )}`}
    >
      {getStatusText(status)}
    </span>
  );
}

// 订单列表组件
async function OrdersList({ locale }: { locale: string }) {
  const t = await getTranslations("common");
  const ordersResult = await getUserRecentOrders();

  if (!ordersResult.data?.success || !ordersResult.data.orders) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">
            {t("loadOrdersFailed")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const orders = ordersResult.data.orders;

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="max-w-sm mx-auto">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {t("noOrdersYet")}
            </h3>
            <p className="text-gray-500 mb-4">
              {t("noOrdersDescription")}
            </p>
            <Link href={`/${locale}`}>
              <Button>{t("browseGames")}</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order: any) => (
        <Card key={order.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* SKU 图片 */}
                <div className="relative w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {order.sku?.image_url ? (
                    <Image
                      src={order.sku.image_url}
                      alt={
                        order.sku?.name?.[locale] ||
                        order.sku?.name?.en ||
                        "Product"
                      }
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">
                        {order.sku?.name?.en?.charAt(0) || "G"}
                      </span>
                    </div>
                  )}
                </div>

                {/* 订单信息 */}
                <div>
                  <h3 className="font-medium text-gray-900">
                    {order.sku?.name?.[locale] ||
                      order.sku?.name?.en ||
                      "Unknown Product"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {order.sku?.game?.name?.[locale] ||
                      order.sku?.game?.name?.en ||
                      "Unknown Game"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(order.created_at).toLocaleDateString(
                      locale === "zh" ? "zh-CN" : "en-US",
                    )}
                  </p>
                </div>
              </div>

              {/* 价格和状态 */}
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ${(order.amount / 100).toFixed(2)}
                </div>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function OrdersPage({ params }: OrdersPageProps) {
  const { locale } = await params;
  const t = await getTranslations("common");

  // 检查用户是否已登录
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/auth`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-[#359EFF] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AP</span>
              </div>
              <span className="text-xl font-semibold text-gray-900">
                AppPay
              </span>
            </div>

            {/* 返回首页 */}
            <Link href={`/${locale}`}>
              <Button variant="outline" size="sm">
                {t("backToHome")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 页面标题 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("myOrders")}
            </h1>
            <p className="text-gray-600">
              {t("viewOrderHistory")}
            </p>
          </div>

          {/* 订单列表 */}
          <OrdersList locale={locale} />
        </div>
      </main>
    </div>
  );
}
