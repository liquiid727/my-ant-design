import { describe, expect, it } from 'vitest';
import {
  ADOPTED,
  FEATURED,
  GROUPS,
  RESOURCES,
  groupById,
  logoSrc,
  previewSrc,
  resourceById,
  resourcesOf,
} from './resources';

describe('资源清单', () => {
  it('id 唯一，页面上的编号才稳定', () => {
    const ids = RESOURCES.map((resource) => resource.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('每个分组都有条目，每条都属于一个已声明的分组', () => {
    for (const group of GROUPS) {
      expect(resourcesOf(group.id).length).toBeGreaterThan(0);
      expect(groupById(group.id)?.label).toBe(group.label);
    }
    expect(groupById('nope')).toBeUndefined();
    for (const resource of RESOURCES) {
      expect(GROUPS.some((group) => group.id === resource.group)).toBe(true);
    }
  });

  it('入口与仓库都是 https，外链不会走到 http', () => {
    for (const resource of RESOURCES) {
      expect(resource.href.startsWith('https://')).toBe(true);
      if (resource.repo) expect(resource.repo.startsWith('https://')).toBe(true);
    }
  });

  it('一句话 + 一个短标签，页面上不会又变成一堵字', () => {
    for (const resource of RESOURCES) {
      expect(resource.claim.length).toBeLessThanOrEqual(46);
      expect(resource.tag.length).toBeGreaterThan(0);
      expect(resource.tag.length).toBeLessThanOrEqual(10);
      expect(resource.license.trim().length).toBeGreaterThan(0);
    }
  });

  it('每条都能解析到真实图标，缺图就是缺证据', () => {
    for (const resource of RESOURCES) {
      expect(logoSrc(resource.id), `缺少图标 ${resource.id}.png`).toMatch(/^data:|^\/|^https?:|\.(png|svg|webp)/);
    }
    expect(logoSrc('没有这一条')).toBe('');
  });

  it('先看的四个都有截图，且指向真实条目', () => {
    expect(FEATURED.length).toBe(4);
    for (const id of FEATURED) {
      expect(resourceById(id), `先看列表里的 ${id} 不存在`).toBeTruthy();
      expect(previewSrc(id), `缺少预览 preview-${id}.jpg`).not.toBe('');
    }
  });

  it('已进管线的条目都在清单里，不会指向不存在的 id', () => {
    expect(ADOPTED.length).toBeGreaterThan(0);
    const ids = new Set(RESOURCES.map((resource) => resource.id));
    for (const resource of ADOPTED) expect(ids.has(resource.id)).toBe(true);
  });
});
