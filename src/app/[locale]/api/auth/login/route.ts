import { type NextRequest, NextResponse } from "next/server";
import { loginAction } from "@/actions/auth.actions";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 },
      );
    }

    // Call the login action
    const result = await loginAction(body);

    if (result.data?.success) {
      return NextResponse.json(result.data, { status: 200 });
    } else {
      return NextResponse.json(
        result.data || { success: false, message: "Login failed" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("Login API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
