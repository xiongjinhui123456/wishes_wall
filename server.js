import express from "express";
import cors from "cors";
import wishesRoutes from "./routes/wishes.js";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";
import { initDatabase } from "./initDatabase.js";

const app = express();
const port = 3001;
const host = '0.0.0.0'; // 绑定到云服务器网络接口
//中间件
app.use(cors());
app.use(express.json());

//日志中间件
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use("/", wishesRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", protectedRoutes);
// 先初始化数据库
initDatabase().then(() => {
//启动服务器
app.listen(port, host,() => {
  console.log("服务器启动成功", `http://8.138.215.26:${port}`);
});
})
