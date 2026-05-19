import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const DEFAULT_BANNERS = [
  {
    id: 'bnr-bonbu-1',
    region: '본부',
    tag: '🏔️ 주말 나들이',
    title: '이번 주말 추천',
    subtitle: '동네 뒷산 가볍게 어때요?',
    gradient: 'linear-gradient(135deg, #0088FF 0%, #00C3D0 100%)',
    image: null,
    active: true,
  },
  {
    id: 'bnr-bonbu-2',
    region: '본부',
    tag: '✨ 새로운 모임',
    title: '신규 클럽',
    subtitle: '지금 막 열린 클럽 확인하기',
    gradient: 'linear-gradient(135deg, #FF668A 0%, #FF8A3D 100%)',
    image: null,
    active: true,
  },
  {
    id: 'bnr-gwangsan-1',
    region: '광산',
    tag: '🔥 광산 트렌딩',
    title: '이번 주 인기',
    subtitle: '광산구에서 가장 활발한 모임',
    gradient: 'linear-gradient(135deg, #7B61FF 0%, #0088FF 100%)',
    image: null,
    active: true,
  },
  {
    id: 'bnr-gwangsan-2',
    region: '광산',
    tag: '🌿 광산 나들이',
    title: '주말 산책 모임',
    subtitle: '광산구 수완 호수공원에서 만나요',
    gradient: 'linear-gradient(135deg, #00C3D0 0%, #00B074 100%)',
    image: null,
    active: true,
  },
  {
    id: 'bnr-bukgu-1',
    region: '북구',
    tag: '⚽ 북구 스포츠',
    title: '함께 뛰어요',
    subtitle: '북구 풋살 크루 모집 중',
    gradient: 'linear-gradient(135deg, #FF668A 0%, #7B61FF 100%)',
    image: null,
    active: true,
  },
  {
    id: 'bnr-bukgu-2',
    region: '북구',
    tag: '📚 북구 스터디',
    title: '같이 읽어요',
    subtitle: '북구 독서 모임 새 멤버 환영',
    gradient: 'linear-gradient(135deg, #0088FF 0%, #7B61FF 100%)',
    image: null,
    active: true,
  },
];

const GRADIENT_PRESETS = [
  { label: '블루-민트', value: 'linear-gradient(135deg, #0088FF 0%, #00C3D0 100%)' },
  { label: '핑크-오렌지', value: 'linear-gradient(135deg, #FF668A 0%, #FF8A3D 100%)' },
  { label: '퍼플-블루', value: 'linear-gradient(135deg, #7B61FF 0%, #0088FF 100%)' },
  { label: '민트-그린', value: 'linear-gradient(135deg, #00C3D0 0%, #00B074 100%)' },
  { label: '핑크-퍼플', value: 'linear-gradient(135deg, #FF668A 0%, #7B61FF 100%)' },
  { label: '블루-퍼플', value: 'linear-gradient(135deg, #0088FF 0%, #7B61FF 100%)' },
];

export { GRADIENT_PRESETS };

export const useBannerStore = create(
  persist(
    (set, get) => ({
      banners: DEFAULT_BANNERS,

      /** 지역별 활성 배너 반환 */
      getBannersForRegion: (region) => {
        const all = get().banners;
        if (!region || region === '전체') return all.filter((b) => b.active);
        return all.filter((b) => b.region === region && b.active);
      },

      /** 배너 추가 */
      addBanner: (banner) =>
        set((s) => ({
          banners: [
            ...s.banners,
            { ...banner, id: `bnr-${Date.now()}`, active: true },
          ],
        })),

      /** 배너 수정 */
      updateBanner: (id, patch) =>
        set((s) => ({
          banners: s.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)),
        })),

      /** 배너 삭제 */
      deleteBanner: (id) =>
        set((s) => ({ banners: s.banners.filter((b) => b.id !== id) })),

      /** 활성/비활성 토글 */
      toggleBannerActive: (id) =>
        set((s) => ({
          banners: s.banners.map((b) =>
            b.id === id ? { ...b, active: !b.active } : b
          ),
        })),
    }),
    { name: 'linkit-banners', version: 2 }
  )
);
