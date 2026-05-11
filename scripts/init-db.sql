-- 医院护士排班系统 - 数据库初始化脚本
-- 数据库: hospital_schedule
-- 创建日期: 2026-05-09

-- 创建数据库
CREATE DATABASE IF NOT EXISTS hospital_schedule DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_schedule;

-- ============================================
-- 1. 人员表 (staff)
-- ============================================
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(50) NOT NULL COMMENT '姓名',
  `level` VARCHAR(20) DEFAULT NULL COMMENT '能级(N0/N1/N2/N3)',
  `title` VARCHAR(50) DEFAULT NULL COMMENT '职称',
  `role` VARCHAR(50) DEFAULT NULL COMMENT '岗位',
  `bed_range` VARCHAR(50) DEFAULT NULL COMMENT '管床范围',
  `is_night_team` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否夜班组',
  `night_team_order` INT DEFAULT NULL COMMENT '夜班组轮转顺序',
  `status` ENUM('active', 'leave', 'transfer') NOT NULL DEFAULT 'active' COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_is_night_team` (`is_night_team`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人员表';

-- ============================================
-- 2. 排班表 (schedule)
-- ============================================
DROP TABLE IF EXISTS `schedule`;
CREATE TABLE `schedule` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `staff_id` INT NOT NULL COMMENT '人员ID',
  `week_start` DATE NOT NULL COMMENT '周开始日期(周一)',
  `week_day` TINYINT NOT NULL COMMENT '星期(1-7)',
  `shift_type` VARCHAR(30) NOT NULL COMMENT '班次类型',
  `is_generated` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否自动生成',
  `is_edited` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否手动编辑过',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff_week_day` (`staff_id`, `week_start`, `week_day`),
  KEY `idx_week_start` (`week_start`),
  CONSTRAINT `fk_schedule_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排班表';

-- ============================================
-- 3. 人员休息申请 (staff_request)
-- ============================================
DROP TABLE IF EXISTS `staff_request`;
CREATE TABLE `staff_request` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `staff_id` INT NOT NULL COMMENT '人员ID',
  `week_start` DATE NOT NULL COMMENT '申请周',
  `week_day` TINYINT NOT NULL COMMENT '星期(1-7)',
  `end_date` DATE DEFAULT NULL COMMENT '结束日期(支持连续多天)',
  `request_type` ENUM('rest', 'prn', 'other') NOT NULL DEFAULT 'rest' COMMENT '申请类型',
  `reason` VARCHAR(200) DEFAULT NULL COMMENT '原因',
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending' COMMENT '状态',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_staff_week` (`staff_id`, `week_start`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_request_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='人员休息申请表';

-- ============================================
-- 4. 固定班次分配 (fixed_shift_assignment)
-- ============================================
DROP TABLE IF EXISTS `fixed_shift_assignment`;
CREATE TABLE `fixed_shift_assignment` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `staff_id` INT NOT NULL COMMENT '人员ID',
  `assign_date` DATE NOT NULL COMMENT '分配日期',
  `shift_type` VARCHAR(30) NOT NULL COMMENT '班次类型',
  `reason` VARCHAR(200) DEFAULT NULL COMMENT '原因',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_staff_date` (`staff_id`, `assign_date`),
  CONSTRAINT `fk_fixed_shift_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='固定班次分配表';

-- ============================================
-- 5. 排班变更日志 (schedule_change_log)
-- ============================================
DROP TABLE IF EXISTS `schedule_change_log`;
CREATE TABLE `schedule_change_log` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `staff_id` INT NOT NULL COMMENT '人员ID',
  `week_start` DATE NOT NULL COMMENT '周开始日期',
  `week_day` TINYINT NOT NULL COMMENT '星期(1-7)',
  `old_shift` VARCHAR(30) NOT NULL COMMENT '原班次',
  `new_shift` VARCHAR(30) NOT NULL COMMENT '新班次',
  `changed_by` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_staff_week` (`staff_id`, `week_start`),
  CONSTRAINT `fk_log_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排班变更日志表';
