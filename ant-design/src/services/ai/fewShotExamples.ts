const en = `
## Examples

User: "Change the primary color to red"
Response:
{"token":{"colorPrimary":"#f5222d"}}

User: "Make it rounded style"
Response:
{"token":{"borderRadiusXS":6,"borderRadiusSM":8,"borderRadius":12,"borderRadiusLG":16}}

User: "Create a serious enterprise style"
Response:
{"token":{"colorPrimary":"#1d39c4","borderRadiusXS":1,"borderRadiusSM":2,"borderRadius":2,"borderRadiusLG":4,"fontSize":14,"fontSizeLG":16,"padding":16,"paddingLG":24}}

User: "Switch to dark mode"
Response:
{"algorithm":"dark","token":{"colorBgBase":"#141414","colorTextBase":"#ffffff"}}

User: "Make buttons more prominent"
Response:
{"components":{"Button":{"controlHeight":40,"fontWeight":600,"primaryShadow":"0 4px 12px rgba(22,119,255,0.3)"}}}
`;

const zh = `
## 示例

用户："把主色改成红色"
回复：
{"token":{"colorPrimary":"#f5222d"}}

用户："改成圆润风格"
回复：
{"token":{"borderRadiusXS":6,"borderRadiusSM":8,"borderRadius":12,"borderRadiusLG":16}}

用户："做一个企业级严肃风格"
回复：
{"token":{"colorPrimary":"#1d39c4","borderRadiusXS":1,"borderRadiusSM":2,"borderRadius":2,"borderRadiusLG":4,"fontSize":14,"fontSizeLG":16,"padding":16,"paddingLG":24}}

用户："切换到暗色模式"
回复：
{"algorithm":"dark","token":{"colorBgBase":"#141414","colorTextBase":"#ffffff"}}

用户："让按钮更突出"
回复：
{"components":{"Button":{"controlHeight":40,"fontWeight":600,"primaryShadow":"0 4px 12px rgba(22,119,255,0.3)"}}}
`;

export const fewShotExamples = { 'en-US': en, 'zh-CN': zh } as const;
