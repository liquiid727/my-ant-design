# Vercel 部署配置 + 构建优化 + E2E 测试

## Description

配置 Vercel 部署、Vite 构建优化（chunk 分割、tree-shaking），编写核心流程的 E2E 测试。确保生产构建可正常部署和访问。

## Acceptance Criteria

- [ ] vercel.json：SPA rewrites 配置
- [ ] vite.config.ts 构建优化：manualChunks 分割 antd / vendor
- [ ] `npm run build` 成功，产出 dist/ 目录
- [ ] 总 bundle size < 350KB (gzip)
- [ ] Vitest 单元测试：themeValidator, themeExporter, themeDiff, extractThemeFromResponse
- [ ] Playwright E2E：启动 → 选预设 → 切换主题 → 修改 Token → 导出
- [ ] 响应式验证：desktop / tablet / mobile 三种 viewport
- [ ] `npm run preview` 本地预览正常

## Dependencies

Issue #12

## Type

infra

## Priority

medium

## SPEC Reference

Section 8.2 Optimization, Section 9 Testing Strategy, Section 10.4 Deployment
