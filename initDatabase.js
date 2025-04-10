import fs from "fs";
import path from "path";
import db from "./db.js"; 

export async function initDatabase() {
  try {
    const sqlPath = path.resolve("init.sql");
    const sqlContent = fs.readFileSync(sqlPath, "utf-8");

    const statements = sqlContent
      .split(";")
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const stmt of statements) {
      await db.query(stmt);
    }

    console.log("✅ 数据库初始化完成");
  } catch (error) {
    console.error("❌ 初始化数据库失败:", error);
  }
}
