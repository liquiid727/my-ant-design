export class ClipboardError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = 'ClipboardError';
    this.cause = cause;
  }
}

export const copyToClipboard = async (content: string): Promise<void> => {
  try {
    if (!globalThis.navigator?.clipboard?.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await globalThis.navigator.clipboard.writeText(content);
  } catch (error) {
    throw new ClipboardError('Unable to copy to clipboard', error);
  }
};
