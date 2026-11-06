import { routeCardVM, type Surface } from '@ds/core';
import { Metric } from '../../components/ui';

/** 骑行产品专属：地图 + 指标 + 面类型。通用组件里不应出现它。 */
export const RouteCard = ({
  title,
  distanceKm,
  elevationM,
  durationMin,
  surface = 'mixed',
  layout = 'card',
}: {
  title: string;
  distanceKm: number;
  elevationM?: number;
  durationMin?: number;
  surface?: Surface;
  layout?: 'card' | 'row';
}) => {
  const vm = routeCardVM({ title, distanceKm, elevationM, durationMin, surface });
  return (
    <article className="route-card" data-layout={layout} aria-label={vm.ariaLabel}>
      <div className="route-map" aria-hidden="true">
        <svg viewBox="0 0 240 88" preserveAspectRatio="none">
          <path className="route-map-water" d="M0 70 C 40 58, 70 78, 110 68 S 190 44, 240 58 L240 88 L0 88 Z" />
          <path className="route-map-line" d="M8 66 C 38 52, 46 30, 78 34 S 128 60, 156 44 S 206 16, 232 22" />
          <circle className="route-map-pin" cx="232" cy="22" r="4" />
          <circle className="route-map-start" cx="8" cy="66" r="4" />
        </svg>
      </div>
      <div className="route-body">
        <div className="route-head">
          <h3 className="route-title">{vm.title}</h3>
          <span className="route-surface">{vm.surfaceLabel}</span>
        </div>
        <div className="route-stats">
          {vm.stats.map((stat) => (
            <Metric key={stat.label} vm={stat} />
          ))}
        </div>
      </div>
    </article>
  );
};
