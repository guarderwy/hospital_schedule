-- 医院护士排班系统 - 数据库初始化脚本 v2
-- 数据库: hospital_schedule
-- 创建日期: 2026-05-11

-- 创建数据库
CREATE DATABASE IF NOT EXISTS hospital_schedule DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE hospital_schedule;

-- ============================================
-- 1. 班次定义表 (shift)
-- ============================================
DROP TABLE IF EXISTS `shift`;
CREATE TABLE `shift` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` VARCHAR(20) NOT NULL COMMENT '班次代码(唯一标识)',
  `name` VARCHAR(30) NOT NULL COMMENT '班次名称',
  `category` VARCHAR(20) NOT NULL DEFAULT 'normal' COMMENT '分类: night(夜班), day(白班), rest(休息), other(其他)',
  `start_time` TIME DEFAULT NULL COMMENT '开始时间',
  `end_time` TIME DEFAULT NULL COMMENT '结束时间',
  `duration_hours` DECIMAL(4,1) DEFAULT NULL COMMENT '时长(小时)',
  `applicable_days` VARCHAR(20) DEFAULT 'all' COMMENT '适用日期: all(每天), weekday(周一到周五), weekend(周六到周日)',
  `color` VARCHAR(20) DEFAULT NULL COMMENT '显示颜色',
  `sort_order` INT NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `description` VARCHAR(200) DEFAULT NULL COMMENT '说明',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_code` (`code`),
  KEY `idx_category` (`category`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='班次定义表';

-- 插入默认班次数据
INSERT INTO `shift` (`code`, `name`, `category`, `start_time`, `end_time`, `duration_hours`, `applicable_days`, `color`, `sort_order`, `description`) VALUES
('P', 'P', 'night', '16:00:00', '23:00:00', 7.0, 'all', '#f56c6c', 1, '前夜班 16:00-23:00'),
('N', 'N', 'night', '23:00:00', '08:00:00', 9.0, 'all', '#f56c6c', 2, '后夜班 23:00-08:00'),
('ZY', '助夜', 'night', '16:00:00', '22:00:00', 6.0, 'weekday', '#e6a23c', 3, '辅助夜班 16:00-22:00，仅周一到周五'),
('X', '休', 'rest', NULL, NULL, NULL, 'all', '#909399', 4, '休息'),
('XPRN', '休prn', 'rest', NULL, NULL, NULL, 'all', '#909399', 5, '休息待命，夜休第二天'),
('A1', 'A1', 'day', '07:30:00', '16:00:00', 8.5, 'all', '#409eff', 6, '白班1 07:30-16:00'),
('A2', 'A2', 'day', '07:30:00', '16:00:00', 8.5, 'all', '#409eff', 7, '白班2 07:30-16:00'),
('A12', '正1+2', 'day', '07:30:00', '17:00:00', 8.5, 'all', '#67c23a', 8, '正班1+2 07:30-12:00,14:30-17:00'),
('AZ', '正(中)', 'day', '07:30:00', '17:00:00', 8.5, 'weekday', '#67c23a', 9, '正班(中) 中医相关，仅周一到周五'),
('AY', '正(医)', 'day', '07:30:00', '17:00:00', 8.5, 'weekday', '#67c23a', 10, '正班(医) 医嘱班，仅周一到周五'),
('AF', 'A(服)', 'day', '07:30:00', '17:00:00', 8.5, 'weekday', '#67c23a', 11, '正班(服) 服药班，仅周一到周五'),
('AYF', '正(医+服)', 'day', '07:30:00', '17:00:00', 8.5, 'weekend', '#67c23a', 12, '正班(医+服) 医嘱+服药，周六到周日'),
('CK', '出科', 'other', NULL, NULL, NULL, 'all', '#c0c4cc', 13, '出科');

-- ============================================
-- 2. 人员表 (staff)
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
-- 3. 排班表 (schedule)
-- ============================================
DROP TABLE IF EXISTS `schedule`;
CREATE TABLE `schedule` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `staff_id` INT NOT NULL COMMENT '人员ID',
  `week_start` DATE NOT NULL COMMENT '周开始日期(周一)',
  `week_day` TINYINT NOT NULL COMMENT '星期(1-7)',
  `shift_type` VARCHAR(30) NOT NULL COMMENT '班次类型',
  `shift_id` INT DEFAULT NULL COMMENT '班次ID',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `is_generated` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否自动生成',
  `is_edited` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否手动编辑过',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_staff_week_day` (`staff_id`, `week_start`, `week_day`),
  KEY `idx_week_start` (`week_start`),
  KEY `idx_shift_id` (`shift_id`),
  CONSTRAINT `fk_schedule_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_schedule_shift` FOREIGN KEY (`shift_id`) REFERENCES `shift` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排班表';

-- ============================================
-- 4. 人员休息申请 (staff_request)
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
-- 5. 固定班次分配 (fixed_shift_assignment)
-- ============================================
DROP TABLE IF EXISTS `fixed_shift_assignment`;
CREATE TABLE `fixed_shift_assignment` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `staff_id` INT NOT NULL COMMENT '人员ID',
  `assign_date` DATE NOT NULL COMMENT '分配日期',
  `shift_type` VARCHAR(30) NOT NULL COMMENT '班次类型',
  `shift_id` INT DEFAULT NULL COMMENT '班次ID',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `reason` VARCHAR(200) DEFAULT NULL COMMENT '原因',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_staff_date` (`staff_id`, `assign_date`),
  KEY `idx_shift_id` (`shift_id`),
  CONSTRAINT `fk_fixed_shift_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_fixed_shift_shift` FOREIGN KEY (`shift_id`) REFERENCES `shift` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='固定班次分配表';

-- ============================================
-- 6. 排班变更日志 (schedule_change_log)
-- ============================================
DROP TABLE IF EXISTS `schedule_change_log`;
CREATE TABLE `schedule_change_log` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '主键',
  `staff_id` INT NOT NULL COMMENT '人员ID',
  `week_start` DATE NOT NULL COMMENT '周开始日期',
  `week_day` TINYINT NOT NULL COMMENT '星期(1-7)',
  `old_shift` VARCHAR(30) NOT NULL COMMENT '原班次',
  `new_shift` VARCHAR(30) NOT NULL COMMENT '新班次',
  `old_shift_id` INT DEFAULT NULL COMMENT '原班次ID',
  `new_shift_id` INT DEFAULT NULL COMMENT '新班次ID',
  `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注',
  `changed_by` VARCHAR(50) DEFAULT NULL COMMENT '操作人',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_staff_week` (`staff_id`, `week_start`),
  KEY `idx_old_shift_id` (`old_shift_id`),
  KEY `idx_new_shift_id` (`new_shift_id`),
  CONSTRAINT `fk_log_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='排班变更日志表';
