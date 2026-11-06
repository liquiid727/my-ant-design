import type { CSSProperties, ReactNode } from 'react';

type SectionProps = {
  index: string;
  id: string;
  title: string;
  note: string;
  aside?: ReactNode;
  children: ReactNode;
};

export const Section = ({ index, id, title, note, aside, children }: SectionProps) => (
  <section className="section" id={id}>
    <header className="section-head">
      <div>
        <p className="eyebrow">
          {index} · {note}
        </p>
        <h2 className="section-title">{title}</h2>
      </div>
      {aside ? <div className="section-aside">{aside}</div> : null}
    </header>
    {children}
  </section>
);

export const Tag = ({ children, tone = 'quiet' }: { children: ReactNode; tone?: 'quiet' | 'accent' | 'warn' }) => (
  <span className="tag" data-tone={tone}>
    {children}
  </span>
);

export const monospaceVars = (style: CSSProperties & Record<`--${string}`, string>) => style;
