"use client";

import {
  BuildingStorefrontIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  EyeIcon,
  FunnelIcon,
  ShoppingCartIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { getAllPlatformOrders } from "@/actions/admin.actions";
import { OrdersListSkeleton } from "@/components/features/dashboard-skeletons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface Order {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  merchant_id: string;
  profiles: {
    id: string;
    merchant_name: string;
    role: string;
  };
  skus: {
    id: string;
    name: string;
    game_id: string;
  };
  games: {
    id: string;
    name: string;
  };
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminOrdersPage() {
  const t = useTranslations();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    loadOrders();
  }, [currentPage, statusFilter]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAllPlatformOrders(
        currentPage,
        pagination.pageSize,
        statusFilter,
      );

      if (result.success) {
        const data = result.data as OrdersResponse;
        setOrders(data.orders || []);
        setPagination(data.pagination);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading && orders.length === 0) {
    return <OrdersListSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="mt-2 text-gray-600">Monitor all platform orders</p>
        </div>
        <Card className="p-6 bg-red-50 border-red-200">
          <h3 className="text-red-800 font-medium">Error loading orders</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <Button onClick={loadOrders} className="mt-3">
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="mt-2 text-gray-600">
            Monitor all platform orders and transactions
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <label className="text-sm font-medium text-gray-700">Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className="flex-1 text-right text-sm text-gray-500">
            Showing {orders.length} of {pagination.total} orders
          </div>
        </div>
      </Card>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {order.skus?.name || "Unknown SKU"}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div className="flex items-center">
                      <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                      {order.profiles?.merchant_name || "Unknown"}
                    </div>
                    <div className="flex items-center">
                      <UserIcon className="h-4 w-4 mr-1" />
                      User ID: {order.user_id?.slice(0, 8)}...
                    </div>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  {order.games?.name && (
                    <div className="mt-2 text-sm text-gray-500">
                      Game: {order.games.name}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ${(order.amount / 100).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">
                      Order ID: {order.id.slice(0, 8)}...
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={pagination.page <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1),
                    )
                  }
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <ShoppingCartIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No orders found
          </h3>
          <p className="text-gray-500">
            {statusFilter === "all"
              ? "No orders have been created yet."
              : `No ${statusFilter} orders found.`}
          </p>
        </Card>
      )}
    </div>
  );
}
