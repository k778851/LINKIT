'use client';

import { Bell, Edit3, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { keywords as demoKeywords } from './adminDemoData';
import { useBannerStore, GRADIENT_PRESETS } from '../../store/bannerStore';
import { ImageUpload } from '../../components/ui/ImageUpload';
import { ApiError, api } from '../../api/apiClient';
import s from './admin.module.css';

const REGIONS = ['본부', '광산', '북구'];
const isOffline = (e) => e instanceof ApiError && e.status === 0;

export function AdminOperationsPage() {
  const banners = useBannerStore((st) => st.banners);
  const addBanner = useBannerStore((st) => st.addBanner);
  const updateBanner = useBannerStore((st) => st.updateBanner);
  const deleteBanner = useBannerStore((st) => st.deleteBanner);
  const toggleBannerActive = useBannerStore((st) => st.toggleBannerActive);

  const [selectedRegion, setSelectedRegion] = useState('본부');
  const [keywordList, setKeywordList] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    api.get('/api/admin/keywords').then(setKeywordList).catch((e) => {
      if (isOffline(e)) setKeywordList(demoKeywords);
    });
    api.get('/api/admin/notices').then(setNotices).catch((e) => {
      if (isOffline(e)) setNotices([{ title: '서비스 점검 안내', position: '홈 공지', date: '2026.05.16 02:00' }]);
    });
  }, []);
  const [modal, setModal] = useState(null);

  const regionBanners = banners.filter((b) => b.region === selectedRegion);

  const handleDeleteBanner = (banner) => {
    setModal({
      type: 'confirm',
      title: '배너 삭제',
      message: `'${banner.title}' 배너를 삭제할까요?`,
      confirmLabel: '삭제',
      danger: true,
      onConfirm: () => deleteBanner(banner.id),
    });
  };

  const handleToggle = (banner) => {
    const next = banner.active ? '비활성' : '활성';
    setModal({
      type: 'confirm',
      title: '배너 상태 변경',
      message: `'${banner.title}' 배너를 ${next} 처리할까요?`,
      confirmLabel: next,
      onConfirm: () => toggleBannerActive(banner.id),
    });
  };

  const saveBanner = (e, image) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      region: form.get('region'),
      tag: form.get('tag'),
      title: form.get('title'),
      subtitle: form.get('subtitle'),
      gradient: form.get('gradient'),
      image: image ?? null,
    };
    if (modal.banner?.id) {
      updateBanner(modal.banner.id, data);
    } else {
      addBanner(data);
    }
    setModal(null);
  };

  const addKeyword = (e) => {
    e.preventDefault();
    const kw = String(new FormData(e.currentTarget).get('keyword') ?? '').trim();
    if (!kw) return;
    setKeywordList((prev) => [...prev, kw.startsWith('#') ? kw : `#${kw}`]);
    setModal(null);
  };

  const addNotice = (e) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
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
          <p className={s.pageDesc}>지역별 홈 배너, 키워드, 공지사항을 운영합니다.</p>
        </div>
        <button className={s.primaryBtn} onClick={() => setModal({ type: 'notice' })}>
          <Plus size={16} /> 공지 작성
        </button>
      </div>

      {/* ── 배너 관리 ── */}
      <section className={s.card} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p className={s.cardTitle} style={{ margin: 0 }}>지역별 메인 배너</p>
          <button
            className={s.primaryBtn}
            onClick={() => setModal({ type: 'banner', banner: { region: selectedRegion } })}
          >
            <Plus size={14} /> 배너 추가
          </button>
        </div>

        {/* 지역 탭 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {REGIONS.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRegion(r)}
              style={{
                padding: '6px 16px',
                borderRadius: 999,
                border: '1.5px solid',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                background: selectedRegion === r ? 'var(--blue)' : 'transparent',
                color: selectedRegion === r ? '#fff' : 'var(--blue)',
                borderColor: 'var(--blue)',
                transition: 'all 0.15s',
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {/* 배너 목록 */}
        {regionBanners.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--ink-4)', fontSize: 14 }}>
            {selectedRegion} 지역 배너가 없어요.
            <br />
            <button
              className={s.primaryBtn}
              style={{ marginTop: 12 }}
              onClick={() => setModal({ type: 'banner', banner: { region: selectedRegion } })}
            >
              <Plus size={14} /> 첫 배너 만들기
            </button>
          </div>
        ) : (
          <div className={s.queueList}>
            {regionBanners.map((banner, i) => (
              <div key={banner.id} className={s.queueItem} style={{ alignItems: 'center', gap: 12 }}>
                {/* 미리보기 썸네일 */}
                <div style={{
                  width: 48,
                  height: 36,
                  borderRadius: 8,
                  background: banner.gradient,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '4px 6px',
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p className={s.itemTitle}>{banner.tag} · {banner.title}</p>
                  <p className={s.itemMeta} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {banner.subtitle}
                  </p>
                </div>
                <div className={s.actionGroup}>
                  <button
                    className={s.smallBtn}
                    onClick={() => setModal({ type: 'banner', banner })}
                  >
                    <Edit3 size={13} /> 편집
                  </button>
                  <button
                    className={banner.active ? s.approveBtn : s.smallBtn}
                    onClick={() => handleToggle(banner)}
                  >
                    {banner.active ? '활성' : '비활성'}
                  </button>
                  <button
                    className={s.rejectBtn}
                    onClick={() => handleDeleteBanner(banner)}
                    style={{ padding: '4px 8px' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className={s.grid2}>
        {/* 키워드 관리 */}
        <section className={s.card}>
          <p className={s.cardTitle}>
            키워드 관리{' '}
            <button className={s.smallBtn} onClick={() => setModal({ type: 'keyword' })}>
              <Plus size={13} /> 추가
            </button>
          </p>
          <div className={s.filterRow}>
            {keywordList.map((kw) => (
              <span key={kw} className={`${s.badge} ${s.badgeBlue}`}>{kw}</span>
            ))}
          </div>
        </section>

        {/* 공지사항 */}
        <section className={s.card}>
          <p className={s.cardTitle}>공지사항 <span className={s.sectionNote}>{notices.length}건</span></p>
          <div className={s.queueList}>
            {notices.map((n) => (
              <div key={`${n.title}-${n.date}`} className={s.queueItem}>
                <div>
                  <p className={s.itemTitle}>{n.title}</p>
                  <p className={s.itemMeta}>{n.position} · {n.date}</p>
                </div>
                <Bell size={16} color="#1677ff" />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── 모달 ── */}
      {modal?.type === 'confirm' && (
        <SimpleModal title={modal.title} onClose={() => setModal(null)}>
          <p className={s.itemMeta}>{modal.message}</p>
          <div className={s.modalFooter}>
            <button className={s.ghostBtn} onClick={() => setModal(null)}>취소</button>
            <button
              className={modal.danger ? s.rejectBtn : s.primaryBtn}
              onClick={() => { modal.onConfirm(); setModal(null); }}
            >
              {modal.confirmLabel}
            </button>
          </div>
        </SimpleModal>
      )}

      {modal?.type === 'banner' && (
        <BannerModal
          banner={modal.banner}
          selectedRegion={selectedRegion}
          onSave={saveBanner}
          onClose={() => setModal(null)}
        />
      )}

      {modal?.type === 'keyword' && (
        <SimpleModal title="키워드 추가" onClose={() => setModal(null)}>
          <form onSubmit={addKeyword} className={s.formGrid}>
            <label className={s.formField}>키워드<input name="keyword" className={s.input} placeholder="#러닝" /></label>
            <div className={s.modalFooter}><button className={s.primaryBtn}>추가</button></div>
          </form>
        </SimpleModal>
      )}

      {modal?.type === 'notice' && (
        <SimpleModal title="공지 작성" onClose={() => setModal(null)}>
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

/** 배너 추가/편집 모달 — 실시간 미리보기 포함 */
function BannerModal({ banner, selectedRegion, onSave, onClose }) {
  const [preview, setPreview] = useState({
    tag: banner?.tag ?? '',
    title: banner?.title ?? '',
    subtitle: banner?.subtitle ?? '',
    gradient: banner?.gradient ?? GRADIENT_PRESETS[0].value,
    image: banner?.image ?? null,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['tag', 'title', 'subtitle', 'gradient'].includes(name)) {
      setPreview((p) => ({ ...p, [name]: value }));
    }
  };

  return (
    <SimpleModal title={banner?.id ? '배너 편집' : '새 배너 추가'} onClose={onClose}>
      <form onSubmit={(e) => onSave(e, preview.image)} className={s.formGrid} onChange={handleChange}>
        <label className={s.formField}>
          지역
          <select name="region" className={s.input} defaultValue={banner?.region ?? selectedRegion}>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label className={s.formField}>
          태그 <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>(이모지 포함 가능)</span>
          <input name="tag" className={s.input} defaultValue={banner?.tag ?? ''} placeholder="🏔️ 주말 나들이" required />
        </label>
        <label className={s.formField}>
          제목
          <input name="title" className={s.input} defaultValue={banner?.title ?? ''} placeholder="이번 주말 추천" required />
        </label>
        <label className={s.formField}>
          문구
          <input name="subtitle" className={s.input} defaultValue={banner?.subtitle ?? ''} placeholder="동네 뒷산 가볍게 어때요?" required />
        </label>
        <div className={s.formField}>
          <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>
            배너 이미지 <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400 }}>(선택 · 없으면 색상 배경 사용)</span>
          </p>
          <ImageUpload
            value={preview.image}
            onChange={(url) => setPreview((p) => ({ ...p, image: url }))}
            shape="square"
            placeholder="🖼️"
          />
        </div>
        {!preview.image && (
          <label className={s.formField}>
            배경 색상
            <select name="gradient" className={s.input} defaultValue={banner?.gradient ?? GRADIENT_PRESETS[0].value}>
              {GRADIENT_PRESETS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </label>
        )}
        <BannerPreview {...preview} />
        <div className={s.modalFooter}>
          <button type="button" className={s.ghostBtn} onClick={onClose}>취소</button>
          <button type="submit" className={s.primaryBtn}>저장</button>
        </div>
      </form>
    </SimpleModal>
  );
}

/** 배너 편집 폼 내 실시간 미리보기 */
function BannerPreview({ tag, title, subtitle, gradient, image }) {
  return (
    <div>
      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>미리보기</p>
      <div style={{
        background: image ? undefined : (gradient || GRADIENT_PRESETS[0].value),
        backgroundImage: image ? `url("${image}")` : undefined,
        backgroundSize: image ? 'cover' : undefined,
        backgroundPosition: image ? 'center' : undefined,
        borderRadius: 14,
        padding: '20px 18px 16px',
        minHeight: 90,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 4,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {image && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
          }} />
        )}
        {tag && (
          <span style={{
            fontSize: 11, fontWeight: 600,
            color: 'rgba(255,255,255,0.9)',
            background: 'rgba(255,255,255,0.18)',
            padding: '2px 10px', borderRadius: 999,
            width: 'fit-content',
            position: 'relative',
          }}>
            {tag}
          </span>
        )}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 500, position: 'relative' }}>
          {title || '제목'}
        </p>
        <p style={{ fontSize: 16, color: '#fff', fontWeight: 700, position: 'relative' }}>
          {subtitle || '문구'}
        </p>
      </div>
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
