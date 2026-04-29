'use client';

import { useAuthStore } from '../../../store/authStore';
import { Header } from '../../../components/layout/Header';
import { Check } from 'lucide-react';
import styles from './SettingPage.module.css';

const LANGUAGES = [
  { code: 'ko', label: '한국어' },
  { code: 'en', label: 'English' },
];

export function LanguagePage() {
  const user = useAuthStore((s) => s.user);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const current = user?.settings?.language ?? 'ko';

  return (
    <div className={styles.page}>
      <Header title="언어" />
      <ul className={styles.list}>
        {LANGUAGES.map(({ code, label }) => (
          <li key={code}>
            <button className={styles.row} style={{ width: '100%' }} onClick={() => updateSettings({ language: code })}>
              <span className={styles.rowLabel}>{label}</span>
              {current === code && <Check size={18} color="var(--color-primary)" />}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
