import { useEffect, useState } from 'react';
import { Button, Field, Segmented, TextInput } from './controls';
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
  const [fieldError, setFieldError] = useState<string | null>(null);

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
    if (!profile.apiKey.trim()) {
      setFieldError('先填 API Key，再保存');
      return;
    }
    setFieldError(null);
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

        <div className="settings-tabs">
          <Segmented
            label="配置类型"
            value={tab}
            options={[
              { id: 'image', label: '生图' },
              { id: 'text', label: '文本 / 映射' },
            ]}
            onChange={(next) => {
              setTab(next);
              setModels([]);
              setResult(null);
              setError(null);
            }}
          />
        </div>

        <div className="settings-body">
          <Field label="接口地址（OpenAI 兼容）">
            <TextInput
              value={profile.baseUrl}
              spellCheck={false}
              placeholder="https://api.openai.com/v1"
              onChange={(event) => patch({ baseUrl: event.target.value })}
            />
          </Field>

          <Field
            label="API Key"
            error={fieldError ?? undefined}
            hint="只写进这台机器的 localStorage，不上传"
          >
            <TextInput
              type="password"
              value={profile.apiKey}
              spellCheck={false}
              placeholder="sk-…"
              onChange={(event) => {
                setFieldError(null);
                patch({ apiKey: event.target.value });
              }}
            />
          </Field>

          <div className="settings-row">
            <Field label="模型">
              <TextInput
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
            </Field>

            {tab === 'image' ? (
              <Field label="尺寸 / 张数">
                <div className="settings-pair">
                  <TextInput
                    list="settings-sizes"
                    value={image.size}
                    onChange={(event) => patch({ size: event.target.value })}
                  />
                  <TextInput
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
              </Field>
            ) : null}
          </div>

          <div className="settings-actions">
            {tab === 'text' ? (
              <Button
                variant="ghost"
                onClick={inheritFromImage}
                disabled={!image.apiKey}
                title={image.apiKey ? '复制生图的接口地址与 Key，模型保持不变' : '先配置生图，才能沿用'}
              >
                沿用生图配置
              </Button>
            ) : null}
            <Button variant="ghost" onClick={() => void pullModels()} disabled={busy !== null}>
              {busy === 'models' ? '拉取中…' : '获取模型列表'}
            </Button>
            <Button variant="ghost" onClick={() => void runTest()} disabled={busy !== null}>
              {busy === 'test' ? '测试中…' : '测试连接'}
            </Button>
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
          <Button
            variant="quiet"
            onClick={() => {
              clearProviders();
              setImage(DEFAULT_IMAGE);
              setText(DEFAULT_TEXT);
            }}
          >
            清除本机配置
          </Button>
          <div className="settings-foot-actions">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button onClick={save}>保存</Button>
          </div>
        </footer>
      </div>
    </div>
  );
};
