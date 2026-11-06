# ADR-0005 · app / brand / theme 三轴拆分

**状态**：已采纳（M2）

## 背景

到 M1 结束，排列是 `品牌 × 主题`，产品语义（`route.*` / `achievement.*` / `postcard.*`）挂在品牌包里。
这意味着"加一个品牌"和"加一个产品"是同一件事，白标能跑，跨产品不行：

- `ledger` 品牌包里放着骑行的产品语义，语义和身份混在一起；
- 要加"记账"这个产品，只能复制品牌包再改，产品语义会散落在品牌目录里；
- 组件契约跟着品牌走，但契约是产品的东西，不是品牌的东西。

## 决定

拆成三个正交维度：

```
app（业务语义 + 页面契约）  ×  brand（视觉身份）  ×  theme（明暗）
apps/ride, apps/ledger        brands/cycling, brands/ledger     light, dark
```

- `apps/<id>/tokens/product.tokens.json`：产品语义；
- `apps/<id>/contracts/*.json`：页面可用的组件契约；
- `brands/<id>/tokens/*.json`：只允许覆盖品牌白名单；
- 产物按 app 拆分：`tokens.ride.css` / `tokens.ledger.wxss` / `design-context.ride.json`。
  一个产品只需要自己的那包，不把另一个产品的语义打进包里。

组合数从 4 变成 8（2 app × 2 brand × 2 theme），但这是**配置维度**的增长，不是代码分叉：
组件、页面、门禁都只有一份。

## 后果

- 好处：跨产品复用成立——记账的两屏用的 `Action` / `Metric` / `ProgressRing` 与骑行完全相同；
  品牌依旧只是皮肤；白标照旧。
- 代价：CSS 变量按 app 拆文件，页面根节点必须带 `data-app`（实验台与 Web 消费方都已带）；
  小程序一次构建只属于一个 app，`DS_APP` 指定要打哪个包。
- 约束：组件不许引用产品语义（`route.*` / `transaction.*`）。这条已写进 `design-context` 的 rules，
  下一版要用 lint 固化（当前靠人工评审）。
- 遗留：`app` 相关的规划（新产品的页面）仍需在 `src/apps/<id>/screens.tsx` 注册，recipe 只能校验组合，
  不能生成页面代码。
