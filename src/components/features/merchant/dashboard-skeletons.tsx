import { Card, CardContent, CardHeader } from "@/components/ui/Card";

// Main Dashboard Skeleton
export function MerchantDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Analytics Cards Skeleton
export function AnalyticsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3 mt-2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Revenue Chart Skeleton
export function RevenueChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-6">
          {/* Daily Revenue Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-16 h-3 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i}>
                  <div className="h-20 bg-gray-200 rounded-lg mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue by Game Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Orders Skeleton
export function RecentOrdersSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Top Products Skeleton
export function TopProductsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse flex justify-between items-center">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded w-24"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Order Details Skeleton
export function OrderDetailsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>

          {/* Customer Info */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Products Performance Skeleton
export function ProductsPerformanceSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mt-2"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse">
          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>

          {/* Products Table */}
          <div className="space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// ENHANCED LOADING STATES WITH FINE-GRAINED CONTROL
// =============================================================================

// Loading state types for better control
export type LoadingState = "idle" | "loading" | "success" | "error" | "partial";

export interface LoadingStates {
  user: LoadingState;
  analytics: LoadingState;
  revenueChart: LoadingState;
  recentOrders: LoadingState;
  topProducts: LoadingState;
  quickStats: LoadingState;
}

// Individual component loading states
interface ComponentLoadingStateProps {
  isLoading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

// Generic loading wrapper component
export function ComponentLoadingState({
  isLoading,
  children,
  fallback,
  className = "",
}: ComponentLoadingStateProps) {
  if (isLoading) {
    return (
      <div className={className}>{fallback || <DefaultLoadingFallback />}</div>
    );
  }
  return <>{children}</>;
}

// Default loading fallback
function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#359EFF]"></div>
      <span className="ml-3 text-gray-600">Loading...</span>
    </div>
  );
}

// Analytics Cards with fine-grained loading
export function AnalyticsCardsWithLoading({
  isLoading,
  analytics,
  children,
}: {
  isLoading: boolean;
  analytics?: any;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <AnalyticsCardsSkeleton />;
  }

  if (!analytics) {
    return (
      <Card className="p-6 bg-gray-50 border-gray-200">
        <CardContent>
          <p className="text-gray-500 text-center">
            No analytics data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Revenue Chart with progressive loading
export function RevenueChartWithLoading({
  isLoading,
  hasData,
  children,
}: {
  isLoading: boolean;
  hasData: boolean;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <RevenueChartSkeleton />;
  }

  if (!hasData) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Revenue Overview
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No revenue data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Recent Orders with loading states
export function RecentOrdersWithLoading({
  isLoading,
  orders,
  children,
}: {
  isLoading: boolean;
  orders?: any[];
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <RecentOrdersSkeleton />;
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No recent orders</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Top Products with loading states
export function TopProductsWithLoading({
  isLoading,
  products,
  children,
}: {
  isLoading: boolean;
  products?: any[];
  children: React.ReactNode;
}) {
  if (isLoading) {
    return <TopProductsSkeleton />;
  }

  if (!products || products.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Top Products</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No product data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Quick Stats with loading states
export function QuickStatsWithLoading({
  isLoading,
  stats,
  children,
}: {
  isLoading: boolean;
  stats?: any;
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Today's Stats</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg">
            <p className="text-gray-500">Stats not available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Order Status Breakdown with loading
export function OrderStatusBreakdownWithLoading({
  isLoading,
  breakdown,
  children,
}: {
  isLoading: boolean;
  breakdown?: any[];
  children: React.ReactNode;
}) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!breakdown || breakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No order status data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return <>{children}</>;
}

// Enhanced dashboard skeleton with progress indicators
export function EnhancedMerchantDashboardSkeleton({
  loadingStates,
}: {
  loadingStates?: Partial<LoadingStates>;
}) {
  const states = {
    user: loadingStates?.user || "loading",
    analytics: loadingStates?.analytics || "loading",
    revenueChart: loadingStates?.revenueChart || "loading",
    recentOrders: loadingStates?.recentOrders || "loading",
    topProducts: loadingStates?.topProducts || "loading",
    quickStats: loadingStates?.quickStats || "loading",
  };

  return (
    <div className="space-y-6">
      {/* Progress indicator */}
      <Card className="p-4 bg-[#359EFF]/10 border-[#359EFF]/30">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#359EFF]"></div>
          <div className="flex-1">
            <p className="text-[#359EFF] font-medium text-sm">
              Loading dashboard components...
            </p>
            <div className="mt-2 space-y-1">
              {states.analytics === "loading" && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#359EFF] rounded-full animate-pulse"></div>
                  <span className="text-[#359EFF] text-xs">Analytics data</span>
                </div>
              )}
              {states.revenueChart === "loading" && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#359EFF] rounded-full animate-pulse"></div>
                  <span className="text-[#359EFF] text-xs">Revenue charts</span>
                </div>
              )}
              {states.recentOrders === "loading" && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-[#359EFF] rounded-full animate-pulse"></div>
                  <span className="text-[#359EFF] text-xs">Recent orders</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Analytics Cards */}
      {states.analytics === "loading" && <AnalyticsCardsSkeleton />}

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        {states.revenueChart === "loading" && (
          <div className="lg:col-span-2">
            <RevenueChartSkeleton />
          </div>
        )}

        {/* Quick Stats */}
        {(states.quickStats === "loading" ||
          states.analytics === "loading") && (
          <div className="space-y-4">
            <QuickStatsWithLoading isLoading={true} stats={null}>
              <></>
            </QuickStatsWithLoading>
            <OrderStatusBreakdownWithLoading
              isLoading={true}
              breakdown={undefined}
            >
              <></>
            </OrderStatusBreakdownWithLoading>
          </div>
        )}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        {states.recentOrders === "loading" && <RecentOrdersSkeleton />}

        {/* Top Products */}
        {states.topProducts === "loading" && <TopProductsSkeleton />}
      </div>
    </div>
  );
}

// Loading state manager hook (for future use with React hooks)
export function useLoadingStates() {
  // This would be implemented as a React hook when converting to client components
  // For now, it's a placeholder for the interface
  return {
    loadingStates: {
      user: "idle" as LoadingState,
      analytics: "idle" as LoadingState,
      revenueChart: "idle" as LoadingState,
      recentOrders: "idle" as LoadingState,
      topProducts: "idle" as LoadingState,
      quickStats: "idle" as LoadingState,
    },
    setLoadingState: (key: keyof LoadingStates, state: LoadingState) => {
      // Implementation would go here
    },
    resetLoadingStates: () => {
      // Implementation would go here
    },
  };
}

// Date Range Filter Skeleton
export function DateRangeFilterSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-4">
          {/* Preset Ranges */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>

          {/* Custom Date Range */}
          <div className="grid grid-cols-3 gap-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="flex gap-2">
              <div className="h-10 bg-gray-200 rounded w-16"></div>
              <div className="h-10 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
