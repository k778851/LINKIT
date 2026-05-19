'use client';

import { useEffect, useMemo, useState } from 'react';
import { auditLogs as demoAuditLogs } from './adminDemoData';
import { ApiError, api } from '../../api/apiClient';

const isOffline = (e) => e instanceof ApiError && e.status === 0;
import s from './admin.module.css';

const roles = [
  ['슈퍼어드민', '1', '전체 시스템 관리 권한'],
  ['운영자', '3', '콘텐츠와 회원 관리'],
  ['CS 담당자', '2', '고객 문의와 신고 처리'],
  ['모더레이터', '5', '콘텐츠 심사와 모니터링'],
];

export function AdminPoliciesPage() {
  const [terms, setTerms] = useState([
    { title: '이용약관', version: 'v2.1', category: '서비스', date: '2026.04.01', status: '시행중' },
    { title: '개인정보처리방침', version: 'v1.5', category: '개인정보', date: '2026.03.15', status: '시행중' },
    { title: '마케팅 수신 동의', version: 'v1.0', category: '동의', date: '2026.01.01', status: '시행중' },
  ]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // 백엔드 감사로그 API 미구현 — 오프라인 시에만 데모 데이터 표시
    api.get('/api/admin/audit-logs').then(setLogs).catch((e) => {
      if (isOffline(e)) setLogs(demoAuditLogs);
    });
  }, []);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const pagedLogs = useMemo(() => logs.slice((page - 1) * 5, page * 5), [logs, page]);
  const pageCount = Math.ceil(logs.length / 5);

  const addPolicy = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setTerms((items) => [{
      title: form.get('title'),
      version: form.get('version'),
      category: form.get('category'),
      status: form.get('status'),
      date: form.get('effectiveDate'),
    }, ...items]);
    setModalOpen(false);
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>POLICY & AUDIT</p>
          <h1 className={s.pageTitle}>정책 · 권한 · 감사로그</h1>
          <p className={s.pageDesc}>정책 초안 작성, 권한 역할, 관리자 작업 이력을 관리합니다.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setModalOpen(true)}>정책 초안 추가</button>
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>약관 · 개인정보 동의 관리 <span className={s.sectionNote}>{terms.length}개 버전</span></p>
          <div className={s.queueList}>
            {terms.map((term) => (
              <div key={`${term.title}-${term.version}`} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>{term.title} {term.version}</p>
                  <p className={s.itemMeta}>{term.category} · 시행일 {term.date}</p>
                </div>
                <span className={`${s.badge} ${term.status === '초안' ? s.badgeOrange : s.badgeGreen}`}>{term.status}</span>
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
        <p className={s.cardTitle}>감사로그 <span className={s.sectionNote}>한 페이지 5건</span></p>
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead><tr><th>날짜</th><th>시간</th><th>관리자</th><th>고유번호</th><th>작업</th><th>결과</th><th>IP</th></tr></thead>
            <tbody>
              {pagedLogs.map((log) => (
                <tr key={`${log.date}-${log.time}-${log.action}`}>
                  <td>{log.date}</td>
                  <td>{log.time}</td>
                  <td>{log.actor}</td>
                  <td>{log.uniqueNo}</td>
                  <td>{log.action}</td>
                  <td><span className={`${s.badge} ${s.badgeGreen}`}>{log.result}</span></td>
                  <td>{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={s.pagination}>
          {Array.from({ length: pageCount }, (_, index) => index + 1).map((item) => (
            <button key={item} className={`${s.filterBtn} ${page === item ? s.filterActive : ''}`} onClick={() => setPage(item)}>{item}</button>
          ))}
        </div>
      </section>

      {modalOpen && (
        <div className={s.modalBackdrop} role="presentation">
          <div className={`${s.modal} ${s.wideModal}`} role="dialog" aria-modal="true">
            <div className={s.modalHeader}>
              <h2 className={s.modalTitle}>정책 초안 추가</h2>
              <button className={s.iconBtn} onClick={() => setModalOpen(false)} aria-label="닫기">×</button>
            </div>
            <form onSubmit={addPolicy} className={s.formGrid}>
              <p className={s.dividerTitle}>기본 정보</p>
              <label className={s.formField}>정책 분류<input name="category" className={s.input} placeholder="서비스" /></label>
              <label className={s.formField}>정책 제목<input name="title" className={s.input} placeholder="이용약관" /></label>
              <label className={s.formField}>버전<input name="version" className={s.input} placeholder="v1.0" /></label>
              <label className={s.formField}>상태<select name="status" className={s.input} defaultValue="초안"><option>초안</option><option>검토중</option><option>시행중</option></select></label>
              <label className={s.formField}>시행일 *<input name="effectiveDate" type="date" className={s.input} required /></label>

              <p className={s.dividerTitle}>정책 내용</p>
              <label className={s.formField}>정책 요약<input name="summary" className={s.input} /></label>
              <label className={`${s.formField} ${s.fullField}`}>본문 내용<textarea name="body" className={s.textarea} /></label>
              <label className={s.formField}>주요 변경사항<input name="changes" className={s.input} /></label>
              <label className={s.formField}>변경 사유<input name="reason" className={s.input} /></label>

              <p className={s.dividerTitle}>적용 설정</p>
              <label className={s.formField}>적용 대상<input name="target" className={s.input} placeholder="전체 회원" /></label>
              <label className={s.formField}>필수 동의 여부<select name="required" className={s.input}><option>필수</option><option>선택</option></select></label>
              <label className={s.formField}>재동의 필요 여부<select name="renew" className={s.input}><option>필요</option><option>불필요</option></select></label>
              <label className={s.formField}>노출 위치<input name="display" className={s.input} placeholder="회원가입, 마이페이지" /></label>

              <p className={s.dividerTitle}>기타</p>
              <label className={s.formField}>첨부파일<input name="file" type="file" className={s.input} /></label>
              <label className={`${s.formField} ${s.fullField}`}>관리자 메모<textarea name="memo" className={s.textarea} /></label>

              <div className={s.modalFooter}>
                <button type="button" className={s.ghostBtn} onClick={() => setModalOpen(false)}>취소</button>
                <button className={s.primaryBtn}>초안 저장</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
