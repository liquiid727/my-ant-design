import type { SVGProps } from 'react';

/** lab 组的图标：一支量筒，和官方主题的品牌图标区分开。 */
export function LabIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true" {...props}>
      <path
        d="M9 3h6M10 3v6.2L5.2 18a2 2 0 0 0 1.8 3h10a2 2 0 0 0 1.8-3L14 9.2V3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.6 15.2h8.8" strokeLinecap="round" />
    </svg>
  );
}
