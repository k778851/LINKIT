'use client';

import clsx from 'clsx';
import styles from './Button.module.css';

export function Button({ variant = 'primary', size = 'md', disabled, className, children, ...props }) {
  return (
    <button
      className={clsx(styles.btn, styles[variant], styles[size], className)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
