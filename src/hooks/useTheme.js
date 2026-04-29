import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useTheme() {
  const user = useAuthStore((s) => s.user);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const theme = user?.settings?.theme ?? 'light';

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('linkit-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: next });
  };

  return { theme, toggleTheme, isDark: theme === 'dark' };
}
