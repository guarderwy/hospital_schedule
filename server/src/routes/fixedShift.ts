import { Router, Request, Response } from 'express';
import pool from '../utils/db';

const router = Router();

router.get('/', async (req: Request, res: Response, next: any) => {
  try {
    const { staff_id, week_start, week_end } = req.query;
    let sql = `
      SELECT f.*, s.name as staff_name
      FROM fixed_shift_assignment f
      LEFT JOIN staff s ON f.staff_id = s.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (staff_id) {
      sql += ' AND f.staff_id = ?';
      params.push(staff_id);
    }
    if (week_start) {
      sql += ' AND f.assign_date >= ?';
      params.push(week_start);
    }
    if (week_end) {
      sql += ' AND f.assign_date <= ?';
      params.push(week_end);
    }

    sql += ' ORDER BY f.assign_date ASC, s.name ASC';
    const [rows] = await pool.query(sql, params);
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: any) => {
  try {
    const { staff_id, assign_date, shift_type, assigned_by, note } = req.body;

    const [result]: any = await pool.query(
      `INSERT INTO fixed_shift_assignment (staff_id, assign_date, shift_type, assigned_by, note)
       VALUES (?, ?, ?, ?, ?)`,
      [staff_id, assign_date, shift_type, assigned_by || '', note || '']
    );

    res.json({ code: 0, message: 'ok', data: { id: result.insertId } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ code: 409, message: '该员工在该日期已有固定班次分配', data: null });
      return;
    }
    next(error);
  }
});

router.put('/:id', async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    const { shift_type, note } = req.body;

    await pool.query(
      'UPDATE fixed_shift_assignment SET shift_type = ?, note = ? WHERE id = ?',
      [shift_type, note, id]
    );

    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: any) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM fixed_shift_assignment WHERE id = ?', [id]);
    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
