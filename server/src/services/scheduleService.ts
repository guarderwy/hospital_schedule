/**
 * Schedule Service - 排班业务逻辑
 * 负责排班生成、复制、验证等核心业务
 */

import { BaseService, ServiceError, ErrorCodes } from './baseService'
import { generateNightSchedule, copyWeekSchedule } from './scheduleGenerator'
import { validateSchedule } from './scheduleValidator'
import type { CreateScheduleDTO, GenerateScheduleDTO, ValidateScheduleDTO, ScheduleValidationError } from '../types/dto'

export class ScheduleService extends BaseService {
  /**
   * 生成下周排班
   * 1. 复制本周全部排班到下周
   * 2. 生成夜班组的智能排班
   * 3. 合并结果：非夜班用复制的，夜班用生成的
   */
  async generateNextWeek(data: GenerateScheduleDTO): Promise<any[]> {
    try {
      const { prev_week_start, next_week_start, randomize } = data

      // 获取夜班组
      const nightTeam = await this.staffRepo.getNightTeam()
      if (nightTeam.length === 0) {
        throw new ServiceError(
          ErrorCodes.INSUFFICIENT_NIGHT_STAFF,
          '夜班组人员不足，无法生成排班',
        )
      }

      const nightTeamIds = nightTeam.map(s => s.id)

      // 1. 复制本周排班
      const copied = await copyWeekSchedule(prev_week_start, next_week_start)

      // 2. 生成夜班组排班
      const generated = await generateNightSchedule(prev_week_start, next_week_start, nightTeamIds, !!randomize)

      // 3. 合并：非夜班用复制的，夜班用生成的覆盖
      const nightTeamIdSet = new Set(nightTeamIds)
      const result = copied.filter(item => !nightTeamIdSet.has(item.staff_id as number))
      result.push(...generated)

      return result
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '生成排班失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 复制排班
   */
  async copySchedule(fromWeekStart: string, toWeekStart: string): Promise<any[]> {
    try {
      return await copyWeekSchedule(fromWeekStart, toWeekStart)
    } catch (error) {
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '复制排班失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 批量保存排班
   */
  async saveBatch(schedules: CreateScheduleDTO[]): Promise<void> {
    try {
      await this.scheduleRepo.batchUpsert(schedules)
    } catch (error) {
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '保存排班失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 验证排班
   */
  async validate(data: ValidateScheduleDTO): Promise<{ valid: boolean; errors: ScheduleValidationError[] }> {
    try {
      let restRequests: any[] = []
      if (data.week_start) {
        restRequests = await this.requestRepo.getApprovedByWeek(data.week_start)
      }

      const errors = validateSchedule(data.schedules, restRequests)
      return {
        valid: errors.length === 0,
        errors,
      }
    } catch (error) {
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '验证排班失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 获取指定周的排班
   */
  async getByWeek(weekStart: string) {
    try {
      return await this.scheduleRepo.getByWeek(weekStart)
    } catch (error) {
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '获取排班失败',
        { originalError: (error as Error).message },
      )
    }
  }
}
