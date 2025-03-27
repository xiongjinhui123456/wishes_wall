import express from "express";
import bcrypt from "bcryptjs";
import { body, validationResult } from "express-validator";
import db from "../db.js";
import jwt from "jsonwebtoken";
import { log } from "console";

// 用户注册接口
const router = express.Router();

router.post(
  "/register",
  [
    body("username").not().isEmpty().withMessage("用户名不能为空"),
    body("email").isEmail().withMessage("请输入有效的电子邮件"),
    body("password").isLength({ min: 6 }).withMessage("密码必须至少6个字符"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, email, password } = req.body;

    try {
      // 检查用户是否已存在
      const [results] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);
      if (results.length > 0) {
        return res.status(400).json({ msg: "用户已存在" });
      }

      // 加密密码
      bcrypt.hash(password, 10, async (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ msg: "密码加密失败" });
        }

        // 插入新用户
        try {
          await db.execute(
            "INSERT INTO users (username, email, password,createdTime) VALUES (?, ?, ?,NOW())",
            [username, email, hashedPassword]
          );
          res.status(201).json({ msg: "注册成功" });
        } catch (err) {
          console.error(err);
          res.status(500).json({ msg: "数据库插入失败" });
        }
      });
    } catch (err) {
      console.error(err);
      res.status(500).send("服务器错误");
    }
  }
);

// 用户登录接口
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("请输入有效的电子邮件"),
    body("password").not().isEmpty().withMessage("密码不能为空"),
  ],
  async (req, res) => {
    const errors = validationResult(req); //express-validator 提供的一个函数，用于检查请求中的数据是否通过了预定义的验证规则
    if (!errors.isEmpty()) { //如果数据验证通过，errors.isEmpty() 会返回 true
      return res.status(400).json({ errors: errors.array()?.[0].msg});
    }

    const { email, password } = req.body;

    try {
      // 查找用户
      const [results] = await db.query("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      if (results.length === 0) {
        return res.status(400).json({ msg: "用户不存在" });
      }

      const user = results[0];

      // 比对密码
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: "密码错误" });
      }

      // 生成 JWT 令牌
      const payload = {
        userId: user.id,
        username: user.username,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
        },
      });
    } catch (err) {
      console.error("服务器错误", err.message);
      res.status(500).send("服务器错误");
    }
  }
);
export default router;
