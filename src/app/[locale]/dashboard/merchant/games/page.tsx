"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import {
  Gamepad2,
  Plus,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data - in real implementation, this would be fetched from Server Components
const mockGames = [
  {
    id: "1",
    name: "Fantasy Quest",
    description: "Epic fantasy RPG adventure",
    status: "active",
    skusCount: 6,
    totalOrders: 89,
    totalRevenue: 2345.67,
    createdAt: "2024-01-01",
    bannerUrl: "/api/placeholder/300/200"
  },
  {
    id: "2",
    name: "Space Warriors",
    description: "Sci-fi space combat game",
    status: "active",
    skusCount: 4,
    totalOrders: 45,
    totalRevenue: 1234.56,
    createdAt: "2024-01-05",
    bannerUrl: "/api/placeholder/300/200"
  },
  {
    id: "3",
    name: "Racing Pro",
    description: "Professional racing simulation",
    status: "inactive",
    skusCount: 8,
    totalOrders: 22,
    totalRevenue: 678.90,
    createdAt: "2024-01-10",
    bannerUrl: "/api/placeholder/300/200"
  }
];

export default function MerchantGamesPage() {
  const t = useTranslations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const filteredGames = mockGames.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || game.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{t("merchant.games.title")}</h1>
          <p className="text-muted-foreground">
            {t("merchant.games.description")}
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/merchant/games/new">
            <Plus className="w-4 h-4 mr-2" />
            {t("merchant.games.addGame")}
          </Link>
        </Button>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={t("merchant.games.searchPlaceholder")}
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
                {t("merchant.games.filter.all")}
              </Button>
              <Button
                variant={filterStatus === "active" ? "default" : "outline"}
                onClick={() => setFilterStatus("active")}
              >
                {t("merchant.games.filter.active")}
              </Button>
              <Button
                variant={filterStatus === "inactive" ? "default" : "outline"}
                onClick={() => setFilterStatus("inactive")}
              >
                {t("merchant.games.filter.inactive")}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <Alert>
          <Gamepad2 className="h-4 w-4" />
          <AlertDescription>
            {searchTerm || filterStatus !== "all"
              ? t("merchant.games.noSearchResults")
              : t("merchant.games.noGames")
            }
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <Card key={game.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                <img
                  src={game.bannerUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/api/placeholder/300/200?text=Game+Banner";
                  }}
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={game.status === "active" ? "default" : "secondary"}>
                    {t(`merchant.games.status.${game.status}`)}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{game.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {game.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("merchant.games.skusCount")}
                    </span>
                    <span className="font-medium">{game.skusCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("merchant.games.ordersCount")}
                    </span>
                    <span className="font-medium">{game.totalOrders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {t("merchant.games.revenue")}
                    </span>
                    <span className="font-medium">${game.totalRevenue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/merchant/games/${game.id}`}>
                      <Eye className="w-4 h-4 mr-1" />
                      {t("merchant.games.view")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link href={`/dashboard/merchant/games/${game.id}/edit`}>
                      <Edit className="w-4 h-4 mr-1" />
                      {t("merchant.games.edit")}
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}