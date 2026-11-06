import { useEffect, useState } from 'react';
import {
  DEFAULT_IMAGE,
  DEFAULT_TEXT,
  clearProviders,
  fetchModels,
  loadImageProvider,
  loadTextProvider,
  saveImageProvider,
  saveTextProvider,
  testProvider,
  MODEL_SUGGESTIONS,
  TEXT_MODEL_SUGGESTIONS,
  SIZE_SUGGESTIONS,
  type ImageProvider,
  type TestResult,
  type TextProvider,
} from '../workbench/provider';

type Tab = 'image' | 'text';

const listeners = new Set<(open: boolean) => void>();
let openState = false;

export const openProviderSettings = () => {
  openState = true;
  listeners.forEach((listener) => listener(true));
};

export const ProviderSettings = () => {
  const [open, setOpen] = useState(openState);
  const [tab, setTab] = useState<Tab>('image');
  const [image, setImage] = useState<ImageProvider>(DEFAULT_IMAGE);
  const [text, setText] = useState<TextProvider>(DEFAULT_TEXT);
  const [models, setModels] = useState<string[]>([]);
  const [busy, setBusy] = useState<'models' | 'test' | null>(null);
  const [result, setResult] = useState<TestResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listeners.add(setOpen);
    return () => {
      listeners.delete(setOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setImage(loadImageProvider());
    setText(loadTextProvider());
    setModels([]);
    setResult(null);
    setError(null);
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  if (!open) return null;

  const profile = tab === 'image' ? image : text;
  const suggestions = tab === 'image' ? MODEL_SUGGESTIONS : TEXT_MODEL_SUGGESTIONS;

  const patch = (patchValue: Record<string, unknown>) => {
    if (tab === 'image') setImage({ ...image, ...patchValue } as ImageProvider);
    else setText({ ...text, ...patchValue } as TextProvider);
  };

  const pullModels = async () => {
    setBusy('models');
    setError(null);
    setResult(null);
    try {
      const list = await fetchModels(profile);
      setModels(list);
      setResult({ ok: true, message: `拉到 ${list.length} 个模型，可从下拉里选`, ms: 0 });
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const runTest = async () => {
    setBusy('test');
    setError(null);
    setResult(null);
    const outcome = await testProvider(tab, profile);
    setResult(outcome);
    setBusy(null);
  };

  /** 沿用生图的地址和 Key：模型不照搬（生图模型名对文本接口没意义）。 */
  const inheritFromImage = () => {
    const imageModel = MODEL_SUGGESTIONS.includes(text.model);
    setText({
      baseUrl: image.baseUrl,
      apiKey: image.apiKey,
      model: !text.model || imageModel ? DEFAULT_TEXT.model : text.model,
    });
    setModels([]);
    setResult(null);
    setError(null);
  };

  const save = () => {
    saveImageProvider(image);
    saveTextProvider(text);
    setOpen(false);
  };

  return (
    <div className="settings-backdrop" role="dialog" aria-modal="true" aria-label="供应商配置" onClick={() => setOpen(false)}>
      <div className="settings-panel" onClick={(event) => event.stopPropagation()}>
        <header className="settings-head">
          <div>
            <p className="eyebrow">Provider</p>
            <h2 className="settings-title">供应商配置</h2>
          </div>
          <button type="button" className="settings-close" aria-label="关闭" onClick={() => setOpen(false)}>
            ×
          </button>
        </header>

        <div className="settings-status">
          <span className={`settings-chip ${image.apiKey ? 'is-on' : ''}`}>生图 {image.apiKey ? '✓' : '未配置'}</span>
          <span className={`settings-chip ${text.apiKey ? 'is-on' : ''}`}>文本 {text.apiKey ? '✓' : '未配置'}</span>
        </div>

        <p className="settings-note">
          Key 只写进这台机器的 localStorage，不经过本站服务器。生图和文本分开配置，可以指向不同供应商。
          {tab === 'text' ? ' 文本模型用于第 4 步的结构映射，不配置也能走完前三步。' : ''}
        </p>

        <div className="settings-tabs" role="tablist">
          {(
            [
              { id: 'image', label: '生图' },
              { id: 'text', label: '文本 / 映射' },
            ] as { id: Tab; label: string }[]
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              className="segmented-item"
              data-active={tab === item.id}
              onClick={() => {
                setTab(item.id);
                setModels([]);
                setResult(null);
                setError(null);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="settings-body">
          <label className="wb-field">
            <span className="wb-label">接口地址（OpenAI 兼容）</span>
            <input
              className="wb-text"
              value={profile.baseUrl}
              spellCheck={false}
              placeholder="https://api.openai.com/v1"
              onChange={(event) => patch({ baseUrl: event.target.value })}
            />
          </label>

          <label className="wb-field">
            <span className="wb-label">API Key</span>
            <input
              className="wb-text"
              type="password"
              value={profile.apiKey}
              spellCheck={false}
              placeholder="sk-…"
              onChange={(event) => patch({ apiKey: event.target.value })}
            />
          </label>

          <div className="settings-row">
            <label className="wb-field">
              <span className="wb-label">模型</span>
              <input
                className="wb-text"
                list="settings-models"
                value={profile.model}
                spellCheck={false}
                onChange={(event) => patch({ model: event.target.value })}
              />
              <datalist id="settings-models">
                {(models.length ? models : suggestions).map((model) => (
                  <option key={model} value={model} />
                ))}
              </datalist>
            </label>

            {tab === 'image' ? (
              <label className="wb-field">
                <span className="wb-label">尺寸 / 张数</span>
                <div className="settings-pair">
                  <input
                    className="wb-text"
                    list="settings-sizes"
                    value={image.size}
                    onChange={(event) => patch({ size: event.target.value })}
                  />
                  <input
                    className="wb-text"
                    type="number"
                    min={1}
                    max={4}
                    value={image.count}
                    onChange={(event) => patch({ count: Number(event.target.value) })}
                  />
                </div>
                <datalist id="settings-sizes">
                  {SIZE_SUGGESTIONS.map((size) => (
                    <option key={size} value={size} />
                  ))}
                </datalist>
              </label>
            ) : null}
          </div>

          <div className="settings-actions">
            {tab === 'text' ? (
              <button
                type="button"
                className="hero-cta hero-cta-ghost"
                onClick={inheritFromImage}
                disabled={!image.apiKey}
                title={image.apiKey ? '复制生图的接口地址与 Key，模型保持不变' : '先配置生图，才能沿用'}
              >
                沿用生图配置
              </button>
            ) : null}
            <button type="button" className="hero-cta hero-cta-ghost" onClick={() => void pullModels()} disabled={busy !== null}>
              {busy === 'models' ? '拉取中…' : '获取模型列表'}
            </button>
            <button type="button" className="hero-cta hero-cta-ghost" onClick={() => void runTest()} disabled={busy !== null}>
              {busy === 'test' ? '测试中…' : '测试连接'}
            </button>
          </div>

          {result ? (
            <p className={`settings-result ${result.ok ? 'is-ok' : 'is-bad'}`}>
              {result.ok ? '✓' : '✗'} {result.message}
              {result.ms ? ` · ${result.ms}ms` : ''}
            </p>
          ) : null}
          {error ? <p className="settings-result is-bad">✗ {error}</p> : null}
        </div>

        <footer className="settings-foot">
          <button
            type="button"
            className="settings-link"
            onClick={() => {
              clearProviders();
              setImage(DEFAULT_IMAGE);
              setText(DEFAULT_TEXT);
            }}
          >
            清除本机配置
          </button>
          <div className="settings-foot-actions">
            <button type="button" className="hero-cta hero-cta-ghost" onClick={() => setOpen(false)}>
              取消
            </button>
            <button type="button" className="hero-cta" onClick={save}>
              保存
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};
