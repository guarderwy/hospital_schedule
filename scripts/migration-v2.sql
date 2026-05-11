-- 医院护士排班系统 - 数据库迁移脚本 v2
-- 功能: 班次表创建、排班表结构调整、数据迁移
-- 执行日期: 2026-05-11
-- 说明: 在 init-db.sql 基础上执行，不可重复执行

USE hospital_schedule;

-- ============================================
-- 1. 创建班次定义表 (shift)
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

-- ============================================
-- 2. 插入班次数据
-- ============================================
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
-- 3. 排班表添加新字段
-- ============================================
-- 添加 shift_id 字段(外键关联班次表)
ALTER TABLE `schedule` ADD COLUMN `shift_id` INT DEFAULT NULL COMMENT '班次ID' AFTER `shift_type`;
-- 添加 remark 字段(备注)
ALTER TABLE `schedule` ADD COLUMN `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注' AFTER `shift_type`;
-- 添加外键约束
ALTER TABLE `schedule` ADD CONSTRAINT `fk_schedule_shift` FOREIGN KEY (`shift_id`) REFERENCES `shift` (`id`) ON DELETE SET NULL;
-- 添加索引
ALTER TABLE `schedule` ADD KEY `idx_shift_id` (`shift_id`);

-- ============================================
-- 4. 数据迁移: shift_type → shift_id
-- ============================================
-- 班次名称到班次ID的映射关系
-- 旧名称 → 新code:
-- P → P (id=1)
-- N → N (id=2)
-- 助夜 → ZY (id=3)
-- 休 → X (id=4)
-- 休prn / 休 prn / 休(prn) → XPRN (id=5)
-- A1 → A1 (id=6)
-- A2 → A2 (id=7)
-- 正1+2 → A12 (id=8)
-- 正(中) → AZ (id=9)
-- 正(医) / 医嘱 → AY (id=10)
-- 正(服) / 服药 → AF (id=11)
-- 正(医+服) → AYF (id=12)
-- 出科 → CK (id=13)

UPDATE `schedule` SET `shift_id` = 1 WHERE `shift_type` = 'P';
UPDATE `schedule` SET `shift_id` = 2 WHERE `shift_type` = 'N';
UPDATE `schedule` SET `shift_id` = 3 WHERE `shift_type` = '助夜';
UPDATE `schedule` SET `shift_id` = 4 WHERE `shift_type` = '休';
UPDATE `schedule` SET `shift_id` = 5 WHERE `shift_type` IN ('休prn', '休 prn', '休(prn)', '休（prn）');
UPDATE `schedule` SET `shift_id` = 6 WHERE `shift_type` = 'A1';
UPDATE `schedule` SET `shift_id` = 7 WHERE `shift_type` = 'A2';
UPDATE `schedule` SET `shift_id` = 8 WHERE `shift_type` = '正1+2';
UPDATE `schedule` SET `shift_id` = 9 WHERE `shift_type` = '正(中)';
UPDATE `schedule` SET `shift_id` = 10 WHERE `shift_type` IN ('正(医)', '医嘱');
UPDATE `schedule` SET `shift_id` = 11 WHERE `shift_type` IN ('正(服)', '服药');
UPDATE `schedule` SET `shift_id` = 12 WHERE `shift_type` = '正(医+服)';
UPDATE `schedule` SET `shift_id` = 13 WHERE `shift_type` = '出科';

-- ============================================
-- 5. 数据迁移: 代理/跟岗/入科等备注信息提取
-- ============================================
-- 如果 shift_type 中包含备注信息(如 "P(代理)"、"N(跟岗)"等)，提取到 remark 字段
UPDATE `schedule` SET 
  `remark` = SUBSTRING_INDEX(SUBSTRING_INDEX(`shift_type`, '(', -1), ')', 1),
  `shift_type` = SUBSTRING_INDEX(`shift_type`, '(', 1),
  `shift_id` = CASE 
    WHEN SUBSTRING_INDEX(`shift_type`, '(', 1) = 'P' THEN 1
    WHEN SUBSTRING_INDEX(`shift_type`, '(', 1) = 'N' THEN 2
    WHEN SUBSTRING_INDEX(`shift_type`, '(', 1) = '助夜' THEN 3
    WHEN SUBSTRING_INDEX(`shift_type`, '(', 1) = '休' THEN 4
    WHEN SUBSTRING_INDEX(`shift_type`, '(', 1) = 'A1' THEN 6
    WHEN SUBSTRING_INDEX(`shift_type`, '(', 1) = 'A2' THEN 7
    ELSE `shift_id`
  END
WHERE `shift_type` LIKE '%(%';

-- 处理全角括号
UPDATE `schedule` SET 
  `remark` = SUBSTRING_INDEX(SUBSTRING_INDEX(`shift_type`, '（', -1), '）', 1),
  `shift_type` = SUBSTRING_INDEX(`shift_type`, '（', 1),
  `shift_id` = CASE 
    WHEN SUBSTRING_INDEX(`shift_type`, '（', 1) = 'P' THEN 1
    WHEN SUBSTRING_INDEX(`shift_type`, '（', 1) = 'N' THEN 2
    WHEN SUBSTRING_INDEX(`shift_type`, '（', 1) = '助夜' THEN 3
    WHEN SUBSTRING_INDEX(`shift_type`, '（', 1) = '休' THEN 4
    WHEN SUBSTRING_INDEX(`shift_type`, '（', 1) = 'A1' THEN 6
    WHEN SUBSTRING_INDEX(`shift_type`, '（', 1) = 'A2' THEN 7
    ELSE `shift_id`
  END
WHERE `shift_type` LIKE '%（%';

-- ============================================
-- 6. 固定班次分配表也添加 shift_id 和 remark
-- ============================================
ALTER TABLE `fixed_shift_assignment` ADD COLUMN `shift_id` INT DEFAULT NULL COMMENT '班次ID' AFTER `shift_type`;
ALTER TABLE `fixed_shift_assignment` ADD COLUMN `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注' AFTER `shift_type`;
ALTER TABLE `fixed_shift_assignment` ADD CONSTRAINT `fk_fixed_shift_shift` FOREIGN KEY (`shift_id`) REFERENCES `shift` (`id`) ON DELETE SET NULL;
ALTER TABLE `fixed_shift_assignment` ADD KEY `idx_shift_id` (`shift_id`);

