"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { createCheckoutSession } from "@/actions/payment.actions";

interface DebugInfo {
  success: boolean;
  tests: {
    database: {
      connected: boolean;
      connectionError?: string;
      skuFound: boolean;
      skuCount: number;
    };
    environment: {
      hasStripeKey: boolean;
      hasWebhookSecret: boolean;
      hasAppUrl: boolean;
    };
    stripe: {
      initialized: string;
    };
    sampleSku: any;
  };
  error?: string;
  details?: string;
}

export default function TestPaymentPage() {
  const t = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  const [isDebugging, setIsDebugging] = useState(false);
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDebugCheck = async () => {
    setIsDebugging(true);
    setDebugInfo(null);

    try {
      const response = await fetch("/api/test-payment");
      const data = await response.json();
      setDebugInfo(data);
    } catch (err) {
      console.error("Debug check error:", err);
      setDebugInfo({
        success: false,
        tests: {
          database: { connected: false, skuFound: false, skuCount: 0 },
          environment: { hasStripeKey: false, hasWebhookSecret: false, hasAppUrl: false },
          stripe: { initialized: "Failed" },
          sampleSku: null,
        },
        error: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsDebugging(false);
    }
  };

  const handleTestPayment = async () => {
    if (!debugInfo?.tests.sampleSku?.[0]?.id) {
      setError("No SKU available for testing. Please run debug check first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const skuId = debugInfo.tests.sampleSku[0].id;
      console.log("Testing payment with SKU ID:", skuId);
      
      const paymentResult = await createCheckoutSession({
        skuId,
        locale: "en",
      });

      console.log("Payment result:", paymentResult);
      setResult(paymentResult);

      if (paymentResult.data?.success && paymentResult.data.checkoutUrl) {
        // If successful, redirect to Stripe Checkout
        window.location.href = paymentResult.data.checkoutUrl;
      }
    } catch (err) {
      console.error("Test payment error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run debug check on page load
    handleDebugCheck();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            支付功能测试页面
          </h1>

          <div className="space-y-6">
            {/* Debug Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-blue-800">
                  系统诊断信息
                </h2>
                <Button
                  onClick={handleDebugCheck}
                  disabled={isDebugging}
                  variant="outline"
                  size="sm"
                >
                  {isDebugging ? "检查中..." : "重新检查"}
                </Button>
              </div>

              {debugInfo && (
                <div className="space-y-4">
                  {/* Database Status */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">数据库连接:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      debugInfo.tests.database.connected
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {debugInfo.tests.database.connected ? "正常" : "异常"}
                    </span>
                    {debugInfo.tests.database.connectionError && (
                      <span className="text-red-600 text-sm">
                        ({debugInfo.tests.database.connectionError})
                      </span>
                    )}
                  </div>

                  {/* SKU Status */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">SKU数据:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      debugInfo.tests.database.skuFound
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {debugInfo.tests.database.skuFound
                        ? `找到 ${debugInfo.tests.database.skuCount} 个SKU`
                        : "未找到SKU"}
                    </span>
                  </div>

                  {/* Environment Variables */}
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span>Stripe Key:</span>
                      <span className={`px-2 py-1 rounded ${
                        debugInfo.tests.environment.hasStripeKey
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {debugInfo.tests.environment.hasStripeKey ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>Webhook:</span>
                      <span className={`px-2 py-1 rounded ${
                        debugInfo.tests.environment.hasWebhookSecret
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {debugInfo.tests.environment.hasWebhookSecret ? "✓" : "✗"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span>App URL:</span>
                      <span className={`px-2 py-1 rounded ${
                        debugInfo.tests.environment.hasAppUrl
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {debugInfo.tests.environment.hasAppUrl ? "✓" : "✗"}
                      </span>
                    </div>
                  </div>

                  {/* Stripe Status */}
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">Stripe初始化:</span>
                    <span className={`px-2 py-1 rounded text-sm ${
                      debugInfo.tests.stripe.initialized.includes("Successfully")
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {debugInfo.tests.stripe.initialized}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Test Payment Button */}
            <Button
              onClick={handleTestPayment}
              disabled={isLoading || !debugInfo?.tests.database.skuFound}
              className="w-full py-3 text-lg"
            >
              {isLoading ? "处理中..." : "测试支付会话"}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  错误详情
                </h3>
                <pre className="text-red-700 text-sm whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            )}

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  支付测试结果
                </h3>
                <pre className="text-green-700 text-sm whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}

            {/* Debugging Checklist */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                调试清单
              </h3>
              <ul className="text-gray-700 text-sm space-y-1 list-disc list-inside">
                <li>检查浏览器控制台的JavaScript错误</li>
                <li>查看服务器日志的详细错误信息</li>
                <li>验证Stripe API密钥配置是否正确</li>
                <li>确保数据库中有SKU数据</li>
                <li>检查用户是否已登录</li>
                <li>验证Stripe API版本兼容性</li>
                <li>检查网络连接和防火墙设置</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
