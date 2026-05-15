/**
 * Repository Layer - 数据库操作抽象
 * 所有数据库查询都通过 Repository 进行，便于测试和维护
 */

import pool from '../utils/db'
import type {
  Schedule,
  Staff,
  StaffRequest,
  FixedShiftAssignment,
  Shift,
  ScheduleChangeLog,
} from '../types'
import type {
  CreateScheduleDTO,
  CreateStaffDTO,
  CreateStaffRequestDTO,
  CreateFixedShiftDTO,
  CreateShiftDTO,
  UpdateStaffDTO,
  UpdateShiftDTO,
} from '../types/dto'

export class StaffRepository {
  async getAll(): Promise<Staff[]> {
    const [rows] = await pool.query('SELECT * FROM staff ORDER BY night_team_order, id')
    return rows as Staff[]
  }

  async getById(id: number): Promise<Staff | null> {
    const [rows] = await pool.query('SELECT * FROM staff WHERE id = ?', [id])
    const result = rows as Staff[]
    return result[0] || null
  }

  async getNightTeam(): Promise<Staff[]> {
    const [rows] = await pool.query(
      'SELECT * FROM staff WHERE is_night_team = ? AND status = ? ORDER BY night_team_order',
      [true, 'active'],
    )
    return rows as Staff[]
  }

  async create(data: CreateStaffDTO): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO staff (name, level, title, role, bed_range, is_night_team, night_team_order, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.name,
        data.level || null,
        data.title || null,
        data.role || null,
        data.bed_range || null,
        data.is_night_team || false,
        data.night_team_order || null,
        data.status || 'active',
      ],
    )
    return (result as any).insertId
  }

  async update(id: number, data: UpdateStaffDTO): Promise<boolean> {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.level !== undefined) {
      updates.push('level = ?')
      values.push(data.level)
    }
    if (data.title !== undefined) {
      updates.push('title = ?')
      values.push(data.title)
    }
    if (data.role !== undefined) {
      updates.push('role = ?')
      values.push(data.role)
    }
    if (data.bed_range !== undefined) {
      updates.push('bed_range = ?')
      values.push(data.bed_range)
    }
    if (data.is_night_team !== undefined) {
      updates.push('is_night_team = ?')
      values.push(data.is_night_team)
    }
    if (data.night_team_order !== undefined) {
      updates.push('night_team_order = ?')
      values.push(data.night_team_order)
    }
    if (data.status !== undefined) {
      updates.push('status = ?')
      values.push(data.status)
    }

    if (updates.length === 0) return true

    values.push(id)
    const [result] = await pool.query(`UPDATE staff SET ${updates.join(', ')} WHERE id = ?`, values)
    return (result as any).affectedRows > 0
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id])
    return (result as any).affectedRows > 0
  }
}

export class ScheduleRepository {
  async getByWeek(weekStart: string): Promise<Schedule[]> {
    const [rows] = await pool.query(
      `SELECT s.*, st.name as staff_name, st.is_night_team 
       FROM schedule s 
       JOIN staff st ON s.staff_id = st.id 
       WHERE s.week_start = ? 
       ORDER BY st.is_night_team DESC, st.night_team_order, s.staff_id, s.week_day`,
      [weekStart],
    )
    return rows as Schedule[]
  }

  async getByStaffAndWeek(staffId: number, weekStart: string): Promise<Schedule[]> {
    const [rows] = await pool.query(
      'SELECT * FROM schedule WHERE staff_id = ? AND week_start = ? ORDER BY week_day',
      [staffId, weekStart],
    )
    return rows as Schedule[]
  }

  async batchUpsert(schedules: CreateScheduleDTO[]): Promise<void> {
    const conn = await pool.getConnection()
    try {
      await conn.beginTransaction()
      for (const item of schedules) {
        await conn.query(
          `INSERT INTO schedule (staff_id, week_start, week_day, shift_type, shift_id, remark, is_generated, is_edited) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE shift_type = ?, shift_id = ?, remark = ?, is_generated = ?, is_edited = ?`,
          [
            item.staff_id,
            item.week_start,
            item.week_day,
            item.shift_type,
            item.shift_id || null,
            item.remark || null,
            item.is_generated || false,
            item.is_edited || false,
            item.shift_type,
            item.shift_id || null,
            item.remark || null,
            item.is_generated || false,
            item.is_edited || false,
          ],
        )
      }
      await conn.commit()
    } catch (err) {
      await conn.rollback()
      throw err
    } finally {
      conn.release()
    }
  }

  async deleteByWeek(weekStart: string): Promise<void> {
    await pool.query('DELETE FROM schedule WHERE week_start = ?', [weekStart])
  }
}

export class StaffRequestRepository {
  async getByWeek(weekStart: string): Promise<StaffRequest[]> {
    const [rows] = await pool.query(
      'SELECT sr.*, st.name as staff_name FROM staff_request sr JOIN staff st ON sr.staff_id = st.id WHERE sr.week_start = ? ORDER BY sr.created_at DESC',
      [weekStart],
    )
    return rows as StaffRequest[]
  }

  async getApprovedByWeek(weekStart: string): Promise<StaffRequest[]> {
    const [rows] = await pool.query(
      'SELECT * FROM staff_request WHERE week_start = ? AND status = ? ORDER BY staff_id',
      [weekStart, 'approved'],
    )
    return rows as StaffRequest[]
  }