-- 迁移固定班次的 shift_id
UPDATE `fixed_shift_assignment` SET `shift_id` = 1 WHERE `shift_type` = 'P';
UPDATE `fixed_shift_assignment` SET `shift_id` = 2 WHERE `shift_type` = 'N';
UPDATE `fixed_shift_assignment` SET `shift_id` = 3 WHERE `shift_type` = '助夜';
UPDATE `fixed_shift_assignment` SET `shift_id` = 4 WHERE `shift_type` = '休';
UPDATE `fixed_shift_assignment` SET `shift_id` = 5 WHERE `shift_type` IN ('休prn', '休 prn', '休(prn)');
UPDATE `fixed_shift_assignment` SET `shift_id` = 6 WHERE `shift_type` = 'A1';
UPDATE `fixed_shift_assignment` SET `shift_id` = 7 WHERE `shift_type` = 'A2';
UPDATE `fixed_shift_assignment` SET `shift_id` = 8 WHERE `shift_type` = '正1+2';
UPDATE `fixed_shift_assignment` SET `shift_id` = 9 WHERE `shift_type` = '正(中)';
UPDATE `fixed_shift_assignment` SET `shift_id` = 10 WHERE `shift_type` IN ('正(医)', '医嘱');
UPDATE `fixed_shift_assignment` SET `shift_id` = 11 WHERE `shift_type` IN ('正(服)', '服药');
UPDATE `fixed_shift_assignment` SET `shift_id` = 12 WHERE `shift_type` = '正(医+服)';
UPDATE `fixed_shift_assignment` SET `shift_id` = 13 WHERE `shift_type` = '出科';

-- ============================================
-- 7. 排班变更日志表添加 shift_id
-- ============================================
ALTER TABLE `schedule_change_log` ADD COLUMN `old_shift_id` INT DEFAULT NULL COMMENT '原班次ID' AFTER `old_shift`;
ALTER TABLE `schedule_change_log` ADD COLUMN `new_shift_id` INT DEFAULT NULL COMMENT '新班次ID' AFTER `new_shift`;
ALTER TABLE `schedule_change_log` ADD COLUMN `remark` VARCHAR(255) DEFAULT NULL COMMENT '备注' AFTER `new_shift`;
ALTER TABLE `schedule_change_log` ADD KEY `idx_old_shift_id` (`old_shift_id`);
ALTER TABLE `schedule_change_log` ADD KEY `idx_new_shift_id` (`new_shift_id`);
