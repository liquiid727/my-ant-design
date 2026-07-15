import { afterEach, describe, expect, it, vi } from 'vitest';
import { copyTextArtifact, downloadTextArtifact, TextArtifactError, type TextArtifact } from './textArtifact';

const artifact: TextArtifact = {
  kind: 'design-md',
  filename: 'design.md',
  content: '# Design',
  mimeType: 'text/markdown;charset=utf-8',
};

afterEach(() => vi.restoreAllMocks());

describe('text artifacts', () => {
  it('normalizes clipboard failures', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });
    await expect(copyTextArtifact('content')).rejects.toMatchObject({ code: 'ARTIFACT_COPY_FAILED' });
  });

  it('creates a UTF-8 Markdown download and releases its object URL', () => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn() });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
    const createObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test');
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => undefined);
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);

    downloadTextArtifact(artifact);

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe('text/markdown;charset=utf-8');
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
    expect(document.querySelector('a[download="design.md"]')).toBeNull();
  });

  it('rejects filenames outside the allow-list', () => {
    expect(() => downloadTextArtifact({ ...artifact, filename: '../design.md' as TextArtifact['filename'] }))
      .toThrow(TextArtifactError);
  });
});
