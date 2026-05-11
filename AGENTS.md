# 医院排班系统 - 项目开发指南

## 项目概述

基于 Vue3 + TypeScript + Node.js + MySQL 的医院护士排班系统，核心功能是夜班组排班管理与自动生成。

**仓库地址**: git@github.com:guarderwy/hospital_schedule.git

---

## 技术栈

- **后端**: Node.js + TypeScript + Express + mysql2
- **前端**: Vue 3 + TypeScript + Vite + Element Plus + Pinia
- **数据库**: MySQL (root/123456)
- **测试**: Vitest

---

## 项目结构

```
shcedule/
├── server/                    # 后端项目
│   ├── src/
│   │   ├── index.ts           # 入口文件
│   │   ├── routes/            # API路由
│   │   │   ├── staff.ts       # 人员管理
│   │   │   ├── schedule.ts    # 排班管理
│   │   │   ├── shift.ts       # 班次管理
│   │   │   ├── staffRequest.ts # 休息申请
│   │   │   ├── fixedShift.ts  # 固定班次
│   │   │   └── scheduleChangeLog.ts # 排班变更日志
│   │   ├── services/          # 业务逻辑
│   │   │   ├── scheduleGenerator.ts # 夜班生成算法
│   │   │   ├── scheduleValidator.ts # 排班校验
│   │   │   └── __tests__/     # 单元测试
│   │   ├── middleware/        # 中间件
│   │   │   └── validation.ts  # 请求校验
│   │   ├── types/             # 类型定义
│   │   └── utils/             # 工具函数
│   └── .env                   # 环境变量
├── web/                       # 前端(旧版)
├── web-redesign/              # 前端(新版，主用)
│   ├── src/
│   │   ├── api/               # API接口
│   │   ├── components/        # 组件
│   │   ├── router/            # 路由
│   │   ├── stores/            # Pinia状态管理
│   │   ├── styles/            # 样式
│   │   ├── types/             # 类型定义
│   │   ├── utils/             # 工具函数
│   │   └── views/             # 页面视图
│   └── .env.development       # 开发环境变量
├── scripts/                   # 脚本
│   └── init-db.sql            # 数据库初始化SQL
├── AGENTS.md                  # 本文件
└── README.md                  # 项目说明
```

---

## 数据库设计

### 0. 班次定义表 (shift)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| code | VARCHAR(20) NOT NULL UNIQUE | 班次代码(唯一标识) |
| name | VARCHAR(30) NOT NULL | 班次名称 |
| category | VARCHAR(20) | 分类: night/day/rest/other |
| start_time | TIME | 开始时间 |
| end_time | TIME | 结束时间 |
| duration_hours | DECIMAL(4,1) | 时长(小时) |
| applicable_days | VARCHAR(20) | 适用日期: all/weekday/weekend |
| color | VARCHAR(20) | 显示颜色 |
| sort_order | INT | 排序顺序 |
| is_active | BOOLEAN | 是否启用 |
| description | VARCHAR(200) | 说明 |

### 1. 人员表 (staff)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| name | VARCHAR(50) NOT NULL | 姓名 |
| level | VARCHAR(20) | 能级(N0/N1/N2/N3) |
| title | VARCHAR(50) | 职称 |
| role | VARCHAR(50) | 岗位 |
| bed_range | VARCHAR(50) | 管床范围 |
| is_night_team | BOOLEAN DEFAULT FALSE | 是否夜班组 |
| night_team_order | INT | 夜班组轮转顺序 |
| status | ENUM('active','leave','transfer') | 状态 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### 2. 排班表 (schedule)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| staff_id | INT FK | 人员ID |
| week_start | DATE NOT NULL | 周开始日期(周一) |
| week_day | TINYINT NOT NULL | 星期(1-7) |
| shift_type | VARCHAR(30) NOT NULL | 班次类型 |
| shift_id | INT FK | 班次ID(关联shift表) |
| remark | VARCHAR(255) | 备注(如代理、跟岗、入科等) |
| is_generated | BOOLEAN DEFAULT FALSE | 是否自动生成 |
| is_edited | BOOLEAN DEFAULT FALSE | 是否手动编辑过 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

UNIQUE KEY: (staff_id, week_start, week_day)

### 3. 人员休息申请 (staff_request)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| staff_id | INT FK | 人员ID |
| week_start | DATE NOT NULL | 申请周 |
| week_day | TINYINT NOT NULL | 星期(1-7) |
| end_date | DATE | 结束日期(支持连续多天) |
| request_type | ENUM('rest','prn','other') | 申请类型 |
| reason | VARCHAR(200) | 原因 |
| status | ENUM('pending','approved','rejected') | 状态 |
| created_at | DATETIME | 创建时间 |

### 4. 固定班次分配 (fixed_shift_assignment)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| staff_id | INT FK | 人员ID |
| assign_date | DATE NOT NULL | 分配日期 |
| shift_type | VARCHAR(30) NOT NULL | 班次类型 |
| shift_id | INT FK | 班次ID |
| remark | VARCHAR(255) | 备注 |
| reason | VARCHAR(200) | 原因 |
| created_at | DATETIME | 创建时间 |

