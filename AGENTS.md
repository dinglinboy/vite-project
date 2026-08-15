# AGENTS.md — vite-project（叮叮商城管理后台前端）

Vue 3 + TypeScript + Vite + Element Plus + Pinia 的商城管理后台，配套后端为 `/Users/dinglin/Desktop/Project/nest-server`。

## 常用命令

```bash
pnpm dev       # 开发（默认端口 5173）
pnpm build     # vue-tsc 类型检查 + vite build
pnpm lint      # eslint . --ext .vue,.js,jsx,.ts --fix
pnpm format    # prettier --write
```

无测试框架/测试脚本。

## 技术栈

- Vue 3.2 组合式 API（全部 `<script setup lang="ts">`）+ TypeScript（strict）
- Vite 4 + **pnpm**；`base: './'`（适配 Vercel 静态部署）
- Element Plus 2.2（unplugin-vue-components **自动按需导入，无需 import 组件**；图标需手动从 `@element-plus/icons-vue` 引入）
- Vue API（ref/reactive 等）由 unplugin-auto-import 自动导入，无需 import
- Pinia（Options 写法）、vue-router 4（**Hash 模式**）、SCSS、axios、echarts、nprogress
- App.vue 用 `ElConfigProvider` 设置中文 locale

## 前后端联调

开发环境经 Vite 代理对接本地 nest-server（`vite.config.ts`）：

| 代理前缀 | target |
|---|---|
| `/dev/api` | `http://localhost:3000`（本地后端，注意后端还有自己的全局前缀 `/dev/api`） |
| `/dev/file` | `http://localhost:3000`（文件服务） |
| `/prod/api` | `http://139.196.236.142`（生产） |

- `.env.development`：`VITE_API_BASE_URL=http://localhost:5173/dev/api`
- 改后端地址：改 `vite.config.ts` proxy + `.env.*`

## 项目结构

```
src/
├── api/               # API 层，按业务域拆文件（user/role/menu/dept.ts）
│   └── types/         # 请求/响应类型
├── layout/            # 后台布局 appLayout.vue + appMenu/ appHeader/
├── router/
│   ├── index.ts       # 静态路由（login/signUp/Layout壳）+ 守卫：登录后动态 addRoute
│   └── helpers.ts     # 后端菜单树 → 路由记录（component 字符串经 import.meta.glob 映射）
├── store/             # Pinia：usePublicStore（侧栏折叠）、useUserStore（角色/权限/动态菜单）
├── directives/        # v-permission 按钮权限指令
├── style/             # 全局 SCSS（index.scss 汇总）
├── util/axios.ts      # axios 封装
├── views/             # 页面：<模块>/<子页>/index.vue
├── interfaces/        # Result/PagingDto 等基础类型
└── composables/       # 预留（空）
```

## 代码约定

- **新页面三件套**：`views/<模块>/<子页>/index.vue` + 后端 `sys_menu` 加菜单（component 填 `模块/子页/index`）+ `api/<域>.ts` 写接口；前端路由由登录后 `getRouters` 动态注册
- **按钮权限**：`v-permission="['permission:user:add']"`（directives/permission.ts，超管恒通过）
- **角色绑菜单**：`views/permission/role/modify.vue` 用 el-tree show-checkbox 勾选；提交 `menuIds = getCheckedKeys() + getHalfCheckedKeys()`（半选父级必须带上否则树断链）；编辑回显只 `setCheckedKeys` 叶子节点（父子联动自动带出父级半选），数据源编辑走 `getRoleMenuTreeSelect(roleId)`、新增走 `getMenuTree()`
- **用户绑角色**：新增用户 `POST /user` 直接带 `roleIds[]`；编辑走 `PUT /user/update` + `PUT /user/authRole`（`roleIds` 空数组=清空全部）；回显走 `GET /user/:id`（返回 `roleIds`）；用户列表行内"分配角色"对话框同样用 authRole
- **商品页**：`api/product.ts` 全部商品接口；列表页 `product/list`（搜索 name/categoryId/product_status + 分页 + 上架/下架/删除，`v-permission` 按钮权限）；新增/编辑页 `product/add`（`/product/add?id=` 编辑，图片 el-upload 自定义 http-request 调 `/common/upload/singleFile`，上传返回 `/file/xxx`，**显示时必须转 `/dev/file/xxx`**，见 add 页 `toViewUrl`）；SKU/参数用 el-table 动态行编辑，price/stock 后端自动算
- **评论页**：`api/review.ts`（list/reply/delete/add）；`product/reply` 搜索 productName/rating/replied + 星级展示（el-rate disabled）+ 回复弹窗（已回复内容回显可改）+ 删除；`product/attr` 为全量 SKU 一览页（拉 /product/list pageSize=100 后前端扁平化）
- **品牌页**：`api/brand.ts`（list/options/add/update/delete）；`product/brand` 分页+搜索+logo 预览弹窗+新增/编辑弹窗+删除；商品新增/编辑页品牌下拉用 `getBrandOptionsApi`（select id/name）
- **分类页**：`api/category.ts`（list/add/update/delete）；`product/classify` 树形表格 + 名称过滤 + 添加/添加子分类/编辑（父级树选择排除自身及后代）/删除（提示连带子分类）；**商品列表/新增页的分类下拉与分类管理页同源**（都用 `GET /category/list` 树）
- **字典页**：`api/dict.ts` 全量接口；`system/dict/index` 类型管理（dictName/dictType 搜索+分页+弹窗）；`system/dict/data` 数据管理（query.dictType 定位，dictLabel/dictValue/dictSort/listClass(标签样式)/isDefault(开关)）；业务表单下拉用 `getDictDataByTypeApi(dictType)` 返回 `{dictLabel, dictValue, listClass}`
- **菜单图标**：`util/iconMap.ts` 维护 icon 字符串→组件映射，新图标先在这里登记
- **注意**：菜单/权限数据变更后，已登录用户需刷新页面（守卫重新拉 getRouters）才生效
- 页面私有子组件放同目录 `components/`，PascalCase；布局组件 camelCase
- **API 函数**命名以 `Api` 结尾（`getUserListApi`），用 `axios.get<any, ResponseType>` 指定响应类型，中文 JSDoc
- **请求封装**（`util/axios.ts`）：baseURL 取 `VITE_API_BASE_URL`，timeout 30s；token 从 `localStorage.jwt_token` 读取，`Authorization: Bearer xx`；401 时 `router.push('/login')`；响应拦截器直接返回 `response.data`
- **路由 meta**：`{ title: true, name: '中文名' }`，公开页加 `noAuth: true`；无 token 且非 noAuth → 重定向 `/login?redirect=xxx`
- **动态路由加载坑（重要）**：守卫里加载完动态路由后**不能 `next({ ...to })`**——to 对象携带注册前的旧 `matched` 快照，vue-router 4 会直接沿用导致子路由不渲染（页面只显示 Layout、内容区空白）；必须用字符串路径 `next({ path: to.fullPath, replace: true })` 强制重新解析（见 `router/index.ts` beforeEach）
- **Prettier**：4 空格缩进、单引号、无分号、行宽 80
- 后端响应格式：`{ code: 0|-1, msg, result }`

