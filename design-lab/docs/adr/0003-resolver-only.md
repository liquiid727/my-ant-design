# ADR-0003 · Style Dictionary 只做解析，输出格式自己写

**状态**：已采纳（M1）

## 背景

编译器的四件事：schema 校验、别名解析、主题合成、单位换算。
其中"别名解析"包含链式引用、循环检测、类型继承、跨文件合并——这些是 Style Dictionary
的核心能力，自己写会反复踩坑。

但 Style Dictionary 的 **transform / format** 面向 CSS/JS/SCSS 生态，默认输出不符合小程序的需要：

- `duration` 被转成 `0.22s`（我们希望保留 `220ms` 便于文档与评审）；
- `shadow` 被转成 `rgb(10% 10% 10% / 0.1)` 的现代语法，老版本 webview 有风险；
- 单位换算（px → rpx）需要按目标平台分别处理，且 `1px` 例外；
- 产物是**多排列合并**的文件（`:root` + 深色差值 + 品牌块），不是单文件输出。

## 决定

- 只用 Style Dictionary 做**解析**：`platforms: { raw: { transforms: [] } }`，
  `exportPlatform('raw')` 拿到"别名已解析、值仍是规范对象"的树。
- 归一化、单位换算、字符串格式化、多排列合并，全部在 `format.mjs` / `emit.mjs` 里自己写。
- 输出格式的验收方式很直接：产物是提交入库的，diff 就是评审对象。

## 后果

- 好处：产物形态完全可控（rpx 策略、ms、老语法兼容、注释抬头）；换解析器不影响输出层。
- 代价：失去 Style Dictionary 的现成 format 生态（自定义平台、SCSS 变量等），
  需要时得自己补。
- 约束：不要把业务逻辑塞进 transform；`raw` 平台必须保持零 transform，
  否则"解析"与"格式化"会重新耦合。
