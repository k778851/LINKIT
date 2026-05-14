'use client';

import { Bell, Edit3, Plus } from 'lucide-react';
import { useState } from 'react';
import { banners, keywords } from './adminDemoData';
import s from './admin.module.css';

const initialRecommendedClubs = [
  ['추천 클럽 1', '러닝 크루', '운동', '156명'],
  ['추천 클럽 2', '감성 사진 모임', '사진', '43명'],
  ['추천 클럽 3', '맛집 탐방대', '맛집', '89명'],
];

export function AdminOperationsPage() {
  const [bannerList, setBannerList] = useState(banners);
  const [keywordList, setKeywordList] = useState(keywords);
  const [notices, setNotices] = useState([
    { title: '서비스 점검 안내', position: '홈 공지', date: '2026.05.16 02:00' },
  ]);
  const [modal, setModal] = useState(null);

  const toggleBanner = (banner) => {
    const nextStatus = banner.status === '활성' ? '비활성' : '활성';
    setModal({
      type: 'confirm',
      title: '메인 배너 상태 변경',
      message: `'${banner.title}' 배너를 ${nextStatus} 처리할까요?`,
      confirmLabel: nextStatus,
      onConfirm: () => setBannerList((prev) => prev.map((item) => item.id === banner.id ? { ...item, status: nextStatus } : item)),
    });
  };

  const saveBanner = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const id = form.get('id');
    setBannerList((prev) => prev.map((banner) => banner.id === id ? {
      ...banner,
      title: form.get('title'),
      subtitle: form.get('subtitle'),
      imageUrl: form.get('imageUrl'),
      period: form.get('period'),
    } : banner));
    setModal(null);
  };

  const addKeyword = (event) => {
    event.preventDefault();
    const keyword = String(new FormData(event.currentTarget).get('keyword') ?? '').trim();
    if (!keyword) return;
    setKeywordList((prev) => [...prev, keyword.startsWith('#') ? keyword : `#${keyword}`]);
    setModal(null);
  };

  const addNotice = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setNotices((prev) => [{
      title: form.get('title'),
      position: form.get('position'),
      date: form.get('date'),
      content: form.get('content'),
    }, ...prev]);
    setModal(null);
  };

  return (
    <div>
      <div className={s.pageHeader}>
        <div>
          <p className={s.eyebrow}>MAIN OPERATIONS</p>
          <h1 className={s.pageTitle}>메인 운영 관리</h1>
          <p className={s.pageDesc}>홈 배너, 키워드, 추천 클럽, 공지사항을 운영합니다.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setModal({ type: 'notice' })}><Plus size={16} /> 공지 작성</button>
      </div>

      <div className={s.grid2}>
        <section className={s.card}>
          <p className={s.cardTitle}>메인 배너</p>
          <div className={s.queueList}>
            {bannerList.map((banner, index) => (
              <div key={banner.id} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>배너 {index + 1} · {banner.title}</p>
                  <p className={s.itemMeta}>{banner.subtitle} · {banner.period}</p>
                </div>
                <div className={s.actionGroup}>
                  <button className={s.smallBtn} onClick={() => setModal({ type: 'banner', banner })}><Edit3 size={13} /> 편집</button>
                  <button className={banner.status === '활성' ? s.approveBtn : s.smallBtn} onClick={() => toggleBanner(banner)}>{banner.status}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={s.card}>
          <p className={s.cardTitle}>키워드 관리 <button className={s.smallBtn} onClick={() => setModal({ type: 'keyword' })}><Plus size={13} /> 추가</button></p>
          <div className={s.filterRow}>
            {keywordList.map((keyword) => <span key={keyword} className={`${s.badge} ${s.badgeBlue}`}>{keyword}</span>)}
          </div>
        </section>
      </div>

      <div className={s.grid3}>
        {initialRecommendedClubs.map(([slot, name, category, count]) => (
          <section key={slot} className={s.card}>
            <p className={s.cardTitle}>{slot} <span className={s.sectionNote}>{count}</span></p>
            <p className={s.itemTitle}>{name}</p>
            <p className={s.itemMeta}>{category}</p>
          </section>
        ))}
      </div>

      <section className={s.card}>
        <p className={s.cardTitle}>공지 사항 <span className={s.sectionNote}>{notices.length}건</span></p>
        <div className={s.queueList}>
          {notices.map((notice) => (
            <div key={`${notice.title}-${notice.date}`} className={s.queueItem}>
              <div><p className={s.itemTitle}>{notice.title}</p><p className={s.itemMeta}>{notice.position} · {notice.date}</p></div>
              <Bell size={16} color="#1677ff" />
            </div>
          ))}
        </div>
      </section>

      {modal?.type === 'confirm' && (
        <SimpleModal title={modal.title} onClose={() => setModal(null)}>
          <p className={s.itemMeta}>{modal.message}</p>
          <div className={s.modalFooter}>
            <button className={s.ghostBtn} onClick={() => setModal(null)}>취소</button>
            <button className={s.primaryBtn} onClick={() => { modal.onConfirm(); setModal(null); }}>{modal.confirmLabel}</button>
          </div>
        </SimpleModal>
      )}
      {modal?.type === 'keyword' && (
        <SimpleModal title="키워드 추가" onClose={() => setModal(null)}>
          <form onSubmit={addKeyword} className={s.formGrid}>
            <label className={s.formField}>키워드<input name="keyword" className={s.input} placeholder="#러닝" /></label>
            <div className={s.modalFooter}><button className={s.primaryBtn}>추가</button></div>
          </form>
        </SimpleModal>
      )}
      {modal?.type === 'banner' && (
        <SimpleModal title="메인 배너 편집" onClose={() => setModal(null)}>
          <form onSubmit={saveBanner} className={s.formGrid}>
            <input type="hidden" name="id" value={modal.banner.id} />
            <label className={s.formField}>배너 제목<input name="title" className={s.input} defaultValue={modal.banner.title} /></label>
            <label className={s.formField}>문구<input name="subtitle" className={s.input} defaultValue={modal.banner.subtitle} /></label>
            <label className={s.formField}>사진 URL<input name="imageUrl" className={s.input} defaultValue={modal.banner.imageUrl} /></label>
            <label className={s.formField}>노출 기간<input name="period" className={s.input} defaultValue={modal.banner.period} /></label>
            <div className={s.modalFooter}><button className={s.primaryBtn}>저장</button></div>
          </form>
        </SimpleModal>
      )}
      {modal?.type === 'notice' && (
        <SimpleModal title="공지 사항 작성" onClose={() => setModal(null)}>
          <form onSubmit={addNotice} className={s.formGrid}>
            <label className={s.formField}>제목<input name="title" className={s.input} placeholder="공지 제목" /></label>
            <label className={s.formField}>노출 위치<input name="position" className={s.input} placeholder="홈 공지" /></label>
            <label className={s.formField}>게시 일시<input name="date" className={s.input} placeholder="2026.05.15 18:00" /></label>
            <label className={s.formField}>내용<textarea name="content" className={s.textarea} placeholder="공지 내용을 입력하세요." /></label>
            <div className={s.modalFooter}><button className={s.primaryBtn}>등록</button></div>
          </form>
        </SimpleModal>
      )}
    </div>
  );
}

function SimpleModal({ title, children, onClose }) {
  return (
    <div className={s.modalBackdrop} role="presentation">
      <div className={s.modal} role="dialog" aria-modal="true">
        <div className={s.modalHeader}>
          <h2 className={s.modalTitle}>{title}</h2>
          <button className={s.iconBtn} onClick={onClose} aria-label="닫기">×</button>
        </div>
        <div className={s.modalBody}>{children}</div>
      </div>
    </div>
  );
}
