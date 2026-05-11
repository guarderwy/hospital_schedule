# 医院护士排班系统前端重构版

`web-redesign` 是在不修改现有 `web` 项目代码的前提下，新建的独立前端应用。它继续使用原后端 `/api/*` 接口，但对界面布局、视觉层级、组件组织和错误反馈做了完整重构。

## 目录说明

- `src/views`：排班中心、人员中心页面
- `src/components`：布局组件、排班矩阵、人员编辑弹窗
- `src/api`：与原后端完全兼容的请求封装
- `src/stores`：Pinia 状态管理
- `docs`：部署文档、使用说明、接口集成测试报告

## 启动方式

```bash
cd D:\www\shcedule\web-redesign
npm run dev
```

默认开发地址为 `http://localhost:5174`，并通过 Vite 代理将 `/api` 转发到配置的后端地址。

当前仓库建议在本地把排班后端启动到 `3001` 端口，避免和机器上其他占用 `3000` 的应用冲突。默认开发配置见 [web-redesign/.env.development](D:/www/shcedule/web-redesign/.env.development)。

## 构建

```bash
cd D:\www\shcedule\web-redesign
npm run build
```

构建产物位于 `web-redesign/dist`。

## 保留的业务能力

- 人员新增、编辑、删除
- 夜班组顺序维护
- 当前周与下周排班编辑
- 复制本周、生成下周、刷新下周、保存下周
- 保存前排班校验
- 休息申请新增、审批、删除
- 固定班次新增、删除
- 排班变更历史查看

详细部署与测试说明见：

- [部署文档](D:/www/shcedule/web-redesign/docs/DEPLOYMENT.md)
- [集成测试报告](D:/www/shcedule/web-redesign/docs/INTEGRATION-TEST-REPORT.md)
