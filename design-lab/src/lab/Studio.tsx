// allow-hardcoded-file: Studio 处理的是用户图片与生成结果，默认色/透明占位不是页面样式
import { useEffect, useMemo, useRef, useState } from 'react';
import { CopyButton } from '../components/code';
import { Button, Segmented, TextInput } from '../components/controls';
import { pushToast } from '../components/toast';
import { analyzeImage, deltaE, loadImage, type Cluster, type Profile, type Role } from '../workbench/analysis';
import { deriveRecipe, readPixels, renderAndDiff, type DiffResult, type Recipe } from '../workbench/recipe';
import { buildMessages, validateRecipe, type ComponentSpec, type PageRecipe } from '../workbench/mapping';
import { chatComplete, extractJson } from '../workbench/llm';
import rideContextJson from '../generated/design-context.ride.json';
import ledgerContextJson from '../generated/design-context.ledger.json';
import rideCatalogJson from '../generated/catalog.ride.json';
import ledgerCatalogJson from '../generated/catalog.ledger.json';
import { generatePack } from '../workbench/generate';
import { DEFAULT_IMAGE, DEFAULT_TEXT, generateImages, loadImageProvider, loadTextProvider, subscribeProviders, type ImageProvider, type TextProvider } from '../workbench/provider';
import { openProviderSettings } from '../components/provider-settings';
import { RecipeCanvas, SUPPORTED } from './RecipeCanvas';
import { DEMO_RECIPES } from '../workbench/demo';
import { DeviceChrome } from '../components/device-chrome';
import { deviceById, renderDevices } from '../lib/devices';
import type { ThemeName } from './model';

const STEPS = [
  { id: 1, label: '生成 / 导入', note: '出图，或拖入你已有的参考图' },
  { id: 2, label: '分析', note: '抽配色，确认每个角色的归属' },
  { id: 3, label: '归一与调校', note: '把抽到的色重新长成一套系统' },
  { id: 4, label: '导出与校验', note: '对比、门禁、落盘' },
] as const;

type StepId = (typeof STEPS)[number]['id'];

type Shot = { id: string; src: string; from: 'model' | 'local' };

const DEVICES = renderDevices();

type DeviceId = string;

const ROLE_LABEL: Record<Role, string> = {
  background: '背景',
  surface: '卡片',
  accent: '强调',
  ink: '文字',
};

const DEFAULT_PROMPT =
  '移动端骑行 App 首页 UI，自然杂志风格：米白背景、鼠尾草绿点缀、衬线标题、大留白、iOS 截图比例，无任何水印与说明文字';

const seedFromProfile = (profile: Profile | null) => profile?.roles.accent?.hex ?? '#B7CE5E';

type AppId = 'ride' | 'ledger';

const CONTEXTS: Record<AppId, { components: ComponentSpec[] }> = {
  ride: rideContextJson as unknown as { components: ComponentSpec[] },
  ledger: ledgerContextJson as unknown as { components: ComponentSpec[] },
};

const PUBLIC_TOKENS: Record<AppId, Set<string>> = {
  ride: new Set(
    (rideCatalogJson as unknown as { brands: { tokens: { path: string; public: boolean }[] }[] }).brands[0].tokens
      .filter((token) => token.public)
      .map((token) => token.path),
  ),
  ledger: new Set(
    (ledgerCatalogJson as unknown as { brands: { tokens: { path: string; public: boolean }[] }[] }).brands[0].tokens
      .filter((token) => token.public)
      .map((token) => token.path),
  ),
};

