# 叮叮商城 — 管理后台前端（vite-project）

基于 Vue 3 + TypeScript + Vite + Element Plus 的商城管理后台，配套后端为 [nest-server](https://github.com/dinglinboy/nest-server)。

## 功能页面

| 模块 | 路由 | 说明 |
|---|---|---|
| 登录/注册 | `/login` `/signUp` | JWT 登录，记住用户信息 |
| 数据仪表板 | `/` | 统计卡片 + 近7天销售趋势/订单状态分布/分类分布/热销Top5 图表 + 最新订单 |
| 商品管理 | `/product/list` | 搜索（名称/分类递归过滤/状态）、分页、上下架、删除、品牌列 |
| 商品新增/编辑 | `/product/add` | 图片上传、SKU 表格、分类树选择、品牌下拉 |
| 商品分类 | `/product/classify` | 树形管理：添加子分类/编辑/连带删除，与商品列表同源 |
| 商品评论 | `/product/reply` | 星级展示、回复弹窗、删除 |
| SKU 一览 | `/product/attr` | 全量 SKU 扁平化展示 |
| 品牌管理 | `/product/brand` | 分页、logo 预览、增删改 |
| 权限管理 | `/permission/*` | 用户/角色/菜单/部门，RBAC 动态菜单 + 按钮权限 |
| 系统字典 | `/system/dict` | 字典类型/数据管理，业务下拉查询 |
| 订单管理 | `/order/list` | 搜索、详情、发货、状态流转（完成/取消/退款）、删除 |
| 媒体管理 | `/media` | 图片网格、上传、预览、复制链接、删除 |
| 个人中心 | `/profile` | 个人资料（骨架） |

## 技术栈

- Vue 3.2 组合式 API（`<script setup lang="ts">`）+ TypeScript
- Vite 4 + pnpm，`base: './'` 适配静态部署
- Element Plus 2.2（组件自动按需导入，图标手动引入）
- Pinia（用户信息/权限/动态菜单）、vue-router 4（Hash 模式）
- axios（统一封装：token、401 跳登录、响应拦截）、echarts、nprogress

## 环境要求

- Node.js 16+
- pnpm

## 快速启动

```bash
# 1. 安装依赖
pnpm install

# 2. 启动（默认端口 5173，代理转发到本地后端 3000）
pnpm dev
```

访问 http://localhost:5173 ，默认账号 `admin / admin123`。

## 联调配置

开发环境经 Vite 代理对接本地后端（`vite.config.ts`）：

| 代理前缀 | target |
|---|---|
| `/dev/api` | `http://localhost:3000`（本地后端） |
| `/dev/file` | `http://localhost:3000`（文件服务） |
| `/prod/api` | `http://139.196.236.142`（生产） |

- `.env.development`：`VITE_API_BASE_URL=http://localhost:5173/dev/api`
- 生产环境用 `pnpm build` 构建后部署静态文件，后端地址由代理或同域部署决定

## 目录结构

```
src/
├── api/               # API 层，按业务域拆文件（product/category/brand/review/dict/order/media/dashboard/user/role/menu/dept）
│   └── types/         # 响应类型
├── layout/            # 后台布局（侧边菜单/顶栏）
├── router/            # 静态路由 + 动态路由（登录后按角色 getRouters 注册）
├── store/             # Pinia（用户/权限/动态菜单）
├── directives/        # v-permission 按钮权限指令
├── util/              # axios 封装、图标映射
├── views/             # 页面：<模块>/<子页>/index.vue
└── interfaces/        # 基础类型（Result/PagingDto）
```

## 常用命令

```bash
pnpm dev        # 开发（端口 5173）
pnpm build      # vue-tsc 类型检查 + 构建
pnpm lint       # eslint --fix
pnpm format     # prettier
```

## 页面开发约定

- 新页面三件套：`views/<模块>/<子页>/index.vue` + 后端 `sys_menu` 菜单（component 填 `模块/子页/index`）+ `api/<域>.ts`
- 动态路由由登录后 `getRouters` 注册；不进菜单的页面（如 `/product/add`、`/system/dict/data`）在 `router/index.ts` 静态注册
- 按钮权限：`v-permission="['权限点']"`
- 上传图片返回 `/file/xxx`，展示时需转 `/dev/file/xxx`
- 菜单/权限数据变更后需刷新页面（守卫重新拉取 getRouters）