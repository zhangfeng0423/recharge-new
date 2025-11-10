const { createClient } = require("@supabase/supabase-js");

// 从环境变量获取配置
const supabaseUrl = "https://curtvyynqzjdpjtfosrz.supabase.co";
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1cnR2eXlucXpqZHBqdGZvc3J6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjcwMzMzMywiZXhwIjoyMDc4Mjc5MzMzfQ.gg5INY-Sgw7Eo7VEIhH21WA9bnVe0JATzcZXFKrH5H8";

// 使用服务角色密钥创建客户端（可以绕过 RLS）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  try {
    console.log("开始执行 RPC 函数迁移...");

    // 读取 SQL 迁移文件
    const fs = require("fs");
    const path = require("path");
    const migrationPath = path.join(
      __dirname,
      "supabase/migrations/9999_merchant_analytics_rpc.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("执行 SQL 迁移...");

    // 执行 SQL - 由于 Supabase 客户端有限制，我们需要使用 rpc 或直接 SQL
    // 但是我们可以使用 .rpc() 来调用 SQL 函数或使用 .from() 来执行操作

    // 首先让我们测试基本连接
    const { data, error } = await supabase
      .from("profiles")
      .select("count")
      .limit(1);

    if (error) {
      console.error("数据库连接失败:", error);
      process.exit(1);
    }

    console.log("数据库连接成功!");

    // 由于 Supabase 客户端不直接支持执行任意 SQL，我们需要使用另一种方法
    // 让我们使用 .rpc() 来逐个创建函数

    // 首先创建 get_merchant_analytics 函数
    console.log("创建 get_merchant_analytics 函数...");

    const { error: rpcError } = await supabase.rpc("exec_sql", {
      sql: sql,
    });

    if (rpcError) {
      console.log("RPC 方法失败，尝试其他方法...");

      // 如果 exec_sql 不存在，我们需要在 Supabase Dashboard 中手动运行 SQL
      console.log("请在 Supabase Dashboard 的 SQL Editor 中运行以下 SQL:");
      console.log("文件位置:", migrationPath);
      console.log("");
      console.log("或者，使用以下连接信息通过 psql 连接:");
      console.log(
        "postgresql://postgres.curtvyynqzjdpjtfosrz:Rechargea18@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
      );
    } else {
      console.log("迁移执行成功!");
    }
  } catch (error) {
    console.error("迁移执行失败:", error);
    process.exit(1);
  }
}

runMigration();
