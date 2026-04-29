'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, FileText, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useRouter } from 'next/navigation';
import styles from './AdminLayout.module.css';

const NAV = [
  { href: '/admin',        label: '대시보드', icon: LayoutDashboard },
  { href: '/admin/users',  label: '유저 관리', icon: Users },
  { href: '/admin/clubs',  label: '클럽 관리', icon: BookOpen },
  { href: '/admin/posts',  label: '게시글 관리', icon: FileText },
];

export function AdminLayout({ children }) {
  const pathname = usePathname();
  const router   = useRouter();
  const logout   = useAuthStore((s) => s.logout);

  const handleLogout = () => { logout(); router.replace('/onboarding'); };

  return (
    <div className={styles.shell}>
      {/* 사이드바 */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <Shield size={22} color="#fff" />
          <span className={styles.brandText}>LINKIT<br /><small>관리자</small></span>
        </div>

        <nav className={styles.nav}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`${styles.navItem} ${active ? styles.navActive : ''}`}>
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} />
          <span>로그아웃</span>
        </button>
      </aside>

      {/* 모바일 탑바 */}
      <header className={styles.topbar}>
        <Shield size={18} color="var(--blue)" />
        <span className={styles.topbarTitle}>LINKIT 관리자</span>
        <div className={styles.topbarNav}>
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`${styles.topItem} ${active ? styles.topActive : ''}`}>
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
