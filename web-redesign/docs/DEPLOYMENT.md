# 部署文档

## 运行前提

1. 后端服务已启动，建议地址 `http://localhost:3001`
2. 当前目录为 `D:\www\shcedule\web-redesign`
3. 本项目通过目录联接复用 `D:\www\shcedule\web\node_modules`，离线环境无需再次安装依赖

## 本地开发

```bash
cd D:\www\shcedule\web-redesign
npm run dev
```

访问地址：`http://localhost:5174`

说明：

- 前端请求 `/api/*`
- Vite 代理默认到 `http://127.0.0.1:3001`

## 开发环境代理配置

在 [web-redesign/.env.development](D:/www/shcedule/web-redesign/.env.development) 中可配置：

```bash
VITE_API_PROXY_TARGET=http://127.0.0.1:3001
VITE_API_BASE_URL=/api
```

如果你的后端实际跑在其他端口，只需要修改 `VITE_API_PROXY_TARGET`。

## 生产构建

```bash
cd D:\www\shcedule\web-redesign
npm run build
```

构建完成后生成 `dist` 目录，可直接部署到静态资源服务。

## Nginx 示例

```nginx
server {
  listen 80;
  server_name schedule.example.com;

  root /var/www/shcedule/web-redesign/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

## 回滚策略

- 原项目 `D:\www\shcedule\web` 未做修改
- 新版出现问题时，直接停止使用 `web-redesign` 部署目录即可回退到旧版
