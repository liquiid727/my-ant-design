import { useState } from 'react';
import { valueOf } from './model';

const ROWS = [
  { duration: 'fast', easing: 'standard', label: '按钮按压', note: '微缩放 + 色彩' },
  { duration: 'base', easing: 'standard', label: '卡片进入', note: '轻位移 + 透明度' },
  { duration: 'slow', easing: 'enter', label: '页面切换', note: '保持空间连续' },
  { duration: 'sheet', easing: 'spring', label: '底部抽屉', note: '弹性缓动' },
  { duration: 'celebrate', easing: 'spring', label: '成就解锁', note: '一次性情绪动效' },
] as const;

const ms = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;

const bezier = (easing: string) => {
  const numbers = easing.match(/-?[\d.]+/g)?.map(Number) ?? [0.25, 0.1, 0.25, 1];
  return numbers.slice(0, 4);
};

const CurvePreview = ({ easing }: { easing: string }) => {
  const [x1, y1, x2, y2] = bezier(easing);
  const x = (value: number) => (value * 100).toFixed(1);
  const y = (value: number) => (58 - value * 52).toFixed(1);
  return (
    <svg className="curve" viewBox="0 0 100 60" aria-hidden="true">
      <path className="curve-frame" d="M0 58 H100 M0 6 V58" />
      <path className="curve-line" d={`M0 58 C ${x(x1)} ${y(y1)} ${x(x2)} ${y(y2)} 100 6`} />
    </svg>
  );
};

export const MotionBench = ({ brand }: { brand: string }) => {
  const [runId, setRunId] = useState(0);
  const [playing, setPlaying] = useState<string | null>(null);

  const play = (row: (typeof ROWS)[number]) => {
    setPlaying(row.duration);
    setRunId((value) => value + 1);
  };

  return (
    <div className="motion">
      <div className="motion-head">
        <p className="motion-title">动效也是 token</p>
        <p className="motion-note">
          下面每一行的时长与缓动都直接读 <code>--motion-*</code>，没有一行是写死的数值。系统开了“减弱动态效果”时，这一列会自动落位。
        </p>
      </div>

      <div className="motion-list">
        {ROWS.map((row) => {
          const duration = valueOf(brand, `motion.duration.${row.duration}`, 'light');
          const easing = valueOf(brand, `motion.easing.${row.easing}`, 'light');
          return (
            <button type="button" className="motion-row" key={row.duration} onClick={() => play(row)}>
              <span className="motion-id">
                <span className="motion-name">{row.label}</span>
                <code className="motion-token">
                  motion.duration.{row.duration} · {row.easing}
                </code>
                <span className="motion-note-inline">{row.note}</span>
              </span>
              <CurvePreview easing={easing} />
              <span className="motion-readout">
                <strong>{ms(duration)}</strong>
                <small>ms</small>
              </span>
              <span className="motion-track">
                <span
                  key={`${row.duration}-${runId}`}
                  className="motion-dot"
                  data-playing={playing === row.duration}
                  style={{
                    animationDuration: `${ms(duration)}ms`,
                    animationTimingFunction: easing,
                  }}
                />
              </span>
            </button>
          );
        })}
      </div>
      <p className="motion-foot">点击任意一行回放</p>
    </div>
  );
};
