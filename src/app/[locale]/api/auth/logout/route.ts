import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForServerActions } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Create a Supabase client for the API route that can handle cookies
    const supabase = await createSupabaseClientForServerActions();

    // 强制清除所有可能的会话数据
    // 尝试多种登出方法确保彻底清除
    const signOutPromises = [
      supabase.auth.signOut(),
      // 如果有其他会话，也尝试清除
      supabase.auth.signOut({ scope: "global" }),
    ];

    await Promise.allSettled(signOutPromises);

    // 验证登出是否成功
    const {
      data: { session: afterLogoutSession },
      error: verificationError,
    } = await supabase.auth.getSession();

    if (verificationError) {
      // 验证时出错，继续尝试其他清除方法
    } else if (afterLogoutSession) {
      // 登出后仍有会话数据，强制再次清除
      await supabase.auth.signOut();
    }

    const duration = Date.now() - startTime;

    // 返回成功响应，包含清除指令
    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
      duration: duration,
      cleared: true,
    });

    // 设置响应头以清除客户端Cookie
    response.headers.set("Clear-Site-Data", '"cookies", "storage"');

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during logout",
        duration: duration,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
