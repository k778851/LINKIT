'use client';

import { Download } from 'lucide-react';
import { useMemo, useState } from 'react';
import s from './admin.module.css';

const summaryByPeriod = {
  '1일': [
    ['신규 회원', '38', '+4.1%'],
    ['신규 클럽', '3', '+1.2%'],
    ['게시글 작성', '96', '+7.4%'],
    ['신고 접수', '5', '-2.0%'],
  ],
  '7일': [
    ['신규 회원', '212', '+5.8%'],
    ['신규 클럽', '18', '+3.4%'],
    ['게시글 작성', '642', '+9.1%'],
    ['신고 접수', '31', '-4.2%'],
  ],
  '30일': [
    ['신규 회원', '1,024', '+12.6%'],
    ['신규 클럽', '74', '+8.5%'],
    ['게시글 작성', '2,840', '+15.2%'],
    ['신고 접수', '126', '-6.8%'],
  ],
};

const growthRows = [
  ['회원 성장', '12,458명', '+1,024', '+12.6%', 82],
  ['클럽 성장', '384개', '+74', '+8.5%', 68],
  ['활성 회원', '8,234명', '+488', '+6.3%', 74],
  ['운영 처리율', '94.2%', '+2.1', '+2.1%', 94],
];

export function AdminReportsPage() {
  const [period, setPeriod] = useState('7일');
  const [startDate, setStartDate] = useState('2026-04-15');
  const [endDate, setEndDate] = useState('2026-05-15');
  const [exportedAt, setExportedAt] = useState('');

  const rangeDays = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.round((end - start) / (1000 * 60 * 60 * 24));
    return Number.isFinite(diff) ? Math.max(diff, 0) : 0;
  }, [startDate, endDate]);

  const handleExport = () => {
    setExportedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>STATISTICS</p>
          <h1 className={s.pageTitle}>통계 및 리포트</h1>
          <p className={s.pageDesc}>1일, 7일, 30일 기준과 직접 기간 설정으로 성장 추이를 확인합니다.</p>
        </div>
        <div className={s.headerActions}>
          {exportedAt && <span className={`${s.badge} ${s.badgeGreen}`}>{exportedAt} 생성됨</span>}
          <button className={s.primaryBtn} onClick={handleExport}><Download size={16} /> CSV 내보내기</button>
        </div>
      </div>

      <section className={s.card}>
        <p className={s.cardTitle}>기간 설정 <span className={s.sectionNote}>최대 1년</span></p>
        <div className={s.rangeControls}>
          {['1일', '7일', '30일'].map((item) => (
            <button key={item} className={`${s.filterBtn} ${period === item ? s.filterActive : ''}`} onClick={() => setPeriod(item)}>{item}</button>
          ))}
          <input className={s.input} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          <input className={s.input} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          <span className={`${s.badge} ${rangeDays > 365 ? s.badgeRed : s.badgeBlue}`}>{rangeDays}일</span>
        </div>
      </section>

      <div className={s.statGrid}>
        {summaryByPeriod[period].map(([label, value, trend]) => (
          <div key={label} className={s.statCard}>
            <p className={s.statNum}>{value}</p>
            <p className={s.statLabel}>{label}</p>
            <p className={trend.startsWith('-') ? s.negativeMeta : s.positiveMeta}>{trend}</p>
          </div>
        ))}
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>회원/클럽 성장 추이 <span className={s.sectionNote}>{period} 기준</span></p>
          {growthRows.map(([label, value, delta, percent, width]) => (
            <div key={label} className={s.metricRow}>
              <div>
                <p className={s.itemTitle}>{label}</p>
                <p className={s.itemMeta}>{value} · {delta} · {percent}</p>
              </div>
              <div className={s.metricBar}><div className={s.metricFill} style={{ width: `${width}%` }} /></div>
            </div>
          ))}
        </section>
        <section className={s.card}>
          <p className={s.cardTitle}>인기 카테고리 TOP 5</p>
          <div className={s.queueList}>
            {[
              ['운동', '1,234'],
              ['독서/스터디', '892'],
              ['음악', '624'],
              ['사진', '511'],
              ['맛집', '402'],
            ].map(([name, value]) => (
              <div key={name} className={s.keywordItem}><span className={s.itemTitle}>{name}</span><span>{value}</span></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
