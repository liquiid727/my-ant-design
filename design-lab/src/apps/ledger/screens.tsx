import { amountVM } from '@ds/core';
import { Action, MetricValue, ProgressRing } from '../../components/ui';

const CATEGORIES = [
  { name: '餐饮', tone: 'dining', amount: '¥1,240.00', share: 36 },
  { name: '交通', tone: 'transit', amount: '¥420.00', share: 12 },
  { name: '订阅', tone: 'subscription', amount: '¥128.00', share: 4 },
];

const RECENT = [
  { name: '山野咖啡馆', meta: '今天 · 餐饮', amount: '-¥38.00', direction: 'expense' },
  { name: '地铁 2 号线', meta: '今天 · 交通', amount: '-¥6.00', direction: 'expense' },
];

const money = (cents: number) => amountVM({ cents }).value;

export const LedgerMonthScreen = () => (
  <div className="screen">
    <header className="screen-head screen-head-tight">
      <p className="screen-eyebrow">10 月 · 第 2 周</p>
      <h2 className="screen-title">本月支出</h2>
      <p className="ledger-amount">{money(348250)}</p>
      <p className="ledger-delta">比上月少 12%</p>
    </header>

    <div className="ledger-budget">
      <div className="ledger-budget-head">
        <span>预算使用</span>
        <span className="ledger-mono">62%</span>
      </div>
      <div className="ledger-bar">
        <span style={{ width: '62%' }} />
      </div>
      <p className="ledger-budget-note">
        {money(348250)} / {money(560000)}
      </p>
    </div>

    <p className="screen-eyebrow">分类</p>
    <div className="ledger-cats">
      {CATEGORIES.map((category) => (
        <div className="ledger-cat" key={category.name}>
          <span className="ledger-dot" style={{ background: `var(--color-category-${category.tone})` }} />
          <span className="ledger-cat-name">{category.name}</span>
          <span className="ledger-cat-amount">{category.amount}</span>
        </div>
      ))}
    </div>

    <p className="screen-eyebrow">最近</p>
    <div className="ledger-rows">
      {RECENT.map((item) => (
        <div className="ledger-row" key={item.name}>
          <span className="ledger-row-main">
            <span className="ledger-row-name">{item.name}</span>
            <span className="ledger-row-meta">{item.meta}</span>
          </span>
          <span className="ledger-row-amount" data-direction={item.direction}>
            {item.amount}
          </span>
        </div>
      ))}
    </div>

    <div className="screen-actions">
      <Action label="记一笔" />
    </div>
  </div>
);

export const LedgerBudgetScreen = () => (
  <div className="screen">
    <header className="screen-head screen-head-tight">
      <p className="screen-eyebrow">10 月预算</p>
      <h2 className="screen-title">还有 38% 可以用</h2>
    </header>

    <div className="screen-ring">
      <ProgressRing value={0.62} size="lg" label={<MetricValue kind="percent" value={0.62} label="已用预算" />} />
    </div>

    <div className="ledger-rows">
      <div className="ledger-row ledger-row-figure">
        <span className="ledger-row-name">预算总额</span>
        <span className="ledger-row-amount">{money(560000)}</span>
      </div>
      <div className="ledger-row ledger-row-figure">
        <span className="ledger-row-name">已使用</span>
        <span className="ledger-row-amount" data-direction="expense">
          {money(348250)}
        </span>
      </div>
      <div className="ledger-row ledger-row-figure">
        <span className="ledger-row-name">剩余</span>
        <span className="ledger-row-amount" data-direction="income">
          {money(211750)}
        </span>
      </div>
    </div>

    <p className="screen-eyebrow">分类预算</p>
    <div className="ledger-cats">
      {CATEGORIES.map((category) => (
        <div className="ledger-cat ledger-cat-budget" key={category.name}>
          <span className="ledger-dot" style={{ background: `var(--color-category-${category.tone})` }} />
          <span className="ledger-cat-name">{category.name}</span>
          <span className="ledger-bar ledger-bar-inline">
            <span style={{ width: `${Math.min(100, category.share * 2)}%` }} />
          </span>
        </div>
      ))}
    </div>

    <div className="screen-actions">
      <Action label="调整预算" variant="secondary" />
    </div>
  </div>
);
