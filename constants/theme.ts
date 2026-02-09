/**
 * RecycleHub Theme Configuration
 * White and Emerald Green color palette
 */

import { Platform } from 'react-native';

// Emerald Green Colors
export const EmeraldColors = {
  light: {
    primary: '#10B981',       // Emerald 500
    primaryDark: '#059669',   // Emerald 600
    primaryLight: '#34D399',  // Emerald 400
    background: '#FFFFFF',
    surface: '#F0FDF4',       // Emerald 50
    text: '#11181C',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    error: '#EF4444',
    success: '#10B981',
  },
  dark: {
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#34D399',
    background: '#111827',   // Gray 900
    surface: '#1F2937',      // Gray 800
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    error: '#EF4444',
    success: '#10B981',
  },
};

export const Colors = {
  light: {
    ...EmeraldColors.light,
    tint: EmeraldColors.light.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: EmeraldColors.light.primary,
  },
  dark: {
    ...EmeraldColors.dark,
    tint: EmeraldColors.dark.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: EmeraldColors.dark.primary,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
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
