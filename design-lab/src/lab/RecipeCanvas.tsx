import type { ReactElement } from 'react';
import { Action, Metric, ProgressRing } from '../components/ui';
import { Amount, BudgetBar, CategoryRow } from '../apps/ledger/components';
import { RouteCard } from '../apps/ride/components';
import type { PageRecipe } from '../workbench/mapping';

type Props = Record<string, unknown>;

const str = (value: unknown, fallback = '') => (typeof value === 'string' ? value : fallback);
const num = (value: unknown, fallback = 0) => (typeof value === 'number' ? value : fallback);

/**
 * 配方 → 界面：只渲染"契约里且有实现"的组件。
 * 没有实现的组件会明说，不假装画出来。
 */
const RENDERERS: Record<string, (props: Props) => ReactElement> = {
  Action: (props) => <Action label={str(props.label, '操作')} variant={(props.variant as 'primary' | 'secondary' | 'ghost') ?? 'primary'} disabled={Boolean(props.disabled)} />,
  Metric: (props) => (
    <Metric
      vm={{
        value: String(props.value ?? '—'),
        unit: str(props.unit),
        label: str(props.label, '指标'),
        tone: (props.tone as 'default' | 'muted') ?? 'default',
        ariaLabel: `${str(props.label, '指标')} ${props.value ?? ''}${str(props.unit)}`,
      }}
    />
  ),
  RouteCard: (props) => (
    <RouteCard
      title={str(props.title, '路线')}
      distanceKm={num(props.distanceKm)}
      elevationM={props.elevationM === undefined ? undefined : num(props.elevationM)}
      durationMin={props.durationMin === undefined ? undefined : num(props.durationMin)}
      surface={(props.surface as 'road' | 'gravel' | 'mixed') ?? 'mixed'}
      layout={(props.layout as 'card' | 'row') ?? 'card'}
    />
  ),
  ProgressRing: (props) => <ProgressRing value={num(props.value)} label={str(props.label, '完成目标')} size="md" />,
  Amount: (props) => (
    <Amount
      value={num(props.value)}
      direction={(props.direction as 'expense' | 'income' | 'transfer') ?? 'expense'}
      caption={props.caption === undefined ? undefined : str(props.caption)}
    />
  ),
  BudgetBar: (props) => <BudgetBar used={num(props.used)} total={num(props.total, 1)} label={props.label === undefined ? undefined : str(props.label)} />,
  CategoryRow: (props) => (
    <CategoryRow
      name={str(props.name, '分类')}
      amount={num(props.amount)}
      share={num(props.share, 0)}
      tone={(props.tone as 'dining' | 'transit' | 'subscription' | 'other') ?? 'other'}
    />
  ),
};

export const SUPPORTED = Object.keys(RENDERERS);

export const RecipeCanvas = ({ recipe }: { recipe: PageRecipe }) => (
  <div className="recipe-canvas">
    {recipe.sections.map((section, index) => {
      const render = RENDERERS[section.component];
      if (!render) {
        return (
          <p className="recipe-missing" key={`${section.component}-${index}`}>
            {section.component} 目前只有契约、没有实现，渲染跳过。
          </p>
        );
      }
      return (
        <div className="recipe-section" key={`${section.component}-${index}`}>
          {render((section.props ?? {}) as Props)}
        </div>
      );
    })}
  </div>
);
