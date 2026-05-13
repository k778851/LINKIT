'use client';

import { useState } from 'react';
import { auditLogs } from './adminDemoData';
import s from './admin.module.css';

const roles = [
  ['슈퍼어드민', '1', '전체 시스템 관리 권한'],
  ['운영자', '3', '콘텐츠와 회원 관리'],
  ['CS담당자', '2', '고객 문의와 신고 처리'],
  ['모더레이터', '5', '콘텐츠 심사와 모니터링'],
];

export function AdminPoliciesPage() {
  const [terms, setTerms] = useState([
    ['이용약관 v2.1', '2026.04.01', '시행중'],
    ['개인정보처리방침 v1.5', '2026.03.15', '시행중'],
    ['마케팅수신동의 v1.0', '2026.01.01', '시행중'],
  ]);
  const [logs, setLogs] = useState(auditLogs);

  const addPolicy = () => {
    setTerms((items) => [[`운영정책 v${items.length + 1}.0`, '검토중', '초안'], ...items]);
    setLogs((items) => [
      { time: '방금 전', actor: '관리자', action: '정책 초안 등록', result: '완료' },
      ...items,
    ]);
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>POLICY & AUDIT</p>
          <h1 className={s.pageTitle}>정책 · 권한 · 감사로그</h1>
          <p className={s.pageDesc}>서비스 정책 반영과 책임 추적 체계를 관리합니다.</p>
        </div>
        <button className={s.primaryBtn} onClick={addPolicy}>정책 초안 추가</button>
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>약관 · 개인정보 동의 관리 <span className={s.sectionNote}>{terms.length}개 버전</span></p>
          <div className={s.queueList}>
            {terms.map(([name, date, status]) => (
              <div key={`${name}-${date}`} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>{name}</p>
                  <p className={s.itemMeta}>{date}</p>
                </div>
                <span className={`${s.badge} ${status === '초안' ? s.badgeOrange : s.badgeGreen}`}>{status}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={s.card}>
          <p className={s.cardTitle}>권한 역할</p>
          <div className={s.queueList}>
            {roles.map(([role, count, desc]) => (
              <div key={role} className={s.queueItem}>
                <div><p className={s.itemTitle}>{role}</p><p className={s.itemMeta}>{desc}</p></div>
                <span className={`${s.badge} ${s.badgeBlue}`}>{count}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={s.card}>
        <p className={s.cardTitle}>메뉴 권한 매트릭스 <span className={s.sectionNote}>읽기 · 쓰기 · 삭제</span></p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>메뉴</th><th>권한</th><th>범위</th></tr></thead>
            <tbody>
              {['대시보드', '회원관리', '클럽관리', '신고센터'].map((menu) => (
                <tr key={menu}><td>{menu}</td><td>R / W / D</td><td><span className={`${s.badge} ${s.badgeBlue}`}>전체 권한</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={s.card}>
        <p className={s.cardTitle}>감사 로그</p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>시간</th><th>관리자</th><th>작업</th><th>결과</th></tr></thead>
            <tbody>
              {logs.map((log) => (
                <tr key={`${log.time}-${log.action}`}>
                  <td>{log.time}</td>
                  <td>{log.actor}</td>
                  <td>{log.action}</td>
                  <td><span className={`${s.badge} ${s.badgeGreen}`}>{log.result}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
