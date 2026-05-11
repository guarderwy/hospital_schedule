import { Router } from 'express';
import pool from '../utils/db';
import { generateNightSchedule, copyWeekSchedule } from '../services/scheduleGenerator';
import { validateSchedule } from '../services/scheduleValidator';
import {
  validateScheduleQuery,
  validateScheduleBatch,
  validateGenerateSchedule,
  validateCopySchedule,
} from '../middleware/validation';

const router = Router();

router.get('/', validateScheduleQuery, async (req, res, next) => {
  try {
    const { week_start } = req.query;
    const [rows] = await pool.query(
      `SELECT s.*, st.name as staff_name, st.is_night_team 
       FROM schedule s 
       JOIN staff st ON s.staff_id = st.id 
       WHERE s.week_start = ? 
       ORDER BY st.is_night_team DESC, st.night_team_order, st.night_team_order, s.staff_id, s.week_day`,
      [week_start]
    );
    res.json({ code: 0, message: 'ok', data: rows });
  } catch (error) {
    next(error);
  }
});

router.post('/batch', validateScheduleBatch, async (req, res, next) => {
  try {
    const { schedules } = req.body;
    const conn = await pool.getConnection();
    await conn.beginTransaction();
    try {
      for (const item of schedules) {
        await conn.query(
          `INSERT INTO schedule (staff_id, week_start, week_day, shift_type, shift_id, remark, is_generated, is_edited) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE shift_type = ?, shift_id = ?, remark = ?, is_generated = ?, is_edited = ?`,
          [
            item.staff_id, item.week_start, item.week_day, item.shift_type, item.shift_id || null, item.remark || null, item.is_generated, item.is_edited,
            item.shift_type, item.shift_id || null, item.remark || null, item.is_generated, item.is_edited,
          ],
        );
      }
      await conn.commit();
      res.json({ code: 0, message: 'ok', data: null });
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    next(error);
  }
});

router.get('/current-week', async (req, res, next) => {
  try {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - daysSinceMonday);
    monday.setHours(0, 0, 0, 0);
    const nextMonday = new Date(monday);
    nextMonday.setDate(monday.getDate() + 7);

    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };

    const currentWeekStart = formatDate(monday);
    const nextWeekStart = formatDate(nextMonday);

    res.json({
      code: 0,
      message: 'ok',
      data: {
        current_week_start: currentWeekStart,
        next_week_start: nextWeekStart,
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/generate-night', validateGenerateSchedule, async (req, res, next) => {
  try {
    const { prev_week_start, next_week_start, randomize } = req.body;
    const [nightTeamRows] = await pool.query(
      'SELECT id FROM staff WHERE is_night_team = ? AND status = ? ORDER BY night_team_order',
      [true, 'active']
    );
    const nightTeamIds = (nightTeamRows as any[]).map((r) => r.id);

    // 1. 复制本周全部排班到下周
    const copied = await copyWeekSchedule(prev_week_start, next_week_start);

    // 2. 生成夜班组下周排班
    const generated = await generateNightSchedule(prev_week_start, next_week_start, nightTeamIds, !!randomize);

    // 3. 合并：非夜班组用复制的，夜班组用生成的覆盖
    const nightTeamIdSet = new Set(nightTeamIds);
    const result = copied.filter((item) => !nightTeamIdSet.has(item.staff_id as number));
    result.push(...generated);

    res.json({ code: 0, message: 'ok', data: result });
  } catch (error) {
    next(error);
  }
});

router.post('/copy', validateCopySchedule, async (req, res, next) => {
  try {
    const { from_week_start, to_week_start } = req.body;
    const copied = await copyWeekSchedule(from_week_start, to_week_start);
    res.json({ code: 0, message: 'ok', data: copied });
  } catch (error) {
    next(error);
  }
});

router.post('/validate', async (req, res, next) => {
  try {
    const { schedules, week_start } = req.body;
    
    let restRequests: any[] = [];
    if (week_start) {
      const [rows] = await pool.query(
        'SELECT sr.*, st.name as staff_name FROM staff_request sr JOIN staff st ON sr.staff_id = st.id WHERE sr.week_start = ? AND sr.status = ?',
        [week_start, 'approved']
      );
      restRequests = rows as any[];
    }
    
    const errors = validateSchedule(schedules, restRequests);
    res.json({ code: 0, message: 'ok', data: { valid: errors.length === 0, errors } });
  } catch (error) {
    next(error);
  }
});

export default router;
