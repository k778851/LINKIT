'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { api, tokenStorage } from '../api/apiClient';

/**
 * Web Push 구독 훅
 * - 로그인 상태 + 브라우저 지원 시 자동 구독 요청
 * - 권한 거부 시 조용히 종료 (강요하지 않음)
 */
export function useWebPush() {
  const user        = useAuthStore((s) => s.user);
  const subscribedRef = useRef(false);

  useEffect(() => {
    if (!user || subscribedRef.current) return;
    if (!tokenStorage.get()) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    async function setupPush() {
      try {
        // 1. Service Worker 등록
        const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await navigator.serviceWorker.ready;

        // 2. 이미 구독 중이면 서버에 재등록만 (새 기기/브라우저 대비)
        let subscription = await reg.pushManager.getSubscription();

        if (!subscription) {
          // 3. 알림 권한 요청
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          // 4. 서버에서 VAPID 공개키 가져오기
          const publicKey = await api.get('/api/push/public-key');

          // 5. Push 구독 생성
          subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          });
        }

        // 6. 구독 정보를 서버에 전송
        await api.post('/api/push/subscribe', subscription.toJSON());

        subscribedRef.current = true;
      } catch (err) {
        // 권한 거부, 비지원 환경 등 — 조용히 실패 처리
        if (process.env.NODE_ENV === 'development') {
          console.debug('[WebPush] 구독 실패:', err.message);
        }
      }
    }

    setupPush();
  }, [user]);
}

/** VAPID 공개키(base64url)를 Uint8Array로 변환 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}
