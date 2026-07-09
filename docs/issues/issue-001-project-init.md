# 项目初始化：Vite + React + antd + TypeScript + 路由 + Layout

## Description

初始化 Theme Studio 项目基础框架。使用 Vite + React 18 + TypeScript 搭建，集成 antd 5.x + antd-style，配置 React Router v6 路由（Playground / Library），创建全局 Layout（HeaderBar + 内容区）。Header 上包含 Logo、导航、Settings 齿轮按钮、AI Chat 按钮。

## Acceptance Criteria

- [ ] `npm create vite` 初始化项目，配置 TypeScript strict mode
- [ ] 安装依赖：antd 5.x, antd-style, zustand, react-router-dom, nanoid
- [ ] 配置 vite.config.ts（React plugin、antd chunk 分割）
- [ ] 创建 vercel.json（SPA rewrites）
- [ ] 创建全局 Layout 组件：HeaderBar（Logo + Nav + Settings 按钮 + AI Chat 按钮）+ Content 区域
- [ ] 配置 React Router：`/` → Playground，`/library` → Library
- [ ] 项目可 `npm run dev` 正常启动，显示空白 Layout

## Dependencies

None

## Type

infra

## Priority

high

## SPEC Reference

Section 2.4 File Structure, Section 10.1 Phase 1
