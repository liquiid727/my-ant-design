import { screensOf } from '../apps';
import { CopyButton } from '../components/code';
import { BrowserFrame } from '../components/web';
import { Button } from '../components/controls';
import { navigate } from '../lib/router';
import { EXAMPLES, type Example } from './examples';
import { NoirWeb } from './noir-web';
import { apps, brandsOf, bytes, manifest, perAppArtifacts } from './model';

const VALUE_LAYOUT = [
  {
    index: '01',
    title: '设计稿和代码不再各说各话',
    body: '颜色、字号、圆角、时长只写一次。改 JSON，四个平台的产物同时更新，不存在"改漏了某个页面"。',
    note: '一处定义 → 全部产物',
  },
  {
    index: '02',
    title: '多端、多品牌，不用复制组件',
    body: '组件只认语义层。换品牌是换一套变量，换产品是换一套业务语义——页面结构一行都不动。',
    note: `${apps.length} 产品 × ${brandsOf('ride').length} 品牌 × 2 主题 = ${manifest.permutations} 套排列`,
  },
  {
    index: '03',
    title: 'AI 可以生成，但不能发明样式',
    body: '模型只能引用已存在的 token，不够用就先提提案；提案与配方在落盘前都会被机器拦一遍。',
    note: '7 道门禁 · 提案 / 配方预检',
  },
];

const ExampleCard = ({ example }: { example: Example }) => {
  const screens = screensOf(example.app);
  const stat = manifest.apps.find((item) => item.id === example.app);
  const Screen = screens[0].component;
  const systemTokens = stat ? stat.tokens.public - (stat.tokens.byLayer.product ?? 0) : 0;

  if (!stat) return null;

  return (
    <article className="example-card">
      <div className="example-preview" data-medium={example.medium}>
        {example.medium === 'mobile' ? (
          <span className="example-shot" data-app={example.app} data-brand={example.brand} data-theme={example.theme}>
            <span className="example-shot-inner">
              <Screen />
            </span>
          </span>
        ) : (
          <span className="example-web" data-app={example.app} data-brand={example.brand} data-theme={example.theme}>
            <span className="example-web-scale">
              <BrowserFrame url={`${example.id}.alro.studio`} meta={`${example.app} · ${example.brand}`}>
                <NoirWeb />
              </BrowserFrame>
            </span>
          </span>
        )}
      </div>

      <div className="example-body">
        <p className="example-kicker">
          {example.kicker} · {example.medium === 'web' ? '1160 宽' : `${screens.length} 屏`}
        </p>
        <h3 className="example-title">{example.title}</h3>
        <p className="example-desc">{example.description}</p>
        <p className="example-scope">我做了什么 · {example.scope}</p>
        <p className="example-meta">
          {example.medium === 'web'
            ? `${systemTokens} 个系统 token · ${manifest.permutations} 套排列`
            : `${stat.tokens.public} 个公开 token · ${stat.tokens.byLayer.product ?? 0} 个产品语义`}
        </p>
        <div className="example-actions">
          <button type="button" className="case-cta" onClick={() => navigate(`/case/${example.id}`)}>
            进入示例 →
          </button>
          <button type="button" className="case-cta case-cta-ghost" onClick={() => navigate(`/matrix?app=${example.app}&brand=${example.brand}&theme=${example.theme}`)}>
            全部排列
          </button>
        </div>
      </div>
    </article>
  );
};

