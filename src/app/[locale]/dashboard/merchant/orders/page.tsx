"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  ShoppingCart,
  Search,
  Filter,
  Download,
  Eye
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data - in real implementation, this would be fetched from Server Components
const mockOrders = [
  {
    id: "ORD-001",
    gameName: "Fantasy Quest",
    skuName: "Crystal Pack x100",
    customerEmail: "player1@example.com",
    amount: 19.99,
    status: "completed",
    paymentMethod: "stripe",
    createdAt: "2024-01-10T14:30:00Z",
    completedAt: "2024-01-10T14:32:00Z"
  },
  {
    id: "ORD-002",
    gameName: "Space Warriors",
    skuName: "Gold Pack x50",
    customerEmail: "player2@example.com",
    amount: 9.99,
    status: "pending",
    paymentMethod: "stripe",
    createdAt: "2024-01-10T16:45:00Z",
    completedAt: null
  },
  {
    id: "ORD-003",
    gameName: "Fantasy Quest",
    skuName: "Starter Pack x10",
    customerEmail: "player3@example.com",
    amount: 4.99,
    status: "completed",
    paymentMethod: "stripe",
    createdAt: "2024-01-09T09:15:00Z",
    completedAt: "2024-01-09T09:17:00Z"
  },
  {
    id: "ORD-004",
    gameName: "Racing Pro",
    skuName: "Premium Car Pack",
    customerEmail: "player4@example.com",
    amount: 24.99,
    status: "failed",
    paymentMethod: "stripe",
    createdAt: "2024-01-09T11:20:00Z",
    completedAt: null
  },
  {
    id: "ORD-005",
    gameName: "Space Warriors",
    skuName: "Weapon Pack x25",
    customerEmail: "player5@example.com",
    amount: 14.99,
    status: "completed",
    paymentMethod: "stripe",
    createdAt: "2024-01-08T13:10:00Z",
    completedAt: "2024-01-08T13:12:00Z"
  }
];

export default function MerchantOrdersPage() {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all");

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("merchant.orders.title")}</h1>
          <p className="text-muted-foreground">
            {t("merchant.orders.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t("merchant.orders.export")}
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t("merchant.orders.searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
              >
                {t("merchant.orders.filter.all")}
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
              >
                {t("merchant.orders.filter.completed")}
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
              >
                {t("merchant.orders.filter.pending")}
              </Button>
              <Button
                variant={filterStatus === "failed" ? "default" : "outline"}
                onClick={() => setFilterStatus("failed")}
              >
                {t("merchant.orders.filter.failed")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <Alert>
          <ShoppingCart className="h-4 w-4" />
          <AlertDescription>
            {searchTerm || filterStatus !== "all"
              ? t("merchant.orders.noSearchResults")
              : t("merchant.orders.noOrders")
            }
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("merchant.orders.listTitle")}</CardTitle>
            <CardDescription>
              {t("merchant.orders.listDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">{t("merchant.orders.table.orderId")}</th>
                    <th className="text-left p-4">{t("merchant.orders.table.game")}</th>
                    <th className="text-left p-4">{t("merchant.orders.table.sku")}</th>
                    <th className="text-left p-4">{t("merchant.orders.table.customer")}</th>
                    <th className="text-left p-4">{t("merchant.orders.table.amount")}</th>
                    <th className="text-left p-4">{t("merchant.orders.table.status")}</th>
                    <th className="text-left p-4">{t("merchant.orders.table.createdAt")}</th>
                    <th className="text-left p-4">{t("merchant.orders.table.actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-mono text-sm">{order.id}</td>
                      <td className="p-4">{order.gameName}</td>
                      <td className="p-4">{order.skuName}</td>
                      <td className="p-4">{order.customerEmail}</td>
                      <td className="p-4 font-semibold">${order.amount.toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={getStatusColor(order.status)}>
                          {t(`merchant.orders.status.${order.status}`)}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="p-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/merchant/orders/${order.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("merchant.orders.summary.totalOrders")}
                </span>
                <span className="font-medium">{filteredOrders.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {t("merchant.orders.summary.totalRevenue")}
                </span>
                <span className="font-medium">
                  ${filteredOrders
                    .filter(order => order.status === "completed")
                    .reduce((sum, order) => sum + order.amount, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}