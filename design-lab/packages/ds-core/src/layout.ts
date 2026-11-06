/** 布局档位：与 @ds/core 的其它部分一样，纯函数、不依赖平台。 */

export type LayoutBucket = 'compact' | 'medium' | 'expanded';

export type Breakpoints = { tablet: number; wide: number };

export const DEFAULT_BREAKPOINTS: Breakpoints = { tablet: 600, wide: 900 };

export const layoutBucket = (width: number, breakpoints: Breakpoints = DEFAULT_BREAKPOINTS): LayoutBucket => {
  if (width >= breakpoints.wide) return 'expanded';
  if (width >= breakpoints.tablet) return 'medium';
  return 'compact';
};

/** 小程序没有容器查询，用页面根节点上的 class 表达同一件事。 */
export const layoutClass = (width: number, breakpoints: Breakpoints = DEFAULT_BREAKPOINTS) =>
  `layout-${layoutBucket(width, breakpoints)}`;

/** 宽屏下的字号系数：compact 恒为 1，其余取品牌无关的固定比例。 */
export const typeScale = (bucket: LayoutBucket, tabletScale = 1.08) => (bucket === 'compact' ? 1 : tabletScale);

export const isWide = (width: number, breakpoints: Breakpoints = DEFAULT_BREAKPOINTS) =>
  layoutBucket(width, breakpoints) !== 'compact';
