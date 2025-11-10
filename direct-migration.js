const { Client } = require("pg");

async function runDirectMigration() {
  // 尝试不同的连接字符串
  const connectionString =
    "postgresql://postgres.curtvyynqzjdpjtfosrz:Rechargea18@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

  const client = new Client({
    connectionString: connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  try {
    console.log("连接到数据库...");
    await client.connect();
    console.log("数据库连接成功!");

    // 读取 SQL 迁移文件
    const fs = require("fs");
    const path = require("path");
    const migrationPath = path.join(
      __dirname,
      "supabase/migrations/9999_merchant_analytics_rpc.sql",
    );
    const sql = fs.readFileSync(migrationPath, "utf8");

    console.log("执行 RPC 函数迁移...");

    // 分割 SQL 并逐个执行（简化版本）
    const statements = sql.split(/;(?=(?:[^"]*"[^"]*")*[^"]*$)/);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (
        statement &&
        !statement.startsWith("--") &&
        !statement.startsWith("/*")
      ) {
        try {
          console.log(`执行语句 ${i + 1}/${statements.length}...`);
          await client.query(statement);
          console.log(`语句 ${i + 1} 执行成功`);
        } catch (err) {
          console.warn(`语句 ${i + 1} 执行失败或已存在:`, err.message);
          // 继续执行其他语句
        }
      }
    }

    console.log("迁移完成!");

    // 验证函数是否创建成功
    console.log("验证 RPC 函数...");
    const { rows } = await client.query(`
      SELECT proname, prosrc
      FROM pg_proc
      WHERE proname LIKE 'get_merchant%'
      LIMIT 5
    `);

    if (rows.length > 0) {
      console.log("成功创建的 RPC 函数:");
      rows.forEach((row) => {
        console.log(`- ${row.proname}`);
      });
    } else {
      console.log("未找到 RPC 函数，可能需要手动检查");
    }
  } catch (error) {
    console.error("迁移失败:", error);
  } finally {
    await client.end();
  }
}

runDirectMigration();