### 5. 排班变更日志 (schedule_change_log)

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | 主键 |
| staff_id | INT FK | 人员ID |
| week_start | DATE NOT NULL | 周开始日期 |
| week_day | TINYINT NOT NULL | 星期(1-7) |
| old_shift | VARCHAR(30) | 原班次 |
| new_shift | VARCHAR(30) | 新班次 |
| old_shift_id | INT | 原班次ID |
| new_shift_id | INT | 新班次ID |
| remark | VARCHAR(255) | 备注 |
| changed_by | VARCHAR(50) | 操作人 |
| created_at | DATETIME | 创建时间 |

---

## 班次类型定义

| 班次代码 | 名称 | 说明 | 适用时间 |
|---------|------|------|---------|
| P | 前夜班 | 16:00-23:00 | 每天 |
| N | 后夜班 | 23:00-08:00 | 每天 |
| 助夜 | 辅助夜班 | 16:00-22:00 | 周一到周五 |
| 休 | 休息 | - | 每天 |
| 休prn | 休息待命 | 夜休第二天 | 每天 |
| A1 | 白班1 | 07:30-16:00 | 每天 |
| A2 | 白班2 | 07:30-16:00 | 每天 |
| 正1+2 | 正班1+2 | 07:30-12:00,14:30-17:00 | 每天 |
| 正(中) | 正班(中) | 中医相关 | 周一到周五 |
| 正(医) | 正班(医) | 医嘱班 | 周一到周五 |
| A(服) | 正班(服) | 服药班 | 周一到周五 |
| 正(医+服) | 正班(医+服) | 医嘱+服药 | 周六到周日 |
| 出科 | 出科 | - | 每天 |
| / | 未排班 | - | - |

---

## 备注功能

排班支持添加备注信息，用于记录代理、跟岗、入科等附加说明。

- 备注显示在排班表格单元格中，格式为: `班次(备注)`，如 `P(代理)`
- 备注不影响班次本身的属性定义及系统逻辑处理
- 复制本周排班时，备注信息会一并复制
- 备注信息存储在 `remark` 字段中，最大长度255字符

---

## 排班规则

### 夜班周期规律

每人按 **P → N → 休 → 休prn → (A1或A2) → 助夜** 循环，周期6天。

- 第5位是(A1或A2)，两者任选其一，不是连续的两天
- 助夜只在周一到周五，周末跳过
- N班后第二天为休，夜休后第二天为休prn

### 日班要求

- 周一到周五: 各1个医嘱班、服药班
- 周六到周日: 1个医+服班
- 周一到周日: 各1个正1+2班
- 周一到周五: 1个正(中)班
- 周一到周日: 各1个A1班、A2班

### 覆盖要求

每天必须有P和N班覆盖。

---

## API接口

### 人员管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/staff | 人员列表 |
| POST | /api/staff | 新增人员 |
| PUT | /api/staff/:id | 更新人员 |
| DELETE | /api/staff/:id | 删除人员 |
| GET | /api/staff/night-team | 获取夜班组人员 |
| PUT | /api/staff/night-team/order | 更新夜班组顺序 |

### 排班管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/schedule?week_start= | 获取某周排班 |
| POST | /api/schedule/batch | 批量保存排班 |
| GET | /api/schedule/current-week | 获取本周日期范围 |
| POST | /api/schedule/generate-night | 生成下周夜班排班 |
| POST | /api/schedule/generate-night?randomize=true | 随机生成下周夜班排班 |
| POST | /api/schedule/copy | 拷贝排班到另一周 |
| POST | /api/schedule/validate | 校验排班 |

### 班次管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/shift | 获取所有班次 |
| GET | /api/shift?category=night | 按分类筛选 |
| GET | /api/shift/:id | 获取单个班次 |
| POST | /api/shift | 创建班次 |
| PUT | /api/shift/:id | 更新班次 |
| DELETE | /api/shift/:id | 删除班次(有引用时禁止删除) |

### 休息申请

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/staff-request | 获取休息申请列表 |
| POST | /api/staff-request | 创建休息申请 |
| PUT | /api/staff-request/:id | 更新休息申请 |
| DELETE | /api/staff-request/:id | 删除休息申请 |

### 固定班次

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/fixed-shift | 获取固定班次列表 |
| POST | /api/fixed-shift | 创建固定班次 |
| DELETE | /api/fixed-shift/:id | 删除固定班次 |

### 排班变更日志

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/schedule-change-log | 获取变更日志 |
| POST | /api/schedule-change-log | 创建变更日志 |

---

## 开发指南

### 环境要求

- Node.js >= 18
- MySQL >= 8.0

### 后端启动

```bash
cd server
npm install
# 配置 .env 文件
npm run dev
```

### 前端启动

```bash
cd web-redesign
npm install
npm run dev
```

### 数据库初始化

```bash
mysql -u root -p < scripts/init-db.sql
```

### 运行测试

```bash
cd server
npm test
```

---

## 开发规范

1. **简化原则**: 不引入不必要的复杂度，如权限系统、多科室等
2. **逐步完善**: 每阶段基于前一阶段成果继续开发
3. **数据一致性**: 排班生成和校验逻辑必须保持一致
4. **用户体验**: 刷新按钮可多次点击，直到满意为止
5. **可维护性**: 班次类型和规则配置化，便于后续调整
6. **代码规范**: 使用TypeScript严格模式，遵循ESLint规则

---

## 注意事项

- 前端以 `web-redesign` 为主，`web` 为旧版保留
- 班次名称统一使用无空格格式，如 `休prn` 而非 `休 prn`
- 排班生成算法基于上周排班推断周期位置，确保规律性
- 保存排班前强制校验，不通过不能保存
