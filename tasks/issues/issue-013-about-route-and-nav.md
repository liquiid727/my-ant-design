# About 页面路由注册与导航入口

## Description

为 Theme Studio 新增 `/about` 路由和导航入口。创建 `AboutPage.tsx` 骨架组件，在 `App.tsx` 中注册 lazy load 路由，在 `HeaderBar.tsx` 的 Segmented 导航中新增 About 选项。

## Acceptance Criteria

- [ ] 创建 `src/components/about/AboutPage.tsx` 骨架组件（named export + default export）
- [ ] 在 `App.tsx` 中新增 `/about` 路由，使用 `React.lazy()` + `.then()` 模式懒加载
- [ ] `HeaderBar.tsx` Segmented 新增 `{ label: 'About', value: '/about' }` 选项
- [ ] Segmented `value` 判断兼容 `/about` 路径高亮
- [ ] 点击 About 导航项正确跳转到 `/about` 页面
- [ ] Typecheck/lint passes
- [ ] Verify in browser using dev-browser skill

## Dependencies

None

## Type

frontend

## Priority

high

## SPEC Reference

Section 2.3 File Structure, Appendix A1, A2
