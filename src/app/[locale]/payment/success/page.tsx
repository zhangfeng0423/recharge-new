import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

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

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Success Message */}
        <h1 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
          {t("paymentSuccess") || "Payment Successful!"}
        </h1>
        <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">
          {t("paymentSuccessMessage") ||
            "Thank you for your purchase! Your payment has been processed successfully."}
        </p>

        {/* Session ID */}
        <div className="mb-8 p-4 bg-white rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 mb-2">
            {t("transactionId") || "Transaction ID"}
          </p>
          <p className="font-mono text-sm text-gray-900 dark:text-white">
            {session_id}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {t("backToStore") || "Back to Store"}
          </Link>
          <Link
            href={`/${locale}/games`}
            className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            {t("browseMoreGames") || "Browse More Games"}
          </Link>
        </div>

        {/* Support Info */}
        <div className="mt-12 text-sm text-gray-500">
          <p>
            {t("support.needHelp") || "Need help?"}{" "}
            <a
              href="mailto:support@example.com"
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {t("support.contactSupport") || "Contact Support"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}