export type TextArtifactKind = 'design-md' | 'claude-md' | 'codex-agents-md';
export type TextArtifactFilename = 'design.md' | 'CLAUDE.md' | 'AGENTS.md';

export type TextArtifact = {
  kind: TextArtifactKind;
  filename: TextArtifactFilename;
  content: string;
  mimeType: 'text/markdown;charset=utf-8';
};

export type TextArtifactErrorCode = 'ARTIFACT_COPY_FAILED' | 'ARTIFACT_DOWNLOAD_FAILED';

export class TextArtifactError extends Error {
  readonly cause?: unknown;

  constructor(readonly code: TextArtifactErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = 'TextArtifactError';
    this.cause = cause;
  }
}

const allowedFilenames = new Set<TextArtifactFilename>(['design.md', 'CLAUDE.md', 'AGENTS.md']);

export const copyTextArtifact = async (content: string): Promise<void> => {
  try {
    if (!globalThis.navigator?.clipboard?.writeText) throw new Error('Clipboard API unavailable');
    await globalThis.navigator.clipboard.writeText(content);
  } catch (error) {
    throw new TextArtifactError(
      'ARTIFACT_COPY_FAILED',
      '无法复制，请手动选择文本或下载文件',
      error,
    );
  }
};

export const downloadTextArtifact = (artifact: TextArtifact): void => {
  try {
    if (!allowedFilenames.has(artifact.filename) || /[\\/]/.test(artifact.filename)) {
      throw new Error('Artifact filename is not allowed');
    }
    const blob = new Blob([artifact.content], { type: artifact.mimeType });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    try {
      anchor.href = objectUrl;
      anchor.download = artifact.filename;
      anchor.hidden = true;
      document.body.append(anchor);
      anchor.click();
    } finally {
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    }
  } catch (error) {
    throw new TextArtifactError(
      'ARTIFACT_DOWNLOAD_FAILED',
      '下载失败，请复制内容后手动保存',
      error,
    );
  }
};
