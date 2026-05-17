'use client';

import { useAuthStore } from '../../../store/authStore';
import { Header } from '../../../components/layout/Header';
import styles from './SettingPage.module.css';

export function NotificationsPage() {
  const user = useAuthStore((s) => s.user);
  const updateSettings = useAuthStore((s) => s.updateSettings);
  const n = user?.settings?.notifications ?? { push: true };

  const toggle = (key) => updateSettings({ notifications: { ...n, [key]: !n[key] } });

  const items = [
    { key: 'push', label: '푸시 알림', desc: '새 모임·댓글 등 앱 푸시 알림' },
  ];

  return (
    <div className={styles.page}>
      <Header title="알림 설정" />
      <ul className={styles.list}>
        {items.map(({ key, label, desc }) => (
          <li key={key} className={styles.row}>
            <div className={styles.rowInfo}>
              <p className={styles.rowLabel}>{label}</p>
              <p className={styles.rowDesc}>{desc}</p>
            </div>
            <button
              className={`${styles.toggle} ${n[key] ? styles.toggleOn : ''}`}
              onClick={() => toggle(key)}
              aria-label={label}
            >
              <span className={styles.toggleThumb} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
