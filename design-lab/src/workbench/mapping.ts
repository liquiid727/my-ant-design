/**
 * 结构配方 → 页面配方：先让模型提议，再用和 scripts/recipe.mjs 相同的规则校验。
 * 模型只负责"这一段看起来像 Action"，能不能成立由校验器说。
 */
import type { Recipe } from './recipe';

export type ComponentSpec = {
  name: string;
  purpose?: string;
  props?: { name: string; type?: string; required?: boolean; enum?: string[]; default?: unknown }[];
};

export type PageRecipe = {
  id: string;
  app: string;
  page: string;
  intent?: string;
  sections: { component: string; props?: Record<string, unknown>; tokens?: string[]; note?: string }[];
};

const COLOR_LITERAL = /(#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\()/i;

export const buildMessages = (
  recipe: Recipe,
  components: ComponentSpec[],
  app: string,
  previousErrors: string[] = [],
) => {
  const system = [
    '你是一个把界面截图结构翻译成"页面配方"的助手。',
    '你只能使用给定组件清单里的组件；不能发明组件、不能写颜色字面量、不能写样式。',
    '严格输出 JSON，不要解释。',
  ].join('\n');

  const componentDoc = components
    .map((component) => {
      const props = (component.props ?? [])
        .map((prop) => `    - ${prop.name}: ${prop.type ?? 'any'}${prop.required ? '（必填）' : ''}${prop.enum ? ` 枚举 ${prop.enum.join('|')}` : ''}`)
        .join('\n');
      return `- ${component.name}：${component.purpose ?? ''}\n${props}`;
    })
    .join('\n');

  const blocks = recipe.blocks
    .slice(0, 24)
    .map((block, index) => `${index}. ${block.kind} 在 (x=${block.x.toFixed(2)}, y=${block.y.toFixed(2)}) 尺寸 ${block.w.toFixed(2)}×${block.h.toFixed(2)}`)
    .join('\n');

  const user = [
    `这个界面属于产品 ${app}。结构来自一张参考图的区域切分：`,
    blocks,
    '',
    '可用组件：',
    componentDoc,
    '',
    '输出一个页面配方，字段与约束：',
    '{ "id": "recipe-xxx", "app": "' + app + '", "page": "pages/home/index", "intent": "一句话", "sections": [ { "component": "组件名", "props": {...}, "tokens": ["可选，必须已存在"] } ] }',
    '- sections 3–5 项，按视觉从上到下；',
    '- props 必须满足上面的必填 / 枚举 / 类型；',
    '- 不要写颜色、间距、圆角、字号的字面量；',
    '- 不要输出除 JSON 以外的任何文字。',
    previousErrors.length ? `\n上一次的输出有这些问题，请修正：\n${previousErrors.map((error) => `- ${error}`).join('\n')}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ];
};

/** 与 scripts/recipe.mjs 同源的检查，放在浏览器里跑，好让自动修复有据可依。 */
export const validateRecipe = (
  value: unknown,
  context: { app: string; components: ComponentSpec[]; publicTokens: Set<string> },
): string[] => {
  const errors: string[] = [];
  if (typeof value !== 'object' || value === null) return ['返回值不是对象'];
  const recipe = value as Partial<PageRecipe>;

  if (typeof recipe.id !== 'string' || !/^recipe-[a-z0-9-]+$/.test(recipe.id)) {
    errors.push('id 必须是 recipe-<小写短横线>');
  }
  if (recipe.app !== context.app) errors.push(`app 必须是 ${context.app}`);
  if (typeof recipe.page !== 'string' || !/^pages\/[a-z0-9-]+\/index$/.test(recipe.page)) {
    errors.push('page 必须是 pages/<名称>/index');
  }
  if (!Array.isArray(recipe.sections) || recipe.sections.length === 0) {
    errors.push('sections 不能为空');
    return errors;
  }

  const specs = new Map(context.components.map((component) => [component.name, component]));

  recipe.sections.forEach((section, index) => {
    const where = `sections[${index}]`;
    if (!section || typeof section !== 'object') {
      errors.push(`${where} 不是对象`);
      return;
    }
    if (typeof section.component !== 'string') {
      errors.push(`${where}.component 缺失`);
      return;
    }
    const spec = specs.get(section.component);
    if (!spec) {
      errors.push(`${where}.component "${section.component}" 不在契约里（可用：${[...specs.keys()].join(', ')}）`);
      return;
    }

    const props = section.props ?? {};
    if (typeof props !== 'object' || Array.isArray(props)) {
      errors.push(`${where}.props 必须是对象`);
      return;
    }
    const declared = new Map((spec.props ?? []).map((prop) => [prop.name, prop]));

    for (const [name, prop] of declared) {
      if (prop.required && !(name in props)) errors.push(`${where}.props.${name} 必填`);
    }
    for (const [name, propValue] of Object.entries(props)) {
      const prop = declared.get(name);
      if (!prop) {
        errors.push(`${where}.props.${name} 不在 ${spec.name} 的契约里`);
        continue;
      }
      if (prop.enum && typeof propValue === 'string' && !prop.enum.includes(propValue)) {
        errors.push(`${where}.props.${name} 只能是 ${prop.enum.join(' | ')}`);
      }
      if (typeof propValue === 'string' && COLOR_LITERAL.test(propValue)) {
        errors.push(`${where}.props.${name} 出现颜色字面量，必须引用 token`);
      }
    }

    for (const token of section.tokens ?? []) {
      if (!context.publicTokens.has(token)) errors.push(`${where}.tokens "${token}" 不是已公开的 token`);
    }
  });

  if (JSON.stringify(recipe).match(COLOR_LITERAL)) {
    // 只保留一条整体提示，避免同类问题刷屏
    if (!errors.some((error) => error.includes('颜色字面量'))) errors.push('配方里出现颜色字面量');
  }

  return errors;
};
