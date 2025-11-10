import { PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { getLocale } from "next-intl/server";
import { Button } from "@/components/ui/Button";

export async function MerchantsHeaderClient({ merchantsData }: any) {
  const locale = await getLocale();

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Merchants Management
        </h1>
        <p className="mt-2 text-gray-600">
          Manage merchant accounts and permissions
        </p>
      </div>
      <Link href={`/${locale}/dashboard/admin/merchants/create`}>
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Merchant
        </Button>
      </Link>
    </div>
  );
}
