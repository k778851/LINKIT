'use client';

import { useRouter } from 'next/navigation';
import { Header } from '../components/layout/Header';
import { useNotificationStore } from '../store/notificationStore';
import styles from './NotificationPage.module.css';

const TYPE_COLORS = {
  comment:    'var(--blue)',
  like:       'var(--pink)',
  club:       'var(--mint)',
  new_member: '#7B61FF',
  follow:     '#FF9500',
  system:     'var(--ink-3)',
};

export function NotificationPage() {
  const router = useRouter();
  const notifications = useNotificationStore((s) => s.notifications);
  const markRead     = useNotificationStore((s) => s.markRead);
  const markAllRead  = useNotificationStore((s) => s.markAllRead);
  const deleteNotif  = useNotificationStore((s) => s.deleteNotif);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClick = (notif) => {
    markRead(notif.id);
    if (notif.path) router.push(notif.path);
  };

  return (
    <div className={styles.page}>
      <Header
        title="알림"
        right={
          unreadCount > 0
            ? <button className={styles.markBtn} onClick={markAllRead}>모두 읽음</button>
            : null
        }
      />

      {unreadCount > 0 && (
        <div className={styles.unreadBanner}>
          <span className={styles.unreadDot} />
          읽지 않은 알림 {unreadCount}개
        </div>
      )}

      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyIcon}>🔔</p>
          <p className={styles.emptyTitle}>알림이 없어요</p>
          <p className={styles.emptyDesc}>새로운 소식이 오면 알려드릴게요</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notif, idx) => (
            <button
              key={notif.id}
              className={`${styles.row} ${!notif.read ? styles.unread : ''} card-animate`}
              style={{ animationDelay: `${Math.min(idx * 30, 210)}ms` }}
              onClick={() => handleClick(notif)}
            >
              {!notif.read && (
                <span className={styles.dot} style={{ background: TYPE_COLORS[notif.type] }} />
              )}
              <div
                className={styles.iconBox}
                style={{ background: `${TYPE_COLORS[notif.type]}18` }}
              >
                <span className={styles.iconEmoji}>{notif.icon}</span>
              </div>
              <div className={styles.content}>
                <p className={styles.title}>{notif.title}</p>
                <p className={styles.body}>{notif.body}</p>
                <p className={styles.time}>{notif.time}</p>
              </div>
              <button
                className={styles.delBtn}
                onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
                aria-label="알림 삭제"
              >
                ×
              </button>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
