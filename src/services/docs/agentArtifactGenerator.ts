import type { TextArtifact } from './textArtifact';

export type AgentArtifactKind = 'claude-md' | 'codex-agents-md';
export type AgentArtifactOptions = {
  designDocPath?: string;
  themeFilePath?: string;
};

export const sharedUiAgentRules = [
  'Read the design document, theme file, and existing component structure before changing UI.',
  'Prefer Ant Design components and existing shared components over custom replacements.',
  'Use global Theme Tokens and component Tokens for visual values.',
  'Do not hard-code colors, radii, shadows, or spacing without documenting the reason.',
  'Cover loading, empty, error, disabled, hover, active, and focus-visible states.',
  'Validate desktop, tablet, and mobile layouts without page-level horizontal overflow.',
  'Run typecheck, build, and relevant UI tests before handoff.',
  'Report every newly introduced hard-coded visual value and its justification.',
] as const;

const examples = `## Example tasks

### Implement a new page
Read the design sources, then implement the requested page with Ant Design and Theme Tokens. Cover all states and verify desktop, tablet, and mobile.

### Refactor an existing page
Replace one-off UI patterns with existing components and Token-driven styling while preserving behavior and accessibility.

### UI review
Review the page for design-system consistency, responsive overflow, missing states, accessibility, and unexplained hard-coded visual values.`;

const renderRules = () => sharedUiAgentRules.map((rule) => `- ${rule}`).join('\n');

export const generateAgentArtifact = (
  kind: AgentArtifactKind,
  options: AgentArtifactOptions = {},
): TextArtifact => {
  const designDocPath = options.designDocPath ?? './design.md';
  const themeFilePath = options.themeFilePath ?? './src/theme.ts';
  const isClaude = kind === 'claude-md';
  const filename = isClaude ? 'CLAUDE.md' : 'AGENTS.md';
  const loadingInstructions = isClaude
    ? `## Required project context

Import the design specification before UI work:

@${designDocPath.replace(/^\.\//, '')}

Also read \`${themeFilePath}\` and inspect the existing component structure.`
    : `## Required project context

Before UI work, explicitly read \`${designDocPath}\`, \`${themeFilePath}\`, and the existing component structure. Follow all applicable AGENTS.md files from the repository root to the working directory.`;

  return {
    kind,
    filename,
    mimeType: 'text/markdown;charset=utf-8',
    content: `# Theme Studio UI Agent Instructions

${loadingInstructions}

## Shared UI development rules

${renderRules()}

## Delivery checklist

- Explain component and Token choices.
- List verification commands and their results.
- Call out remaining risks or unverified states.

${examples}
`,
  };
};
