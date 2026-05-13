'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  Bell,
  BookOpen,
  FileWarning,
  LayoutDashboard,
  LogOut,
  Megaphone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { assetPath } from '../../lib/assetPath';
import { useAuthStore } from '../../store/authStore';
import styles from './AdminLayout.module.css';

const NAV = [
  { href: '/admin', label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users', label: '회원 관리', icon: Users },
  { href: '/admin/clubs', label: '클럽 관리', icon: BookOpen },
  { href: '/admin/posts', label: '커뮤니티 · 신고', icon: FileWarning },
  { href: '/admin/operations', label: '메인 운영', icon: Megaphone },
  { href: '/admin/reports', label: '통계 리포트', icon: BarChart3 },
  { href: '/admin/policies', label: '정책 · 감사로그', icon: ShieldCheck },
];

export function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.replace('/onboarding');
  };

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Image
            src={assetPath('/logo-sig-white.png')}
            alt="LINKIT"
            width={108}
            height={32}
            style={{ objectFit: 'contain' }}
            priority
          />
          <span className={styles.brandBadge}>ADMIN</span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`${styles.navItem} ${active ? styles.navActive : ''}`}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFoot}>
          <div className={styles.liveBox}>
            <Bell size={15} />
            <span>신고 5건 대기</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <LogOut size={16} />
            <span>로그아웃</span>
          </button>
        </div>
      </aside>

      <header className={styles.topbar}>
        <Image
          src={assetPath('/logo-sig-color.png')}
          alt="LINKIT"
          width={72}
          height={22}
          style={{ objectFit: 'contain' }}
          priority
        />
        <span className={styles.topbarTitle}>관리자</span>
        <div className={styles.topbarNav}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
            return (
              <Link key={href} href={href} className={`${styles.topItem} ${active ? styles.topActive : ''}`}>
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      <main className={styles.main}>{children}</main>
    </div>
  );
}
