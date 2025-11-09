import { type NextRequest, NextResponse } from "next/server";
import { registerAction } from "@/actions/auth.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.email || !body.password || !body.confirmPassword || !body.role) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 },
      );
    }

    // Validate role
    if (!["USER", "MERCHANT"].includes(body.role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 },
      );
    }

    // Validate merchant name for MERCHANT role
    if (body.role === "MERCHANT" && !body.merchantName) {
      return NextResponse.json(
        {
          success: false,
          message: "Merchant name is required for MERCHANT role",
        },
        { status: 400 },
      );
    }

    // Call the register action
    const result = await registerAction(body);

    if (result.data?.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json(
        result.data || { success: false, message: "Registration failed" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
