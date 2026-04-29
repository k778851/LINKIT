'use client';

import clsx from 'clsx';
import styles from './Chip.module.css';

export function Chip({ active, onClick, children, className }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(styles.chip, active && styles.active, className)}
      aria-pressed={active}
    >
      {children}
    </button>
  );
}
