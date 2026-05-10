'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import styles from './Header.module.css';

export function Header({ title, left, right, transparent }) {
  const router = useRouter();

  const defaultLeft = (
    <button className={styles.iconBtn} onClick={() => router.back()} aria-label="뒤로가기">
      <ArrowLeft size={22} strokeWidth={2} />
    </button>
  );

  return (
    <header className={`${styles.header} ${transparent ? styles.transparent : ''}`}>
      <div className={styles.left}>{left !== undefined ? left : defaultLeft}</div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>{right}</div>
    </header>
  );
}