export const Studio = ({
  sample,
  device: deviceParam,
  brand: brandParam,
  width: widthParam,
  landscape: landscapeParam,
  theme,
  onTheme,
}: {
  sample?: boolean;
  device?: string;
  brand?: string;
  width?: number;
  landscape?: boolean;
  theme: ThemeName;
  onTheme: (theme: ThemeName) => void;
}) => {
  const [step, setStep] = useState<StepId>(1);
  const [image, setImage] = useState<ImageProvider>(DEFAULT_IMAGE);
  const [text, setText] = useState<TextProvider>(DEFAULT_TEXT);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [shots, setShots] = useState<Shot[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [status, setStatus] = useState<{ kind: 'idle' | 'busy' | 'ok' | 'error'; message?: string }>({ kind: 'idle' });

  const [seed, setSeed] = useState('#B7CE5E');
  const [font, setFont] = useState<'serif' | 'sans'>('serif');
  const [radius, setRadius] = useState<'small' | 'medium' | 'large'>('medium');
  const [label, setLabel] = useState('新品牌');
  const [latin, setLatin] = useState('Studio Brand');
  const [customId, setCustomId] = useState<string | null>(null);
  const [rebuild, setRebuild] = useState<{ recipe: Recipe; diff: DiffResult } | null>(null);
  const [rebuildState, setRebuildState] = useState<'idle' | 'busy' | 'error'>('idle');
  const [targetApp, setTargetApp] = useState<AppId>('ride');
  const [renderBrand, setRenderBrand] = useState<'generated' | 'cycling' | 'ledger' | 'noir'>(
    (brandParam as 'cycling' | 'ledger' | 'noir' | undefined) ?? 'generated',
  );
  const [device, setDevice] = useState<DeviceId>(deviceById(deviceParam)?.id ?? 'se');
  const [landscape, setLandscape] = useState(Boolean(landscapeParam));
  const [zoom, setZoom] = useState<'auto' | 50 | 75 | 100>('auto');
  const [customWidth, setCustomWidth] = useState<number | null>(
    widthParam && widthParam >= 320 && widthParam <= 1600 ? Math.round(widthParam) : null,
  );
  const [mapping, setMapping] = useState<{ recipe: PageRecipe | null; errors: string[]; attempts: number } | null>(null);
  const [mappingState, setMappingState] = useState<'idle' | 'busy' | 'error'>('idle');
  const [outputTheme, setOutputTheme] = useState<ThemeName | 'recipe' | 'page-recipe'>('light');

  const fileInput = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLDivElement | null>(null);
  const [measured, setMeasured] = useState<{ w: number; h: number } | null>(null);
  const shotsRef = useRef<Shot[]>([]);
  shotsRef.current = shots;

  // ?sample=1：用内置配方直接看渲染，不需要模型和 Key
  useEffect(() => {
    if (!sample) return;
    setMapping({ recipe: DEMO_RECIPES[targetApp], errors: [], attempts: 0 });
    setStep(4);
  }, [sample, targetApp]);

  useEffect(() => {
    const sync = () => {
      setImage(loadImageProvider());
      setText(loadTextProvider());
    };
    sync();
    return subscribeProviders(sync);
  }, []);

  // 换步骤时清掉上一页的状态提示，避免它跟着跑
  useEffect(() => {
    setStatus({ kind: 'idle' });
  }, [step]);

  const id = useMemo(() => {
    const fromLabel = label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    const fromLatin = latin
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    return customId ?? (fromLabel || fromLatin || 'brand');
  }, [customId, label, latin]);

  const pack = useMemo(() => generatePack({ id, label, latin, seed, font, radius }), [id, label, latin, seed, font, radius]);
  const resolved = theme === 'light' ? pack.light.resolved : pack.dark.resolved;
  const deviceInfo = deviceById(device);
  const baseWidth = customWidth ?? deviceInfo?.width ?? 375;
  const baseHeight = deviceInfo ? Math.round(baseWidth * (deviceInfo.height / deviceInfo.width)) : Math.round(baseWidth * 1.8);
  const effectiveWidth = landscape ? baseHeight : baseWidth;
  const frameHeight = landscape ? baseWidth : null;
  // 横屏只换尺寸，不换设备类型（横过来的手机还是手机）
  const effectiveKind = customWidth
    ? customWidth >= 900
      ? 'desktop'
      : customWidth >= 600
        ? 'tablet'
        : 'phone'
    : (deviceInfo?.kind ?? 'phone');
  const reference = shots.find((shot) => shot.id === selected) ?? null;

  /** 选中一张图就立刻分析，省一次点击 */
  useEffect(() => {
    if (!selected) return;
    const shot = shotsRef.current.find((item) => item.id === selected);
    if (!shot) return;
    let cancelled = false;
    setStatus({ kind: 'busy', message: '正在分析配色…' });
    analyzeImage(shot.src)
      .then((result) => {
        if (cancelled) return;
        setProfile(result);
        setSeed(seedFromProfile(result));
        setStatus({ kind: 'ok', message: `分析完成 · ${result.clusters.length} 个色簇` });
      })
      .catch((error: Error) => {
        if (cancelled) return;
        setStatus({ kind: 'error', message: error.message });
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const runGeneration = async () => {
    setStatus({ kind: 'busy', message: '正在生成…' });
    try {
      const urls = await generateImages(image, prompt);
      const next = urls.map((src, index) => ({ id: `model-${Date.now()}-${index}`, src, from: 'model' as const }));
      setShots((current) => [...next, ...current]);
      setSelected(next[0]?.id ?? null);
      setStatus({ kind: 'ok', message: `生成 ${urls.length} 张` });
      setStep(2);
    } catch (error) {
      setStatus({ kind: 'error', message: (error as Error).message });
    }
  };

  const importFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const loaded = await Promise.all(
      [...files].slice(0, 6).map(
        (file) =>
          new Promise<Shot>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ id: `local-${Date.now()}-${file.name}`, src: String(reader.result), from: 'local' });
            reader.onerror = () => reject(new Error('读取图片失败'));
            reader.readAsDataURL(file);
          }),
      ),
    );
    setShots((current) => [...loaded, ...current]);
    setSelected(loaded[0]?.id ?? null);
    setStep(2);
  };

  const assignRole = (role: Role, cluster: Cluster) => {
    setProfile((current) => {
      if (!current) return current;
      if (role === 'accent') setSeed(cluster.hex);
      return {
        ...current,
        roles: { ...current.roles, [role]: cluster },
        confidence: { ...current.confidence, [role]: 1 },
      };
    });
  };

  // 进入第 4 步时重建：把参考图变成配方，再用 token 画一遍，逐像素比
  useEffect(() => {
    if (step !== 4 || !reference) return;
    let cancelled = false;
    setRebuildState('busy');
    (async () => {
      const image = await loadImage(reference.src);
      const pixels = readPixels(image, 240);
      const background = profile?.roles.background?.hex ?? '#FFFFFF';
      const accent = resolved['color.action.primary'];
      const recipe = deriveRecipe(pixels, background, accent);
      const diff = renderAndDiff(pixels, recipe, { accent, ink: resolved['color.ink.primary'] });
      if (cancelled) return;
      setRebuild({ recipe, diff });
      setRebuildState('idle');
    })().catch(() => {
      if (!cancelled) setRebuildState('error');
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, reference, seed, theme]);

  const runMapping = async () => {
    if (!rebuild) return;
    setMappingState('busy');
    setMapping({ recipe: null, errors: [], attempts: 0 });
    let errors: string[] = [];
    let recipe: PageRecipe | null = null;
    let attempts = 0;

    try {
      // 最多两轮：第二轮把校验错误喂回去，让模型自己修
      for (let round = 0; round < 2; round += 1) {
        attempts += 1;
        const messages = buildMessages(rebuild.recipe, CONTEXTS[targetApp].components, targetApp, errors);
        const reply = await chatComplete(text, messages);
        const parsed = extractJson(reply) as PageRecipe;
        errors = validateRecipe(parsed, {
          app: targetApp,
          components: CONTEXTS[targetApp].components,
          publicTokens: PUBLIC_TOKENS[targetApp],
        });
        recipe = parsed;
        if (!errors.length) break;
      }
      setMapping({ recipe, errors, attempts });
      setMappingState('idle');
    } catch (error) {
      setMappingState('error');
      setMapping({ recipe: null, errors: [(error as Error).message], attempts });
    }
  };

  // 同一份配方，换品牌就换一套变量：这就是"页面不感知品牌"的证据
  const brandTokens = useMemo(() => {
    if (renderBrand === 'generated') return null;
    // 配方属于哪个产品，就用那个产品的 catalog；只换品牌包，产品语义保持不变
    const catalog = targetApp === 'ride' ? rideCatalogJson : ledgerCatalogJson;
    const brands = (
      catalog as unknown as {
        brands: { id: string; tokens: { path: string; values: { light: string; dark: string } }[] }[];
      }
    ).brands;
    const picked = brands.find((brand) => brand.id === renderBrand) ?? brands[0];
    return picked.tokens;
  }, [renderBrand, targetApp]);

  const recipeVars = useMemo(() => {
    const entries = brandTokens
      ? brandTokens.map((token) => [`--${token.path.replace(/\./g, '-')}`, theme === 'light' ? token.values.light : token.values.dark])
      : Object.entries(resolved).map(([path, value]) => [`--${path.replace(/\./g, '-')}`, value]);
    return Object.fromEntries(entries) as React.CSSProperties;
  }, [brandTokens, theme, resolved]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (sample) params.set('sample', '1');
    if (device !== 'se') params.set('device', device);
    if (renderBrand !== 'generated') params.set('brand', renderBrand);
    if (customWidth) params.set('w', String(customWidth));
    if (landscape) params.set('o', 'land');
    const query = params.toString();
    window.history.replaceState(null, '', query ? `#/studio?${query}` : '#/studio');
  }, [device, renderBrand, customWidth, landscape, sample]);

  // 实际渲染出来的像素尺寸，方便对齐截图
  useEffect(() => {
    const node = phoneRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      const rect = node.getBoundingClientRect();
      setMeasured({ w: Math.round(rect.width), h: Math.round(rect.height) });
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [mapping?.recipe, device, landscape, customWidth, theme]);

  const vars = {
    '--wb-canvas': resolved['color.surface.canvas'],
    '--wb-raised': resolved['color.surface.raised'],
    '--wb-sunken': resolved['color.surface.sunken'],
    '--wb-ink': resolved['color.ink.primary'],
    '--wb-muted': resolved['color.ink.tertiary'],
    '--wb-accent': resolved['color.action.primary'],
    '--wb-on-accent': resolved['color.action.on-primary'],
    '--wb-line': resolved['color.border.subtle'],
    '--wb-radius': radius === 'small' ? '10px' : radius === 'large' ? '24px' : '18px',
    '--wb-display': font === 'serif' ? "'Songti SC', Georgia, serif" : "'Helvetica Neue', 'PingFang SC', sans-serif",
  } as unknown as React.CSSProperties;

  const json =
    outputTheme === 'page-recipe'
      ? JSON.stringify(mapping?.recipe ?? { note: '还没有生成页面配方' }, null, 2)
      : outputTheme === 'recipe'
        ? JSON.stringify(rebuild?.recipe ?? { version: 1, blocks: [] }, null, 2)
        : JSON.stringify(
          {
              $description: `由 design-lab Studio 生成 · 品牌包 ${id}`,
              ...(outputTheme === 'light' ? pack.light.tokens : pack.dark.tokens),
            },
            null,
            2,
          );

  const fidelity = profile
    ? ([
        { label: '强调色', ours: resolved['color.action.primary'], theirs: profile.roles.accent?.hex },
        { label: '背景', ours: resolved['color.surface.canvas'], theirs: profile.roles.background?.hex },
        { label: '文字', ours: resolved['color.ink.primary'], theirs: profile.roles.ink?.hex },
      ].filter((item) => item.theirs) as { label: string; ours: string; theirs: string }[])
    : [];

  const download = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download =
      outputTheme === 'page-recipe'
        ? 'page-recipe.json'
        : outputTheme === 'recipe'
          ? 'visual-recipe.json'
          : outputTheme === 'light'
            ? 'brand.tokens.json'
            : 'dark.tokens.json';
    anchor.click();
    URL.revokeObjectURL(url);
    pushToast('已开始下载 JSON');
  };

  return (
    <div className="studio">
      <header className="page-head">
        <p className="eyebrow">Studio · 从一张图到一套 token</p>
        <h1 className="page-title">先出图，再把它变成系统</h1>
        <p className="page-lede">
          生成或导入参考图 → 抽出配色与角色 → 归一成一套 token → 校验后落盘。图片只在浏览器里分析，不上传；
          API Key 也只存在本机。
        </p>
      </header>

      <nav className="studio-steps" aria-label="流程">
        {STEPS.map((item) => (
          <button
            key={item.id}
            type="button"
            className="studio-step"
            data-active={step === item.id}
            data-done={step > item.id}
            onClick={() => setStep(item.id)}
          >
            <span className="studio-step-index">{String(item.id).padStart(2, '0')}</span>
            <span className="studio-step-label">{item.label}</span>
            <span className="studio-step-note">{item.note}</span>
          </button>
        ))}
      </nav>

      <ol className="studio-outputs" aria-label="本次会话的产物">
        <li>
          <button type="button" className="studio-output" data-ready={Boolean(reference)} onClick={() => setStep(1)}>
            <span className="studio-output-thumb">
              {reference ? <img src={reference.src} alt="" /> : <span className="studio-output-empty">01</span>}
            </span>
            <span className="studio-output-text">
              <strong>参考图</strong>
              <small>{reference ? '已选 1 张' : '还没选'}</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" className="studio-output" data-ready={Boolean(profile)} onClick={() => setStep(2)}>
            <span className="studio-output-thumb">
              {profile ? (
                <span className="studio-output-swatches">
                  {(['background', 'surface', 'accent', 'ink'] as Role[]).map((role) => (
                    <i key={role} style={{ background: profile.roles[role]?.hex ?? 'transparent' }} />
                  ))}
                </span>
              ) : (
                <span className="studio-output-empty">02</span>
              )}
            </span>
            <span className="studio-output-text">
              <strong>配色</strong>
              <small>{profile ? `${profile.clusters.length} 个色簇` : '未分析'}</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" className="studio-output" data-ready="true" onClick={() => setStep(3)}>
            <span className="studio-output-thumb">
              <span className="studio-output-ramp">
                {Object.entries(pack.ramp).map(([stepKey, hex]) => (
                  <i key={stepKey} style={{ background: hex }} />
                ))}
              </span>
            </span>
            <span className="studio-output-text">
              <strong>品牌包</strong>
              <small>{id}</small>
            </span>
          </button>
        </li>
        <li>
          <button type="button" className="studio-output" data-ready={Boolean(rebuild)} onClick={() => setStep(4)}>
            <span className="studio-output-thumb">
              {rebuild ? <img src={rebuild.diff.heatmap} alt="" /> : <span className="studio-output-empty">04</span>}
            </span>
            <span className="studio-output-text">
              <strong>重建</strong>
              <small>{rebuild ? `差异 ${(rebuild.diff.mismatch * 100).toFixed(1)}%` : '待重建'}</small>
            </span>
          </button>
        </li>
        <li>
          <button
            type="button"
            className="studio-output"
            data-ready={Boolean(mapping?.recipe)}
            onClick={() => setStep(4)}
          >
            <span className="studio-output-thumb">
              {mapping?.recipe ? (
                <span className="studio-output-bars">
                  {mapping.recipe.sections.slice(0, 4).map((section) => (
                    <i key={section.component} />
                  ))}
                </span>
              ) : (
                <span className="studio-output-empty">05</span>
              )}
            </span>
            <span className="studio-output-text">
              <strong>页面配方</strong>
              <small>{mapping?.recipe ? `${mapping.recipe.sections.length} 个区块` : '未生成'}</small>
            </span>
          </button>
        </li>
      </ol>

      {step === 1 ? (
        <section className="studio-panel">
          <div className="studio-split">
            <div className="studio-col">
              <h2 className="studio-title">用你的供应商出图</h2>
              <p className="studio-hint">
                支持任意 OpenAI 兼容的 <code>/images/generations</code>。Key 只写进 localStorage，不经过本站服务器。
              </p>

              <div className="studio-provider">
                <div>
                  <p className="wb-label">生图供应商</p>
                  <p className="studio-provider-line">
                    {image.model || '未选择模型'} · {image.baseUrl.replace(/^https?:\/\//, '').split('/')[0]}
                    {' · '}
                    {image.apiKey ? '已配置 Key' : '未配置 Key'}
                  </p>
                </div>
                <Button variant="ghost" onClick={openProviderSettings}>
                  配置
                </Button>
              </div>

              <div className="wb-field">
                <label className="wb-label" htmlFor="studio-prompt">
                  提示词
                </label>
                <textarea
                  id="studio-prompt"
                  className="studio-textarea"
                  rows={5}
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                />
              </div>

              <div className="studio-actions">
                <Button onClick={() => void runGeneration()} disabled={status.kind === 'busy'}>
                  {status.kind === 'busy' ? '生成中…' : '生成图片'}
                </Button>
                <Button variant="ghost" onClick={() => fileInput.current?.click()}>
                  导入本地图片
                </Button>
                <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(event) => void importFiles(event.target.files)} />
              </div>
              <p className="studio-hint">没有 Key 也能用：直接导入你已有的参考图，后面三步完全一样。</p>
            </div>

            <div className="studio-col">
              <h2 className="studio-title">候选图</h2>
              {shots.length ? (
                <div className="studio-shots">
                  {shots.map((shot) => (
                    <button
                      key={shot.id}
                      type="button"
                      className="studio-shot"
                      data-active={selected === shot.id}
                      onClick={() => setSelected(shot.id)}
                    >
                      <img src={shot.src} alt="候选参考图" />
                      <span className="studio-shot-tag">{shot.from === 'model' ? '生成' : '导入'}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="studio-empty">还没有图片。生成几张，或导入一张你喜欢的参考图。</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="studio-panel">
          {!reference ? (
            <p className="studio-empty">先在第一步选一张图。</p>
          ) : (
            <div className="studio-split">
              <div className="studio-col">
                <h2 className="studio-title">参考图</h2>
                <img className="studio-ref" src={reference.src} alt="当前参考图" />
                {profile ? (
                  <p className="studio-hint">
                    {profile.size.width} × {profile.size.height} · 抽出 {profile.clusters.length} 个色簇
                  </p>
                ) : null}
                <div className="studio-roles">
                  {(Object.keys(ROLE_LABEL) as Role[]).map((role) => {
                    const cluster = profile?.roles[role];
                    const confidence = profile?.confidence[role] ?? 0;
                    return (
                      <div className="studio-role" key={role}>
                        <span className="studio-role-name">{ROLE_LABEL[role]}</span>
                        <span className="studio-role-swatch" style={{ background: cluster?.hex ?? '#0000' }} />
                        <code className="studio-role-hex">{cluster?.hex ?? '—'}</code>
                        <span className="studio-role-bar">
                          <span style={{ width: `${Math.round(confidence * 100)}%` }} />
                        </span>
                        <span className="studio-role-conf">{Math.round(confidence * 100)}%</span>
                      </div>
                    );
                  })}
                </div>
                {profile ? (
                  <p className={`studio-contrast ${profile.contrast.inkOnBackground < 4.5 ? 'is-bad' : 'is-ok'}`}>
                    文字 / 背景 {profile.contrast.inkOnBackground}:1 · 文字 / 卡片 {profile.contrast.inkOnSurface}:1
                    {profile.contrast.inkOnBackground < 4.5 ? '（低于 AA，归一阶段会重算文字色）' : ''}
                  </p>
                ) : null}
              </div>

              <div className="studio-col">
                <h2 className="studio-title">色簇（点一下指定角色）</h2>
                <ul className="studio-clusters">
                  {(profile?.clusters ?? []).map((cluster) => (
                    <li className="studio-cluster" key={cluster.hex}>
                      <span className="studio-cluster-swatch" style={{ background: cluster.hex }} />
                      <code>{cluster.hex}</code>
                      <span className="studio-cluster-meta">
                        L {cluster.oklch.l.toFixed(2)} · C {cluster.oklch.c.toFixed(2)} · {Math.round(cluster.share * 100)}%
                      </span>
                      <span className="studio-cluster-actions">
                        <button type="button" onClick={() => assignRole('accent', cluster)}>
                          强调
                        </button>
                        <button type="button" onClick={() => assignRole('background', cluster)}>
                          背景
                        </button>
                        <button type="button" onClick={() => assignRole('surface', cluster)}>
                          卡片
                        </button>
                        <button type="button" onClick={() => assignRole('ink', cluster)}>
                          文字
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
                <Button onClick={() => setStep(3)} disabled={!profile}>
                  用这份分析去归一 →
                </Button>
              </div>
            </div>
          )}
        </section>
      ) : null}

      {step === 3 ? (
        <section className="studio-panel">
          <div className="studio-split">
            <div className="studio-col">
              <h2 className="studio-title">归一：把抽到的色重新长成系统</h2>
              <p className="studio-hint">
                抽出来的只有一个颜色。这里用它派生 10 级色阶、明暗两套表面和文字，并保持色相一致——这是"风格协调"的关键一步。
              </p>

              <div className="wb-field">
                <span className="wb-label">品牌主色（来自分析，可改）</span>
                <div className="wb-seed-row">
                  <input
                    type="color"
                    className="wb-color"
                    value={seed}
                    onChange={(event) => setSeed(event.target.value.toUpperCase())}
                  />
                  <TextInput value={seed} onChange={(event) => setSeed(event.target.value.toUpperCase())} spellCheck={false} />
                </div>
              </div>

              <div className="wb-field">
                <span className="wb-label">字体性格</span>
                <Segmented
                  label="字体性格"
                  value={font}
                  options={[
                    { id: 'serif', label: '衬线 · 编辑感' },
                    { id: 'sans', label: '无衬线 · 技术感' },
                  ]}
                  onChange={setFont}
                />
              </div>

              <div className="wb-field">
                <span className="wb-label">圆角尺度</span>
                <Segmented
                  label="圆角尺度"
                  value={radius}
                  options={[
                    { id: 'small', label: '利落' },
                    { id: 'medium', label: '中性' },
                    { id: 'large', label: '柔和' },
                  ]}
                  onChange={setRadius}
                />
              </div>

              <div className="wb-two">
                <div className="wb-field">
                  <label className="wb-label" htmlFor="studio-label">
                    品牌名
                  </label>
                  <TextInput id="studio-label" value={label} onChange={(event) => setLabel(event.target.value)} />
                </div>
                <div className="wb-field">
                  <label className="wb-label" htmlFor="studio-latin">
                    Latin
                  </label>
                  <TextInput id="studio-latin" value={latin} onChange={(event) => setLatin(event.target.value)} />
                </div>
              </div>

              <div className="wb-field">
                <label className="wb-label" htmlFor="studio-id">
                  目录名
                </label>
                <TextInput
                  id="studio-id"
                  value={id}
                  onChange={(event) => setCustomId(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                />
                <p className="wb-hint">
                  目录 <code>brands/{id}/tokens/</code>
                </p>
              </div>

              <Button onClick={() => setStep(4)}>
                看导出与校验 →
              </Button>
            </div>

            <div className="studio-col">
              <div className="studio-preview-bar">
                <span className="wb-label">预览主题</span>
                <Segmented
                  label="预览主题"
                  value={theme}
                  options={[
                    { id: 'light', label: '浅色' },
                    { id: 'dark', label: '深色' },
                  ]}
                  onChange={onTheme}
                />
              </div>

              <div className="wb-preview" style={vars}>
                <div className="wb-card">
                  <p className="wb-eyebrow">SURFACE / INK / ACTION</p>
                  <h3 className="wb-title">{latin || 'Brand'}</h3>
                  <p className="wb-metric">
                    23.4<span>km</span>
                  </p>
                  <div className="wb-actions">
                    <span className="wb-btn">开始骑行</span>
                    <span className="wb-ghost">收藏</span>
                  </div>
                  <p className="wb-caption">今天比上周多骑了 8 公里</p>
                </div>
                <div className="wb-ramp">
                  {Object.entries(pack.ramp).map(([step, hex]) => (
                    <span key={step} className="wb-ramp-step" style={{ background: hex }} title={`${step} · ${hex}`} />
                  ))}
                </div>
              </div>

              {pack.warnings.length ? (
                <ul className="wb-warnings">
                  {pack.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              ) : (
                <p className="wb-ok">✓ 关键对比度达标（完整七道门禁在 npm run verify）</p>
              )}
            </div>
          </div>
        </section>
      ) : null}

      {step === 4 ? (
        <section className="studio-panel">
          <div className="studio-split">
            <div className="studio-col">
              <h2 className="studio-title">同一版式，用 token 重画一遍</h2>
              <p className="studio-hint">
                把参考图拆成结构配方（横条 → 区块），再用刚生成的 token 重画，逐像素比。文字重建不了，
                所以文字区域从分数里排除，单独标出被排除了多少。
              </p>
              {rebuildState === 'error' ? <p className="studio-hint">重建失败，换一张图或重试。</p> : null}
              {rebuild ? (
                <>
                  <div className="studio-triptych">
                    <figure>
                      <img src={reference?.src} alt="参考图" />
                      <figcaption>参考图</figcaption>
                    </figure>
                    <figure>
                      <img src={rebuild.diff.rendered} alt="用 token 重建" />
                      <figcaption>用 token 重建</figcaption>
                    </figure>
                    <figure>
                      <img src={rebuild.diff.heatmap} alt="差异热区" />
                      <figcaption>差异热区</figcaption>
                    </figure>
                  </div>
                  <dl className="studio-metrics">
                    <div>
                      <dt>像素不一致</dt>
                      <dd>{(rebuild.diff.mismatch * 100).toFixed(1)}%</dd>
                    </div>
                    <div>
                      <dt>排除（文字区）</dt>
                      <dd>{(rebuild.diff.ignored * 100).toFixed(1)}%</dd>
                    </div>
                    <div>
                      <dt>结构块</dt>
                      <dd>{rebuild.recipe.blocks.length}</dd>
                    </div>
                  </dl>
                  <p className="studio-hint">
                    不一致集中在文字（已排除）与圆角、阴影边缘；如果整块色面都红，说明归一后的颜色偏离太多，回上一步调主色。
                  </p>
                </>
              ) : (
                <p className="studio-empty">{rebuildState === 'busy' ? '正在重建…' : '还没有参考图。'}</p>
              )}

              <h2 className="studio-title">自动映射成页面配方</h2>
              <p className="studio-hint">
                结构块本身说明不了"这是按钮还是卡片"。把结构、组件契约和规则一起交给模型，让它提议一份页面配方；
                提议会立刻用和 <code>npm run recipe</code> 相同的规则校验，不合格就带着错误再问一轮。
              </p>
              <div className="studio-mapping-controls">
                <Segmented
                  label="映射目标"
                  value={targetApp}
                  options={[
                    { id: 'ride', label: '映射到骑行' },
                    { id: 'ledger', label: '映射到记账' },
                  ]}
                  onChange={setTargetApp}
                />
                <Button onClick={() => void runMapping()} disabled={mappingState === 'busy' || !rebuild}>
                  {mappingState === 'busy' ? '生成中…' : mapping?.recipe ? '重新生成' : '生成页面配方'}
                </Button>
              </div>

              {mapping ? (
                mapping.errors.length ? (
                  <ul className="wb-warnings">
                    {mapping.errors.map((error) => (
                      <li key={error}>{error}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="wb-ok">
                    ✓ 通过校验：{mapping.recipe?.sections.length} 个区块，用了{' '}
                    {[...new Set(mapping.recipe?.sections.map((section) => section.component))].join(' / ')}
                    （{mapping.attempts} 轮）
                  </p>
                )
              ) : null}

              <h2 className="studio-title">与参考图的配色距离</h2>
              <p className="studio-hint">
                归一之后颜色不会和原图一模一样（原图常常不可用）。这里用 OKLab 距离量化差多少，超过 20 就该回头看分析。
              </p>
              <ul className="studio-fidelity">
                {fidelity.map((item) => {
                  const distance = deltaE(item.ours, item.theirs);
                  return (
                    <li key={item.label}>
                      <span className="studio-fidelity-label">{item.label}</span>
                      <span className="studio-fidelity-swatch" style={{ background: item.theirs }} />
                      <span className="studio-fidelity-arrow">→</span>
                      <span className="studio-fidelity-swatch" style={{ background: item.ours }} />
                      <span className={`studio-fidelity-value ${distance > 20 ? 'is-bad' : 'is-ok'}`}>ΔE {distance.toFixed(0)}</span>
                    </li>
                  );
                })}
                {!fidelity.length ? <li className="studio-hint">还没有参考图，跳过这一节。</li> : null}
              </ul>

              <h2 className="studio-title" style={{ marginTop: 24 }}>
                落盘三步
              </h2>
              <ol className="wb-steps">
                <li>
                  <span>01</span>
                  <code>brands/{id}/tokens/brand.tokens.json</code>
                  <small>粘贴浅色那份</small>
                </li>
                <li>
                  <span>02</span>
                  <code>brands/{id}/tokens/dark.tokens.json</code>
                  <small>粘贴深色那份</small>
                </li>
                <li>
                  <span>03</span>
                  <code>npm run tokens &amp;&amp; npm run verify</code>
                  <small>编译 + 七道门禁</small>
                </li>
              </ol>
              <p className="wb-note">
                还要在 <code>pipeline/pipeline.config.mjs</code> 的 <code>BRANDS</code> 里加一条指向这两个文件。
                生成器只保证"是一份合法的品牌包"，能不能合并由门禁说了算。
              </p>
              <p className="wb-note">
                <code>visual-recipe.json</code> 是这张图的<strong>版式结构</strong>（归一化坐标 + 块类型），
                不是组件配方：它描述"哪里有一块卡片、哪里是文字"，可以人工映射成
                <code>agents/page-recipe.schema.json</code> 里的组件与 props，两者字段不同，不自动转换。
              </p>
            </div>

            <div className="studio-col">
              <div className="studio-preview-bar">
                <span className="wb-label">导出</span>
                <Segmented
                  label="导出内容"
                  value={outputTheme}
                  options={[
                    { id: 'light', label: 'brand.tokens.json' },
                    { id: 'dark', label: 'dark.tokens.json' },
                    { id: 'recipe', label: 'visual-recipe.json' },
                    { id: 'page-recipe', label: 'page-recipe.json' },
                  ]}
                  onChange={setOutputTheme}
                />
                <Button variant="ghost" onClick={download}>
                  下载
                </Button>
              </div>

              <div className="wb-code">
                <CopyButton text={json} label="复制 JSON" className="code-copy" />
                <pre className="code">
                  <code>{json}</code>
                </pre>
              </div>
            </div>
          </div>

        <section className="studio-render-section">
          {mapping?.recipe && !mapping.errors.length ? (
            <div className="studio-render">
              <div className="studio-render-head">
                <span className="wb-label">配方 → 界面</span>
                <Segmented
                  label="设备"
                  value={device}
                  options={DEVICES.map((item) => ({
                    id: item.id,
                    label: item.label,
                    title: `${item.width} × ${item.height}`,
                  }))}
                  onChange={(next) => {
                    setCustomWidth(null);
                    setDevice(next);
                  }}
                />
                <button
                  type="button"
                  className="ctl-chip studio-orientation"
                  data-active={landscape}
                  onClick={() => setLandscape((value) => !value)}
                  title="宽高互换"
                >
                  {landscape ? '横屏' : '竖屏'}
                </button>
                {measured ? (
                  <button
                    type="button"
                    className="studio-measure"
                    title="复制实际渲染尺寸"
                    onClick={() => {
                      const text = `${measured.w} × ${measured.h} @ ${Math.round((measured.w / effectiveWidth) * 100)}%`;
                      void navigator.clipboard?.writeText(text).then(() => pushToast('已复制尺寸')).catch(() => undefined);
                    }}
                  >
                    {measured.w} × {measured.h} · {Math.round((measured.w / effectiveWidth) * 100)}%
                  </button>
                ) : null}
                <Segmented
                  label="缩放"
                  value={zoom}
                  options={[
                    { id: 'auto', label: '自适应' },
                    { id: 50, label: '50%' },
                    { id: 75, label: '75%' },
                    { id: 100, label: '100%' },
                  ]}
                  onChange={setZoom}
                />
                <label className="studio-width">
                  宽
                  <input
                    type="number"
                    min={320}
                    max={1600}
                    value={effectiveWidth}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      setCustomWidth(next >= 320 && next <= 1600 ? Math.round(next) : null);
                    }}
                  />
                  px
                </label>
                <Segmented
                  label="品牌包"
                  value={renderBrand}
                  options={[
                    { id: 'generated', label: '本品牌' },
                    { id: 'cycling', label: '骑行包' },
                    { id: 'ledger', label: '记账包' },
                    { id: 'noir', label: 'Noir 包' },
                  ]}
                  onChange={setRenderBrand}
                />
              </div>
              <div
                ref={phoneRef}
                className="recipe-phone"
                data-kind={effectiveKind}
                data-orientation={landscape ? 'landscape' : 'portrait'}
                style={{
                  ...recipeVars,
                  width: `min(100%, ${effectiveWidth}px)`,
                  ...(frameHeight ? { height: frameHeight } : {}),
                  ...(zoom === 'auto' ? {} : { transform: `scale(${zoom / 100})`, transformOrigin: 'top left', marginBottom: 0 }),
                }}
              >
                <DeviceChrome kind={effectiveKind} />
                <RecipeCanvas recipe={mapping.recipe} />
              </div>
              <p className="studio-hint">
                换品牌只换变量，布局不动；换设备只换宽度，组件按容器查询重排（平板两列、桌面三列）。
                已支持渲染：{SUPPORTED.join(' / ')}；其它组件只有契约、没有实现，会明确标出来。
              </p>
            </div>
          ) : null}
        </section>
        </section>
      ) : null}

      {status.message ? (
        <p className={`studio-status ${status.kind === 'error' ? 'is-error' : status.kind === 'ok' ? 'is-ok' : ''}`} role="status">
          {status.message}
        </p>
      ) : null}
    </div>
  );
};
