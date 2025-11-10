import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrderBySessionId } from "@/actions/order.actions";
import { Alert } from "@/components/ui/Alert";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { formatAmount, formatDate } from "@/lib/utils";

interface PaymentSuccessPageProps {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    session_id?: string;
  }>;
}

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: PaymentSuccessPageProps) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const t = await getTranslations("common");

  if (!session_id) {
    notFound();
  }

  // Get order details
  const orderResult = await getOrderBySessionId({ sessionId: session_id });

  // Handle order fetch errors
  if (
    !orderResult.data?.success ||
    !orderResult.data?.data
  ) {
    return (
      <div className="max-w-md mx-auto">
        <Alert variant="destructive" className="mb-6">
          <p className="text-center">
            {(
              orderResult.data?.message ||
              t("unableToRetrieveOrderInfo")
            )}
          </p>
        </Alert>
        <div className="text-center">
          <Link
            href={`/${locale}/games`}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {t("returnToGames")}
          </Link>
        </div>
      </div>
    );
  }

  const order = (orderResult.data as any)?.success ? (orderResult.data as any).data : null;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success Animation/Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          {t("paymentSuccess")}
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          {t("paymentSuccessMessage")}
        </p>
      </div>

      {/* Order Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {t("orderDetails")}
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Order ID */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
            <span className="text-slate-600 dark:text-slate-400">
              {t("orderId")}
            </span>
            <span className="font-mono text-sm text-slate-900 dark:text-slate-100">
              {order.id}
            </span>
          </div>

          {/* Product Details */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {order.sku?.name[locale as "en" | "zh"] || order.sku?.name.en}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {order.sku?.game?.name[locale as "en" | "zh"] ||
                  order.sku?.game?.name.en}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-slate-900 dark:text-slate-100">
                {formatAmount(order.amount, order.currency)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Order Status:{" "}
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  {t("completed")}
                </span>
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-2 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                {t("paymentDate")}
              </span>
              <span className="text-slate-900 dark:text-slate-100">
                {formatDate(order.updated_at, locale)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">
                {t("paymentMethod")}
              </span>
              <span className="text-slate-900 dark:text-slate-100">
                {t("creditCard")}
              </span>
            </div>
            {order.stripe_checkout_session_id && (
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">
                  {t("transactionId")}
                </span>
                <span className="font-mono text-sm text-slate-900 dark:text-slate-100">
                  {order.stripe_checkout_session_id.slice(-8)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Product Image */}
      {order.sku?.image_url && (
        <div className="mb-6 text-center">
          <Image
            src={order.sku.image_url}
            alt={order.sku.name[locale as "en" | "zh"] || order.sku.name.en}
            width={96}
            height={96}
            className="w-24 h-24 mx-auto rounded-lg object-cover shadow-md"
          />
        </div>
      )}

      {/* Important Information */}
      <Alert variant="default" className="mb-6">
        <div className="flex items-start">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="Information"
            role="img"
          >
            <title>Information</title>
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
              {t("deliveryInformation")}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {t("deliveryMessage")}
            </p>
          </div>
        </div>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/${locale}/games`}
          className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
        >
          {t("continueShopping")}
        </Link>
        <Link
          href={`/${locale}/orders/${order.id}`}
          className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          {t("viewOrderDetails")}
        </Link>
      </div>

      {/* Customer Support */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
          {t("needHelp")}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
          <a
            href="mailto:support@gamerecharge.com"
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("emailSupport")}
          </a>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <Link
            href={`/${locale}/help`}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {t("helpCenter")}
          </Link>
        </div>
      </div>
    </div>
  );
}
