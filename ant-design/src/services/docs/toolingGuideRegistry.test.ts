import { execFile } from 'node:child_process';
import { describe, expect, it } from 'vitest';
import {
  ABOUT_CONTENT_METADATA,
  getToolingVerificationStatus,
  getToolingVerificationSummary,
  TOOLING_VERIFICATION_MAX_AGE_DAYS,
  toolingGuideRegistry,
  type ToolingGuide,
} from './toolingGuideRegistry';

const checkUrl = (url: string): Promise<void> => new Promise((resolve, reject) => {
  execFile('curl', [
    '--location',
    '--fail',
    '--silent',
    '--show-error',
    '--retry',
    '2',
    '--retry-delay',
    '1',
    '--retry-all-errors',
    '--connect-timeout',
    '10',
    '--max-time',
    '20',
    '--output',
    '/dev/null',
    url,
  ], { timeout: 70_000 }, (error) => {
    if (error) reject(error);
    else resolve();
  });
});

const makeGuide = (id: string, lastVerifiedAt: string): ToolingGuide => ({
  ...toolingGuideRegistry[0],
  id,
  lastVerifiedAt,
});

const formatStaleGuideMessage = (now: Date): string => {
  const summary = getToolingVerificationSummary(toolingGuideRegistry, now);
  const details = toolingGuideRegistry
    .filter((guide) => summary.staleGuideIds.includes(guide.id))
    .map((guide) => [
      `${guide.title} last verified at ${guide.lastVerifiedAt} against ${guide.verifiedToolVersion}.`,
      `Official docs: ${guide.officialUrl}`,
      `Review commands: ${guide.reviewCommands.join(', ')}`,
    ].join('\n'))
    .join('\n\n');
  return `CLI/MCP guides must be reviewed every ${TOOLING_VERIFICATION_MAX_AGE_DAYS} days.\n${details}`;
};

describe('getToolingVerificationStatus', () => {
  it('keeps the 90-day boundary fresh', () => {
    expect(getToolingVerificationStatus('2026-01-01', new Date('2026-04-01T23:59:59.999Z'))).toBe('fresh');
  });

  it('marks the 91st day stale', () => {
    expect(getToolingVerificationStatus('2026-01-01', new Date('2026-04-02T00:00:00.000Z'))).toBe('stale');
  });

  it.each(['not-a-date', '2026-02-30', '2026-7-1'])('treats invalid dates as invalid: %s', (date) => {
    expect(getToolingVerificationStatus(date, new Date('2026-01-01T00:00:00.000Z'))).toBe('invalid');
  });

  it('treats future verification dates as invalid', () => {
    expect(getToolingVerificationStatus('2026-01-02', new Date('2026-01-01T00:00:00.000Z'))).toBe('invalid');
  });
});

describe('getToolingVerificationSummary', () => {
  it('uses the oldest client verification date and reports stale clients', () => {
    const guides = [makeGuide('older', '2026-01-01'), makeGuide('newer', '2026-03-01')];
    expect(getToolingVerificationSummary(guides, new Date('2026-04-02T00:00:00.000Z'))).toEqual({
      oldestVerifiedAt: '2026-01-01',
      staleGuideIds: ['older'],
      isStale: true,
    });
  });
});

describe('tooling guide registry metadata', () => {
  it('keeps release and guide metadata complete and unique', () => {
    expect(ABOUT_CONTENT_METADATA.version.trim()).not.toBe('');
    expect(getToolingVerificationStatus(
      ABOUT_CONTENT_METADATA.updatedAt,
      new Date(`${ABOUT_CONTENT_METADATA.updatedAt}T00:00:00.000Z`),
    )).toBe('fresh');
    expect(new Set(toolingGuideRegistry.map((guide) => guide.id)).size).toBe(toolingGuideRegistry.length);
    expect(toolingGuideRegistry.map((guide) => guide.client).sort()).toEqual(['claude-code', 'codex']);

    toolingGuideRegistry.forEach((guide) => {
      expect(guide.id.trim()).not.toBe('');
      expect(guide.verifiedToolVersion.trim()).not.toBe('');
      expect(guide.reviewCommands.length).toBeGreaterThan(0);
      expect(guide.reviewCommands.every((command) => command.trim().length > 0)).toBe(true);
      expect(new URL(guide.officialUrl).protocol).toBe('https:');
      expect(getToolingVerificationStatus(
        guide.lastVerifiedAt,
        new Date(`${guide.lastVerifiedAt}T00:00:00.000Z`),
      )).toBe('fresh');
    });
  });

  it('keeps the official Ant Design CLI and MCP boundary explicit', () => {
    toolingGuideRegistry.forEach((guide) => {
      const serialized = JSON.stringify(guide);
      expect(serialized).toContain('@ant-design/cli');
      expect(serialized).toContain('antd setup --client');
      expect(serialized).toContain('npx -y @ant-design/cli mcp');
      expect(serialized).not.toContain('@upstash/context7-mcp');
      expect(serialized).not.toContain('claude mcp add');
      expect(serialized).not.toContain('codex mcp add');
    });
  });

  it('requires every guide to be reviewed for the current About release', () => {
    const guidesNotReviewedForRelease = toolingGuideRegistry
      .filter((guide) => guide.lastVerifiedAt < ABOUT_CONTENT_METADATA.updatedAt);
    if (guidesNotReviewedForRelease.length > 0) {
      throw new Error([
        `About content was updated at ${ABOUT_CONTENT_METADATA.updatedAt}.`,
        'Re-run the listed client review commands and update lastVerifiedAt before releasing:',
        ...guidesNotReviewedForRelease.map((guide) => `${guide.title}: ${guide.reviewCommands.join(', ')}`),
      ].join('\n'));
    }
    expect(guidesNotReviewedForRelease).toEqual([]);
  });
});

describe('tooling guide verification gate', () => {
  it('keeps every checked-in guide within the review window', () => {
    const now = new Date(Date.now());
    const summary = getToolingVerificationSummary(toolingGuideRegistry, now);
    if (summary.isStale) throw new Error(formatStaleGuideMessage(now));
    expect(summary.staleGuideIds).toEqual([]);
  });

  it.runIf(process.env.VERIFY_TOOLING_LINKS === '1')(
    'keeps official documentation links reachable',
    async () => {
      await Promise.all(toolingGuideRegistry.map(async (guide) => {
        await expect(checkUrl(guide.officialUrl), `${guide.title}: ${guide.officialUrl} is unreachable`).resolves.toBeUndefined();
      }));
    },
    75_000,
  );
});
