# 接口集成测试报告

测试日期：2026-05-11

测试对象：`D:\www\shcedule\web-redesign`

## 测试范围

- 前端构建是否通过
- 新前端是否继续使用原有 `/api` 接口
- 关键业务流程是否已映射到后端现有路由

## 路由映射核对

| 功能 | 新前端调用 | 后端路由 |
|---|---|---|
| 人员列表 | `GET /api/staff` | `server/src/routes/staff.ts` |
| 新增人员 | `POST /api/staff` | `server/src/routes/staff.ts` |
| 编辑人员 | `PUT /api/staff/:id` | `server/src/routes/staff.ts` |
| 删除人员 | `DELETE /api/staff/:id` | `server/src/routes/staff.ts` |
| 夜班组排序 | `PUT /api/staff/night-team/order` | `server/src/routes/staff.ts` |
| 获取周范围 | `GET /api/schedule/current-week` | `server/src/routes/schedule.ts` |
| 获取排班 | `GET /api/schedule` | `server/src/routes/schedule.ts` |
| 保存排班 | `POST /api/schedule/batch` | `server/src/routes/schedule.ts` |
| 生成夜班 | `POST /api/schedule/generate-night` | `server/src/routes/schedule.ts` |
| 复制排班 | `POST /api/schedule/copy` | `server/src/routes/schedule.ts` |
| 校验排班 | `POST /api/schedule/validate` | `server/src/routes/schedule.ts` |
| 休息申请列表/新增/审批/删除 | `/api/staff-request/*` | `server/src/routes/staffRequest.ts` |
| 固定班次列表/新增/删除 | `/api/fixed-shift/*` | `server/src/routes/fixedShift.ts` |
| 变更历史 | `GET /api/schedule-change-log` | `server/src/routes/scheduleChangeLog.ts` |

## 结果

- 新前端 API 路径与旧系统保持兼容
- 所有核心业务流程都已对应到现有后端路由
- 前端已按“独立应用”方式实现，不依赖修改旧 `web` 代码

## 待执行项

- 如需完整联调，请确保本地 MySQL 与后端服务正常启动后，再执行页面级冒烟测试
- 若后续需要自动化接口回归，建议补充基于 Playwright 或 Vitest 的 UI/API 测试脚本
