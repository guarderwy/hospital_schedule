/**
 * Base Service - 业务逻辑基础类
 * 提供通用的服务接口和错误处理
 */

import { StaffRepository, ScheduleRepository, StaffRequestRepository, FixedShiftRepository, ShiftRepository, ChangeLogRepository } from '../database/repository'

export class BaseService {
  protected staffRepo = new StaffRepository()
  protected scheduleRepo = new ScheduleRepository()
  protected requestRepo = new StaffRequestRepository()
  protected fixedShiftRepo = new FixedShiftRepository()
  protected shiftRepo = new ShiftRepository()
  protected changeLogRepo = new ChangeLogRepository()
}

export class ServiceError extends Error {
  constructor(
    public code: number = 500,
    public message: string = 'Internal Server Error',
    public details?: Record<string, any>,
  ) {
    super(message)
    this.name = 'ServiceError'
  }
}

export const ErrorCodes = {
  // 客户端错误 (4xx)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,

  // 服务器错误 (5xx)
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,

  // 业务错误 (9xx)
  BUSINESS_ERROR: 9000,
  SCHEDULE_CONFLICT: 9001,
  INVALID_SCHEDULE_STATE: 9002,
  INSUFFICIENT_NIGHT_STAFF: 9003,
  COVERAGE_NOT_MET: 9004,
}
