import { Router } from 'express';
import pool from '../utils/db';

const router = Router();

// 获取所有班次
router.get('/', async (req, res, next) => {
  try {
    const { category, active } = req.query;
    let sql = 'SELECT * FROM shift WHERE 1=1';
    const params: any[] = [];

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (active !== undefined) {
      sql += ' AND is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    sql += ' ORDER BY sort_order';

    const [rows] = await pool.query(sql, params);
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (error) {
    next(error);
  }
});

// 获取单个班次
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM shift WHERE id = ?', [id]);
    const shifts = rows as any[];

    if (shifts.length === 0) {
      return res.status(404).json({ code: 404, message: '班次不存在', data: null });
    }

    res.json({ code: 0, message: 'ok', data: shifts[0] });
  } catch (error) {
    next(error);
  }
});

// 创建班次
router.post('/', async (req, res, next) => {
  try {
    const { code, name, category, start_time, end_time, duration_hours, applicable_days, color, sort_order, description } = req.body;

    if (!code || !name) {
      return res.status(400).json({ code: 400, message: '班次代码和名称不能为空', data: null });
    }

    const [result] = await pool.query(
      'INSERT INTO shift (code, name, category, start_time, end_time, duration_hours, applicable_days, color, sort_order, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        code,
        name,
        category || 'normal',
        start_time || null,
        end_time || null,
        duration_hours || null,
        applicable_days || 'all',
        color || null,
        sort_order || 0,
        description || null,
      ],
    );

    res.json({ code: 0, message: 'ok', data: { id: (result as any).insertId } });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '班次代码已存在', data: null });
    }
    next(error);
  }
});

// 更新班次
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, category, start_time, end_time, duration_hours, applicable_days, color, sort_order, is_active, description } = req.body;

    const [result] = await pool.query(
      'UPDATE shift SET code = ?, name = ?, category = ?, start_time = ?, end_time = ?, duration_hours = ?, applicable_days = ?, color = ?, sort_order = ?, is_active = ?, description = ? WHERE id = ?',
      [
        code,
        name,
        category,
        start_time,
        end_time,
        duration_hours,
        applicable_days,
        color,
        sort_order,
        is_active,
        description,
        id,
      ],
    );

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '班次不存在', data: null });
    }

    res.json({ code: 0, message: 'ok', data: null });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ code: 400, message: '班次代码已存在', data: null });
    }
    next(error);
  }
});

// 删除班次
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查是否有排班引用此班次
    const [refs] = await pool.query('SELECT COUNT(*) as count FROM schedule WHERE shift_id = ?', [id]);
    if ((refs as any[])[0].count > 0) {
      return res.status(400).json({ code: 400, message: '该班次已被排班引用，无法删除', data: null });
    }

    const [result] = await pool.query('DELETE FROM shift WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ code: 404, message: '班次不存在', data: null });
    }

    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
