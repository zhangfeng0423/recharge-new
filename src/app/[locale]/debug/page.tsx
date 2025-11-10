"use client";

import { useState } from "react";
import { GoogleButton } from "@/components/ui/GoogleButton";
import { SupabaseConnectionChecker } from "@/components/debug/SupabaseConnectionChecker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export default function DebugPage() {
  const [googleResult, setGoogleResult] = useState<{
    success: boolean;
    message: string;
    timestamp: string;
  } | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Google OAuth 调试页面
          </h1>
          <p className="text-gray-600">
            此页面用于诊断和测试 Google 登录功能
          </p>
        </div>

        {/* Supabase 连接检查 */}
        <Card>
          <CardHeader>
            <CardTitle>Supabase 连接状态</CardTitle>
          </CardHeader>
          <CardContent>
            <SupabaseConnectionChecker />
          </CardContent>
        </Card>

        {/* Google OAuth 测试 */}
        <Card>
          <CardHeader>
            <CardTitle>Google OAuth 测试</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">测试 Google 登录</h3>
              <p className="text-sm text-gray-600 mb-4">
                点击下面的按钮测试 Google 登录流程。如果成功，您将被重定向到 Google 进行认证。
              </p>

              <GoogleButton
                onSuccess={() => {
                  setGoogleResult({
                    success: true,
                    message: "OAuth 流程已启动，正在重定向到 Google...",
                    timestamp: new Date().toLocaleString(),
                  });
                }}
                onError={(error) => {
                  setGoogleResult({
                    success: false,
                    message: error,
                    timestamp: new Date().toLocaleString(),
                  });
                }}
                timeoutMs={15000} // 15秒超时，用于调试
              />
            </div>

            {/* 显示测试结果 */}
            {googleResult && (
              <div className={`p-4 rounded-lg border ${
                googleResult.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <div className={`font-medium ${
                      googleResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {googleResult.success ? '✓ 成功' : '✗ 失败'}
                    </div>
                    <div className={`text-sm mt-1 ${
                      googleResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {googleResult.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      时间: {googleResult.timestamp}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 环境信息 */}
        <Card>
          <CardHeader>
            <CardTitle>环境信息</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">当前域名:</span>
                <div className="text-gray-600 break-all">
                  {typeof window !== 'undefined' ? window.location.origin : 'N/A'}
                </div>
              </div>
              <div>
                <span className="font-medium">回调 URL:</span>
                <div className="text-gray-600 break-all">
                  {typeof window !== 'undefined'
                    ? `${window.location.origin}/auth/callback`
                    : 'N/A'}
                </div>
              </div>
              <div>
                <span className="font-medium">Supabase URL:</span>
                <div className="text-gray-600 break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || '未设置'}
                </div>
              </div>
              <div>
                <span className="font-medium">环境:</span>
                <div className="text-gray-600">
                  {process.env.NODE_ENV || '未知'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 故障排除指南 */}
        <Card>
          <CardHeader>
            <CardTitle>故障排除指南</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">如果 Google 登录一直转圈:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>检查浏览器控制台是否有错误信息</li>
                  <li>确认网络连接正常</li>
                  <li>检查 Supabase 控制台中的 Google OAuth 配置</li>
                  <li>确认回调 URL 正确设置</li>
                  <li>尝试清除浏览器缓存和 Cookie</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">常见问题:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li><strong>redirect_uri_mismatch:</strong> 检查 Supabase 控制台中的回调 URL 设置</li>
                  <li><strong>网络错误:</strong> 检查防火墙和网络连接</li>
                  <li><strong>超时:</strong> 检查网络速度，尝试增加超时时间</li>
                  <li><strong>环境变量错误:</strong> 确认 .env.local 中的配置正确</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}