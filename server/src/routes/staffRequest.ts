import { Router, Request, Response } from 'express';
import pool from '../utils/db';
import { validateStaffRequest } from '../middleware/validation';

const router = Router();

router.get('/', async (req: Request, res: Response, next: any) => {
  try {
    const { staff_id, week_start, status } = req.query;
    let sql = 'SELECT * FROM staff_request WHERE 1=1';
    const params: any[] = [];

    if (staff_id) {
      sql += ' AND staff_id = ?';
      params.push(staff_id);
    }
    if (week_start) {
      sql += ' AND week_start = ?';
      params.push(week_start);
    }
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY week_start DESC, week_day ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: any) => {
  try {
    const { staff_id, week_start, week_day, end_date, request_type, reason } = req.body;

    let actualEndDate = end_date || null;
    let totalDays = 1;

    if (actualEndDate && week_start) {
      const startDate = new Date(week_start);
      const endDate = new Date(actualEndDate);
      const diffTime = endDate.getTime() - startDate.getTime();
      totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      if (totalDays < 1) totalDays = 1;
    }

    const [result]: any = await pool.query(
      `INSERT INTO staff_request (staff_id, week_start, week_day, end_date, total_days, request_type, reason, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [staff_id, week_start, week_day, actualEndDate, totalDays, request_type || 'rest', reason || '']
    );

    res.json({ code: 0, message: 'ok', data: { id: result.insertId, total_days: totalDays } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { request_type, reason, status, end_date } = req.body;

    let updateFields: string[] = [];
    let params: any[] = [];

    if (request_type !== undefined) {
      updateFields.push('request_type = ?');
      params.push(request_type);
    }
    if (reason !== undefined) {
      updateFields.push('reason = ?');
      params.push(reason);
    }
    if (status !== undefined) {
      updateFields.push('status = ?');
      params.push(status);
    }
    if (end_date !== undefined) {
      updateFields.push('end_date = ?');
      params.push(end_date);
    }

    if (updateFields.length === 0) {
      res.json({ code: 0, message: 'no changes', data: null });
      return;
    }

    params.push(id);
    await pool.query(
      `UPDATE staff_request SET ${updateFields.join(', ')} WHERE id = ?`,
      params
    );

    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

router.patch('/:id/approve', async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { status = 'approved', approved_by = '' } = req.body;

    const [result]: any = await pool.query(
      'UPDATE staff_request SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      [status, approved_by, id]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ code: 404, message: 'Request not found', data: null });
      return;
    }

    res.json({ code: 0, message: 'ok', data: { id, status } });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM staff_request WHERE id = ?', [id]);
    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
