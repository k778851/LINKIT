'use client';

import Image from 'next/image';
import { Header } from '../../../components/layout/Header';
import { assetPath } from '../../../lib/assetPath';
import styles from './SettingPage.module.css';

export function AboutPage() {
  return (
    <div className={styles.page}>
      <Header title="앱 정보" />

      {/* 로고 */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        padding: '32px 0 24px',
      }}>
        <Image
          src={assetPath('/logo-sig-v-color.png')}
          alt="LINKIT"
          width={100}
          height={120}
          style={{ objectFit: 'contain' }}
        />
        <p style={{ fontSize: 12, color: 'var(--ink-3)' }}>우리 동네 소모임 커뮤니티</p>
      </div>

      <ul className={styles.list}>
        {[
          { label: '앱 버전',           value: 'v1.0.0' },
          { label: '이용약관',          value: '' },
          { label: '개인정보처리방침',   value: '' },
          { label: '오픈소스 라이선스',  value: '' },
        ].map(({ label, value }) => (
          <li key={label} className={styles.row}>
            <span className={styles.rowLabel}>{label}</span>
            {value && <span className={styles.rowDesc}>{value}</span>}
          </li>
        ))}
      </ul>
      <p className={styles.copyright}>© 2026 LINKIT. All rights reserved.</p>
    </div>
  );
}
