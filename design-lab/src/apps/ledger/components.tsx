import { formatAmount } from '@ds/core';

/** formatAmount 返回 {value, unit}，这里只要字符串。 */
const money = (cents: number, currency: 'CNY' = 'CNY') => formatAmount(cents, currency).value;

/** 账目主数字：金额 + 方向。金额格式化统一走 @ds/core，组件不解析业务数据。 */
export const Amount = ({
  value,
  currency = 'CNY',
  direction = 'expense',
  caption,
}: {
  value: number;
  currency?: 'CNY';
  direction?: 'expense' | 'income' | 'transfer';
  caption?: string;
}) => (
  <div className="amount" data-direction={direction}>
    <p className="amount-value">
      {direction === 'income' ? '+' : direction === 'expense' ? '−' : ''}
      {money(value, currency)}
    </p>
    {caption ? <p className="amount-caption">{caption}</p> : null}
  </div>
);

/** 预算使用条：已用 / 预算，超支变色。 */
export const BudgetBar = ({ used, total, label }: { used: number; total: number; label?: string }) => {
  const ratio = total > 0 ? Math.min(1, used / total) : 0;
  const over = used > total;
  return (
    <div className="budget" data-over={over ? 'true' : 'false'}>
      {label ? <p className="budget-label">{label}</p> : null}
      <div className="budget-track">
        <span className="budget-fill" style={{ width: `${Math.round(ratio * 100)}%` }} />
      </div>
      <p className="budget-meta">
        {money(used)} / {money(total)}
      </p>
    </div>
  );
};

/** 分类消费行：色点 + 名称 + 金额 + 占比。 */
export const CategoryRow = ({
  name,
  amount,
  share = 0,
  tone = 'other',
}: {
  name: string;
  amount: number;
  share?: number;
  tone?: 'dining' | 'transit' | 'subscription' | 'other';
}) => (
  <div className="category-row" data-tone={tone}>
    <span className="category-dot" aria-hidden="true" />
    <span className="category-name">{name}</span>
    <span className="category-share">{Math.round(share)}%</span>
    <span className="category-amount">{money(amount)}</span>
  </div>
);
