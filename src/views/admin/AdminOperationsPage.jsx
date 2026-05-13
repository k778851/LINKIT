'use client';

import { Bell, Eye, Plus } from 'lucide-react';
import { banners, keywords } from './adminDemoData';
import s from './admin.module.css';

export function AdminOperationsPage() {
  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>MAIN OPERATIONS</p>
          <h1 className={s.pageTitle}>메인 운영 관리</h1>
          <p className={s.pageDesc}>앱 홈 노출 요소인 배너, 키워드, 추천 클럽, 팝업/푸시를 운영합니다.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn}><Eye size={16} /> 미리보기</button>
          <button className={s.primaryBtn}><Plus size={16} /> 새 알림</button>
        </div>
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>메인 배너</p>
          <div className={s.queueList}>
            {banners.map((banner, index) => (
              <div key={banner.title} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>메인 배너 {index + 1} · {banner.title}</p>
                  <p className={s.itemMeta}>{banner.period}</p>
                </div>
                <span className={`${s.badge} ${s.badgeGreen}`}>{banner.status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={s.card}>
          <p className={s.cardTitle}>키워드 관리 <span className={s.sectionNote}>8개</span></p>
          <div className={s.filterRow}>
            {keywords.map((keyword) => <span key={keyword} className={`${s.badge} ${s.badgeBlue}`}>{keyword}</span>)}
          </div>
        </section>
      </div>

      <div className={s.grid3}>
        {[
          ['추천 클럽 1', '아침 테니스', '매일 07:00', '12'],
          ['추천 클럽 2', '감성 사진모임', '주말 오후', '8'],
          ['추천 클럽 3', '뜨개질과 수다', '평일 저녁', '15'],
        ].map(([slot, name, time, count]) => (
          <section key={slot} className={s.card}>
            <p className={s.cardTitle}>{slot} <span className={s.sectionNote}>{count}</span></p>
            <p className={s.itemTitle}>{name}</p>
            <p className={s.itemMeta}>{time}</p>
          </section>
        ))}
      </div>

      <section className={s.card}>
        <p className={s.cardTitle}>팝업 / 푸시 관리 <span className={s.sectionNote}>3건 대기</span></p>
        <div className={s.queueList}>
          <div className={s.queueItem}><div><p className={s.itemTitle}>신규 회원 가입 알림</p><p className={s.itemMeta}>예약: 2026.04.27 09:00</p></div><Bell size={16} color="#1677ff" /></div>
          <div className={s.queueItem}><div><p className={s.itemTitle}>클럽 승인 완료 알림</p><p className={s.itemMeta}>예약: 2026.04.27 14:00</p></div><Bell size={16} color="#1677ff" /></div>
        </div>
      </section>
    </div>
  );
}
