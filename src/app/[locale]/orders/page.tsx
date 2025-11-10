"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Input } from "@/components/ui/Input";
import {
  ShoppingCart,
  Gamepad2,
  ExternalLink,
  Download,
  Search,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data - in real implementation, this would be fetched from Server Components
const mockOrders = [
  {
    id: "ORD-001",
    gameName: "Fantasy Quest",
    skuName: "Crystal Pack x100",
    skuDescription: "100 crystals + 10 bonus",
    amount: 19.99,
    status: "completed",
    paymentMethod: "stripe",
    createdAt: "2024-01-10T14:30:00Z",
    completedAt: "2024-01-10T14:32:00Z",
    gameUrl: "/games/fantasy-quest",
    gameBannerUrl: "/api/placeholder/100/100"
  },
  {
    id: "ORD-002",
    gameName: "Space Warriors",
    skuName: "Gold Pack x50",
    skuDescription: "50 gold coins + 5 bonus",
    amount: 9.99,
    status: "pending",
    paymentMethod: "stripe",
    createdAt: "2024-01-10T16:45:00Z",
    completedAt: null,
    gameUrl: "/games/space-warriors",
    gameBannerUrl: "/api/placeholder/100/100"
  },
  {
    id: "ORD-003",
    gameName: "Fantasy Quest",
    skuName: "Starter Pack x10",
    skuDescription: "10 crystals for beginners",
    amount: 4.99,
    status: "completed",
    paymentMethod: "stripe",
    createdAt: "2024-01-09T09:15:00Z",
    completedAt: "2024-01-09T09:17:00Z",
    gameUrl: "/games/fantasy-quest",
    gameBannerUrl: "/api/placeholder/100/100"
  },
  {
    id: "ORD-004",
    gameName: "Racing Pro",
    skuName: "Premium Car Pack",
    skuDescription: "Unlock 3 premium racing cars",
    amount: 24.99,
    status: "failed",
    paymentMethod: "stripe",
    createdAt: "2024-01-09T11:20:00Z",
    completedAt: null,
    gameUrl: "/games/racing-pro",
    gameBannerUrl: "/api/placeholder/100/100"
  }
];

export default function OrdersPage() {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "failed">("all");

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.gameName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.skuName.toLowerCase().includes(searchTerm.toLowerCase());
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

  const totalSpent = filteredOrders
    .filter(order => order.status === "completed")
    .reduce((sum, order) => sum + order.amount, 0);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("orders.title")}</h1>
          <p className="text-muted-foreground">
            {t("orders.description")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            {t("orders.export")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("orders.stats.totalOrders")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredOrders.filter(order => order.status === "completed").length} {t("orders.stats.completed")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("orders.stats.totalSpent")}
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {t("orders.stats.onGames")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("orders.stats.pendingOrders")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredOrders.filter(order => order.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("orders.stats.awaitingPayment")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t("orders.searchPlaceholder")}
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
                {t("orders.filter.all")}
              </Button>
              <Button
                variant={filterStatus === "completed" ? "default" : "outline"}
                onClick={() => setFilterStatus("completed")}
              >
                {t("orders.filter.completed")}
              </Button>
              <Button
                variant={filterStatus === "pending" ? "default" : "outline"}
                onClick={() => setFilterStatus("pending")}
              >
                {t("orders.filter.pending")}
              </Button>
              <Button
                variant={filterStatus === "failed" ? "default" : "outline"}
                onClick={() => setFilterStatus("failed")}
              >
                {t("orders.filter.failed")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <Alert>
          <ShoppingCart className="h-4 w-4" />
          <AlertDescription>
            {searchTerm || filterStatus !== "all"
              ? t("orders.noSearchResults")
              : t("orders.noOrders")
            }
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Game Banner */}
                    <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={order.gameBannerUrl}
                        alt={order.gameName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/api/placeholder/64/64?text=Game";
                        }}
                      />
                    </div>

                    {/* Order Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{order.id}</h3>
                        <Badge variant={getStatusColor(order.status)}>
                          {t(`orders.status.${order.status}`)}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{order.gameName}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm">{order.skuName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.skuDescription}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{t("orders.table.orderDate")}: {formatDate(order.createdAt)}</span>
                          {order.completedAt && (
                            <span>{t("orders.table.completedDate")}: {formatDate(order.completedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions and Price */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">${order.amount.toFixed(2)}</div>
                      <p className="text-sm text-muted-foreground">{order.paymentMethod}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/orders/${order.id}`}>
                          {t("orders.viewDetails")}
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={order.gameUrl}>
                          <ExternalLink className="w-4 h-4 mr-1" />
                          {t("orders.viewGame")}
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}