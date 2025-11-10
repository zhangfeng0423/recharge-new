"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Gamepad2,
  Package,
  ShoppingCart,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";

// Mock data - in real implementation, this would come from Server Components
const mockStats = {
  totalGames: 5,
  totalSKUs: 24,
  totalOrders: 156,
  totalRevenue: 3456.78
};

const mockRecentGames = [
  { id: "1", name: "Fantasy Quest", status: "active", skusCount: 6, revenue: 1234.56 },
  { id: "2", name: "Space Warriors", status: "active", skusCount: 4, revenue: 890.12 },
  { id: "3", name: "Racing Pro", status: "inactive", skusCount: 8, revenue: 456.78 }
];

const mockRecentOrders = [
  { id: "ORD-001", game: "Fantasy Quest", sku: "Crystal Pack x100", amount: 19.99, status: "completed", date: "2024-01-10" },
  { id: "ORD-002", game: "Space Warriors", sku: "Gold Pack x50", amount: 9.99, status: "pending", date: "2024-01-10" },
  { id: "ORD-003", game: "Fantasy Quest", sku: "Starter Pack x10", amount: 4.99, status: "completed", date: "2024-01-09" }
];

export default function MerchantDashboardPage() {
  const t = useTranslations("merchant.dashboard");

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/merchant/games/new">
              <Plus className="w-4 h-4 mr-2" />
              {t("addGame")}
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalGames")}
            </CardTitle>
            <Gamepad2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalGames}</div>
            <p className="text-xs text-muted-foreground">
              +2 {t("stats.thisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalSKUs")}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalSKUs}</div>
            <p className="text-xs text-muted-foreground">
              +4 {t("stats.thisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalOrders")}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +28 {t("stats.thisMonth")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t("stats.totalRevenue")}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockStats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +12% {t("stats.thisMonth")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="games" className="space-y-6">
        <TabsList>
          <TabsTrigger value="games">{t("tabs.games")}</TabsTrigger>
          <TabsTrigger value="orders">{t("tabs.orders")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("tabs.analytics")}</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("games.title")}</CardTitle>
              <CardDescription>
                {t("games.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{game.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {game.skusCount} {t("games.skus")}
                        </p>
                      </div>
                      <Badge variant={game.status === "active" ? "default" : "secondary"}>
                        {t(`games.status.${game.status}`)}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold">${game.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {t("games.revenue")}
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/merchant/games/${game.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/dashboard/merchant/games/${game.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/merchant/games">
                    {t("games.viewAll")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("orders.title")}</CardTitle>
              <CardDescription>
                {t("orders.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockRecentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{order.id}</h3>
                        <p className="text-sm text-muted-foreground">{order.game}</p>
                        <p className="text-sm">{order.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-right">
                        <p className="font-semibold">${order.amount.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                        {t(`orders.status.${order.status}`)}
                      </Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/merchant/orders/${order.id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/dashboard/merchant/orders">
                    {t("orders.viewAll")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              {t("analytics.comingSoon")}
            </AlertDescription>
          </Alert>
          <Card>
            <CardHeader>
              <CardTitle>{t("analytics.title")}</CardTitle>
              <CardDescription>
                {t("analytics.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>{t("analytics.noData")}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}