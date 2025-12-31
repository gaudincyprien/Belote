import { useEffect, useState } from 'react';

/**
 * Hook to manage application theme (light/dark/auto)
 */
export function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

  // Load initial theme from settings
  useEffect(() => {
    const loadTheme = async () => {
      if (window.electron?.getAllSettings) {
        const settings = await window.electron.getAllSettings();
        setTheme(settings.theme);
      }
    };
    loadTheme();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      let shouldBeDark = false;

      if (theme === 'dark') {
        shouldBeDark = true;
      } else if (theme === 'light') {
        shouldBeDark = false;
      } else if (theme === 'auto') {
        // Auto mode: check system preference
        shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }

      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
        setEffectiveTheme('dark');
      } else {
        document.documentElement.classList.remove('dark');
        setEffectiveTheme('light');
      }
    };

    applyTheme();

    // Listen for system theme changes in auto mode
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, effectiveTheme };
}
