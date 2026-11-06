import { navigate } from '../lib/router';
import { apps, manifest } from './model';

const PROBLEMS = [
  {
    title: '改一处颜色，要改十几个地方',
    body: '设计稿改了，代码里散落着硬编码；下次再改，没人记得哪里漏了。',
    answer: '颜色、字号、间距只写一份 JSON，四个平台由编译器产出。',
  },
  {
    title: '多端、多品牌，组件被复制成好几套',
    body: '小程序一套、H5 一套、换个品牌再来一套，修 bug 要修三遍。',
    answer: '组件只认语义层；品牌是变量，产品是业务语义，页面结构不动。',
  },
  {
    title: 'AI 写的界面，一次一个样子',
    body: '模型每次都可能发明新的绿色、新的圆角，产出好看却不成体系。',
    answer: '模型只能引用已有 token；提案与配方在落盘前被机器拦一遍。',
  },
];

const DELIVERS = [
  { label: '一份源', value: '6 层 JSON', note: 'primitive / semantic / brand / product / component / layout' },
  { label: '四类产物', value: 'CSS · WXSS · TS · DTCG', note: '按产品拆分，只导出业务可见变量' },
  { label: '七道门禁', value: 'verify', note: '对比度、分层、白名单、硬编码、契约…' },
  { label: '两个闭环', value: '提案 · 配方', note: 'AI 想改 token 或拼页面，先过预检' },
];

const NOT = [
  { title: '不是 Figma 插件', body: '它不读设计稿，也不生成 Figma 图层；设计稿只是参考，定义落在 JSON 里。' },
  { title: '不是通用组件库', body: '组件只够这两个产品用，API 按契约收窄，不追求"什么场景都能拼"。' },
  { title: '不是低代码平台', body: '页面还是人和 AI 写代码，只是写之前先有契约、写之后先过门禁。' },
  { title: '不是黑盒代码生成', body: '产物全部提交入库，diff 就是评审对象；生成器不替你决定长什么样。' },
];

const STACK = ['DTCG 2025.10', 'Style Dictionary', 'Vite + React', 'Playwright', '微信小程序 WXSS'];

export const About = () => (
  <div className="about">
    <header className="page-head">
      <p className="eyebrow">关于 · About</p>
      <h1 className="page-title">这套东西是干什么用的</h1>
      <p className="page-lede">
        一句话：把"设计决定"变成可编译、可校验、可交付的工程资产。
        它面向的是这样一类项目——一个人或小团队，要同时做 Web 与小程序，要支持多个品牌，还想让 AI 参与编码。
      </p>
    </header>

    <section className="about-section" id="why">
      <header className="home-head">
        <p className="eyebrow">为什么做</p>
        <h2 className="home-title">三个反复出现的问题</h2>
      </header>
      <div className="about-grid">
        {PROBLEMS.map((item, index) => (
          <article className="about-card" key={item.title}>
            <span className="about-index">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="about-card-title">{item.title}</h3>
            <p className="about-problem">{item.body}</p>
            <p className="about-answer">{item.answer}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-section" id="delivers">
      <header className="home-head">
        <p className="eyebrow">交付什么</p>
        <h2 className="home-title">四样东西</h2>
      </header>
      <dl className="about-delivers">
        {DELIVERS.map((item) => (
          <div key={item.label}>
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
            <span>{item.note}</span>
          </div>
        ))}
      </dl>
    </section>

    <section className="about-section" id="not">
      <header className="home-head">
        <p className="eyebrow">边界</p>
        <h2 className="home-title">它不是什么</h2>
        <p className="home-note">把边界说清楚，比把能力说满更有用。</p>
      </header>
      <div className="about-grid about-grid-wide">
        {NOT.map((item) => (
          <article className="about-card" key={item.title}>
            <h3 className="about-card-title">{item.title}</h3>
            <p className="about-problem">{item.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="about-section" id="status">
      <header className="home-head">
        <p className="eyebrow">现在到哪了</p>
        <h2 className="home-title">一个 MVP，但有证据链</h2>
      </header>
      <div className="about-status">
        <dl>
          <div>
            <dt>产品</dt>
            <dd>{apps.length}</dd>
          </div>
          <div>
            <dt>排列</dt>
            <dd>{manifest.permutations}</dd>
          </div>
          <div>
            <dt>产物</dt>
            <dd>{manifest.artifacts.length}</dd>
          </div>
          <div>
            <dt>对比度</dt>
            <dd>{manifest.contrast.pairs}</dd>
          </div>
        </dl>
        <ul className="about-list">
          <li>7 个 ADR 记录取舍；决策页直接由 ADR 生成，不手写。</li>
          <li>16 个单测覆盖格式化与布局档位；6 张视觉基线锁住像素。</li>
          <li>提案与配方各有一组契约测试（1 通过 / 2 拦截、1 通过 / 1 拦截）。</li>
          <li>边界：还没有接真实小程序工程，真机截图脚本待接入。</li>
        </ul>
      </div>
    </section>

    <section className="about-section" id="who">
      <header className="home-head">
        <p className="eyebrow">谁做的 · Studio</p>
        <h2 className="home-title">Alro&apos;s studio</h2>
        <p className="home-note">设计工程 · 前端实现 · 设计系统</p>
      </header>
      <div className="about-who">
        <p>
          一个独立工作室，做设计工程与前端实现。这套管线来自自己的项目需求：一个人要同时维护 Web 与小程序、
          两套品牌、还要让 AI 参与交付，所以把"一致性"从人的记忆里搬进了编译器和门禁。
        </p>
        <p className="about-stack-line">
          技术底座：
          {STACK.map((item) => (
            <span className="about-tag" key={item}>
              {item}
            </span>
          ))}
        </p>
        <p className="about-sign-note">这个站本身就是这套系统的产物：页面用的是编译出来的同一批 token，改一处颜色，这里也会跟着变。</p>
        <p className="about-links">
          <button type="button" className="hero-cta" onClick={() => navigate('/method')}>
            看完整方法 →
          </button>
          <button type="button" className="hero-cta hero-cta-ghost" onClick={() => navigate('/')}>
            回到首页看案例
          </button>
        </p>
        <p className="about-sign-links">
          <a href="https://github.com/liquiid727/my-ant-design" target="_blank" rel="noreferrer">
            GitHub 仓库
          </a>
          <a href="https://github.com/liquiid727/my-ant-design/issues" target="_blank" rel="noreferrer">
            合作与咨询：开 issue
          </a>
        </p>
      </div>
    </section>

  </div>
);
