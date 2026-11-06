import { brands, bytes, manifest } from './model';

const STAGES = [
  { key: 'source', index: '01', label: '源 · JSON', value: `${manifest.tokens.total}`, unit: '个 token', note: '唯一真相，人可读' },
  { key: 'resolve', index: '02', label: '解析 · 别名', value: `${manifest.permutations}`, unit: '套排列', note: '循环、链式引用交给解析器' },
  { key: 'emit', index: '03', label: '产物 · 4 类', value: `${manifest.artifacts.filter((item) => item.kind !== 'catalog' && item.kind !== 'qa' && item.kind !== 'design-context' && item.kind !== 'manifest').length}`, unit: '个文件', note: 'CSS / WXSS / TS / DTCG' },
  { key: 'gate', index: '04', label: '门禁 · 6 条', value: `${manifest.contrast.pairs}`, unit: '组配对', note: `${manifest.contrast.failing} 项不达标` },
];

export const CompileBand = () => (
  <div className="band">
    <div className="band-stages">
      {STAGES.map((stage) => (
        <div className="stage" key={stage.key}>
          <p className="stage-index">{stage.index}</p>
          <p className="stage-label">{stage.label}</p>
          <p className="stage-value">
            {stage.value}
            <span className="stage-unit">{stage.unit}</span>
          </p>
          <p className="stage-note">{stage.note}</p>
        </div>
      ))}
    </div>
    <div className="band-artifacts">
      {manifest.artifacts
        .filter((artifact) => artifact.kind !== 'manifest')
        .map((artifact) => (
          <div className="artifact" key={artifact.file}>
            <p className="artifact-name">{artifact.name}</p>
            <p className="artifact-label">{artifact.label}</p>
            <p className="artifact-size">{bytes(artifact.bytes)}</p>
          </div>
        ))}
    </div>
    <p className="band-foot">
      {brands.map((brand) => `${brand.label} · ${brand.latin}`).join('  /  ')} — 改一处 primitive，以上产物与下面三块屏幕同时更新；diff 就是评审对象。
    </p>
  </div>
);
