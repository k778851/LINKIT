'use client';

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 2500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]); // max 4
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
}

/* ── Toast UI ── */
const TYPE_ICON = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed',
      bottom: 'calc(var(--height-tab-bar) + 16px)',
      left: '50%',
      transform: 'translateX(-50%)',
      width: 'calc(min(100vw, var(--max-width)) - 32px)',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => onRemove(t.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '12px 16px',
            background: 'var(--ink)',
            color: '#fff',
            borderRadius: 14,
            fontSize: 14,
            fontWeight: 500,
            boxShadow: '0 4px 20px rgba(0,0,0,0.22)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            animation: 'toastIn 0.25s ease',
            lineHeight: 1.4,
          }}
        >
          <span style={{ fontSize: 16 }}>{TYPE_ICON[t.type] ?? TYPE_ICON.info}</span>
          <span style={{ flex: 1 }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
