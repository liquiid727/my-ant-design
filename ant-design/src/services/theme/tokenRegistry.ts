import type { TokenMeta } from '../../types';

export const globalTokens: TokenMeta[] = [
  { name: 'colorPrimary', type: 'color', default: '#1677FF', group: 'Colors', description: 'Primary brand color' },
  { name: 'colorSuccess', type: 'color', default: '#52c41a', group: 'Colors', description: 'Success state color' },
  { name: 'colorWarning', type: 'color', default: '#faad14', group: 'Colors', description: 'Warning state color' },
  { name: 'colorError', type: 'color', default: '#ff4d4f', group: 'Colors', description: 'Error state color' },
  { name: 'colorInfo', type: 'color', default: '#1677FF', group: 'Colors', description: 'Informational color' },
  { name: 'colorBgBase', type: 'color', default: '#ffffff', group: 'Colors', description: 'Base background color' },
  { name: 'colorTextBase', type: 'color', default: '#000000', group: 'Colors', description: 'Base text color' },
  { name: 'borderRadius', type: 'number', default: 6, min: 0, max: 32, group: 'Border', description: 'Base radius' },
  { name: 'borderRadiusSM', type: 'number', default: 4, min: 0, max: 24, group: 'Border', description: 'Small radius' },
  { name: 'borderRadiusLG', type: 'number', default: 8, min: 0, max: 40, group: 'Border', description: 'Large radius' },
  { name: 'borderRadiusXS', type: 'number', default: 2, min: 0, max: 16, group: 'Border', description: 'Extra small radius' },
  { name: 'lineWidth', type: 'number', default: 1, min: 0, max: 6, group: 'Border', description: 'Border width' },
  { name: 'fontSize', type: 'number', default: 14, min: 10, max: 24, group: 'Typography', description: 'Base font size' },
  { name: 'fontSizeSM', type: 'number', default: 12, min: 9, max: 20, group: 'Typography', description: 'Small font size' },
  { name: 'fontSizeLG', type: 'number', default: 16, min: 12, max: 30, group: 'Typography', description: 'Large font size' },
  { name: 'padding', type: 'number', default: 16, min: 0, max: 48, group: 'Spacing', description: 'Base padding' },
  { name: 'paddingSM', type: 'number', default: 12, min: 0, max: 40, group: 'Spacing', description: 'Small padding' },
  { name: 'paddingLG', type: 'number', default: 24, min: 0, max: 64, group: 'Spacing', description: 'Large padding' },
  { name: 'margin', type: 'number', default: 16, min: 0, max: 48, group: 'Spacing', description: 'Base margin' },
  { name: 'marginSM', type: 'number', default: 12, min: 0, max: 40, group: 'Spacing', description: 'Small margin' },
  { name: 'marginLG', type: 'number', default: 24, min: 0, max: 64, group: 'Spacing', description: 'Large margin' },
];

export const componentTokens: Record<string, TokenMeta[]> = {
  Button: [
    { name: 'borderRadius', type: 'number', default: 6, min: 0, max: 40, group: 'Button', description: 'Button radius' },
    { name: 'controlHeight', type: 'number', default: 32, min: 24, max: 64, group: 'Button', description: 'Button height' },
    { name: 'fontWeight', type: 'number', default: 400, min: 300, max: 800, group: 'Button', description: 'Button font weight' },
    { name: 'primaryShadow', type: 'string', default: '0 2px 0 rgba(5,145,255,0.1)', group: 'Button', description: 'Primary shadow' },
  ],
  Input: [
    { name: 'borderRadius', type: 'number', default: 6, min: 0, max: 32, group: 'Input', description: 'Input radius' },
    { name: 'activeBorderColor', type: 'color', default: '#1677FF', group: 'Input', description: 'Active border color' },
    { name: 'hoverBorderColor', type: 'color', default: '#4096ff', group: 'Input', description: 'Hover border color' },
  ],
  Select: [
    { name: 'borderRadius', type: 'number', default: 6, min: 0, max: 32, group: 'Select', description: 'Select radius' },
    { name: 'optionSelectedBg', type: 'color', default: '#e6f4ff', group: 'Select', description: 'Selected option background' },
  ],
  Card: [
    { name: 'borderRadiusLG', type: 'number', default: 8, min: 0, max: 40, group: 'Card', description: 'Card radius' },
    { name: 'colorBgContainer', type: 'color', default: '#ffffff', group: 'Card', description: 'Card background' },
  ],
  Modal: [
    { name: 'borderRadiusLG', type: 'number', default: 8, min: 0, max: 40, group: 'Modal', description: 'Modal radius' },
    { name: 'titleFontSize', type: 'number', default: 16, min: 12, max: 28, group: 'Modal', description: 'Title font size' },
  ],
  Alert: [
    { name: 'borderRadiusLG', type: 'number', default: 8, min: 0, max: 40, group: 'Alert', description: 'Alert radius' },
  ],
  Table: [
    { name: 'headerBg', type: 'color', default: '#fafafa', group: 'Table', description: 'Header background' },
    { name: 'rowHoverBg', type: 'color', default: '#fafafa', group: 'Table', description: 'Row hover background' },
    { name: 'borderColor', type: 'color', default: '#f0f0f0', group: 'Table', description: 'Table border color' },
  ],
  Menu: [
    { name: 'itemSelectedBg', type: 'color', default: '#e6f4ff', group: 'Menu', description: 'Selected item background' },
    { name: 'itemBorderRadius', type: 'number', default: 8, min: 0, max: 32, group: 'Menu', description: 'Menu item radius' },
  ],
};

export const allComponentNames = Object.keys(componentTokens);

export const tokenRegistry = {
  global: globalTokens,
  components: componentTokens,
};

