#!/usr/bin/env node
/**
 * 页面配方（Page Recipe）校验：Agent 说"我要这样拼一页"，这里判断它能不能拼。
 *
 *   npm run recipe -- agents/examples/04-ride-home.recipe.json
 *   npm run recipe -- agents/examples/05-ride-home-broken.recipe.json --json
 *
 * 规则：组件必须在契约里、props 必须匹配契约（必填/枚举/类型）、
 *      不能塞契约之外的东西、不能写颜色字面量、token 必须公开存在。
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { APPS } from '../pipeline/pipeline.config.mjs';
import { ROOT } from '../pipeline/compiler/paths.mjs';

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/;

const readJson = async (rel) => JSON.parse(await fs.readFile(path.join(ROOT, rel), 'utf8'));

const loadContracts = async (app) => {
  const files = (await fs.readdir(path.join(ROOT, app.contracts))).filter((file) => file.endsWith('.json'));
  const contracts = await Promise.all(files.map((file) => readJson(path.join(app.contracts, file))));
  return new Map(contracts.map((contract) => [contract.name, contract]));
};

const loadPublicTokens = async (appId) => {
  const catalog = await readJson(`src/generated/catalog.${appId}.json`);
  return new Set(catalog.brands.flatMap((brand) => brand.tokens.filter((token) => token.public).map((token) => token.path)));
};

const unionValues = (type) => [...(type ?? '').matchAll(/'([^']+)'/g)].map((match) => match[1]);

const typeOf = (value) => {
  if (Array.isArray(value)) return 'array';
  if (value === null) return 'null';
  return typeof value;
};

const checkProps = (component, contract, props, issues, index) => {
  const at = `sections[${index}] ${component}`;
  const declared = new Map((contract.props ?? []).map((prop) => [prop.name, prop]));

  for (const prop of contract.props ?? []) {
    if (prop.required && !(prop.name in props)) issues.push(`${at}: 缺少必填 prop "${prop.name}"`);
  }

  for (const [name, value] of Object.entries(props)) {
    const spec = declared.get(name);
    if (!spec) {
      issues.push(`${at}: prop "${name}" 不在契约里（可用：${[...declared.keys()].join(' / ')}）`);
      continue;
    }
    if (typeof value === 'string' && typeof spec.enum?.[0] === 'string' && COLOR_LITERAL.test(value)) {
      issues.push(`${at}.${name}: 不允许写颜色字面量 "${value}"，颜色只能来自 token`);
    }
    const union = unionValues(spec.type);
    const allowed = spec.enum ?? union;

    if (allowed.length) {
      if (!allowed.includes(value)) issues.push(`${at}.${name}: "${value}" 不在允许值里（${allowed.join(' / ')}）`);
      continue;
    }

    const declaredType = spec.type?.trim();
    if (declaredType === 'function') {
      issues.push(`${at}.${name}: recipe 里不能传函数`);
      continue;
    }
    if (declaredType) {
      const actual = typeOf(value);
      if (actual !== declaredType) issues.push(`${at}.${name}: 类型应为 ${declaredType}，实际是 ${actual}`);
    }
  }
};

const main = async () => {
  const args = process.argv.slice(2);
  const file = args.find((arg) => !arg.startsWith('--'));
  const asJson = args.includes('--json');

  if (!file) {
    console.error('用法：npm run recipe -- <recipe.json> [--json]');
    process.exitCode = 1;
    return;
  }

  const recipe = JSON.parse(await fs.readFile(path.resolve(process.cwd(), file), 'utf8'));
  const issues = [];
  const app = APPS.find((item) => item.id === recipe.app);

  if (!recipe.id || !recipe.page) issues.push('缺少 id 或 page');
  if (!app) issues.push(`app 必须是 ${APPS.map((item) => item.id).join(' / ')}`);
  if (!Array.isArray(recipe.sections) || recipe.sections.length === 0) issues.push('sections 必须是非空数组');

  const report = { recipe: recipe.id, app: recipe.app, page: recipe.page, sections: [], issues, blocking: false };

  if (app) {
    const contracts = await loadContracts(app);
    const publicTokens = await loadPublicTokens(app.id);

    for (const [index, section] of (recipe.sections ?? []).entries()) {
      const contract = contracts.get(section.component);
      const before = issues.length;

      if (!contract) {
        issues.push(`sections[${index}]: 组件 "${section.component}" 不在 ${app.id} 的契约里（可用：${[...contracts.keys()].join(' / ')}）`);
        report.sections.push({ component: section.component, ok: false });
        continue;
      }

      checkProps(section.component, contract, section.props ?? {}, issues, index);

      for (const tokenPath of section.tokens ?? []) {
        if (!publicTokens.has(tokenPath)) issues.push(`sections[${index}]: token "${tokenPath}" 不存在或不可见`);
      }

      report.sections.push({
        component: section.component,
        ok: issues.length === before,
        declaredTokens: contract.tokens?.length ?? 0,
      });
    }
  }

  report.blocking = issues.length > 0;

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = report.blocking ? 1 : 0;
    return;
  }

  console.log('');
  console.log(`  Recipe  ${recipe.id ?? '(无 id)'}  →  ${recipe.page ?? '(无 page)'}（${recipe.app ?? '?'}）`);
  console.log('');

  for (const section of report.sections) {
    console.log(`  ${section.ok ? '✓' : '✗'} ${section.component.padEnd(14)} 契约 ${section.declaredTokens ?? 0} 个 token`);
  }

  if (issues.length) {
    console.log(`\n  ✗ ${issues.length} 个问题`);
    for (const issue of issues) console.log(`      ${issue}`);
    console.log('');
    process.exitCode = 1;
    return;
  }

  console.log('\n  ✓ 组件与 props 全部落在契约内，没有硬编码颜色\n');
};

main().catch((error) => {
  console.error(`\n配方校验失败：${error.message}\n`);
  process.exitCode = 1;
});
