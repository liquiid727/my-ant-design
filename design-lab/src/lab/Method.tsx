import { Fragment, useEffect, useState } from 'react';
import { CodeBlock } from '../components/code';
import { Segmented } from '../components/controls';
import { apps, bytes, changeOf, changes, manifest, perAppArtifacts } from './model';

const STEPS = [
  {
    index: '01',
    title: '定义',
    body: '一份人可读的 JSON：色阶、语义、组件、产品、品牌、布局六层分开写，品牌只能覆盖白名单。',
    note: 'tokens / apps / brands',
  },
  {
    index: '02',
    title: '编译',
    body: '解析别名与循环，把 px 换算成 rpx，只导出业务可见的变量，按产品拆产物。',
    note: 'npm run tokens',
  },
  {
    index: '03',
    title: '校验',
    body: '七道门禁：主题完整性、品牌白名单、分层方向、对比度、契约、硬编码、产品边界。',
    note: 'npm run verify',
  },
  {
    index: '04',
    title: '消费',
    body: 'Web 走 CSS 变量，小程序走 WXSS 与运行时，TS 给类型，DTCG 给外部工具，上下文给 AI。',
    note: 'css / wxss / ts / dtcg',
  },
  {
    index: '05',
    title: '回归',
    body: '像素基线锁住肉眼可见的变化；提案与配方再做两道预检，AI 改不动样式。',
    note: 'npm run visual',
  },
];

const USAGE = [
  { label: 'Web', code: "import './tokens.{app}.css'", note: '根节点带 data-app / data-brand / data-theme' },
  { label: '小程序', code: '@import "tokens.wxss"', note: 'runtime/layout.js 负责断点 class' },
  { label: '外部工具', code: 'dtcg/*.tokens.json', note: 'DTCG 2025.10，只含业务可见 token' },
  { label: 'AI', code: 'design-context.{app}.json', note: '唯一输入：token + 契约 + 硬规则' },
];

const ChangeBadge = ({ name, count }: { name: string; count: number }) => {
  const change = changeOf(name);
  if (count > 1) return <span className="change-badge">{count} 个变化</span>;
  if (!change) return <span className="change-none">—</span>;
  if (change.status === 'added') return <span className="change-badge">新增</span>;
  if (change.added === null) return <span className="change-badge">二进制</span>;
  return (
    <span className="change-badge">
      +{change.added} / −{change.removed}
    </span>
  );
};

