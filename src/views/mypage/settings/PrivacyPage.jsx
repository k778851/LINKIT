'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../../../store/authStore';
import { Header } from '../../../components/layout/Header';
import { Modal } from '../../../components/common/Modal';
import styles from './SettingPage.module.css';

export function PrivacyPage() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const [showDelete, setShowDelete] = useState(false);

  const handleDelete = () => { logout(); router.replace('/'); };

  return (
    <div className={styles.page}>
      <Header title="개인정보 · 보안" />
      <ul className={styles.list}>
        <li className={styles.row} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
          <p className={styles.rowLabel}>비밀번호 변경</p>
          <p className={styles.rowDesc}>비밀번호 변경 이력 없음</p>
        </li>
        <li>
          <button className={`${styles.row} ${styles.dangerRow}`} style={{ width: '100%' }} onClick={() => setShowDelete(true)}>
            계정 삭제
          </button>
        </li>
      </ul>
      {showDelete && (
        <Modal
          title="계정 삭제"
          message="계정을 삭제하면 모든 데이터가 사라져요. 정말 삭제하시겠어요?"
          confirmLabel="삭제"
          cancelLabel="취소"
          danger
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
        />
      )}
    </div>
  );
}