  async create(data: CreateStaffRequestDTO): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO staff_request (staff_id, week_start, end_date, week_day, total_days, request_type, reason) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        data.staff_id,
        data.week_start,
        data.end_date || null,
        data.week_day,
        data.total_days || 1,
        data.request_type,
        data.reason || null,
      ],
    )
    return (result as any).insertId
  }

  async approve(id: number, approvedBy: string): Promise<boolean> {
    const [result] = await pool.query(
      'UPDATE staff_request SET status = ?, approved_by = ?, approved_at = NOW() WHERE id = ?',
      ['approved', approvedBy, id],
    )
    return (result as any).affectedRows > 0
  }

  async reject(id: number): Promise<boolean> {
    const [result] = await pool.query('UPDATE staff_request SET status = ? WHERE id = ?', ['rejected', id])
    return (result as any).affectedRows > 0
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM staff_request WHERE id = ?', [id])
    return (result as any).affectedRows > 0
  }
}

export class FixedShiftRepository {
  async getByWeek(weekStart: string): Promise<FixedShiftAssignment[]> {
    const [rows] = await pool.query(
      `SELECT fsa.*, st.name as staff_name 
       FROM fixed_shift_assignment fsa 
       JOIN staff st ON fsa.staff_id = st.id 
       WHERE fsa.assign_date >= ? AND fsa.assign_date < DATE_ADD(?, INTERVAL 7 DAY)
       ORDER BY fsa.assign_date, fsa.staff_id`,
      [weekStart, weekStart],
    )
    return rows as FixedShiftAssignment[]
  }

  async create(data: CreateFixedShiftDTO): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO fixed_shift_assignment (staff_id, assign_date, shift_type, assigned_by, note) VALUES (?, ?, ?, ?, ?)',
      [data.staff_id, data.assign_date, data.shift_type, data.assigned_by, data.note || ''],
    )
    return (result as any).insertId
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query('DELETE FROM fixed_shift_assignment WHERE id = ?', [id])
    return (result as any).affectedRows > 0
  }
}

export class ShiftRepository {
  async getAll(): Promise<Shift[]> {
    const [rows] = await pool.query('SELECT * FROM shift WHERE is_active = ? ORDER BY sort_order, id', [true])
    return rows as Shift[]
  }

  async getById(id: number): Promise<Shift | null> {
    const [rows] = await pool.query('SELECT * FROM shift WHERE id = ?', [id])
    const result = rows as Shift[]
    return result[0] || null
  }

  async create(data: CreateShiftDTO): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO shift (code, name, category, start_time, end_time, duration_hours, applicable_days, color, sort_order, is_active, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.code,
        data.name,
        data.category,
        data.start_time || null,
        data.end_time || null,
        data.duration_hours || null,
        data.applicable_days || '',
        data.color || null,
        data.sort_order || 0,
        data.is_active !== false,
        data.description || null,
      ],
    )
    return (result as any).insertId
  }

  async update(id: number, data: UpdateShiftDTO): Promise<boolean> {
    const updates: string[] = []
    const values: any[] = []

    if (data.name !== undefined) {
      updates.push('name = ?')
      values.push(data.name)
    }
    if (data.category !== undefined) {
      updates.push('category = ?')
      values.push(data.category)
    }
    if (data.color !== undefined) {
      updates.push('color = ?')
      values.push(data.color)
    }
    if (data.sort_order !== undefined) {
      updates.push('sort_order = ?')
      values.push(data.sort_order)
    }
    if (data.is_active !== undefined) {
      updates.push('is_active = ?')
      values.push(data.is_active)
    }
    if (data.description !== undefined) {
      updates.push('description = ?')
      values.push(data.description)
    }

    if (updates.length === 0) return true

    values.push(id)
    const [result] = await pool.query(`UPDATE shift SET ${updates.join(', ')} WHERE id = ?`, values)
    return (result as any).affectedRows > 0
  }

  async delete(id: number): Promise<boolean> {
    const [result] = await pool.query('UPDATE shift SET is_active = ? WHERE id = ?', [false, id])
    return (result as any).affectedRows > 0
  }
}

export class ChangeLogRepository {
  async getByWeek(weekStart: string): Promise<ScheduleChangeLog[]> {
    const [rows] = await pool.query(
      `SELECT scl.*, st.name as staff_name 
       FROM schedule_change_log scl 
       JOIN staff st ON scl.staff_id = st.id 
       WHERE scl.week_start = ? 
       ORDER BY scl.created_at DESC`,
      [weekStart],
    )
    return rows as ScheduleChangeLog[]
  }

  async create(data: Omit<ScheduleChangeLog, 'id' | 'created_at'>): Promise<number> {
    const [result] = await pool.query(
      'INSERT INTO schedule_change_log (schedule_id, staff_id, week_start, week_day, old_shift, new_shift, change_type, changed_by, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        data.schedule_id || null,
        data.staff_id,
        data.week_start,
        data.week_day,
        data.old_shift,
        data.new_shift,
        data.change_type,
        data.changed_by,
        data.note,
      ],
    )
    return (result as any).insertId
  }
}
