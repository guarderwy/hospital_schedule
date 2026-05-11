import { Request, Response, NextFunction } from 'express';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_SHIFTS = ['P', 'N', '休', '休prn', 'A1', 'A2', '助夜', '正1+2', '正(中)', '正(医)', '正(服)', '正(医+服)', '医嘱', '服药', '/'];
const VALID_STATUSES = ['active', 'leave', 'transfer'];
const VALID_REQUEST_TYPES = ['rest', 'prn', 'other'];

function sendError(res: Response, message: string) {
  return res.status(400).json({ code: 400, message, data: null });
}

export function validateScheduleQuery(req: Request, res: Response, next: NextFunction) {
  const { week_start } = req.query;
  if (!week_start || typeof week_start !== 'string') {
    return sendError(res, 'week_start 参数必填');
  }
  if (!DATE_REGEX.test(week_start)) {
    return sendError(res, 'week_start 格式错误，应为 YYYY-MM-DD');
  }
  next();
}

export function validateScheduleBatch(req: Request, res: Response, next: NextFunction) {
  const { schedules } = req.body;
  if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
    return sendError(res, 'schedules 数组必填且不能为空');
  }
  for (let i = 0; i < schedules.length; i++) {
    const s = schedules[i];
    if (!s.staff_id || typeof s.staff_id !== 'number') {
      return sendError(res, `schedules[${i}].staff_id 必须是数字`);
    }
    if (!s.week_start || typeof s.week_start !== 'string' || !DATE_REGEX.test(s.week_start)) {
      return sendError(res, `schedules[${i}].week_start 格式错误，应为 YYYY-MM-DD`);
    }
    if (!s.week_day || typeof s.week_day !== 'number' || s.week_day < 1 || s.week_day > 7) {
      return sendError(res, `schedules[${i}].week_day 必须是 1-7 之间的数字`);
    }
    if (!s.shift_type || typeof s.shift_type !== 'string') {
      return sendError(res, `schedules[${i}].shift_type 必填`);
    }
  }
  next();
}

export function validateGenerateSchedule(req: Request, res: Response, next: NextFunction) {
  const { prev_week_start, next_week_start } = req.body;
  if (!prev_week_start || typeof prev_week_start !== 'string' || !DATE_REGEX.test(prev_week_start)) {
    return sendError(res, 'prev_week_start 格式错误，应为 YYYY-MM-DD');
  }
  if (!next_week_start || typeof next_week_start !== 'string' || !DATE_REGEX.test(next_week_start)) {
    return sendError(res, 'next_week_start 格式错误，应为 YYYY-MM-DD');
  }
  next();
}

export function validateCopySchedule(req: Request, res: Response, next: NextFunction) {
  const { from_week_start, to_week_start } = req.body;
  if (!from_week_start || typeof from_week_start !== 'string' || !DATE_REGEX.test(from_week_start)) {
    return sendError(res, 'from_week_start 格式错误，应为 YYYY-MM-DD');
  }
  if (!to_week_start || typeof to_week_start !== 'string' || !DATE_REGEX.test(to_week_start)) {
    return sendError(res, 'to_week_start 格式错误，应为 YYYY-MM-DD');
  }
  next();
}

export function validateStaffCreate(req: Request, res: Response, next: NextFunction) {
  const { name } = req.body;
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return sendError(res, 'name 必填');
  }
  const { level } = req.body;
  if (level && !['N0', 'N1', 'N2', 'N3'].includes(level)) {
    return sendError(res, 'level 必须是 N0/N1/N2/N3 之一');
  }
  next();
}

export function validateStaffUpdate(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return sendError(res, 'id 必须是数字');
  }
  const { status } = req.body;
  if (status && !VALID_STATUSES.includes(status)) {
    return sendError(res, `status 必须是 ${VALID_STATUSES.join('/')} 之一`);
  }
  next();
}

export function validateNightTeamOrder(req: Request, res: Response, next: NextFunction) {
  const { orders } = req.body;
  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return sendError(res, 'orders 数组必填且不能为空');
  }
  for (let i = 0; i < orders.length; i++) {
    const o = orders[i];
    if (!o.id || typeof o.id !== 'number') {
      return sendError(res, `orders[${i}].id 必须是数字`);
    }
    if (typeof o.order !== 'number') {
      return sendError(res, `orders[${i}].order 必须是数字`);
    }
  }
  next();
}

export function validateStaffRequest(req: Request, res: Response, next: NextFunction) {
  const { staff_id, week_start, week_day, request_type } = req.body;
  if (!staff_id || typeof staff_id !== 'number') {
    return sendError(res, 'staff_id 必须是数字');
  }
  if (!week_start || typeof week_start !== 'string' || !DATE_REGEX.test(week_start)) {
    return sendError(res, 'week_start 格式错误，应为 YYYY-MM-DD');
  }
  if (!week_day || typeof week_day !== 'number' || week_day < 1 || week_day > 7) {
    return sendError(res, 'week_day 必须是 1-7 之间的数字');
  }
  if (request_type && !VALID_REQUEST_TYPES.includes(request_type)) {
    return sendError(res, `request_type 必须是 ${VALID_REQUEST_TYPES.join('/')} 之一`);
  }
  next();
}
