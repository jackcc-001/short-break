# 历史代码清理说明

## 当前产品范围

「歇一会儿」是无需登录的轻娱乐休息站。保留 `/`、`/games`、`/break` 与 `/api/health`。
游戏成绩、偏好使用当前浏览器保存。烦恼回收站仍通过 `useInferenceRun → runInference` 调用在线服务。

## 本次删除（已核对全工程引用）

- `app/admin/page.tsx`：旧武侠志演示后台，无前台入口、无真实鉴权/管理接口，含虚构统计及内存演示数据。删除后 `/admin` 返回 404，而不是新的后台。
- `components/retention-strip.tsx`：已移除的“今日江湖·三件小事”，没有调用方。
- `lib/upload-file.ts`：没有调用方的文件上传辅助方法，当前产品无上传功能。
- `public/file.svg`、`globe.svg`、`next.svg`、`vercel.svg`、`window.svg`：无引用的初始模板素材。
- `components/mini-games.tsx` 内旧“顺序点灯”的状态机、计时器、按钮与渲染分支；保留四款当前小游戏的三档难度、棋盘和分档成绩逻辑。
- 原创名帖、手动任务、旧逃跑演示和顺序点灯相关的失效 CSS 选择器、旧动画。
- 未使用的导入和状态：旧气泡状态、旧逃跑演示状态、旧怪鸟层数导出及未使用导入。

## 明确保留

- 十二款正在使用的游戏，包括仍有武侠包装的围住怪盗、武林记忆牌、轻功登顶；这是有效产品内容，不是无用代码。
- `?play=sequence` 与旧 `last-game=sequence` 到双星归位的兼容映射。
- `lib/inference.ts`、`lib/use-inference-run.ts`、`@inferencesh/sdk`：烦恼回收站实际使用。
- `lib/iframe-safe-cookie.ts`：目前无登录调用，但 ESLint 平台规则显式指定了该会话 Cookie 辅助入口，保留作为基础设施。
- `db/`、`drizzle/`、`drizzle.config.ts`、`lib/db.ts`、`lib/pg-dsn.ts` 与相关包：当前业务不使用数据库，但 compose 中仍声明数据库迁移入口。为了不影响既有部署和迁移历史，本次没有删表、删迁移、修改数据库配置或拆除平台资源。需要数据库去配或降配时应另行评估。
- `/games` 与 `/` 共用页面：已有分享链接使用 `/games`，不是重复无效路由。
- 用户浏览器中的历史本地数据：本次没有批量清除 localStorage，也没有改写成绩键。

## 防回归措施

- TypeScript 开启 `noUnusedLocals`、`noUnusedParameters`。
- 新增 `pnpm test:cleanup`：确认废弃文件不存在、12 个游戏入口仍在、旧链接仍兼容、在线生成和迁移基础设施仍在。
- `pnpm test:games`：原有游戏逻辑测试。
- `pnpm build`：构建路由表确认 `/admin` 已移除。

## 发布边界

本次是工作区与预览改动，不自动替换线上版本。未执行线上下线、数据删除或数据库迁移。
