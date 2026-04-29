'use client';

import { ToastProvider } from '../context/ToastContext';
import { AppInitProvider } from '../context/AppInitProvider';
import { useTheme } from '../hooks/useTheme';

/** 앱 전역 테마를 html[data-theme]에 동기화 */
function ThemeSync() {
  useTheme();
  return null;
}

/** 클라이언트 전용 Provider 묶음 — RootLayout(서버 컴포넌트)에서 import */
export function ClientProviders({ children }) {
  return (
    <ToastProvider>
      <AppInitProvider>
        <ThemeSync />
        {children}
      </AppInitProvider>
    </ToastProvider>
  );
}
