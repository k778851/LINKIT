'use client';

import { useEffect } from 'react';
import styles from './Modal.module.css';
import { Button } from './Button';

export function Modal({ title, message, confirmLabel = '확인', cancelLabel = '취소', onConfirm, onCancel, danger }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {message && <p className={styles.message}>{message}</p>}
        <div className={styles.actions}>
          {onCancel && (
            <Button variant="ghost" className={styles.btn} onClick={onCancel}>
              {cancelLabel}
            </Button>
          )}
          <Button
            variant={danger ? 'danger' : 'primary'}
            className={styles.btn}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
