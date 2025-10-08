import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({
  mode: 'system', // 'system' | 'light' | 'dark'
  theme: 'light', // resolved theme
  cycleMode: () => {},
  setMode: () => {},
  palette: 'default', // 'default' | 'ocean' (extensible)
  setPalette: () => {},
  cyclePalette: () => {},
});

const getSystemTheme = () => (
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
);

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem('themeMode') || 'system';
    } catch {
      return 'system';
    }
  });

  const [systemTheme, setSystemTheme] = useState(getSystemTheme());
  const [palette, setPalette] = useState(() => {
    try {
      return localStorage.getItem('themePalette') || 'default';
    } catch {
      return 'default';
    }
  });

  // Watch system changes
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => setSystemTheme(mq.matches ? 'dark' : 'light');
    try { mq.addEventListener('change', handler); } catch { mq.addListener(handler); }
    return () => { try { mq.removeEventListener('change', handler); } catch { mq.removeListener(handler); } };
  }, []);

  const theme = useMemo(() => (mode === 'system' ? systemTheme : mode), [mode, systemTheme]);

  // Apply theme + palette to root attributes and color-scheme
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-palette', palette);
    root.style.colorScheme = theme;
  }, [theme, palette]);

  // Persist user-chosen mode (not the resolved theme)
  useEffect(() => {
    try { localStorage.setItem('themeMode', mode); } catch {}
  }, [mode]);

  // Persist palette
  useEffect(() => {
    try { localStorage.setItem('themePalette', palette); } catch {}
  }, [palette]);

  const cycleMode = useCallback(() => {
    // Toggle strictly between light and dark. If currently following system, use resolved theme to toggle.
    setMode((prev) => {
      const current = prev === 'system' ? (systemTheme || 'light') : prev;
      return current === 'light' ? 'dark' : 'light';
    });
  }, [systemTheme]);

  const cyclePalette = useCallback(() => {
    setPalette((prev) => (prev === 'default' ? 'ocean' : 'default'));
  }, []);

  const value = useMemo(() => ({
    mode,
    theme,
    cycleMode,
    setMode,
    palette,
    setPalette,
    cyclePalette,
  }), [mode, theme, cycleMode, setMode, palette, setPalette, cyclePalette]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
