'use client';

import { AlertTriangle, BookOpen, CheckCircle2, Clock, FileText, Search, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useClubStore } from '../../store/clubStore';
import { useCommunityStore } from '../../store/communityStore';
import { dashboardTasks, reportInbox } from './adminDemoData';
import s from './admin.module.css';

export function AdminDashboard() {
  const router = useRouter();
  const clubs = useClubStore((state) => state.clubs);
  const posts = useCommunityStore((state) => state.posts);

  const cards = [
    { label: '전체 회원', value: '12,458', icon: Users },
    { label: '활성 클럽', value: clubs.length.toLocaleString(), icon: BookOpen },
    { label: '오늘 신고', value: String(reportInbox.length), icon: AlertTriangle },
    { label: '전체 게시글', value: posts.length.toLocaleString(), icon: FileText },
  ];

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>ADMIN DASHBOARD</p>
          <h1 className={s.pageTitle}>링킷 운영 대시보드</h1>
          <p className={s.pageDesc}>회원, 클럽, 신고, 공지 업무를 한 화면에서 빠르게 확인합니다.</p>
        </div>
        <div className={s.headerActions}>
          <button className={s.ghostBtn} onClick={() => router.push('/admin/users')}><Search size={16} /> 회원 검색</button>
          <button className={s.primaryBtn} onClick={() => router.push('/admin/clubs')}><CheckCircle2 size={16} /> 클럽 승인</button>
        </div>
      </div>

      <div className={s.statGrid}>
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className={s.statCard}>
            <div className={s.statTop}>
              <span className={s.statIcon}><Icon size={19} /></span>
            </div>
            <p className={s.statNum}>{value}</p>
            <p className={s.statLabel}>{label}</p>
          </div>
        ))}
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>오늘 업무 <span className={s.sectionNote}>{dashboardTasks.length}건</span></p>
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
          <p className={s.cardTitle}>신고 알림 <span className={s.sectionNote}>{reportInbox.length}건 대기</span></p>
          <div className={s.queueList}>
            {reportInbox.map((item) => (
              <div key={item.title} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>{item.title}</p>
                  <p className={s.itemMeta}>{item.time} · {item.reason}</p>
                </div>
                <span className={`${s.badge} ${item.severity === '높음' ? s.badgeRed : s.badgeOrange}`}>{item.severity}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={s.card}>
        <p className={s.cardTitle}>운영 범위 <span className={s.sectionNote}>주요 관리자 메뉴</span></p>
        <div className={s.grid3}>
          {[
            ['회원 관리', '회원 상세, 경고, 정지, 해제 처리'],
            ['클럽 관리', '클럽 승인, 중지 해제, 운영자 확인'],
            ['커뮤니티 신고', '신고 내용 확인 및 게시글 처리'],
            ['메인 운영', '배너, 키워드, 공지사항 관리'],
            ['통계 리포트', '기간별 성장 추이와 운영 지표 확인'],
            ['정책 감사로그', '정책 초안과 관리자 작업 로그 관리'],
          ].map(([title, desc]) => (
            <div key={title} className={s.activityItem}>
              <div>
                <p className={s.itemTitle}>{title}</p>
                <p className={s.itemMeta}>{desc}</p>
              </div>
              <span className={`${s.badge} ${s.badgeBlue}`}>운영</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
