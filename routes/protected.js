import express from 'express';
import auth from './middleware/auth.js';

const router = express.Router();

// 受保护的路由
router.get('/profile', auth, (req, res) => {
  res.json({ msg: '这是一个受保护的资源', user: req.user });
});

export default router;