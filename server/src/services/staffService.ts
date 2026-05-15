/**
 * Staff Service - 人员管理业务逻辑
 */

import { BaseService, ServiceError, ErrorCodes } from './baseService'
import type { CreateStaffDTO, UpdateStaffDTO } from '../types/dto'

export class StaffService extends BaseService {
  /**
   * 获取所有人员
   */
  async getAll() {
    try {
      return await this.staffRepo.getAll()
    } catch (error) {
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '获取人员列表失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 获取单个人员
   */
  async getById(id: number) {
    try {
      const staff = await this.staffRepo.getById(id)
      if (!staff) {
        throw new ServiceError(
          ErrorCodes.NOT_FOUND,
          `人员 ID ${id} 不存在`,
        )
      }
      return staff
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '获取人员失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 获取夜班组
   */
  async getNightTeam() {
    try {
      return await this.staffRepo.getNightTeam()
    } catch (error) {
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '获取夜班组失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 创建人员
   */
  async create(data: CreateStaffDTO) {
    try {
      if (!data.name || data.name.trim() === '') {
        throw new ServiceError(
          ErrorCodes.VALIDATION_ERROR,
          '人员名字不能为空',
        )
      }

      const id = await this.staffRepo.create(data)
      return await this.staffRepo.getById(id)
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '创建人员失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 更新人员
   */
  async update(id: number, data: UpdateStaffDTO) {
    try {
      // 检查人员是否存在
      const staff = await this.staffRepo.getById(id)
      if (!staff) {
        throw new ServiceError(
          ErrorCodes.NOT_FOUND,
          `人员 ID ${id} 不存在`,
        )
      }

      const success = await this.staffRepo.update(id, data)
      if (!success) {
        throw new ServiceError(
          ErrorCodes.INTERNAL_ERROR,
          '更新人员失败',
        )
      }

      return await this.staffRepo.getById(id)
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '更新人员失败',
        { originalError: (error as Error).message },
      )
    }
  }

  /**
   * 删除人员
   */
  async delete(id: number) {
    try {
      const staff = await this.staffRepo.getById(id)
      if (!staff) {
        throw new ServiceError(
          ErrorCodes.NOT_FOUND,
          `人员 ID ${id} 不存在`,
        )
      }

      const success = await this.staffRepo.delete(id)
      if (!success) {
        throw new ServiceError(
          ErrorCodes.INTERNAL_ERROR,
          '删除人员失败',
        )
      }

      return true
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error
      }
      throw new ServiceError(
        ErrorCodes.INTERNAL_ERROR,
        '删除人员失败',
        { originalError: (error as Error).message },
      )
    }
  }
}
