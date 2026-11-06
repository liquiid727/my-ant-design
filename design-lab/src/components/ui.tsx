import { useEffect, useRef, useState, type ReactNode } from 'react';
import { metricVM, ringVM, routeCardVM, type MetricKind, type MetricVM, type Surface } from '@ds/core';

export const Action = ({
  label,
  variant = 'primary',
  disabled = false,
  onClick,
}: {
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button className="action" data-variant={variant} disabled={disabled} onClick={onClick} type="button">
    {label}
  </button>
);

/** 只负责把 ViewModel 画出来——数值怎么格式化在 @ds/core 里。 */
export const Metric = ({ vm }: { vm: MetricVM }) => (
  <div className="metric" data-tone={vm.tone} aria-label={vm.ariaLabel}>
    <p className="metric-value">
      {vm.value}
      {vm.unit ? <span className="metric-unit">{vm.unit}</span> : null}
    </p>
    <p className="metric-label">{vm.label}</p>
  </div>
);

/** 便捷写法：给原始数值和标签，内部走 metricVM。 */
export const MetricValue = (props: {
  kind: MetricKind;
  value: number;
  label: string;
  tone?: 'default' | 'muted';
  mode?: 'clock' | 'compact';
  unit?: string;
}) => <Metric vm={metricVM(props)} />;

export const ProgressRing = ({
  value,
  label,
  size = 'md',
}: {
  value: number;
  label?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const vm = ringVM(value);
  const [offset, setOffset] = useState(1);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setOffset(vm.dashOffsetFactor));
    return () => cancelAnimationFrame(frame);
  }, [vm.dashOffsetFactor]);

  return (
    <div className="ring" data-size={size} role="img" aria-label={vm.ariaLabel}>
      <svg viewBox="0 0 100 100" className="ring-svg">
        <circle className="ring-track" cx="50" cy="50" r={radius} />
        <circle
          className="ring-fill"
          cx="50"
          cy="50"
          r={radius}
          style={{ strokeDasharray: circumference, strokeDashoffset: circumference * offset }}
        />
      </svg>
      {label ? <div className="ring-label">{label}</div> : null}
    </div>
  );
};

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

export const Badge = ({ unlocked, label }: { unlocked: boolean; label: string }) => (
  <div className="badge" data-unlocked={unlocked}>
    <span className="badge-mark" aria-hidden="true">
      {unlocked ? '★' : '·'}
    </span>
    <span className="badge-label">{label}</span>
  </div>
);

export const PhoneFrame = ({ title, children }: { title: string; children: ReactNode }) => (
  <figure className="phone">
    <figcaption className="phone-caption">{title}</figcaption>
    <div className="phone-shell">
      <div className="phone-screen">
        <div className="phone-status">
          <span>9:41</span>
          <span className="phone-status-icons" aria-hidden="true">
            ▮▮▮
          </span>
        </div>
        {children}
      </div>
    </div>
  </figure>
);

export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  const query = useRef<MediaQueryList | null>(null);

  useEffect(() => {
    query.current = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.current.matches);
    const listener = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.current.addEventListener('change', listener);
    return () => query.current?.removeEventListener('change', listener);
  }, []);

  return reduced;
};

export type { MetricVM };
