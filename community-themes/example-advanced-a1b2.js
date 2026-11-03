// src/themes/community/example-advanced-a1b2/theme.ts
import { createStyles } from "antd-style";
var advancedAuroraConfig = {
  token: {
    colorPrimary: "#722ed1",
    colorInfo: "#1677ff",
    colorBgBase: "#fbfbff",
    borderRadius: 10,
    borderRadiusSM: 8,
    borderRadiusLG: 16,
    borderRadiusXS: 4
  },
  components: {
    Button: {
      borderRadius: 10,
      primaryShadow: "0 8px 20px rgba(114, 46, 209, 0.24)"
    },
    Card: {
      borderRadiusLG: 16
    }
  }
};
var useStyles = createStyles(({ css, token }) => ({
  auroraSurface: css({
    ".ant-card": {
      boxShadow: `0 12px 28px ${token.colorPrimary}1f`
    },
    ".ant-btn-primary": {
      background: `linear-gradient(135deg, ${token.colorPrimary}, ${token.colorInfo})`,
      border: "none"
    }
  })
}));
function useAdvancedAuroraTheme() {
  const { styles } = useStyles();
  return {
    theme: advancedAuroraConfig,
    componentSize: "middle"
  };
}
var theme_default = useAdvancedAuroraTheme;
export {
  advancedAuroraConfig,
  theme_default as default,
  useAdvancedAuroraTheme
};
