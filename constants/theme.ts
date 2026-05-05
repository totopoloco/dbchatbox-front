import { Platform } from 'react-native';

export const BrandColors = {
  light: {
    primary: '#CCAA71',
    primaryPressed: '#B8925A',
    onPrimary: '#F8FAFC',
    navBar: '#242628',
    navBarText: '#F4F5F5',
    navBarTextActive: '#CCAA71',
    background: '#FFFFFF',
    surface: '#FFFFFF',
    surfaceVariant: '#F1F5F9',
    onSurface: '#0C0D0D',
    onSurfaceVariant: '#64748B',
    outline: '#E2E8F0',
    error: '#EF4444',
    onError: '#F8FAFC',
    warning: '#D97706',
    success: '#15803D',
    statusActive: '#15803D',
    statusInactive: '#64748B',
    statusDeleted: '#EF4444',
    paymentPaid: '#15803D',
    paymentOverdue: '#EF4444',
    paymentInReview: '#D97706',
  },
  dark: {
    primary: '#CCAA71',
    primaryPressed: '#B8925A',
    onPrimary: '#F8FAFC',
    navBar: '#242628',
    navBarText: '#F4F5F5',
    navBarTextActive: '#CCAA71',
    background: '#1A1C1D',
    surface: '#242628',
    surfaceVariant: '#2E3032',
    onSurface: '#F4F5F5',
    onSurfaceVariant: '#94A3B8',
    outline: '#3A3C3E',
    error: '#FCA5A5',
    onError: '#450A0A',
    warning: '#FCD34D',
    success: '#86EFAC',
    statusActive: '#86EFAC',
    statusInactive: '#94A3B8',
    statusDeleted: '#FCA5A5',
    paymentPaid: '#86EFAC',
    paymentOverdue: '#FCA5A5',
    paymentInReview: '#FCD34D',
  },
};

// Legacy Colors export kept for backward-compat with useThemeColor
export const Colors = {
  light: {
    text: BrandColors.light.onSurface,
    background: BrandColors.light.background,
    tint: BrandColors.light.primary,
    icon: BrandColors.light.onSurfaceVariant,
    tabIconDefault: BrandColors.light.navBarText,
    tabIconSelected: BrandColors.light.navBarTextActive,
  },
  dark: {
    text: BrandColors.dark.onSurface,
    background: BrandColors.dark.background,
    tint: BrandColors.dark.primary,
    icon: BrandColors.dark.onSurfaceVariant,
    tabIconDefault: BrandColors.dark.navBarText,
    tabIconSelected: BrandColors.dark.navBarTextActive,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
