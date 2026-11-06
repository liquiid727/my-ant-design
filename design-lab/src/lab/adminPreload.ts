/**
 * 悬停/聚焦导航时预取工作室的代码与样式。
 * 放在独立模块里，App 才能静态引用它而不把工作室打进首屏包。
 */
export const preloadAdminStudio = () => {
  void import('./AdminStudio');
  void import('@studio/App');
  void import('@studio/styles.css');
};
