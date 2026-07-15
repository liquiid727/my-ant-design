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
};

const lastVerifiedAt = '2026-07-15';

export const toolingGuideRegistry: ToolingGuide[] = [
  {
    id: 'claude-code-mcp',
    client: 'claude-code',
    title: 'Claude Code CLI / MCP',
    description: 'local scope 仅用于当前项目且保持私有；project scope 写入可共享的 .mcp.json；user scope 跨项目生效。',
    configPath: '.mcp.json (project scope)',
    commands: [
      { label: '添加公开 Context7 MCP（project scope）', code: 'claude mcp add --transport stdio --scope project context7 -- npx -y @upstash/context7-mcp' },
      { label: '列出 MCP servers', code: 'claude mcp list' },
      { label: '查看单个 server', code: 'claude mcp get context7' },
      { label: '在 Claude Code 会话中检查状态', code: '/mcp' },
    ],
    configExample: `{
  "mcpServers": {
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"],
      "env": {}
    }
  }
}`,
    verification: [
      '运行 claude mcp list，确认 context7 出现在列表中。',
      '运行 claude mcp get context7，核对 transport、command 与 scope。',
      '按用途选择 scope：local=当前项目私有，project=.mcp.json 团队共享，user=个人跨项目。',
      '启动 Claude Code 后输入 /mcp，确认 server 已连接并可见。',
      '让 Agent 先读取项目中的 ./design.md 与主题文件；MCP 不替代这些项目文件。',
    ],
    troubleshooting: [
      '找不到 npx：先确认 Node.js 与 npm 已安装并位于 PATH。',
      '项目成员看不到配置：确认使用 project scope，并提交仓库根目录的 .mcp.json。',
      '配置冲突：检查 local、project、user 同名 server；local 优先级最高。',
      'server 未连接：运行 claude mcp get context7 并在 /mcp 中查看错误。',
    ],
    officialUrl: 'https://code.claude.com/docs/en/mcp',
    lastVerifiedAt,
  },
  {
    id: 'codex-mcp',
    client: 'codex',
    title: 'Codex CLI / MCP',
    description: '用户默认配置位于 ~/.codex/config.toml；可信项目可使用 .codex/config.toml。',
    configPath: '~/.codex/config.toml or .codex/config.toml (trusted projects)',
    commands: [
      { label: '添加公开 Context7 MCP', code: 'codex mcp add context7 -- npx -y @upstash/context7-mcp' },
      { label: '列出 MCP servers', code: 'codex mcp list' },
      { label: '查看可用 MCP 子命令', code: 'codex mcp --help' },
      { label: '在 Codex TUI 中检查状态', code: '/mcp' },
    ],
    configExample: `[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]`,
    verification: [
      '运行 codex mcp list，确认 context7 已配置。',
      '启动 codex TUI 后输入 /mcp，确认 server 与工具可见。',
      '项目级 .codex/config.toml 只有在信任该项目后才会加载。',
      'AGENTS.md 应要求 Agent 读取 ./design.md、主题文件和现有组件结构。',
    ],
    troubleshooting: [
      '项目配置未生效：确认项目已标记为 trusted，并检查更近目录的 .codex/config.toml 覆盖。',
      'server 启动失败：运行 codex mcp --help 和 codex mcp list，并手动执行 npx 命令检查依赖。',
      '配置位置错误：个人默认放 ~/.codex/config.toml，共享项目配置放仓库的 .codex/config.toml。',
      'TUI 中不可见：重启 Codex，使更新后的 MCP 配置重新加载。',
    ],
    officialUrl: 'https://learn.chatgpt.com/docs/extend/mcp',
    lastVerifiedAt,
  },
];
