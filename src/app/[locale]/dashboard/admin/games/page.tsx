"use client";

import {
  BuildingOfficeIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  CubeIcon,
  CurrencyDollarIcon,
  EyeIcon,
  NoSymbolIcon,
  PauseIcon,
  PencilSquareIcon,
  PlayIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getAllGamesForModeration } from "@/actions/admin.actions";
import { GamesListSkeleton } from "@/components/features/dashboard-skeletons";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Games moderation list component
function GamesModerationContent({ gamesData }: any) {
  const games = gamesData?.data || [];

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <ComputerDesktopIcon />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No games yet</h3>
        <p className="text-gray-500">
          Games submitted by merchants will appear here for moderation.
        </p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "suspended":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircleIcon className="h-4 w-4" />;
      case "suspended":
        return <NoSymbolIcon className="h-4 w-4" />;
      default:
        return <PauseIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      {games.map((game: any) => (
        <Card key={game.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {game.name?.en || game.name || "Untitled Game"}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(game.status)}`}
                >
                  {getStatusIcon(game.status)}
                  <span className="ml-1">{game.status || "inactive"}</span>
                </span>
                {game.banner_url && (
                  <img
                    src={game.banner_url}
                    alt={game.name?.en || "Game"}
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
              </div>

              <p className="text-gray-600 mb-4 line-clamp-2">
                {game.description?.en || game.description || "No description"}
              </p>

              <div className="flex space-x-6 text-sm text-gray-500 mb-3">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                  {game.profiles?.merchant_name || "Unknown Merchant"}
                </div>
                <div className="flex items-center">
                  <CubeIcon className="h-4 w-4 mr-1" />
                  {game.analytics?.totalSkus || 0} SKUs
                </div>
                <div className="flex items-center">
                  <ComputerDesktopIcon className="h-4 w-4 mr-1" />
                  {game.analytics?.totalOrders || 0} orders
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />$
                  {((game.analytics?.totalRevenue || 0) / 100).toFixed(2)}
                </div>
              </div>

              <div className="text-xs text-gray-400">
                Created {new Date(game.created_at).toLocaleDateString()}
                {game.updated_at !== game.created_at && (
                  <>
                    {" "}
                    • Updated {new Date(game.updated_at).toLocaleDateString()}
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col space-y-2 ml-4">
              <div className="flex space-x-2">
                <Link href={`/games/${game.id}`}>
                  <Button variant="outline" size="sm">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </Link>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    // TODO: Implement status update action
                    const newStatus =
                      game.status === "active" ? "inactive" : "active";
                  }}
                >
                  {game.status === "active" ? (
                    <PauseIcon className="h-4 w-4" />
                  ) : (
                    <PlayIcon className="h-4 w-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                  onClick={async () => {
                    if (
                      confirm("Are you sure you want to suspend this game?")
                    ) {
                      // TODO: Implement suspend action
                    }
                  }}
                >
                  <NoSymbolIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Main page component
export default function AdminGamesPage() {
  const [gamesResult, setGamesResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const result = await getAllGamesForModeration();
        setGamesResult(result);
      } catch (error) {
        setGamesResult({ data: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Games Moderation
            </h1>
            <p className="mt-2 text-gray-600">
              Review and moderate platform games
            </p>
          </div>
        </div>
        <GamesListSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Games Moderation</h1>
          <p className="mt-2 text-gray-600">
            Review and moderate platform games
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Games</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {gamesResult?.data?.length || 0}
              </p>
            </div>
            <ComputerDesktopIcon className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {gamesResult?.data?.filter((g: any) => g.status === "active")
                  .length || 0}
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Inactive</p>
              <p className="mt-2 text-3xl font-bold text-gray-600">
                {gamesResult?.data?.filter(
                  (g: any) => g.status === "inactive" || !g.status,
                ).length || 0}
              </p>
            </div>
            <PauseIcon className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="mt-2 text-3xl font-bold text-red-600">
                {gamesResult?.data?.filter((g: any) => g.status === "suspended")
                  .length || 0}
              </p>
            </div>
            <NoSymbolIcon className="h-8 w-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Games List */}
      <GamesModerationContent gamesData={gamesResult} />
    </div>
  );
}
