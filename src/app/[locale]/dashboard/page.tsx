import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth.actions";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth");
  }

  // Redirect based on user role
  switch (user.role) {
    case "ADMIN":
      redirect("/dashboard/admin");
    case "MERCHANT":
      redirect("/dashboard/merchant");
    default:
      redirect("/games"); // Regular users go to games page
  }
}
