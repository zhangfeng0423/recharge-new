/**
 * Database Connection Test Page
 *
 * This page provides a UI to test and verify the database connection.
 * It shows detailed information about the connection status and table accessibility.
 */

"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";

const supabase = createSupabaseBrowserClient();

interface ConnectionStatus {
  status: string;
  message: string;
  environment?: {
    configured: Record<string, boolean>;
    missing: string[] | null;
  };
  connectivity?: {
    overall: string;
    details: Record<string, string>;
  };
  health?: any;
  timestamp: string;
  error?: string;
}

export default function TestConnectionPage() {
  const t = useTranslations("connection");
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testingTable, setTestingTable] = useState<string>("");

  const testConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from("games").select("*").limit(1);
      if (error) {
        setStatus({
          status: "Failed",
          message: error.message,
          timestamp: new Date().toISOString(),
        });
      } else if (data) {
        setStatus({
          status: "Success",
          message: t("connectedToSupabaseAndFetchedData"),
          timestamp: new Date().toISOString(),
        });
      } else {
        setStatus({
          status: "Success",
          message: t("connectedToSupabaseNoDataFound"),
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      setStatus({
        status: "Error",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, [testConnection]);

  const testTable = async (tableName: string) => {
    setTestingTable(tableName);
    try {
      const response = await fetch("/api/test-connection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ table: tableName }),
      });
      const data = await response.json();
      alert(
        `${t("table")} ${tableName}: ${data.status}${data.error ? ` - ${data.error}` : ""}`,
      );
    } catch (error) {
      alert(`${t("failedToTestTable")} ${tableName}: ${error}`);
    } finally {
      setTestingTable("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>{t("loadingMessage")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              {t("pageTitle")}
            </h3>

            {/* Status Overview */}
            <div
              className={`mb-6 p-4 rounded-lg ${
                status?.status === "healthy"
                  ? "bg-green-50 border border-green-200"
                  : status?.status === "degraded"
                    ? "bg-yellow-50 border border-yellow-200"
                    : "bg-red-50 border border-red-200"
              }`}
            >
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 w-3 h-3 rounded-full mr-3 ${
                    status?.status === "healthy"
                      ? "bg-green-400"
                      : status?.status === "degraded"
                        ? "bg-yellow-400"
                        : "bg-red-400"
                  }`}
                ></div>
                <div>
                  <h4
                    className={`font-medium ${
                      status?.status === "healthy"
                        ? "text-green-800"
                        : status?.status === "degraded"
                          ? "text-yellow-800"
                          : "text-red-800"
                    }`}
                  >
                    {t("messagePrefix")}{" "}
                    {status?.status?.toUpperCase() || t("statusUnknown")}
                  </h4>
                  <p
                    className={`text-sm mt-1 ${
                      status?.status === "healthy"
                        ? "text-green-600"
                        : status?.status === "degraded"
                          ? "text-yellow-600"
                          : "text-red-600"
                    }`}
                  >
                    {status?.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Environment Variables */}
            {status?.environment && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("envVarsTitle")}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(status.environment.configured).map(
                    ([key, configured]) => (
                      <div key={key} className="flex items-center">
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            configured ? "bg-green-400" : "bg-red-400"
                          }`}
                        ></div>
                        <span className="text-sm font-mono">{key}</span>
                      </div>
                    ),
                  )}
                </div>
                {status.environment.missing && (
                  <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-600">
                    {t("envVarMissing")} {status.environment.missing.join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* Table Connectivity */}
            {status?.connectivity && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">
                  {t("tableConnectivityTitle")}
                </h4>
                <div className="mb-2">
                  <span className="text-sm text-gray-600">
                    {t("overallStatus")} {status.connectivity.overall}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(status.connectivity.details).map(
                    ([table, result]) => (
                      <div
                        key={table}
                        className="flex items-center justify-between p-3 border rounded"
                      >
                        <span className="text-sm font-mono">{table}</span>
                        <button
                          onClick={() => testTable(table)}
                          disabled={testingTable === table}
                          className={`px-3 py-1 rounded text-xs font-medium ${
                            result === "success"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          } ${testingTable === table ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          {testingTable === table
                            ? t("testButtonTesting")
                            : result === "success"
                              ? t("testButtonSuccess")
                              : t("testButtonFailed")}
                        </button>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {t("retestButton")}
              </button>
              <div className="text-sm text-gray-500">
                {t("lastTested")}{" "}
                {status?.timestamp
                  ? new Date(status.timestamp).toLocaleString()
                  : t("never")}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            {t("setupInstructionsTitle")}
          </h4>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>
              {t("setupInstruction1")}{" "}
              <code className="bg-blue-100 px-1 rounded">
                .env.local.example
              </code>{" "}
              {t("common.to")}{" "}
              <code className="bg-blue-100 px-1 rounded">.env.local</code>
            </li>
            <li>{t("setupInstruction2")}</li>
            <li>{t("setupInstruction3")}</li>
            <li>{t("setupInstruction4")}</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
