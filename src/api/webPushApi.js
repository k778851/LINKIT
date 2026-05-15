import { api } from './apiClient';

/**
 * Web Push 구독 API
 * - VAPID 공개키 조회 → ServiceWorker 등록 → 구독 → endpoint/p256dh/auth 서버 전송
 */
export const webPushApi = {
  /** VAPID 공개키 (base64 url-safe) */
  getPublicKey: () => api.get('/api/push/public-key'),

  /** 구독 등록 — browser PushSubscription.toJSON() 형태로 전송 */
  subscribe: (subscriptionJson) => api.post('/api/push/subscribe', subscriptionJson),

  /** 구독 해제 */
  unsubscribe: (endpoint) => api.post('/api/push/unsubscribe', { endpoint }),
};
