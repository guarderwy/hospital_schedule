import { Router } from 'express';
import pool from '../utils/db';
import { validateStaffCreate, validateStaffUpdate, validateNightTeamOrder } from '../middleware/validation';

const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const [rows] = await pool.query('SELECT * FROM staff WHERE status = ? ORDER BY night_team_order, id', ['active']);
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (error) {
    next(error);
  }
});

router.get('/night-team', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM staff WHERE is_night_team = ? AND status = ? ORDER BY night_team_order',
      [true, 'active']
    );
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/', validateStaffCreate, async (req, res, next) => {
  try {
    const { name, level, title, role, bed_range, is_night_team, night_team_order } = req.body;
    const [result] = await pool.query(
      'INSERT INTO staff (name, level, title, role, bed_range, is_night_team, night_team_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, level, title, role, bed_range, is_night_team, night_team_order]
    );
    res.json({ code: 0, message: 'ok', data: { id: (result as any).insertId } });
  } catch (error) {
    next(error);
  }
});

router.put('/:id', validateStaffUpdate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, level, title, role, bed_range, is_night_team, night_team_order, status } = req.body;
    await pool.query(
      'UPDATE staff SET name = ?, level = ?, title = ?, role = ?, bed_range = ?, is_night_team = ?, night_team_order = ?, status = ? WHERE id = ?',
      [name, level, title, role, bed_range, is_night_team, night_team_order, status, id]
    );
    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE staff SET status = ? WHERE id = ?', ['leave', id]);
    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

router.put('/night-team/order', validateNightTeamOrder, async (req, res, next) => {
  try {
    const { orders } = req.body;
    for (const item of orders) {
      await pool.query(
        'UPDATE staff SET night_team_order = ? WHERE id = ?',
        [item.order, item.id]
      );
    }
    res.json({ code: 0, message: 'ok', data: null });
  } catch (error) {
    next(error);
  }
});

export default router;
