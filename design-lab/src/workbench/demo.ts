/** 不用模型也能看的示例配方：视觉回归和"试试看"都用它。 */
import type { PageRecipe } from './mapping';

export const DEMO_RECIPES: Record<'ride' | 'ledger', PageRecipe> = {
  ride: {
    id: 'recipe-demo-ride',
    app: 'ride',
    page: 'pages/home/index',
    intent: '示例：一个指标、一张路线卡、一个主操作',
    sections: [
      { component: 'Metric', props: { value: 23.4, unit: 'km', label: '本周里程' } },
      {
        component: 'RouteCard',
        props: { title: '西湖西溪绿道', distanceKm: 23.4, elevationM: 218, durationMin: 95, surface: 'mixed' },
        tokens: ['card.radius'],
      },
      { component: 'Action', props: { label: '开始骑行', variant: 'primary' } },
    ],
  },
  ledger: {
    id: 'recipe-demo-ledger',
    app: 'ledger',
    page: 'pages/month/index',
    intent: '示例：本月支出、预算、两个分类',
    sections: [
      { component: 'Amount', props: { value: 348250, direction: 'expense', caption: '本月支出' } },
      { component: 'BudgetBar', props: { used: 218000, total: 300000, label: '餐饮预算' } },
      { component: 'CategoryRow', props: { name: '餐饮', amount: 126000, share: 36, tone: 'dining' } },
      { component: 'CategoryRow', props: { name: '交通', amount: 48000, share: 14, tone: 'transit' } },
    ],
  },
};
