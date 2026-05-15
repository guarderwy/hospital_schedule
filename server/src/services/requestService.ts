/**
 * StaffRequest Service - 休息申请业务逻辑
 */

import { BaseService, ServiceError, ErrorCodes } from './baseService'
import type { CreateStaffRequestDTO, ApproveStaffRequestDTO } from '../types/dto'

export class RequestService extends BaseService {
  /**
   * 获取指定周的申请
   */
  async getByWeek(weekStart: string) {
    try {
      return await this.requestRepo.getByWeek(weekStart)
    } catch (error) {
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '获取申请列表失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 创建申请
   */
  async create(data: CreateStaffRequestDTO) {
    try {
      // 验证人员存在
      const staff = await this.staffRepo.getById(data.staff_id)
      if (!staff) {
        throw new ServiceError(
          ErrorCodes.NOT_FOUND,
          `人员 ID ${data.staff_id} 不存在`,
        )
      }

      // 验证申请参数
      if (data.week_day < 1 || data.week_day > 7) {
        throw new ServiceError(
          ErrorCodes.VALIDATION_ERROR,
          '周日期必须在1-7之间',
        )
      }

      const id = await this.requestRepo.create(data)
      return { id, ...data }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '创建申请失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 批准申请
   */
  async approve(id: number, data: ApproveStaffRequestDTO) {
    try {
      const success = await this.requestRepo.approve(id, data.approved_by)
      if (!success) {
        throw new ServiceError(
          ErrorCodes.NOT_FOUND,
          `申请 ID ${id} 不存在`,
        )
      }
      return { id, status: 'approved' }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '批准申请失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 拒绝申请
   */
  async reject(id: number) {
    try {
      const success = await this.requestRepo.reject(id)
      if (!success) {
        throw new ServiceError(
          ErrorCodes.NOT_FOUND,
          `申请 ID ${id} 不存在`,
        )
      }
      return { id, status: 'rejected' }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '拒绝申请失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 删除申请
   */
  async delete(id: number) {
    try {
      const success = await this.requestRepo.delete(id)
      if (!success) {
        throw new ServiceError(
          ErrorCodes.NOT_FOUND,
          `申请 ID ${id} 不存在`,
        )
      }
      return true
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '删除申请失败',
        { originalError: (error as Error).message },
      )
    }
  }
}
