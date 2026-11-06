# ADR-0001 · 源文件用"友好格式"，DTCG 作为产物

**状态**：已采纳（M1）

## 背景

DTCG 2025.10 的 `color` 是对象：

```json
{ "colorSpace": "srgb", "components": [0.72, 0.82, 0.54], "alpha": 1, "hex": "#B7CE5E" }
```

`dimension` 是 `{ "value": 18, "unit": "px" }`，`duration` 同理。
如果源文件按规范写，一个 12 色色阶就会变成 60 行不可读的对象，编辑成本高到没人愿意改——
而"token 是唯一真相"的前提，是这份真相**人能读、能改、能 review**。

## 决定

- 源文件（`tokens/**/*.tokens.json`）允许写 `"#B7CE5E"`、`"18px"`、`"220ms"`、`"0 10px 28px rgba(…)"`。
- `normalize.mjs` 在编译时把友好值归一化成规范值，**规范值只出现在产物里**：
  - `dtcg/*.tokens.json` 可直接交给 Figma 插件、其他解析器；
  - 平台产物（css / wxss / ts）本来就是字符串，不受影响。
- 别名 `{color.ramp.sage.600}` 保持原样，交给 Style Dictionary 解析。

## 后果

- 好处：源文件可读、diff 干净、非工程角色也能改。
- 代价：源文件不是合法 DTCG。任何"直接消费源文件"的外部工具都不成立，必须先编译。
- 约束：`normalize.mjs` 是唯一允许理解"友好写法"的地方，新增类型只改这里。
