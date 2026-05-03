'use client';

import { useEffect, useRef } from 'react';
import { tokenStorage } from '../api/apiClient';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { useToastContext } from '../context/ToastContext';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const MAX_RETRIES = 5;
const BASE_DELAY  = 3000; // 재연결 기본 딜레이 (ms)

/**
 * SSE 실시간 알림 구독 훅
 * - 로그인 상태일 때만 구독
 * - 연결 끊김 시 지수 백오프로 재연결 (최대 5회)
 * - 언마운트 시 EventSource 닫기
 */
export function useSseNotifications() {
  const user         = useAuthStore((s) => s.user);
  const addNotification = useNotificationStore((s) => s.addNotification);
  const { showToast }   = useToastContext();

  const esRef        = useRef(null);
  const retriesRef   = useRef(0);
  const timerRef     = useRef(null);

  useEffect(() => {
    if (!user) return; // 비로그인 시 구독 안 함

    function connect() {
      const token = tokenStorage.get();
      if (!token) return;

      // 기존 연결 정리
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }

      const url = `${BASE_URL}/api/notifications/subscribe?token=${encodeURIComponent(token)}`;
      const es  = new EventSource(url);
      esRef.current = es;

      es.addEventListener('connect', () => {
        retriesRef.current = 0; // 연결 성공 시 재시도 카운터 초기화
      });

      es.addEventListener('notification', (e) => {
        try {
          const data = JSON.parse(e.data);
          // 스토어에 추가
          addNotification({
            id:    data.id,
            type:  data.type,
            icon:  data.icon,
            title: data.title,
            body:  data.body,
            path:  data.path,
            read:  false,
            time:  '방금 전',
          });
          // 토스트 표시
          showToast(`${data.icon} ${data.title}`, 'info');
        } catch {
          // JSON 파싱 오류는 조용히 무시
        }
      });

      es.addEventListener('heartbeat', () => {
        // heartbeat — 연결 유지 확인용 (별도 처리 없음)
      });

      es.onerror = () => {
        es.close();
        esRef.current = null;

        if (retriesRef.current < MAX_RETRIES) {
          const delay = BASE_DELAY * Math.pow(2, retriesRef.current);
          retriesRef.current += 1;
          timerRef.current = setTimeout(connect, delay);
        }
        // MAX_RETRIES 초과 시 재연결 포기 (사용자가 페이지 새로고침 시 재시도)
      };
    }

    connect();

    return () => {
      clearTimeout(timerRef.current);
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
    };
  }, [user]); // user 변경(로그인/로그아웃) 시 재연결
}
