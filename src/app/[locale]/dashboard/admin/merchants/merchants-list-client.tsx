import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

// Merchants list component
export async function MerchantsListClient({ merchantsData }: any) {
  const locale = await getLocale();
  const merchants = merchantsData?.data || [];

  if (merchants.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
          <BuildingStorefrontIcon />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No merchants yet
        </h3>
        <p className="text-gray-500 mb-6">
          Get started by creating your first merchant account.
        </p>
        <Link href={`/${locale}/dashboard/admin/merchants/create`}>
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Merchant
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {merchants.map((merchant: any) => (
        <Card key={merchant.id} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {merchant.merchant_name || "Unnamed Merchant"}
                </h3>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    merchant.role === "ADMIN"
                      ? "bg-purple-100 text-purple-800"
                      : merchant.role === "MERCHANT"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {merchant.role}
                </span>
              </div>

              <div className="text-gray-600 mb-4">
                User ID: {merchant.id?.slice(0, 8)}...
              </div>

              <div className="flex space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <BuildingStorefrontIcon className="h-4 w-4 mr-1" />
                  {(merchant.games || []).length} games
                </div>
                <div className="flex items-center">
                  <ShoppingCartIcon className="h-4 w-4 mr-1" />
                  {merchant.analytics?.totalOrders || 0} orders
                </div>
                <div className="flex items-center">
                  <CurrencyDollarIcon className="h-4 w-4 mr-1" />$
                  {((merchant.analytics?.totalRevenue || 0) / 100).toFixed(2)}
                </div>
                <div className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {merchant.analytics?.conversionRate?.toFixed(1) || 0}%
                  conversion
                </div>
              </div>

              <div className="mt-3 text-xs text-gray-400">
                Joined{" "}
                {merchant.created_at
                  ? new Date(merchant.created_at).toISOString().split("T")[0]
                  : "Unknown"}
                {merchant.updated_at !== merchant.created_at &&
                  merchant.updated_at && (
                    <>
                      {" "}
                      • Updated{" "}
                      {
                        new Date(merchant.updated_at)
                          .toISOString()
                          .split("T")[0]
                      }
                    </>
                  )}
              </div>
            </div>

            <div className="flex space-x-2 ml-4">
              <Button variant="outline" size="sm">
                <EyeIcon className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm">
                <PencilSquareIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
