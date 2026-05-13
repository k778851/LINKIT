'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import s from './admin.module.css';

const metrics = [
  ['전체 회원', '12,458', '+5.2% vs 지난주'],
  ['활성 회원', '8,234', '+3.8% vs 지난주'],
  ['신규 가입', '156', '+12.5% vs 어제'],
  ['이탈률', '2.3%', '-0.5% vs 지난주'],
];

const ops = [
  ['신고 처리 속도', '2.3분', 72],
  ['클럽 승인률', '94.2%', 94],
  ['커뮤니티 활성도', '87.5%', 88],
  ['신고 제재율', '12.8%', 13],
  ['평균 응답 속도', '1.2초', 83],
];

export function AdminReportsPage() {
  const [exportedAt, setExportedAt] = useState('');

  const handleExport = () => {
    setExportedAt(new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }));
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>STATISTICS</p>
          <h1 className={s.pageTitle}>통계 및 리포트</h1>
          <p className={s.pageDesc}>성장, 신고, 처리 속도 지표를 바탕으로 운영 의사결정을 지원합니다.</p>
        </div>
        <div className={s.headerActions}>
          {exportedAt && <span className={`${s.badge} ${s.badgeGreen}`}>{exportedAt} 생성됨</span>}
          <button className={s.primaryBtn} onClick={handleExport}><Download size={16} /> CSV 내보내기</button>
        </div>
      </div>

      <div className={s.statGrid}>
        {metrics.map(([label, value, trend]) => (
          <div key={label} className={s.statCard}>
            <p className={s.statNum}>{value}</p>
            <p className={s.statLabel}>{label}</p>
            <p className={s.itemMeta}>{trend}</p>
          </div>
        ))}
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>회원 / 클럽 성장 추이 <span className={s.sectionNote}>30일</span></p>
          {['회원 성장', '클럽 생성', '게시글 작성'].map((label, idx) => (
            <div key={label} style={{ marginBottom: 18 }}>
              <p className={s.itemTitle}>{label}</p>
              <div className={s.metricBar}><div className={s.metricFill} style={{ width: `${72 + idx * 8}%` }} /></div>
            </div>
          ))}
        </section>
        <section className={s.card}>
          <p className={s.cardTitle}>인기 클럽 / 키워드 TOP 5</p>
          <div className={s.queueList}>
            {[
              ['운동/스포츠', '1,234'],
              ['독서/문학', '892'],
              ['음악', '624'],
              ['사진', '511'],
              ['스터디', '402'],
            ].map(([name, value]) => (
              <div key={name} className={s.keywordItem}><span className={s.itemTitle}>{name}</span><span>{value}</span></div>
            ))}
          </div>
        </section>
      </div>

      <section className={s.card}>
        <p className={s.cardTitle}>운영 지표 <span className={s.sectionNote}>실시간</span></p>
        <div className={s.grid3}>
          {ops.map(([label, value, percent]) => (
            <div key={label} className={s.activityItem}>
              <div style={{ width: '100%' }}>
                <p className={s.itemTitle}>{label}</p>
                <p className={s.itemMeta}>{value}</p>
                <div className={s.metricBar}><div className={s.metricFill} style={{ width: `${percent}%` }} /></div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
