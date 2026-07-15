import { describe, expect, it } from 'vitest';
import { generateAgentArtifact, sharedUiAgentRules } from './agentArtifactGenerator';

describe('generateAgentArtifact', () => {
  it('generates platform-correct filenames and loading syntax', () => {
    const claude = generateAgentArtifact('claude-md');
    const codex = generateAgentArtifact('codex-agents-md');

    expect(claude.filename).toBe('CLAUDE.md');
    expect(claude.content).toContain('@design.md');
    expect(codex.filename).toBe('AGENTS.md');
    expect(codex.content).toContain('read `./design.md`');
    expect(codex.content).not.toContain('@design.md');
  });

  it('keeps the complete shared design constraints in both artifacts', () => {
    for (const artifact of [generateAgentArtifact('claude-md'), generateAgentArtifact('codex-agents-md')]) {
      for (const rule of sharedUiAgentRules) expect(artifact.content).toContain(rule);
      expect(artifact.content).toContain('./src/theme.ts');
      expect(artifact.content).toContain('Implement a new page');
      expect(artifact.content).toContain('Refactor an existing page');
      expect(artifact.content).toContain('UI review');
      expect(artifact.content).toMatch(/typecheck/);
      expect(artifact.content).toMatch(/desktop, tablet, and mobile/);
    }
  });

  it('supports project-specific relative paths without changing platform syntax', () => {
    const claude = generateAgentArtifact('claude-md', { designDocPath: './docs/design.md', themeFilePath: './src/theme/index.ts' });
    const codex = generateAgentArtifact('codex-agents-md', { designDocPath: './docs/design.md', themeFilePath: './src/theme/index.ts' });
    expect(claude.content).toContain('@docs/design.md');
    expect(codex.content).toContain('`./docs/design.md`');
    expect(claude.content).toContain('./src/theme/index.ts');
  });
});
