'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Bell, Moon, Info, LogOut } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';
import { useTheme } from '../../../hooks/useTheme';
import { Modal } from '../../../components/common/Modal';
import styles from './SettingsTab.module.css';

export function SettingsTab() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const { isDark, toggleTheme } = useTheme();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  const rows = [
    { icon: Bell,  label: '알림 설정', to: '/mypage/settings/notifications' },
    { icon: Info,  label: '앱 정보', to: '/mypage/settings/about' },
  ];

  return (
    <div className={styles.tab}>
      <ul className={styles.list}>
        {rows.map(({ icon: Icon, label, to }) => (
          <li key={to}>
            <button className={styles.row} onClick={() => router.push(to)}>
              <span className={styles.rowIconBox}><Icon size={16} /></span>
              <span className={styles.rowLabel}>{label}</span>
              <ChevronRight size={16} className={styles.chevron} />
            </button>
          </li>
        ))}

        {/* 다크모드 토글 */}
        <li>
          <div className={styles.row}>
            <span className={styles.rowIconBox}><Moon size={16} /></span>
            <span className={styles.rowLabel}>다크모드</span>
            <button
              className={`${styles.toggle} ${isDark ? styles.toggleOn : ''}`}
              onClick={toggleTheme}
              aria-label={isDark ? '라이트모드로 전환' : '다크모드로 전환'}
            >
              <span className={styles.toggleThumb} />
            </button>
          </div>
        </li>

        {/* 로그아웃 */}
        <li>
          <button className={`${styles.row} ${styles.logoutRow}`} onClick={() => setShowLogout(true)}>
            <span className={`${styles.rowIconBox}`}><LogOut size={16} /></span>
            <span className={styles.rowLabel}>로그아웃</span>
          </button>
        </li>
      </ul>

      {showLogout && (
        <Modal
          title="로그아웃"
          message="정말 로그아웃 하시겠어요?"
          confirmLabel="로그아웃"
          cancelLabel="취소"
          danger
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}
