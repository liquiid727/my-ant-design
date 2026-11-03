import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClipboardError, copyToClipboard } from './clipboard';

const originalClipboard = navigator.clipboard;

afterEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: originalClipboard,
  });
  vi.restoreAllMocks();
});

describe('copyToClipboard', () => {
  it('writes content using the Clipboard API', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await copyToClipboard('theme json');

    expect(writeText).toHaveBeenCalledWith('theme json');
  });

  it('throws ClipboardError when the Clipboard API is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    await expect(copyToClipboard('theme json')).rejects.toBeInstanceOf(ClipboardError);
  });

  it('throws ClipboardError when writing is rejected', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    });

    await expect(copyToClipboard('theme json')).rejects.toMatchObject({
      name: 'ClipboardError',
      message: 'Unable to copy to clipboard',
    });
  });
});
