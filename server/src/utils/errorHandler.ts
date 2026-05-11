import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const path = req.path;

  console.error(`[${timestamp}] ${method} ${path}:`, err.message || err);

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      code: 409,
      message: '数据重复',
      data: null,
    });
  }

  if (err.code && err.code.startsWith('ER_')) {
    console.error(`Database error [${err.code}]:`, err);
    return res.status(500).json({
      code: 500,
      message: '数据库操作失败',
      data: null,
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: err.message,
      data: null,
    });
  }

  res.status(500).json({
    code: 500,
    message: process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message,
    data: null,
  });
}