export const Method = ({ focus }: { focus?: string }) => {
  const [outputApp, setOutputApp] = useState(apps[0].id);
  const [showDtcg, setShowDtcg] = useState(false);

  useEffect(() => {
    if (!focus) return;
    const frame = requestAnimationFrame(() => {
      document.getElementById(focus)?.scrollIntoView({ block: 'start' });
    });
    return () => cancelAnimationFrame(frame);
  }, [focus]);

  const artifacts = perAppArtifacts(outputApp);
  const totalBytes = artifacts.reduce((sum, item) => sum + item.bytes, 0);

  // DTCG 是品牌 × 明暗的笛卡尔积，折成一行，需要时再展开
  const dtcgRows = artifacts.filter((artifact) => artifact.kind === 'dtcg');
  const tableRows: {
    key: string;
    name: string;
    label: string;
    size: number;
    changed: number;
    children?: typeof artifacts;
  }[] = [];
  let dtcgAdded = false;

  for (const artifact of artifacts) {
    if (artifact.kind === 'dtcg') {
      if (!dtcgAdded) {
        dtcgAdded = true;
        const changedDtcg = dtcgRows.filter((item) => changeOf(item.name));
        tableRows.push({
          key: 'dtcg',
          name: 'dtcg/*.tokens.json',
          label: `DTCG · ${dtcgRows.length} 个文件（品牌 × 明暗）`,
          size: dtcgRows.reduce((sum, item) => sum + item.bytes, 0),
          changed: changedDtcg.length,
          children: dtcgRows,
        });
      }
      continue;
    }
    const change = changeOf(artifact.name);
    tableRows.push({
      key: artifact.file,
      name: artifact.name,
      label: artifact.label,
      size: artifact.bytes,
      changed: change ? 1 : 0,
    });
  }

  return (
    <div className="method">
      <header className="page-head">
        <p className="eyebrow">方法 · How it works</p>
        <h1 className="page-title">五步，从决定到产物</h1>
        <p className="page-lede">
          每一步都有对应的命令和可检查的产物。没有"只存在于设计稿里的规则"，也没有"只在某个人脑子里"的约定。
        </p>
      </header>

      <section className="home-section" id="process">
        <ol className="steps">
          {STEPS.map((step) => (
            <li className="step" key={step.index}>
              <span className="step-index">{step.index}</span>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-body">{step.body}</p>
              <code className="step-note">{step.note}</code>
            </li>
          ))}
        </ol>
      </section>

      <section className="home-section" id="generation">
        <header className="home-head">
          <p className="eyebrow">生成方式</p>
          <h2 className="home-title">让 AI 生成，但不许它发明样式</h2>
        </header>
        <div className="generation">
          <div className="generation-copy">
            <p>
              两个闭环，都由机器可读的契约驱动。Agent 想加颜色，得先交一份 Token 提案；想拼页面，
              得先写一份页面配方——两者都会在没有落盘之前被拦下。
            </p>
            <ul className="generation-list">
              <li>
                <strong>提案</strong>
                <span>结构 / 白名单 / 影响面 / 对比度 / 主题完整性</span>
              </li>
              <li>
                <strong>配方</strong>
                <span>组件在契约里 / props 匹配 / token 公开 / 不许写颜色</span>
              </li>
              <li>
                <strong>落盘后</strong>
                <span>verify 七道门禁 → 视觉基线 → 人工 review</span>
              </li>
            </ul>
            <p className="generation-quote">
              “AI 默认不能创造新的颜色、间距、圆角。不够用，就先提扩展建议。”——这是我们给 Agent 的唯一硬约束。
            </p>
          </div>

          <CodeBlock
            code={`# 1. 想改 token：先交提案，预检通过才落盘
npm run proposal -- agents/examples/01-add-night-notice.json

# 2. 想拼页面：先写配方，组件与 props 必须落在契约内
npm run recipe   -- agents/examples/04-ride-home.recipe.json

# 3. 落盘之后：七道门禁 + 视觉基线
npm run verify
npm run visual`}
          />
        </div>
      </section>

      <section className="home-section" id="output">
        <header className="home-head">
          <div className="home-head-row">
            <div>
              <p className="eyebrow">交付物 · Artifacts</p>
              <h2 className="home-title">可以直接取用的产物</h2>
            </div>
            <Segmented
              label="查看哪个产品的产物"
              value={outputApp}
              options={apps.map((app) => ({ id: app.id, label: app.label }))}
              onChange={setOutputApp}
            />
          </div>
          <p className="home-note">
            文件都在 <code>src/generated</code> 下，Web、小程序、外部工具、AI 各取所需，按产品分开。
            想看某个 token 的值，去示例页的 Token 表；想看这次编译改了什么，看最右一列。
          </p>
          <p className="output-change">
            {changes.available && changes.summary.changed > 0 ? (
              <>
                本次编译改动 <strong>{changes.summary.changed}</strong> 个产物（+{changes.summary.added} / −{changes.summary.removed} 行）
              </>
            ) : (
              <>本次编译没有产物变化 —— 工作区里的生成物和 HEAD 一致</>
            )}
          </p>
        </header>

        <div className="output">
          <table className="output-table">
            <thead>
              <tr>
                <th>文件</th>
                <th>形态</th>
                <th className="num">体积</th>
                <th>本次编译</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <Fragment key={row.key}>
                  <tr className={row.children ? 'output-group' : undefined}>
                    <td>
                      <code>{row.name}</code>
                      {row.children ? (
                        <button type="button" className="output-toggle" onClick={() => setShowDtcg((value) => !value)}>
                          {showDtcg ? '收起' : '展开'}
                        </button>
                      ) : null}
                    </td>
                    <td className="output-kind">{row.label}</td>
                    <td className="num">{bytes(row.size)}</td>
                    <td>
                      <ChangeBadge name={row.name} count={row.changed} />
                    </td>
                  </tr>
                  {row.children && showDtcg
                    ? row.children.map((child) => (
                        <tr key={child.file} className="output-child">
                          <td>
                            <code>{child.name}</code>
                          </td>
                          <td className="output-kind">{child.label}</td>
                          <td className="num">{bytes(child.bytes)}</td>
                          <td>
                            <ChangeBadge name={child.name} count={changeOf(child.name) ? 1 : 0} />
                          </td>
                        </tr>
                      ))
                    : null}
                </Fragment>
              ))}
            </tbody>
          </table>

          <div className="usage">
            <p className="usage-title">这些文件给谁用</p>
            {USAGE.map((item) => (
              <div className="usage-row" key={item.label}>
                <span className="usage-label">{item.label}</span>
                <span className="usage-body">
                  <code>{item.code.replace(/\{app\}/g, outputApp)}</code>
                  <small>{item.note}</small>
                </span>
              </div>
            ))}
            <p className="output-total">
              合计 <strong>{bytes(totalBytes)}</strong>，全部由 <code>npm run tokens</code> 生成；产物提交入库，diff 就是评审对象。
            </p>
          </div>
        </div>
      </section>

      <footer className="method-foot">
        <p>
          想先跑一遍？<a href="#/workbench">去工作台，从一个品牌色生成一套 token</a>；或<a href="#/">回到首页看三个示例</a>。
        </p>
        <p className="method-stat">
          {manifest.permutations} 套排列 · {manifest.artifacts.length} 个产物 · {manifest.contrast.pairs} 组对比度
        </p>
      </footer>
    </div>
  );
};
