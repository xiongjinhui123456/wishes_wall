import express from "express";
import db from "../db.js";

const router = express.Router();

//统一错误处理
const handleError = (res, error, message) => {
  console.log(error);
  res.status(500).json({ message, error });
};

//获取最近的十条数据
router.get("/wishesList", async (req, res) => {
  let { pageNum, pageSize } = req.query;

  // 解析并校验分页参数
  pageNum = Number(pageNum);
  pageSize = Number(pageSize);

  if (isNaN(pageNum) || pageNum <= 0) pageNum = 1;
  if (isNaN(pageSize) || pageSize <= 0) pageSize = 10;

  // 计算 OFFSET,查询时跳过这些数据
  const offset = (pageNum - 1) * pageSize;

  try {
    // 查询总条数
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM wishes"
    );

    // 查询分页数据,   使用 ? 进行参数化查询,更高效也安全
    const [rows] = await db.query(
      "SELECT * FROM wishes ORDER BY COALESCE(updateTime, createdTime) DESC  LIMIT ? OFFSET ?", //这里的问号是占位符，第一个问号是pageSize,第二个是offset
      [pageSize, offset]
    );

    // 返回数据
    res.json({
      total, // 总条数
      pageNum, // 当前页码
      pageSize, // 每页条数
      totalPages: Math.ceil(total / pageSize), // 总页数
      data: rows, // 当前页数据
    });
  } catch (error) {
    handleError(res, error, "愿望列表加载失败");
  }
});

//添加新的愿望
router.post("/add", async (req, res) => {
  const { name, message } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ status: "error", message: "姓名不能为空" });
  }
  if (!message?.trim()) {
    return res.status(400).json({ status: "error", message: "愿望不能为空" });
  }
  try {
    await db.query(
      "INSERT INTO wishes(name,message,createdTime) VALUES(?,?,NOW())",
      [name, message]
    );
    res.status(200).json({ status: "success", message: "愿望添加成功" });
  } catch (err) {
    handleError(res, err, "愿望添加失败，请稍后重试");
  }
});

//删除愿望
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  if (!id || isNaN(id)) {
    return res.status(400).json({ status: "error", message: "无效的id" });
  }
  try {
    const [result] = await db.query("DELETE FROM wishes WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "数据不存在" });
    }
    res.json({ status: "success", message: "删除成功" });
  } catch (err) {
    handleError(req, err, "删除失败");
  }
});

//更新愿望

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name, message } = req.body;
  if (!id || isNaN(id)) {
    return res.status(400).json({ status: "error", message: "无效的id" });
  }
  if (!name?.trim() || !message?.trim()) {
    return res
      .status(400)
      .json({ status: "error", message: "姓名和愿望不能为空" });
  }
  try {
    const [result] = await db.query(
      "UPDATE  wishes SET name=?,message=?,updateTime=NOW() WHERE id = ?",
      [name, message, id]
    );
    //通过表里面受影响的数据行数，来判断数据是否存在
    if (result.affectedRows === 0) {
      return res.status(404).json({ status: "error", message: "数据不存在" });
    }
    res.json({ status: "success", message: "更新成功" });
  } catch (err) {
    handleError(req, err, "更新失败");
  }
});
export default router;