export const Home = () => {
  const rideArtifacts = perAppArtifacts('ride');
  const rideBytes = rideArtifacts.reduce((sum, item) => sum + item.bytes, 0);
  const publicTokens = manifest.apps.reduce((sum, app) => sum + app.tokens.public, 0);

  const VALUES_METRIC = [
    {
      value: String(manifest.artifacts.length),
      label: '个产物 / 一次编译',
      calc: [
        { text: 'tokens.css / wxss / ts：各 1 个', to: '/method/output' },
        {
          text: `dtcg：${rideArtifacts.filter((item) => item.kind === 'dtcg').length} 个（${brandsOf('ride').length} 品牌 × 2 主题）`,
          to: '/method/output',
        },
        { text: 'catalog / qa / design-context：3 个', to: '/method/output' },
        {
          text: `单个产品 ${rideArtifacts.length} 个 × ${apps.length} 个产品 = ${manifest.artifacts.length}`,
          to: '/method/output',
        },
      ],
    },
    {
      value: String(manifest.permutations),
      label: '套排列 / 同一批组件',
      calc: [
        { text: `${apps.length} 个产品 × ${brandsOf('ride').length} 个品牌 × 2 个主题`, to: '/matrix' },
        { text: '组件只有一份，排列只影响变量', to: '/method/process' },
      ],
    },
    {
      value: '7',
      label: '道门禁 / 硬编码零容忍',
      calc: [
        { text: '主题完整性 · 品牌白名单 · 分层方向 · 对比度', to: '/method/process' },
        { text: '契约可解析 · 禁止硬编码颜色 · 产品语义不越界', to: '/method/process' },
      ],
    },
  ];

  return (
    <div className="home">
      <header className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Alro&apos;s studio · Design engineering</p>
          <h1 className="hero-title">
            让设计和代码，
            <br />
            从同一份定义里长出来
          </h1>
          <p className="hero-lede">
            这不是一个组件库，也不是设计稿的还原服务。它把品牌、语义、组件、布局写成一份 JSON，
            再编译成 Web 与小程序真正能用的变量——并用门禁和像素基线守住它，让 AI 参与进来也不跑偏。
          </p>
          <div className="hero-actions">
            <Button onClick={() => navigate('/method')}>它是怎么做到的 →</Button>
            <Button variant="ghost" onClick={() => navigate('/about')}>
              关于这套东西
            </Button>
          </div>
          <dl className="hero-stats">
            <div>
              <dt>产品</dt>
              <dd>{apps.length}</dd>
              <span>骑行 / 记账</span>
            </div>
            <div>
              <dt>排列</dt>
              <dd>{manifest.permutations}</dd>
              <span>产品 × 品牌 × 主题</span>
            </div>
            <div>
              <dt>token</dt>
              <dd>{publicTokens}</dd>
              <span>业务可见</span>
            </div>
            <div>
              <dt>门禁</dt>
              <dd>7</dd>
              <span>阻断合并</span>
            </div>
          </dl>
        </div>

        <aside className="hero-panel">
          <p className="hero-panel-title">Token 管线 · 一次运行</p>
          <p className="hero-panel-lede">
            定义 → 编译 → 门禁 → 消费 → 回归。每个环节都有文件和命令，
            不依赖某个人的手感。
          </p>
          <ol className="hero-flow">
            <li>
              <span className="flow-index">源</span>
              <span className="flow-body">
                <strong>6 层 JSON</strong>
                <small>primitive / semantic / brand / product / component / layout</small>
              </span>
            </li>
            <li>
              <span className="flow-index">出</span>
              <span className="flow-body">
                <strong>
                  骑行 {rideArtifacts.length} 个产物 · {bytes(rideBytes)}
                </strong>
                <small>两个产品各一份，内部原色不导出</small>
              </span>
            </li>
            <li>
              <span className="flow-index">检</span>
              <span className="flow-body">
                <strong>7 条门禁 · {manifest.contrast.pairs} 组对比度</strong>
                <small>任何一条不过，合并就被拦住</small>
              </span>
            </li>
          </ol>
          <p className="hero-panel-foot">
            <span aria-hidden="true" />
            npm run tokens · 本次编译通过
          </p>
        </aside>
      </header>

      <section className="home-section" id="value">
        <header className="home-head">
          <p className="eyebrow">它解决什么</p>
          <h2 className="home-title">三个具体的麻烦</h2>
          <p className="home-note">不是"设计系统"这种抽象名词，是这三个会直接拖慢交付的问题。</p>
        </header>
        <ol className="values">
          {VALUE_LAYOUT.map((value, index) => (
            <li className="value" key={value.index}>
              <span className="value-index">{value.index}</span>
              <p className="value-metric">
                <strong>{VALUES_METRIC[index].value}</strong>
                <span>{VALUES_METRIC[index].label}</span>
              </p>
              <h3 className="value-title">{value.title}</h3>
              <p className="value-body">{value.body}</p>
              <code className="value-note">{value.note}</code>
              <details className="value-calc">
                <summary>怎么算的</summary>
                <ul>
                  {VALUES_METRIC[index].calc.map((line) => (
                    <li key={line.text}>
                      <button type="button" className="calc-link" onClick={() => navigate(line.to)}>
                        {line.text}
                      </button>
                    </li>
                  ))}
                </ul>
              </details>

            </li>
          ))}
        </ol>
      </section>

      <section className="home-section" id="cases">
        <header className="home-head home-head-row">
          <div>
            <p className="eyebrow">示例</p>
            <h2 className="home-title">三个示例，三种身份</h2>
            <p className="home-note">
              骑行与记账是移动端；Noir 是同一套组件的桌面 Web 立面。每个示例固定自己的品牌与主题，
              进入后只看这一种身份；想看全部组合，去「排列」。
            </p>
          </div>
          <button type="button" className="how-link" onClick={() => navigate('/matrix')}>
            全部 {manifest.permutations} 套排列 →
          </button>
        </header>
        <div className="examples">
          {EXAMPLES.map((example) => (
            <ExampleCard key={example.id} example={example} />
          ))}
        </div>
      </section>

      <section className="home-section" id="how">
        <header className="home-head">
          <p className="eyebrow">怎么做到</p>
          <h2 className="home-title">定义 → 编译 → 门禁 → 回归</h2>
          <p className="home-note">
            五个步骤，每一步都有命令与可检查的产物；两个 AI 闭环，在落盘之前就被机器拦一遍。
          </p>
        </header>
        <div className="how">
          <ol className="how-steps">
            <li>
              <span>01</span>
              <strong>定义</strong>
              <small>tokens / apps / brands</small>
            </li>
            <li>
              <span>02</span>
              <strong>编译</strong>
              <small>npm run tokens</small>
            </li>
            <li>
              <span>03</span>
              <strong>校验</strong>
              <small>npm run verify</small>
            </li>
            <li>
              <span>04</span>
              <strong>消费</strong>
              <small>css / wxss / ts / dtcg</small>
            </li>
            <li>
              <span>05</span>
              <strong>回归</strong>
              <small>npm run visual</small>
            </li>
          </ol>
          <button type="button" className="how-link" onClick={() => navigate('/method')}>
            看完整方法（流程、产物、生成方式）→
          </button>
        </div>
      </section>

      <section className="home-section start" id="start">
        <header className="home-head">
          <p className="eyebrow">开始</p>
          <h2 className="home-title">从零跑一遍</h2>
          <p className="home-note">三条命令，不需要设计稿，也不需要后端：仓库里带着两套产品、全部产物和门禁。</p>
        </header>
        <ol className="start-steps">
          <li>
            <span className="start-index">01</span>
            <span className="start-cmd">
              <code>git clone git@github.com:liquiid727/my-ant-design.git</code>
              <CopyButton text="git clone git@github.com:liquiid727/my-ant-design.git" className="start-copy" />
            </span>
            <small>公开仓库，只有 main 一条线</small>
          </li>
          <li>
            <span className="start-index">02</span>
            <span className="start-cmd">
              <code>cd design-lab &amp;&amp; npm install</code>
              <CopyButton text="cd design-lab && npm install" className="start-copy" />
            </span>
            <small>只装一次；不需要额外的设计工具</small>
          </li>
          <li>
            <span className="start-index">03</span>
            <span className="start-cmd">
              <code>npm run dev</code>
              <CopyButton text="npm run dev" className="start-copy" />
            </span>
            <small>localhost:4517 · 改 token 会即时重编译</small>
          </li>
        </ol>
      </section>
    </div>
  );
};
