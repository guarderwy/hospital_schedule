import { Router, Request, Response } from 'express';
import pool from '../utils/db';

const router = Router();

router.get('/', async (req: Request, res: Response, next: any) => {
  try {
    const { staff_id, week_start } = req.query;
    let sql = 'SELECT * FROM schedule_change_log WHERE 1=1';
    const params: any[] = [];

    if (staff_id) {
      sql += ' AND staff_id = ?';
      params.push(staff_id);
    }
    if (week_start) {
      sql += ' AND week_start = ?';
      params.push(week_start);
    }

    sql += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: any) => {
  try {
    const { schedule_id, staff_id, week_start, week_day, old_shift, new_shift, change_type, changed_by, note } = req.body;

    const [result]: any = await pool.query(
      `INSERT INTO schedule_change_log (schedule_id, staff_id, week_start, week_day, old_shift, new_shift, change_type, changed_by, note)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [schedule_id || null, staff_id, week_start, week_day, old_shift || '', new_shift, change_type || 'manual_edit', changed_by || '', note || '']
    );

    res.json({ code: 0, message: 'ok', data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
});

export default router;