## 已有功能模块

| 模块 | 路由 | 完成度 |
|---|---|---|
| 登录/注册 | `/login` `/signUp` | 完整（登录后存 JWT + userInfo） |
| 首页仪表板 | `/` | **已实装**：`api/dashboard.ts` → `/dashboard/stats`；8 张统计卡片（今日/累计销售额、今日/总订单、待发货、用户、商品、待回复评论）+ 近7天销售趋势折线 + 订单状态分布环形 + 商品分类分布条形 + 热销 Top5 条形 + 最新订单表格（点击"查看全部"跳 /order/list）；echarts 手动 init，`nextTick` 后渲染 |
| 商品 | `/product/list|classify|attr|reply|brand` | 列表**已对接**（搜索/分页/上下架/删除+品牌列）；新增/编辑 `/product/add`（静态路由，query.id 区分，图片上传+SKU 表格+品牌下拉）；评论页**已对接**；attr 为 SKU 一览页；**品牌管理页已对接**（分页/新增/编辑/删除，logo 显示）；分类树已对接 |
| 订单 | `/order/list` | **已实装**：`api/order.ts`（list/detail/add/ship/status/delete）；搜索 orderNo/username/orderStatus + 分页；操作按状态：paid→发货弹窗（物流单号）、shipped→标记完成、pending/paid→取消、paid/shipped→退款、删除；详情弹窗含收货信息+商品明细表格；按钮 `v-permission`（order:list:ship/edit/remove） |
| 媒体 | `/media` | **已实装**：`api/media.ts`（list/delete）；网格展示 + 预览 + 复制链接（`/dev${url}`）+ 上传（复用 `/common/upload/singleFile`）+ 删除；返回字段驼峰（uploadId/fileName） |
| 权限 | `/permission/role|admin|rule|user|dept|resource` | 较完整，**RBAC 已实装**（动态菜单+接口鉴权） |
| 系统（字典） | `/system/dict` `/system/dict/data` | **已实装**：类型管理（搜索/分页/新增编辑弹窗/删除连带数据）；数据管理页（静态路由，query.dictType 定位，含标签样式/默认值）；下拉查询 `getDictDataByTypeApi` 供业务表单复用 |
| 权限规则（菜单管理） | `/permission/rule` | 完整：树表格 + 新增/编辑/删除 + 类型区分 M/C/F + 父级树选择（防自引用） |
| 订单 / 媒体 / 个人中心 | `/order/list` `/media` `/profile` | 订单**已实装**（列表/搜索/详情/发货/状态流转/删除）；媒体**已实装**（网格/上传/预览/复制链接/删除）；个人中心骨架 |

## 设计系统（2026-08 改造，源自 ui-ux-pro-max）

- **设计令牌**在 `src/style/variables.scss`（原 varibles.scss 拼写错误已修复）：品牌蓝 `--mall-primary: #2563EB` + CTA 橙 `--mall-accent: #EA580C`，背景 `#F8FAFC`；同时覆盖全套 Element Plus CSS 变量（--el-color-primary 等），改主题只动这一个文件
- **字体**：Plus Jakarta Sans（Google Fonts import，含中文 fallback）
- **布局**：`appLayout.vue` 侧边栏深蓝渐变（--mall-sidebar-bg）+ 顶栏玻璃拟态（blur 12px + 半透明白）；菜单选中项品牌蓝渐变 + 左侧指示条
- **登录/注册页**：暗色科技渐变背景 + 粒子 + 玻璃表单卡（login-shared.scss 共享）；暗色下 el-checkbox/input 需单独覆盖
- **全局统一**：common.scss 给 el-card/el-table/el-dialog 统一圆角/边框/阴影；仪表盘图表与 stat 图标用品牌色板
- 改视觉优先动 variables.scss 令牌，避免散落硬编码色值
