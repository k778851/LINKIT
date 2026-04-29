'use client';

import clsx from 'clsx';
import styles from './Card.module.css';

export function Card({ className, onClick, children }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      className={clsx(styles.card, onClick && styles.clickable, className)}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      {children}
    </Tag>
  );
}
