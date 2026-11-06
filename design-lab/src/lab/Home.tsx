import { screensOf } from '../apps';
import { CopyButton } from '../components/code';
import { BrowserFrame } from '../components/web';
import { Button } from '../components/controls';
import { navigate } from '../lib/router';
import brandCycling from '../assets/home/brand-cycling.png';
import brandLedger from '../assets/home/brand-ledger.png';
import brandNoir from '../assets/home/brand-noir.png';
import { EXAMPLES, type Example } from './examples';
import { NoirWeb } from './noir-web';
import { apps, brandsOf, bytes, manifest, perAppArtifacts, valueOf } from './model';

/** 三张证据卡：每张都放一个能查证的东西，不再用三段话解释。 */
const BRAND_SHOTS = [
  { id: 'cycling', label: '骑行包 · 鼠尾草', src: brandCycling },
  { id: 'ledger', label: '记账包 · 朱砂', src: brandLedger },
  { id: 'noir', label: 'Noir · 黑白', src: brandNoir },
];

const GATES = ['主题完整性', '品牌白名单', '分层方向', '对比度', '契约可解析', '禁止硬编码颜色', '产品语义不越界'];

const EVIDENCE = [
  {
    index: '01',
    title: '改一处，四个平台同时变',
    body: '颜色、字号、时长只写一次；CSS、WXSS、TS、DTCG 全部从同一份 JSON 编译出来。',
    metric: `4 个平台 · ${manifest.artifacts.length} 个产物`,
  },
  {
    index: '02',
    title: '同一批组件，换品牌就换一套',
    body: '产品语义和页面结构不动，只换品牌包——三套身份，组件代码一行没改。',
    metric: `${brandsOf('ride').length} 个品牌 × 2 个主题`,
  },
  {
    index: '03',
    title: 'AI 能生成，但不能发明样式',
    body: '模型只能引用已有 token；提案与配方在落盘前先被机器拦一遍。',
    metric: `${GATES.length} 道门禁 · 硬编码零容忍`,
  },
];

const FLOW = [
  { index: '01', label: '定义', cmd: 'tokens / apps / brands', meta: '6 层 JSON' },
  { index: '02', label: '编译', cmd: 'npm run tokens', meta: `${manifest.artifacts.length} 个产物` },
  { index: '03', label: '校验', cmd: 'npm run verify', meta: `${GATES.length} 道门禁` },
  { index: '04', label: '消费', cmd: 'css / wxss / ts / dtcg', meta: '4 个平台' },
  { index: '05', label: '回归', cmd: 'npm run visual', meta: '6 张基线' },
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
          <p className="eyebrow">三个证据</p>
          <h2 className="home-title">不是口号，是能查到的三件事</h2>
          <p className="home-note">每张卡里的数字、截图和值都来自仓库里的产物；想追，链接都通到源文件。</p>
        </header>

        <ol className="evidence">
          <li className="ev-card">
            <div className="ev-shot ev-token">
              <div className="ev-token-head">
                <span className="ev-token-path">color.action.primary</span>
                <span className="ev-token-layer">semantic</span>
              </div>
              <div className="ev-token-values">
                <span>
                  <i className="ev-swatch" style={{ background: valueOf('ride', 'cycling', 'color.action.primary', 'light') }} />
                  <code>{valueOf('ride', 'cycling', 'color.action.primary', 'light')}</code>
                  <small>浅色</small>
                </span>
                <span>
                  <i className="ev-swatch" style={{ background: valueOf('ride', 'cycling', 'color.action.primary', 'dark') }} />
                  <code>{valueOf('ride', 'cycling', 'color.action.primary', 'dark')}</code>
                  <small>深色</small>
                </span>
              </div>
              <p className="ev-compile">
                <span>一次编译</span>
                <span aria-hidden="true">→</span>
                <span>4 个目标</span>
              </p>
              <ul className="ev-targets">
                <li>CSS</li>
                <li>WXSS</li>
                <li>TS</li>
                <li>DTCG</li>
              </ul>
            </div>
            <span className="ev-index">{EVIDENCE[0].index}</span>
            <h3 className="ev-title">{EVIDENCE[0].title}</h3>
            <p className="ev-body">{EVIDENCE[0].body}</p>
            <p className="ev-metric">{EVIDENCE[0].metric}</p>
          </li>

          <li className="ev-card">
            <div className="ev-shot ev-phones">
              {BRAND_SHOTS.map((brand) => (
                <figure key={brand.id}>
                  <img src={brand.src} alt={`${brand.label} 下的同一个首页`} width={300} height={567} loading="lazy" />
                  <figcaption>{brand.label}</figcaption>
                </figure>
              ))}
            </div>
            <span className="ev-index">{EVIDENCE[1].index}</span>
            <h3 className="ev-title">{EVIDENCE[1].title}</h3>
            <p className="ev-body">{EVIDENCE[1].body}</p>
            <p className="ev-metric">{EVIDENCE[1].metric}</p>
          </li>

          <li className="ev-card">
            <div className="ev-shot ev-gates">
              <ul>
                {GATES.map((gate) => (
                  <li key={gate}>
                    <span aria-hidden="true">✓</span>
                    {gate}
                  </li>
                ))}
              </ul>
              <p className="ev-blocked">
                <span aria-hidden="true">✕</span>
                示例：主色换深绿 → on-primary 1.52:1
              </p>
            </div>
            <span className="ev-index">{EVIDENCE[2].index}</span>
            <h3 className="ev-title">{EVIDENCE[2].title}</h3>
            <p className="ev-body">{EVIDENCE[2].body}</p>
            <p className="ev-metric">{EVIDENCE[2].metric}</p>
          </li>
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
        <header className="home-head home-head-row">
          <div>
            <p className="eyebrow">怎么做到</p>
            <h2 className="home-title">一条流水线，五个动作</h2>
            <p className="home-note">每一步都有命令和产物；跑一遍就能看到，不用信任何描述。</p>
          </div>
          <button type="button" className="how-link" onClick={() => navigate('/method')}>
            看完整方法 →
          </button>
        </header>
        <ol className="flow">
          {FLOW.map((item) => (
            <li key={item.index}>
              <span className="flow-step">{item.index}</span>
              <strong>{item.label}</strong>
              <code>{item.cmd}</code>
              <small>{item.meta}</small>
            </li>
          ))}
        </ol>
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
