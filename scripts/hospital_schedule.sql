/*
 Navicat Premium Data Transfer

 Source Server         : 本地-mysql
 Source Server Type    : MySQL
 Source Server Version : 50726
 Source Host           : localhost:3306
 Source Schema         : hospital_schedule

 Target Server Type    : MySQL
 Target Server Version : 50726
 File Encoding         : 65001

 Date: 18/05/2026 10:01:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for fixed_shift_assignment
-- ----------------------------
DROP TABLE IF EXISTS `fixed_shift_assignment`;
CREATE TABLE `fixed_shift_assignment`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL,
  `assign_date` date NOT NULL,
  `shift_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `shift_id` int(11) NULL DEFAULT NULL COMMENT '班次ID',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `assigned_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `note` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_staff_date`(`staff_id`, `assign_date`) USING BTREE,
  CONSTRAINT `fixed_shift_assignment_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of fixed_shift_assignment
-- ----------------------------
INSERT INTO `fixed_shift_assignment` VALUES (1, 54, '2026-05-11', '正(中)', 9, NULL, '', '', '2026-05-08 17:53:32', '2026-05-11 16:26:38');
INSERT INTO `fixed_shift_assignment` VALUES (2, 57, '2026-05-12', '正(医+服)', 12, NULL, '', '', '2026-05-08 18:26:42', '2026-05-11 16:26:38');

-- ----------------------------
-- Table structure for night_team_config
-- ----------------------------
DROP TABLE IF EXISTS `night_team_config`;
CREATE TABLE `night_team_config`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL COMMENT 'staff id',
  `week_start` date NOT NULL COMMENT 'week start',
  `is_active` tinyint(1) NULL DEFAULT 1 COMMENT 'is active',
  `sort_order` int(11) NULL DEFAULT NULL COMMENT 'sort order',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_config_staff_week`(`staff_id`, `week_start`) USING BTREE,
  CONSTRAINT `night_team_config_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'night team config table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of night_team_config
-- ----------------------------

-- ----------------------------
-- Table structure for schedule
-- ----------------------------
DROP TABLE IF EXISTS `schedule`;
CREATE TABLE `schedule`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL COMMENT 'staff id',
  `week_start` date NOT NULL COMMENT 'week start date',
  `week_day` tinyint(4) NOT NULL COMMENT 'week day 1-7',
  `shift_type` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'shift type',
  `shift_id` int(11) NULL DEFAULT NULL COMMENT '班次ID',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `is_generated` tinyint(1) NULL DEFAULT 0 COMMENT 'is generated',
  `is_edited` tinyint(1) NULL DEFAULT 0 COMMENT 'is edited',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_schedule_staff_week`(`staff_id`, `week_start`, `week_day`) USING BTREE,
  CONSTRAINT `schedule_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 451 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'schedule table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of schedule
-- ----------------------------
INSERT INTO `schedule` VALUES (290, 54, '2026-05-11', 1, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (291, 54, '2026-05-11', 2, '休', 4, 'prn', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (292, 54, '2026-05-11', 3, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (293, 54, '2026-05-11', 4, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (294, 54, '2026-05-11', 5, 'P', 1, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (295, 54, '2026-05-11', 6, 'N', 2, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (296, 54, '2026-05-11', 7, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (297, 55, '2026-05-11', 1, 'P', 1, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (298, 55, '2026-05-11', 2, 'N', 2, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (299, 55, '2026-05-11', 3, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (300, 55, '2026-05-11', 4, '出科', 13, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (301, 55, '2026-05-11', 5, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (302, 55, '2026-05-11', 6, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (303, 55, '2026-05-11', 7, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (304, 56, '2026-05-11', 1, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (305, 56, '2026-05-11', 2, 'A2', 7, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (306, 56, '2026-05-11', 3, 'A2', 7, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (307, 56, '2026-05-11', 4, '休', 4, 'prn', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (308, 56, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (309, 56, '2026-05-11', 6, 'A2', 7, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (310, 56, '2026-05-11', 7, 'P', 1, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (311, 57, '2026-05-11', 1, '助夜', 3, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (312, 57, '2026-05-11', 2, 'P', 1, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (313, 57, '2026-05-11', 3, 'N', 2, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (314, 57, '2026-05-11', 4, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (315, 57, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (316, 57, '2026-05-11', 6, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (317, 57, '2026-05-11', 7, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (318, 58, '2026-05-11', 1, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (319, 58, '2026-05-11', 2, '助夜', 3, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (320, 58, '2026-05-11', 3, 'P', 1, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (321, 58, '2026-05-11', 4, 'N', 2, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (322, 58, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (323, 58, '2026-05-11', 6, '休', 4, 'prn', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (324, 58, '2026-05-11', 7, 'A2', 7, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (325, 59, '2026-05-11', 1, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (326, 59, '2026-05-11', 2, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (327, 59, '2026-05-11', 3, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (328, 59, '2026-05-11', 4, '出科', 13, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (329, 59, '2026-05-11', 5, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (330, 59, '2026-05-11', 6, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (331, 59, '2026-05-11', 7, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (332, 60, '2026-05-11', 1, 'N', 2, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (333, 60, '2026-05-11', 2, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (334, 60, '2026-05-11', 3, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (335, 60, '2026-05-11', 4, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (336, 60, '2026-05-11', 5, '休', 4, 'prn', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (337, 60, '2026-05-11', 6, 'P', 1, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (338, 60, '2026-05-11', 7, 'N', 2, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (339, 61, '2026-05-11', 1, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (340, 61, '2026-05-11', 2, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (341, 61, '2026-05-11', 3, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (342, 61, '2026-05-11', 4, 'P', 1, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (343, 61, '2026-05-11', 5, 'N', 2, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (344, 61, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (345, 61, '2026-05-11', 7, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (346, 62, '2026-05-11', 1, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (347, 62, '2026-05-11', 2, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (348, 62, '2026-05-11', 3, '助夜', 3, 'prn', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (349, 62, '2026-05-11', 4, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (350, 62, '2026-05-11', 5, '正1+2', 8, '代理', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (351, 62, '2026-05-11', 6, '正1+2', 8, '代理', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (352, 62, '2026-05-11', 7, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (353, 63, '2026-05-11', 1, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (354, 63, '2026-05-11', 2, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (355, 63, '2026-05-11', 3, '/', 14, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (356, 63, '2026-05-11', 4, '休', 4, '入科', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (357, 63, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (358, 63, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (359, 63, '2026-05-11', 7, 'A2', 7, '跟岗', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (360, 64, '2026-05-11', 1, 'A2', 7, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (361, 64, '2026-05-11', 2, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (362, 64, '2026-05-11', 3, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (363, 64, '2026-05-11', 4, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (364, 64, '2026-05-11', 5, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (365, 64, '2026-05-11', 6, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (366, 64, '2026-05-11', 7, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (367, 65, '2026-05-11', 1, 'A(服)', 11, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (368, 65, '2026-05-11', 2, 'A(服)', 11, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (369, 65, '2026-05-11', 3, 'A(服)', 11, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (370, 65, '2026-05-11', 4, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (371, 65, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (372, 65, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (373, 65, '2026-05-11', 7, 'A(服)', 11, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (374, 66, '2026-05-11', 1, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (375, 66, '2026-05-11', 2, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (376, 66, '2026-05-11', 3, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (377, 66, '2026-05-11', 4, 'A2', 7, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (378, 66, '2026-05-11', 5, 'A2', 7, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (379, 66, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (380, 66, '2026-05-11', 7, '休', 4, 'prn', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (381, 67, '2026-05-11', 1, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (382, 67, '2026-05-11', 2, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (383, 67, '2026-05-11', 3, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (384, 67, '2026-05-11', 4, '/', 14, '正(医+服)（代理）', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (385, 67, '2026-05-11', 5, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (386, 67, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (387, 67, '2026-05-11', 7, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (388, 68, '2026-05-11', 1, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (389, 68, '2026-05-11', 2, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (390, 68, '2026-05-11', 3, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (391, 68, '2026-05-11', 4, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (392, 68, '2026-05-11', 5, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (393, 68, '2026-05-11', 6, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (394, 68, '2026-05-11', 7, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (395, 69, '2026-05-11', 1, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (396, 69, '2026-05-11', 2, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (397, 69, '2026-05-11', 3, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (398, 69, '2026-05-11', 4, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (399, 69, '2026-05-11', 5, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (400, 69, '2026-05-11', 6, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (401, 69, '2026-05-11', 7, '正(中)', 9, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (402, 70, '2026-05-11', 1, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (403, 70, '2026-05-11', 2, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (404, 70, '2026-05-11', 3, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (405, 70, '2026-05-11', 4, '休', 4, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (406, 70, '2026-05-11', 5, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (407, 70, '2026-05-11', 6, '休', 4, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (408, 70, '2026-05-11', 7, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (409, 71, '2026-05-11', 1, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (410, 71, '2026-05-11', 2, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (411, 71, '2026-05-11', 3, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (412, 71, '2026-05-11', 4, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (413, 71, '2026-05-11', 5, '休', 4, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (414, 71, '2026-05-11', 6, '休', 4, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (415, 71, '2026-05-11', 7, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (416, 72, '2026-05-11', 1, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (417, 72, '2026-05-11', 2, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (418, 72, '2026-05-11', 3, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (419, 72, '2026-05-11', 4, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (420, 72, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (421, 72, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (422, 72, '2026-05-11', 7, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (423, 73, '2026-05-11', 1, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (424, 73, '2026-05-11', 2, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (425, 73, '2026-05-11', 3, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (426, 73, '2026-05-11', 4, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (427, 73, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (428, 73, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (429, 73, '2026-05-11', 7, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (430, 74, '2026-05-11', 1, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (431, 74, '2026-05-11', 2, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (432, 74, '2026-05-11', 3, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (433, 74, '2026-05-11', 4, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (434, 74, '2026-05-11', 5, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:27:33');
INSERT INTO `schedule` VALUES (435, 74, '2026-05-11', 6, 'A1', 6, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (436, 74, '2026-05-11', 7, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (437, 75, '2026-05-11', 1, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (438, 75, '2026-05-11', 2, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (439, 75, '2026-05-11', 3, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (440, 75, '2026-05-11', 4, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (441, 75, '2026-05-11', 5, '/', 14, '正', 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:28:18');
INSERT INTO `schedule` VALUES (442, 75, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (443, 75, '2026-05-11', 7, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (444, 76, '2026-05-11', 1, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (445, 76, '2026-05-11', 2, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (446, 76, '2026-05-11', 3, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (447, 76, '2026-05-11', 4, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (448, 76, '2026-05-11', 5, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (449, 76, '2026-05-11', 6, '休', 4, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');
INSERT INTO `schedule` VALUES (450, 76, '2026-05-11', 7, '正1+2', 8, NULL, 0, 0, '2026-05-08 15:53:15', '2026-05-11 16:26:38');

-- ----------------------------
-- Table structure for schedule_change_log
-- ----------------------------
DROP TABLE IF EXISTS `schedule_change_log`;
CREATE TABLE `schedule_change_log`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `schedule_id` int(11) NULL DEFAULT NULL,
  `staff_id` int(11) NOT NULL,
  `week_start` date NOT NULL,
  `week_day` tinyint(4) NOT NULL,
  `old_shift` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `new_shift` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `old_shift_id` int(11) NULL DEFAULT NULL COMMENT '原班次ID',
  `new_shift_id` int(11) NULL DEFAULT NULL COMMENT '新班次ID',
  `remark` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '备注',
  `change_type` enum('manual_edit','swap','drag_drop','generated') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'manual_edit',
  `changed_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `note` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT '',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of schedule_change_log
-- ----------------------------

-- ----------------------------
-- Table structure for shift
-- ----------------------------
DROP TABLE IF EXISTS `shift`;
CREATE TABLE `shift`  (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `code` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '班次代码(唯一标识)',
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '班次名称',
  `category` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal' COMMENT '分类: night(夜班), day(白班), rest(休息), other(其他)',
  `start_time` time NULL DEFAULT NULL COMMENT '开始时间',
  `end_time` time NULL DEFAULT NULL COMMENT '结束时间',
  `duration_hours` decimal(4, 1) NULL DEFAULT NULL COMMENT '时长(小时)',
  `applicable_days` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT 'all' COMMENT '适用日期: all(每天), weekday(周一到周五), weekend(周六到周日)',
  `color` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '显示颜色',
  `sort_order` int(11) NOT NULL DEFAULT 0 COMMENT '排序顺序',
  `is_active` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否启用',
  `description` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NULL DEFAULT NULL COMMENT '说明',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `uk_code`(`code`) USING BTREE,
  INDEX `idx_category`(`category`) USING BTREE,
  INDEX `idx_is_active`(`is_active`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci COMMENT = '班次定义表' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of shift
-- ----------------------------
INSERT INTO `shift` VALUES (1, 'P', '前夜班', 'night', '16:00:00', '23:00:00', 7.0, 'all', NULL, 1, 1, '16:00-23:00', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (2, 'N', '后夜班', 'night', '23:00:00', '08:00:00', 9.0, 'all', NULL, 2, 1, '23:00-08:00', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (3, '助夜', '助夜', 'night', '16:00:00', '22:00:00', 6.0, 'weekday', NULL, 3, 1, '16:00-22:00, 周一到周五', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (4, '休', '休', 'rest', NULL, NULL, NULL, 'all', NULL, 4, 1, '休息', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (5, '休prn', '休prn', 'rest', NULL, NULL, NULL, 'all', NULL, 5, 1, '休息待命, 夜休第二天', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (6, 'A1', 'A1', 'day', '07:30:00', '16:00:00', 8.5, 'all', NULL, 6, 1, '白班1, 07:30-16:00', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (7, 'A2', 'A2', 'day', '07:30:00', '16:00:00', 8.5, 'all', NULL, 7, 1, '白班2, 07:30-16:00', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (8, '正1+2', '正1+2', 'day', '07:30:00', '17:00:00', 8.5, 'all', NULL, 8, 1, '正班1+2, 07:30-12:00,14:30-17:00', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (9, '正(中)', '正(中)', 'day', '07:30:00', '17:00:00', 8.5, 'weekday', NULL, 9, 1, '正班(中), 中医相关, 周一到周五', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (10, '正(医)', '正(医)', 'day', '07:30:00', '17:00:00', 8.5, 'weekday', NULL, 10, 1, '正班(医), 医嘱班, 周一到周五', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (11, 'A(服)', 'A(服)', 'day', '07:30:00', '17:00:00', 8.5, 'weekday', NULL, 11, 1, '正班(服), 服药班, 周一到周五', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (12, '正(医+服)', '正(医+服)', 'day', '07:30:00', '17:00:00', 8.5, 'weekend', NULL, 12, 1, '正班(医+服), 医嘱+服药, 周六到周日', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (13, '出科', '出科', 'other', NULL, NULL, NULL, 'all', NULL, 13, 1, '出科', '2026-05-11 16:26:38', '2026-05-11 16:26:38');
INSERT INTO `shift` VALUES (14, '/', '未排班', 'other', NULL, NULL, NULL, 'all', NULL, 14, 1, '未排班', '2026-05-11 16:26:38', '2026-05-11 16:26:38');

-- ----------------------------
-- Table structure for staff
-- ----------------------------
DROP TABLE IF EXISTS `staff`;
CREATE TABLE `staff`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'name',
  `pinyin` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  `level` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'level N0/N1/N2/N3',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'title',
  `role` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'role',
  `bed_range` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'bed range',
  `is_night_team` tinyint(1) NULL DEFAULT 0 COMMENT 'is night team',
  `night_team_order` int(11) NULL DEFAULT NULL COMMENT 'night team order',
  `status` enum('active','leave','transfer') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'active' COMMENT 'status',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 77 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'staff table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of staff
-- ----------------------------
INSERT INTO `staff` VALUES (54, '54', '54', 'N2', '主管护师', '夜班+责任', '', 1, 1, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (55, '55', '55', 'N1', '护士', '', '', 1, 2, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (56, '56', '56', 'N1', '护士', '', '', 1, 3, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (57, '57', '57', 'N2', '护师', '', '', 1, 4, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (58, '58', '58', 'N2', '主管护师', '', '', 1, 5, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (59, '59', '59', 'N0', '护士', '', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (60, '60', '60', 'N0', '护士', '', '', 1, 7, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (61, '61', '61', 'N2', '主管护师', '', '', 1, 6, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (62, '62', '62', 'N3', '主管护师', '主责', '16-23', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (63, '63', '63', 'N0', '护士', '次责（二组）', '跟岗27-50', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (64, '64', '64', 'N1', '护士', '次责（一组）', '1-26、51-52', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (65, '65', '65', 'N2', '护师', '服药（带班组长）', '19.2', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (66, '66', '66', 'N1', '护士', '中医', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (67, '67', '67', 'N2', '主管护师', '医嘱', '医嘱', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (68, '68', '68', 'N3', '主管护师', '中医护理门诊', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (69, '69', '69', 'N3', '主管护师', '中医护理门诊', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (70, '70', '70', 'N2', '护师', '耳鼻喉科门诊', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (71, '71', '71', 'N3', '主管护师', '眼科门诊', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (72, '72', '72', 'N3', '主管护师', '副护士长', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (73, '73', '73', '跟岗', '主管护师', '进修', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (74, '74', '74', 'N2', '护师', '支援', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (75, '75', '75', '跟岗', '主管护师', '进修', '', 0, NULL, 'active', '2026-05-08 15:53:15');
INSERT INTO `staff` VALUES (76, '76', '76', '', '', '跟岗', '', 0, NULL, 'active', '2026-05-08 15:53:15');

-- ----------------------------
-- Table structure for staff_request
-- ----------------------------
DROP TABLE IF EXISTS `staff_request`;
CREATE TABLE `staff_request`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `staff_id` int(11) NOT NULL COMMENT 'staff id',
  `week_start` date NOT NULL COMMENT 'week start',
  `end_date` date NULL DEFAULT NULL,
  `total_days` int(11) NULL DEFAULT 1,
  `week_day` tinyint(4) NOT NULL COMMENT 'week day 1-7',
  `request_type` enum('rest','prn','other') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'rest' COMMENT 'request type',
  `status` enum('pending','approved','rejected') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT 'pending',
  `approved_by` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `approved_at` datetime NULL DEFAULT NULL,
  `reason` varchar(200) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'reason',
  `created_at` datetime NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `staff_id`(`staff_id`) USING BTREE,
  CONSTRAINT `staff_request_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = 'staff request table' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of staff_request
-- ----------------------------

SET FOREIGN_KEY_CHECKS = 1;
