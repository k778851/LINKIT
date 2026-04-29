'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, MessageSquare, User } from 'lucide-react';
import styles from './BottomTabBar.module.css';

const tabs = [
  { to: '/home',      icon: Home,          label: '홈' },
  { to: '/clubs',     icon: Users,         label: '클럽' },
  { to: '/community', icon: MessageSquare, label: '커뮤니티' },
  { to: '/mypage',    icon: User,          label: '마이페이지' },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="하단 탭 메뉴">
      {tabs.map(({ to, icon: Icon, label }) => {
        const isActive = pathname === to || pathname.startsWith(to + '/');
        return (
          <Link
            key={to}
            href={to}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            aria-label={label}
          >
            <Icon size={22} strokeWidth={1.8} />
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
