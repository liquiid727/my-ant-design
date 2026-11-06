import type { ThemeName } from './model';

export type ExampleMedium = 'mobile' | 'web';

export type Example = {
  id: string;
  app: string;
  brand: string;
  theme: ThemeName;
  medium: ExampleMedium;
  title: string;
  kicker: string;
  description: string;
  scope: string;
};

/**
 * 三个固定身份的示例。
 * 每个示例锁定 app × brand × theme × 媒介；示例页只展示这一种身份，
 * 想看全部排列去 /matrix。
 */
export const EXAMPLES: Example[] = [
  {
    id: 'ride',
    app: 'ride',
    brand: 'cycling',
    theme: 'light',
    medium: 'mobile',
    title: 'Ride Atlas',
    kicker: '移动端 · 骑行包 · 浅色',
    description: '路线规划 · 骑行记录 · 成就 · 明信片',
    scope: 'Token 分层 · 组件契约 · 移动端组件 · 视觉门禁',
  },
  {
    id: 'ledger',
    app: 'ledger',
    brand: 'ledger',
    theme: 'light',
    medium: 'mobile',
    title: 'Ledger',
    kicker: '移动端 · 记账包 · 浅色',
    description: '月度账目 · 分类预算 · 流水明细',
    scope: '第二产品语义 · 组件复用验证 · 门禁扩展',
  },
  {
    id: 'noir',
    app: 'ride',
    brand: 'noir',
    theme: 'dark',
    medium: 'web',
    title: 'Noir',
    kicker: 'Web · Noir · 深色',
    description: '暗黑设计感的系统控制台：侧栏、指标、Token 与发布记录。',
    scope: '独立 Web 示例 · 桌面栅格 · 暗黑品牌包',
  },
];

export const exampleById = (id: string): Example => EXAMPLES.find((item) => item.id === id) ?? EXAMPLES[0];
