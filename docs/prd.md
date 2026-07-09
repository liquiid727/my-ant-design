RD：Ant Design Theme Studio（AI Design System Builder）

Version: MVP v0.1

一、背景（Background）

目前 Ant Design 官方提供了：

Theme Token
Component Token
ConfigProvider
CLI
MCP

以及官方的 Theme Playground，可以实时预览 Design Token 的修改效果。

但是官方能力主要集中于：

Token 调整
Theme 调试
官方组件展示

缺少：

AI 生成主题
企业主题管理
Theme Version
Theme Library
一键导入到项目
老项目主题升级
Design System 生命周期管理

因此，希望构建一套独立的 Theme Studio，在 Ant Design Design System 的基础之上，利用 LLM 自动生成、编辑、预览、管理整个主题系统。

二、目标（Goals）

一句话：

基于 Ant Design Design Token，通过 AI 快速生成企业级 Design System，并能够实时预览、导出、应用到 React 项目。

最终效果：

Prompt

↓

Theme

↓

Preview

↓

Edit

↓

Export

↓

Project
三、产品定位

不是：

Theme Editor

不是：

Design Tool

而是：

AI 驱动的 Ant Design Design System Builder

四、整体流程
               Theme Studio

        Prompt
           │
           ▼
     AI Theme Agent
           │
           ▼
 Theme JSON(Token)
           │
           ▼
 ConfigProvider
           │
           ▼
 Live Preview
           │
      ┌────┴────┐
      ▼         ▼
  Theme Edit   Component Edit
      │         │
      └────┬────┘
           ▼
      Theme Version
           │
           ▼
Export theme.ts/theme.json
           │
           ▼
CLI Apply
           │
           ▼
Existing Project / New Project
五、功能模块
5.1 Theme Playground（官方能力复刻）

参考：

Ant Design 官网 Playground。

提供：

Button
Input
Card
Modal
Notification
Alert
Avatar
Form
Table
Layout
Login
Dashboard

实时展示。

要求：

任何 Token 修改

立即刷新。

5.2 Theme Editor

编辑：

Global Token

例如：

Primary

Success

Warning

Error

Border Radius

Line Width

Font Size

Shadow

Spacing

Background

Text

Border

修改后：

实时刷新。

5.3 Component Token

支持：

Button

Input

Table

Select

Menu

Card

Modal

Drawer

Tabs

Progress

Tag

Notification

每个组件：

独立修改。

例如：

Table

Header Background

Hover Color

Border

Radius

Padding
5.4 AI Theme Generator（核心）

新增：

LLM Provider

例如：

OpenAI

Claude

Gemini

DeepSeek

Qwen

OpenRouter

Custom API

用户配置：

BaseURL

API Key

Model

Prompt：

例如：

帮我生成一个：

苹果风

企业后台

白色

大量留白

毛玻璃

Primary #007AFF

AI 输出：

ThemeConfig

自动：

Preview。

5.5 Theme Library

保存：

Theme。

例如：

Default

Illustration

Apple

Linear

Stripe

Github

Summer

Dark

Cyberpunk

支持：

复制

修改

分享。

5.6 Theme Version

例如：

v1

v2

v3

查看：

Diff。

支持：

Rollback。

5.7 Export

支持导出：

theme.ts

theme.json

design-token.json

tailwind.config.ts（可选）

css variables（可选）
5.8 CLI Integration（重点）

接入：

Ant Design CLI。

利用 CLI：

查询：

Component

Token

Demo

Semantic DOM

Design.md

AI：

生成：

合法 Theme。

避免：

生成不存在 Token。

5.9 MCP Integration

接入：

Ant Design MCP。

AI：

生成 Theme 前：

查询：

Button Token

Card Token

Table Token

保证：

全部来自：

官方。

5.10 Apply Theme

生成：

theme.ts

支持：

新项目

自动：

生成：

<ConfigProvider
theme={theme}
/>

老项目

扫描：

ConfigProvider

Theme

Token

自动：

替换：

Theme。

支持：

Diff。

六、AI Workflow
Prompt

↓

LLM

↓

Ant Design MCP

↓

Theme JSON

↓

Validation

↓

Preview

↓

Manual Edit

↓

Export

↓

Apply Project
七、未来规划（Future）
Theme Agent

一句话：

夏日度假风

↓

完整：

Theme。

Theme Review

AI：

Review：

Contrast

Accessibility

WCAG

Color Harmony

Design Consistency
Screenshot Theme

上传：

后台截图。

AI：

识别：

颜色

间距

Radius

Shadow

↓

生成：

Theme。

Figma Import

导入：

Variables。

↓

Theme。

Multi Framework

输出：

Ant Design

Tailwind

MUI

CSS Variables

Style Dictionary
Theme Marketplace

分享：

Apple

Stripe

Linear

Github

Arc

Notion

一键：

Apply。

八、我建议增加的一个「杀手级功能」

这个是官方目前没有做，但我认为价值最高。

🎯 Project Migration（项目主题迁移）

输入一个已有 React 项目：

/project

Theme Studio 自动：

分析项目当前的 Ant Design 使用方式。
检测哪些地方已经使用 ConfigProvider、哪些地方写死了颜色或样式。
调用 Ant Design CLI/MCP 获取对应组件的官方 Token。
生成统一的 theme.ts。
将可以替换的硬编码颜色、圆角、阴影迁移到 Token。
输出完整 Diff，供开发者确认后应用。

整个流程可以概括为：

Old Project
      │
      ▼
Project Scan
      │
      ▼
Extract Theme
      │
      ▼
Normalize Token
      │
      ▼
AI Optimize
      │
      ▼
Preview
      │
      ▼
Export theme.ts
      │
      ▼
Apply

我认为这会成为整个 Theme Studio 最有竞争力的能力：不仅能创建新主题，还能帮助已有项目完成 Design System 的收敛和升级。这也是官方 Playground 和大多数 Theme Editor 目前都没有覆盖的场景。
