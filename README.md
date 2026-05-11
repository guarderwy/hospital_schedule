# 医院护士排班系统

> 基于 Vue3 + TypeScript + Node.js + MySQL 的医院护士排班管理系统，核心功能是夜班组排班管理与自动生成。

## 功能特性

- 人员管理：护士信息维护、夜班组配置
- 排班管理：双周排班表展示、本周只读/下周可编辑
- 智能排班：基于6天周期规律自动生成夜班排班，支持随机刷新
- 排班校验：实时校验排班规则，确保P/N覆盖
- 休息申请：支持人员休息申请，排班生成时自动应用
- 固定班次：支持特殊日期固定班次分配
- 变更日志：记录排班变更历史
- 班次管理：班次定义CRUD、备注功能(代理/跟岗/入科等)

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia |
| 后端 | Node.js + TypeScript + Express + mysql2 |
| 数据库 | MySQL 8.0+ |
| 测试 | Vitest |

## 数据库架构

系统使用MySQL数据库，主要表结构如下：

| 表名 | 说明 | 关键字段 |
|------|------|---------|
| shift | 班次定义表 | id, code, name, category, start_time, end_time |
| staff | 人员表 | id, name, level, is_night_team, night_team_order |
| schedule | 排班表 | id, staff_id, week_start, week_day, shift_type, shift_id, remark |
| staff_request | 休息申请 | id, staff_id, week_start, request_type, status |
| fixed_shift_assignment | 固定班次分配 | id, staff_id, assign_date, shift_type, shift_id |
| schedule_change_log | 排班变更日志 | id, staff_id, old_shift, new_shift, remark |

**备注字段说明**: `remark` 字段用于记录代理、跟岗、入科等附加说明，显示格式为 `班次(备注)`。

**数据迁移**: 从旧版本升级请执行 `scripts/migration-v2.sql`。

### 环境要求

- Node.js >= 18
- MySQL >= 8.0

### 数据库初始化

```bash
mysql -u root -p < scripts/init-db.sql
```

### 后端启动

```bash
cd server
npm install
cp .env.example .env  # 配置数据库连接
npm run dev
```

后端服务默认运行在 http://localhost:3000

### 前端启动

```bash
cd web-redesign
npm install
npm run dev
```

前端服务默认运行在 http://localhost:5174

## 项目结构

```
├── server/                    # 后端项目
│   ├── src/
│   │   ├── routes/            # API路由
│   │   ├── services/          # 业务逻辑（排班生成、校验）
│   │   ├── middleware/        # 请求校验中间件
│   │   ├── types/             # TypeScript类型定义
│   │   └── utils/             # 工具函数
│   └── .env                   # 环境变量
├── web-redesign/              # 前端项目（主用）
│   ├── src/
│   │   ├── api/               # API接口封装
│   │   ├── components/        # 可复用组件
│   │   ├── stores/            # Pinia状态管理
│   │   ├── styles/            # 全局样式
│   │   └── views/             # 页面视图
│   └── .env.development       # 开发环境变量
├── scripts/
│   └── init-db.sql            # 数据库初始化脚本
├── AGENTS.md                  # 开发指南
└── README.md                  # 项目说明
```

## API接口

### 人员管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/staff | 人员列表 |
| POST | /api/staff | 新增人员 |
| PUT | /api/staff/:id | 更新人员 |
| DELETE | /api/staff/:id | 删除人员 |

### 排班管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/schedule?week_start= | 获取某周排班 |
| POST | /api/schedule/batch | 批量保存排班 |
| POST | /api/schedule/generate-night | 生成下周夜班排班 |
| POST | /api/schedule/copy | 拷贝排班 |
| POST | /api/schedule/validate | 校验排班 |

完整API文档请参考 [AGENTS.md](./AGENTS.md)

## 排班规则

### 夜班周期

每人按 **P → N → 休 → 休prn → (A1或A2) → 助夜** 循环，周期6天。

- 助夜只在周一到周五，周末跳过
- N班后第二天为休，夜休后第二天为休prn

### 覆盖要求

每天必须有P和N班覆盖。

## 开发指南

详细开发指南请参考 [AGENTS.md](./AGENTS.md)

### 运行测试

```bash
cd server
npm test
```

### 构建

```bash
# 后端构建
cd server && npm run build

# 前端构建
cd web-redesign && npm run build
```

## License

MIT
