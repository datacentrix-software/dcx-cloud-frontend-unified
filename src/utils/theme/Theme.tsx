import { createTheme, Theme } from '@mui/material/styles';
import * as locales from '@mui/material/locale';
import { PaletteMode, Shadows } from '@mui/material';
import { useSelector } from '@/store/hooks';
import { AppState } from '@/store/store';
import { useEffect } from 'react';
import components from './Components';
import typography from './Typography';
import { shadows, darkshadows } from './Shadows';
import { baseDarkTheme, baselightTheme } from './DefaultColors';

interface BuildThemeConfig {
  mode: PaletteMode;
  direction: 'ltr' | 'rtl';
  borderRadius: number;
}

export const BuildTheme = (config: BuildThemeConfig): Theme => {
  const defaultTheme = config.mode === 'dark' ? baseDarkTheme : baselightTheme;
  const defaultShadow = config.mode === 'dark' ? darkshadows : shadows;

  const theme = createTheme(
    {
      palette: {
        ...defaultTheme.palette,
        mode: config.mode,
      },
      shape: {
        borderRadius: config.borderRadius,
      },
      shadows: defaultShadow  as unknown as Shadows,
      typography,
      direction: config.direction,
    },
    locales.enUS, // Add other locale support if needed
  );

  theme.components = components(theme);

  return theme;
};

export const ThemeSettings = () => {
  const customizer = useSelector((state: AppState) => state.customizer);

  const theme = BuildTheme({
    mode: customizer.activeMode as PaletteMode,
    direction: customizer.activeDir,
    borderRadius: customizer.borderRadius,
  });

  useEffect(() => {
    document.dir = customizer.activeDir;
  }, [customizer.activeDir]);

  return theme;
};
