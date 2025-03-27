import express from 'express';
import cors from 'cors';
import wishesRoutes from './routes/wishes.js'

const app = express();
const port = 3000;

//中间件
app.use(cors())
app.use(express.json());

//日志中间件
app.use((req,res,next)=>{
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next()
})
app.use("/", wishesRoutes);

//启动服务器
app.listen(port, () => {
  console.log("服务器启动成功", `http://localhost:${port}`);
});
