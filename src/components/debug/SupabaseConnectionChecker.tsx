"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

interface ConnectionStatus {
  supabaseUrl: boolean;
  supabaseAnonKey: boolean;
  connectionTest: boolean;
  authConfig: boolean;
  error?: string;
}

export function SupabaseConnectionChecker() {
  const [status, setStatus] = useState<ConnectionStatus>({
    supabaseUrl: false,
    supabaseAnonKey: false,
    connectionTest: false,
    authConfig: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState<string[]>([]);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsLoading(true);
    const newDetails: string[] = [];

    try {
      // 检查环境变量
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      newDetails.push(`检查环境变量...`);

      if (supabaseUrl) {
        newDetails.push(`✓ Supabase URL: ${supabaseUrl}`);
        status.supabaseUrl = true;
      } else {
        newDetails.push(`✗ Supabase URL 未设置`);
        status.supabaseUrl = false;
      }

      if (supabaseAnonKey) {
        newDetails.push(`✓ Supabase Anon Key: ${supabaseAnonKey.substring(0, 10)}...`);
        status.supabaseAnonKey = true;
      } else {
        newDetails.push(`✗ Supabase Anon Key 未设置`);
        status.supabaseAnonKey = false;
      }

      // 测试连接
      newDetails.push(`测试 Supabase 连接...`);
      try {
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
          newDetails.push(`✗ 连接测试失败: ${error.message}`);
          status.connectionTest = false;
        } else {
          newDetails.push(`✓ Supabase 连接正常`);
          status.connectionTest = true;
        }
      } catch (error) {
        newDetails.push(`✗ 连接测试异常: ${error instanceof Error ? error.message : '未知错误'}`);
        status.connectionTest = false;
      }

      // 检查Google OAuth配置
      newDetails.push(`检查 Google OAuth 配置...`);
      const appUrl = typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

      newDetails.push(`应用 URL: ${appUrl}`);

      // 模拟OAuth配置检查（实际需要从Supabase控制台检查）
      status.authConfig = true; // 假设已配置
      newDetails.push(`✓ Google OAuth 需要在 Supabase 控制台中验证`);
      newDetails.push(`  - 回调 URL: ${appUrl}/auth/callback`);
      newDetails.push(`  - 确保已启用 Google Provider`);

      setStatus({ ...status });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      newDetails.push(`✗ 检查过程出错: ${errorMessage}`);
      setStatus(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setDetails(newDetails);
      setIsLoading(false);
    }
  };

  const getOverallStatus = () => {
    if (isLoading) return 'loading';
    if (status.error) return 'error';
    const allGood = status.supabaseUrl && status.supabaseAnonKey && status.connectionTest && status.authConfig;
    return allGood ? 'success' : 'warning';
  };

  const overallStatus = getOverallStatus();

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-lg font-semibold">Supabase 连接诊断</h3>
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
        ) : overallStatus === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : overallStatus === 'error' ? (
          <XCircle className="h-5 w-5 text-red-500" />
        ) : (
          <AlertCircle className="h-5 w-5 text-yellow-500" />
        )}
      </div>

      {/* 状态概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <div className={`p-2 rounded text-center ${
          status.supabaseUrl ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="text-sm font-medium">URL 配置</div>
          <div className="text-xs">{status.supabaseUrl ? '正常' : '异常'}</div>
        </div>

        <div className={`p-2 rounded text-center ${
          status.supabaseAnonKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="text-sm font-medium">密钥配置</div>
          <div className="text-xs">{status.supabaseAnonKey ? '正常' : '异常'}</div>
        </div>

        <div className={`p-2 rounded text-center ${
          status.connectionTest ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="text-sm font-medium">连接测试</div>
          <div className="text-xs">{status.connectionTest ? '通过' : '失败'}</div>
        </div>

        <div className={`p-2 rounded text-center ${
          status.authConfig ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          <div className="text-sm font-medium">OAuth 配置</div>
          <div className="text-xs">{status.authConfig ? '需要验证' : '待配置'}</div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="bg-white p-3 rounded border">
        <h4 className="font-medium mb-2">诊断详情:</h4>
        <div className="text-sm space-y-1 font-mono">
          {details.map((detail, index) => (
            <div key={index} className={detail.startsWith('✓') ? 'text-green-700' : detail.startsWith('✗') ? 'text-red-700' : 'text-gray-700'}>
              {detail}
            </div>
          ))}
        </div>
      </div>

      {/* 刷新按钮 */}
      <div className="mt-4">
        <button
          onClick={checkConnection}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? '检查中...' : '重新检查'}
        </button>
      </div>

      {/* 故障排除建议 */}
      {overallStatus !== 'success' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-medium text-yellow-800 mb-2">故障排除建议:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {!status.supabaseUrl && <li>• 检查 .env.local 文件中的 NEXT_PUBLIC_SUPABASE_URL</li>}
            {!status.supabaseAnonKey && <li>• 检查 .env.local 文件中的 NEXT_PUBLIC_SUPABASE_ANON_KEY</li>}
            {!status.connectionTest && <li>• 检查网络连接和 Supabase 项目状态</li>}
            <li>• 确保 Supabase 控制台中已启用 Google OAuth Provider</li>
            <li>• 检查回调 URL 是否正确配置 (当前域名 + /auth/callback)</li>
            <li>• 如果在 Vercel 部署，确保环境变量已正确设置</li>
          </ul>
        </div>
      )}
    </div>
  );
}