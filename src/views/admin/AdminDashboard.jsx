'use client';

import { AlertTriangle, BookOpen, CheckCircle2, Clock, FileText, Search, Users } from 'lucide-react';
import { useClubStore } from '../../store/clubStore';
import { useCommunityStore } from '../../store/communityStore';
import { dashboardTasks, reportInbox } from './adminDemoData';
import s from './admin.module.css';

export function AdminDashboard() {
  const clubs = useClubStore((state) => state.clubs);
  const posts = useCommunityStore((state) => state.posts);

  const cards = [
    { label: '총 회원', value: '12,458', trend: '▲ 5.2%', icon: Users },
    { label: '활성 클럽', value: clubs.length.toLocaleString(), trend: '▲ 3.8%', icon: BookOpen },
    { label: '오늘 신고', value: '5', trend: '▼ 12.5%', icon: AlertTriangle, down: true },
    { label: '전체 게시글', value: posts.length.toLocaleString(), trend: '▲ 8.3%', icon: FileText },
  ];

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>ADMIN DASHBOARD</p>
          <h1 className={s.pageTitle}>서비스 운영 통합 대시보드</h1>
          <p className={s.pageDesc}>핵심 지표, 승인 대기, 신고 알림, 오늘의 운영 업무를 한눈에 확인합니다.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn}><Search size={16} /> 회원 검색</button>
          <button className={s.primaryBtn}><CheckCircle2 size={16} /> 클럽 승인</button>
        </div>
      </div>

      <div className={s.statGrid}>
        {cards.map(({ label, value, trend, icon: Icon, down }) => (
          <div key={label} className={s.statCard}>
            <div className={s.statTop}>
              <span className={s.statIcon}><Icon size={19} /></span>
              <span className={`${s.statTrend} ${down ? s.statTrendDown : ''}`}>{trend}</span>
            </div>
            <p className={s.statNum}>{value}</p>
            <p className={s.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>오늘의 할 일 <span className={s.sectionNote}>4건</span></p>
          <div className={s.grid3}>
            {dashboardTasks.map((task) => (
              <div key={task.title} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>{task.title}</p>
                  <p className={s.itemMeta}>{task.meta}</p>
                </div>
                <Clock size={16} color="#1677ff" />
              </div>
            ))}
          </div>
        </section>

        <section className={s.card}>
          <p className={s.cardTitle}>신고 알림 <span className={s.sectionNote}>5건 대기</span></p>
          <div className={s.queueList}>
            {reportInbox.slice(0, 3).map((item) => (
              <div key={item.title} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>{item.title}</p>
                  <p className={s.itemMeta}>{item.time}</p>
                </div>
                <span className={`${s.badge} ${item.severity === '높음' ? s.badgeRed : s.badgeOrange}`}>
                  {item.severity}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={s.card}>
        <p className={s.cardTitle}>운영 범위 <span className={s.sectionNote}>8개 영역 · 42개 세부 기능</span></p>
        <div className={s.grid3}>
          {[
            ['회원/권한', '회원 관리, 권한 설정'],
            ['클럽/신청', '클럽 관리, 신청 처리'],
            ['커뮤니티/신고', '게시글, 댓글, 신고 관리'],
            ['메인 노출', '배너, 키워드 관리'],
            ['통계/리포트', '데이터 분석, 리포트'],
            ['정책/감사로그', '약관, 동의, 로그 관리'],
          ].map(([title, desc]) => (
            <div key={title} className={s.activityItem}>
              <div>
                <p className={s.itemTitle}>{title}</p>
                <p className={s.itemMeta}>{desc}</p>
              </div>
              <span className={s.badge + ' ' + s.badgeBlue}>운영</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
