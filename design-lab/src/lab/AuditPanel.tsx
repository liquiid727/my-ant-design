import { manifest, qaFor, valueOf } from './model';

const rowsFor = (app: string, brand: string) => {
  const qa = qaFor(app);
  return (qa.results[`${brand}.light`] ?? []).map((light) => {
    const dark = (qa.results[`${brand}.dark`] ?? []).find((item) => item.id === light.id);
    return {
      ...light,
      darkRatio: dark?.ratio ?? null,
      darkPass: dark?.pass ?? false,
      darkFg: dark?.fgValue,
      darkBg: dark?.bgValue,
    };
  });
};

const Status = ({ pass }: { pass: boolean }) => (
  <span className="audit-status" data-pass={pass}>
    {pass ? '通过' : '不达标'}
  </span>
);

export const AuditPanel = ({ app, brand }: { app: string; brand: string }) => {
  const rows = rowsFor(app, brand);
  const failing = rows.filter((row) => !row.pass || !row.darkPass).length;

  return (
    <div className="audit">
      <div className="audit-facts">
        <div className="audit-fact">
          <p className="audit-fact-value">{manifest.contrast.pairs}</p>
          <p className="audit-fact-label">对比度配对</p>
          <p className="audit-fact-note">浅色 + 深色各跑一遍</p>
        </div>
        <div className="audit-fact">
          <p className="audit-fact-value">{failing}</p>
          <p className="audit-fact-label">不达标</p>
          <p className="audit-fact-note">有任何一条即阻断合并</p>
        </div>
        <div className="audit-fact">
          <p className="audit-fact-value">{valueOf(app, brand, 'size.touch-min', 'light').replace('px', '')}</p>
          <p className="audit-fact-label">最小触控</p>
          <p className="audit-fact-note">px；换算成 rpx 后仍达标</p>
        </div>
        <div className="audit-fact">
          <p className="audit-fact-value">{valueOf(app, brand, 'border.width.hairline', 'light').replace('px', '')}</p>
          <p className="audit-fact-label">发丝线</p>
          <p className="audit-fact-note">px；不随屏宽缩放</p>
        </div>
      </div>

      <div className="table-scroll">
      <table className="audit-table">
        <thead>
          <tr>
            <th>配对</th>
            <th>用途</th>
            <th className="num">浅色</th>
            <th className="num">深色</th>
            <th className="num">门槛</th>
            <th>状态</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <span className="audit-pair">
                  <span className="audit-chip" style={{ background: row.fgValue }} />
                  <span className="audit-chip" style={{ background: row.bgValue }} />
                  <span className="audit-divider" aria-hidden="true" />
                  <span className="audit-chip" style={{ background: row.darkFg }} />
                  <span className="audit-chip" style={{ background: row.darkBg }} />
                </span>
                <code className="audit-id">{row.id}</code>
              </td>
              <td className="audit-use">{row.note}</td>
              <td className="num">{row.ratio?.toFixed(2)}</td>
              <td className="num">{row.darkRatio?.toFixed(2)}</td>
              <td className="num">{row.min}</td>
              <td>
                <Status pass={row.pass && row.darkPass} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};
