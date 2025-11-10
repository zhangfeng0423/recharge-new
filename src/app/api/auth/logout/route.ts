import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseClientForServerActions } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("🚪 [LOGOUT API] 开始登出流程...");

  try {
    // Create a Supabase client for the API route that can handle cookies
    const supabase = await createSupabaseClientForServerActions();

    // 检查当前会话状态
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.log("❌ [LOGOUT API] 获取会话失败:", sessionError.message);
    } else {
      console.log(
        "✅ [LOGOUT API] 当前会话用户:",
        session?.user?.email || "无会话",
      );
    }

    // 强制清除所有可能的会话数据
    console.log("🧹 [LOGOUT API] 开始清除服务端会话...");

    // 尝试多种登出方法确保彻底清除
    const signOutPromises = [
      supabase.auth.signOut(),
      // 如果有其他会话，也尝试清除
      supabase.auth.signOut({ scope: "global" }),
    ];

    const results = await Promise.allSettled(signOutPromises);
    const errors = results
      .filter((result) => result.status === "rejected")
      .map((result) => (result as PromiseRejectedResult).reason);

    if (errors.length > 0) {
      console.log("⚠️ [LOGOUT API] 部分登出操作失败:", errors);
      // 即使部分失败，也继续尝试其他清除方法
    }

    // 验证登出是否成功
    const {
      data: { session: afterLogoutSession },
      error: verificationError,
    } = await supabase.auth.getSession();

    if (verificationError) {
      console.log(
        "❌ [LOGOUT API] 验证登出状态时出错:",
        verificationError.message,
      );
    } else if (afterLogoutSession) {
      console.log(
        "⚠️ [LOGOUT API] 警告：登出后仍有会话数据:",
        afterLogoutSession.user?.email,
      );
      // 强制再次清除
      await supabase.auth.signOut();
    } else {
      console.log("✅ [LOGOUT API] 验证成功：服务端会话已清除");
    }

    const duration = Date.now() - startTime;
    console.log(`✅ [LOGOUT API] 登出流程完成，耗时: ${duration}ms`);

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
    console.error(`❌ [LOGOUT API] 登出失败，耗时: ${duration}ms`, error);

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
