/**
 * 动效：核心只声明"意图 → token 名"，具体毫秒数由调用方从编译产物里解析。
 * 这样 core 不依赖任何平台产物，也不会出现"两份时长"。
 */

export type MotionIntent = 'press' | 'card-enter' | 'page-transition' | 'sheet' | 'celebrate';

export const MOTION_INTENTS: Record<MotionIntent, { duration: string; easing: string; note: string }> = {
  press: { duration: 'motion.duration.fast', easing: 'motion.easing.standard', note: '按钮按压：微缩放 + 色彩' },
  'card-enter': { duration: 'motion.duration.base', easing: 'motion.easing.standard', note: '卡片进入：轻位移 + 透明度' },
  'page-transition': { duration: 'motion.duration.slow', easing: 'motion.easing.enter', note: '页面切换：保持空间连续' },
  sheet: { duration: 'motion.duration.sheet', easing: 'motion.easing.spring', note: '底部抽屉：弹性缓动' },
  celebrate: { duration: 'motion.duration.celebrate', easing: 'motion.easing.spring', note: '成就解锁：一次性情绪动效' },
};

export type MotionPlan = {
  intent: MotionIntent;
  play: boolean;
  durationMs: number;
  easing: string;
  durationToken: string;
  easingToken: string;
  note: string;
};

const ms = (value: string) => Number(value.replace(/[^\d.]/g, '')) || 0;

export const planMotion = (
  intent: MotionIntent,
  { reducedMotion, resolve }: { reducedMotion: boolean; resolve: (token: string) => string },
): MotionPlan => {
  const def = MOTION_INTENTS[intent];
  const duration = resolve(def.duration);
  const easing = resolve(def.easing);

  if (reducedMotion) {
    return {
      intent,
      play: false,
      durationMs: 0,
      easing: 'linear',
      durationToken: def.duration,
      easingToken: def.easing,
      note: `${def.note}（已按减弱动态效果降级）`,
    };
  }

  return {
    intent,
    play: true,
    durationMs: ms(duration),
    easing,
    durationToken: def.duration,
    easingToken: def.easing,
    note: def.note,
  };
};
