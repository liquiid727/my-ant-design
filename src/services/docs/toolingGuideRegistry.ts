export type ToolingGuide = {
  id: string;
  client: 'claude-code' | 'codex';
  title: string;
  description: string;
  configPath: string;
  commands: Array<{ label: string; code: string }>;
  configExample: string;
  verification: string[];
  troubleshooting: string[];
  officialUrl: string;
  lastVerifiedAt: string;
  verifiedToolVersion: string;
  reviewCommands: string[];
};

export const ABOUT_CONTENT_METADATA = {
  version: '0709',
  updatedAt: '2026-07-17',
} as const;

export const TOOLING_VERIFICATION_MAX_AGE_DAYS = 90;

export type ToolingVerificationStatus = 'fresh' | 'stale' | 'invalid';

export type ToolingVerificationSummary = {
  oldestVerifiedAt: string | null;
  staleGuideIds: string[];
  isStale: boolean;
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const parseUtcDate = (value: string): number | null => {
  if (!ISO_DATE_PATTERN.test(value)) return null;
  const timestamp = Date.parse(`${value}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp)) return null;
  return new Date(timestamp).toISOString().slice(0, 10) === value ? timestamp : null;
};

export const getToolingVerificationStatus = (
  lastVerifiedAt: string,
  now = new Date(Date.now()),
  maxAgeDays = TOOLING_VERIFICATION_MAX_AGE_DAYS,
): ToolingVerificationStatus => {
  const verifiedAt = parseUtcDate(lastVerifiedAt);
  if (verifiedAt === null || !Number.isFinite(now.getTime()) || maxAgeDays < 0) return 'invalid';

  const currentUtcDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const ageInDays = Math.floor((currentUtcDay - verifiedAt) / DAY_IN_MS);
  if (ageInDays < 0) return 'invalid';
  return ageInDays > maxAgeDays ? 'stale' : 'fresh';
};

export const getToolingVerificationSummary = (
  guides: ToolingGuide[],
  now = new Date(Date.now()),
  maxAgeDays = TOOLING_VERIFICATION_MAX_AGE_DAYS,
): ToolingVerificationSummary => {
  const sortedDates = guides
    .map((guide) => guide.lastVerifiedAt)
    .filter((date) => parseUtcDate(date) !== null)
    .sort();
  const staleGuideIds = guides
    .filter((guide) => getToolingVerificationStatus(guide.lastVerifiedAt, now, maxAgeDays) !== 'fresh')
    .map((guide) => guide.id);

  return {
    oldestVerifiedAt: sortedDates[0] ?? null,
    staleGuideIds,
    isStale: staleGuideIds.length > 0,
  };
};

export const toolingGuideRegistry: ToolingGuide[] = [
  {
    id: 'antd-cli-claude-code',
    client: 'claude-code',
    title: 'Ant Design CLI / MCP · Claude Code',
    description: 'Ant Design CLI 提供组件、示例、Token、设计语言和项目诊断；官方 MCP 将这些能力作为结构化工具接入 Claude Code。',
    configPath: '由 antd setup --client claude 自动配置',
    commands: [
      { label: '安装 Ant Design CLI', code: 'npm install -g @ant-design/cli' },
      { label: '验证 CLI 并查询组件', code: 'antd -V\nantd info Button\nantd token Button' },
      { label: '自动配置 Claude Code', code: 'antd setup --client claude' },
      { label: '预览并检查配置', code: 'antd setup --client claude --dry-run\nantd setup --client claude --check' },
      { label: '手动启动官方 MCP Server', code: 'npx -y @ant-design/cli mcp' },
    ],
    configExample: `{
  "mcpServers": {
    "antd": {
      "command": "npx",
      "args": ["-y", "@ant-design/cli", "mcp"]
    }
  }
}`,
    verification: [
      '运行 antd -V，确认已安装 @ant-design/cli 且 Node.js 版本不低于 20。',
      '运行 antd info Button 和 antd token Button，确认可以读取组件 API 与设计 Token。',
      '运行 antd setup --client claude --check，确认 Claude Code 的 Skill/MCP 配置有效。',
      '让 Agent 调用 antd_info、antd_doc 或 antd_token，而不是依赖模型记忆猜测 Ant Design API。',
      '让 Agent 同时读取项目 ./design.md 与主题文件；官方 MCP 提供 Ant Design 知识，不替代项目设计事实。',
    ],
    troubleshooting: [
      '找不到 antd 或 npx：确认 Node.js 20+ 与 npm 已安装并位于 PATH，然后重新安装 @ant-design/cli。',
      '自动配置失败：先运行 antd setup --client claude --dry-run 查看将要修改的配置。',
      'MCP 未连接：手动运行 npx -y @ant-design/cli mcp，检查启动错误后再执行 --check。',
      '组件信息与项目不符：先确认 package.json 中的 antd 主版本，再使用 CLI 的版本参数或迁移命令核对差异。',
      'Context7 等第三方文档 MCP 可作为补充，但不能代替 Ant Design 官方 CLI/MCP。',
    ],
    officialUrl: 'https://ant.design/docs/react/mcp',
    lastVerifiedAt: '2026-07-17',
    verifiedToolVersion: '@ant-design/cli 6.5.1',
    reviewCommands: [
      'antd -V',
      'antd setup --client claude --dry-run',
      'antd setup --client claude --check',
    ],
  },
  {
    id: 'antd-cli-codex',
    client: 'codex',
    title: 'Ant Design CLI / MCP · Codex',
    description: '同一个 Ant Design 官方 CLI/MCP 可以接入 Codex；Codex 只是 Agent 客户端，组件知识和诊断能力来自 @ant-design/cli。',
    configPath: '由 antd setup --client codex 自动配置',
    commands: [
      { label: '安装 Ant Design CLI', code: 'npm install -g @ant-design/cli' },
      { label: '验证 CLI 并查询设计语言', code: 'antd -V\nantd design.md\nantd demo Button' },
      { label: '自动配置 Codex', code: 'antd setup --client codex' },
      { label: '检查项目并执行规范诊断', code: 'antd doctor\nantd usage\nantd lint' },
      { label: '手动启动官方 MCP Server', code: 'npx -y @ant-design/cli mcp' },
    ],
    configExample: `{
  "mcpServers": {
    "antd": {
      "command": "npx",
      "args": ["-y", "@ant-design/cli", "mcp"]
    }
  }
}`,
    verification: [
      '运行 antd -V，确认 CLI 可用且 Node.js 版本不低于 20。',
      '运行 antd design.md 或 antd demo Button，确认官方设计语言与示例数据可读取。',
      '执行 antd setup --client codex 后，在 Codex 中确认 antd MCP 工具可见。',
      '让 Agent 使用 antd_info、antd_demo、antd_semantic 和 antd_changelog 核对实现与版本差异。',
      'AGENTS.md 应要求 Agent 读取 ./design.md、主题文件和现有组件结构，再调用 Ant Design 工具。',
    ],
    troubleshooting: [
      'Codex 中看不到工具：重启客户端，并检查自动配置生成的 MCP server 名称是否为 antd。',
      'server 启动失败：手动执行 npx -y @ant-design/cli mcp，确认 npm registry 与 Node.js 环境正常。',
      '项目诊断结果异常：在项目根目录运行 antd env 和 antd doctor，确认依赖版本与工作目录。',
      '迁移跨主版本时，使用 antd changelog 和 antd migrate <from> <to>，不要直接套用旧 API。',
      '第三方 MCP 只能补充资料；Ant Design 组件、Token 和版本知识以官方 CLI/MCP 为准。',
    ],
    officialUrl: 'https://ant.design/docs/react/cli',
    lastVerifiedAt: '2026-07-17',
    verifiedToolVersion: '@ant-design/cli 6.5.1',
    reviewCommands: [
      'antd -V',
      'antd setup --client codex',
      'npx -y @ant-design/cli mcp',
    ],
  },
];
