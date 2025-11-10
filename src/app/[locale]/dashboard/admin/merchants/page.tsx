import {
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { getAllMerchants } from "@/actions/admin.actions";
import { MerchantsListSkeleton } from "@/components/features/dashboard-skeletons";
import { Card } from "@/components/ui/Card";
import { MerchantsHeaderClient } from "./merchants-header-client";
import { MerchantsListClient } from "./merchants-list-client";

// Main page component
export default async function AdminMerchantsPage() {
  // Fetch merchants data
  const merchantsResult = await getAllMerchants();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <MerchantsHeaderClient merchantsData={merchantsResult} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Total Merchants
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {merchantsResult?.data?.length || 0}
              </p>
            </div>
            <BuildingStorefrontIcon className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Active This Month
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {(() => {
                  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
                  return (
                    merchantsResult?.data?.filter(
                      (m: any) =>
                        m.updated_at &&
                        m.updated_at.slice(0, 7) === currentMonth,
                    ).length || 0
                  );
                })()}
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-gray-400" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                $
                {(
                  (merchantsResult?.data || []).reduce(
                    (sum: number, merchant: any) =>
                      sum + (merchant.analytics?.totalRevenue || 0),
                    0,
                  ) / 100
                ).toFixed(2)}
              </p>
            </div>
            <CurrencyDollarIcon className="h-8 w-8 text-gray-400" />
          </div>
        </Card>
      </div>

      {/* Merchants List */}
      <MerchantsListClient merchantsData={merchantsResult} />
    </div>
  );
}
