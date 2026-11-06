import { appLabel, brandsOf, manifest, perAppArtifacts } from './model';

const size = (bytes: number) => (bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`);

export const CompileBand = ({ app }: { app: string }) => {
  const stat = manifest.apps.find((item) => item.id === app) ?? manifest.apps[0];
  const artifacts = perAppArtifacts(app);

  const stages = [
    { key: 'source', index: '01', label: '源 · JSON', value: String(stat.tokens.total), unit: '个 token', note: '唯一真相，人可读' },
    { key: 'resolve', index: '02', label: '解析 · 别名', value: String(manifest.permutations), unit: '套排列', note: 'app × 品牌 × 主题' },
    { key: 'emit', index: '03', label: '产物 · 4 类', value: String(artifacts.filter((item) => item.kind !== 'json').length), unit: '个文件', note: 'CSS / WXSS / TS / DTCG' },
    { key: 'gate', index: '04', label: '门禁 · 7 条', value: String(manifest.contrast.pairs), unit: '组配对', note: `${manifest.contrast.failing} 项不达标` },
  ];

  return (
    <div className="band">
      <div className="band-stages">
        {stages.map((stage) => (
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
        {artifacts.slice(0, 12).map((artifact) => (
          <div className="artifact" key={artifact.file}>
            <p className="artifact-name">{artifact.name}</p>
            <p className="artifact-label">{artifact.label}</p>
            <p className="artifact-size">{size(artifact.bytes)}</p>
          </div>
        ))}
      </div>
      <p className="band-foot">
        {appLabel(app)} · {brandsOf(app).length} 品牌 × 2 主题 —— 改一处 primitive，以上产物与下面所有界面同时更新；diff 就是评审对象。
      </p>
    </div>
  );
};
