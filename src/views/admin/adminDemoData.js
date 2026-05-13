export const adminUsers = [
  { id: 'USR001234', name: '김민수', handle: 'minsu', status: '정상', joined: 3, reports: 0, joinedAt: '2026.04.15', lastLogin: '2026.04.25' },
  { id: 'USR001235', name: '이지은', handle: 'jieun', status: '경고', joined: 1, reports: 2, joinedAt: '2026.04.10', lastLogin: '2026.04.24' },
  { id: 'USR001236', name: '박준호', handle: 'junho', status: '정지', joined: 0, reports: 5, joinedAt: '2026.04.05', lastLogin: '2026.04.20' },
  { id: 'USR001237', name: '최수진', handle: 'sujin', status: '정상', joined: 2, reports: 0, joinedAt: '2026.04.12', lastLogin: '2026.04.25' },
  { id: 'USR001238', name: '정우진', handle: 'woojin', status: '정상', joined: 4, reports: 1, joinedAt: '2026.04.08', lastLogin: '2026.04.23' },
];

export const adminClubs = [
  { id: '#CL001', name: '주말 등산 클럽', status: '승인', category: '운동/스포츠', owner: '김철수', members: '12/20명', reports: 0, growth: '+5%' },
  { id: '#CL002', name: '테니스 동호회', status: '대기', category: '운동/스포츠', owner: '이영희', members: '8/15명', reports: 0, growth: '+2%' },
  { id: '#CL003', name: '독서 모임', status: '승인', category: '스터디', owner: '박민수', members: '25/30명', reports: 1, growth: '+12%' },
  { id: '#CL004', name: '요가 클래스', status: '중지', category: '운동/스포츠', owner: '최수진', members: '0/10명', reports: 3, growth: '-5%' },
];

export const adminPosts = [
  { id: '#1234', author: '김지영', category: '일상', title: '와이파이 잘 터지는 동네카페', reports: 2, status: '노출', createdAt: '2026.04.26' },
  { id: '#1235', author: '이민수', category: '질문', title: '동네 병원 추천해주세요', reports: 0, status: '노출', createdAt: '2026.04.26' },
  { id: '#1236', author: '박소연', category: '정보', title: '주차장 위치 안내', reports: 1, status: '숨김', createdAt: '2026.04.25' },
  { id: '#1237', author: '홍길동', category: '댓글', title: '스팸 댓글 신고 접수', reports: 5, status: '대기', createdAt: '2026.04.25' },
];

export const reportInbox = [
  { title: '욕설/비방 게시글 신고', time: '2분 전', severity: '높음' },
  { title: '스팸 댓글 신고', time: '5분 전', severity: '중간' },
  { title: '부적절한 프로필', time: '10분 전', severity: '중간' },
  { title: '광고성 게시글', time: '18분 전', severity: '낮음' },
  { title: '정치 키워드 포함', time: '26분 전', severity: '낮음' },
];

export const dashboardTasks = [
  { title: '클럽 생성 요청', meta: '승인 대기 · 2분 전' },
  { title: '게시글 신고 처리', meta: '신고 센터 · 5분 전' },
  { title: '회원 제재 검토', meta: '회원 관리 · 10분 전' },
  { title: '공지 작성 예약', meta: '메인 운영 · 오늘 14:00' },
];

export const banners = [
  { title: '주말 등산 클럽', status: '활성', period: '2026.04.26 ~ 05.03' },
  { title: '동네 독서 모임', status: '활성', period: '2026.04.26 ~ 05.10' },
];

export const keywords = ['#운동', '#독서', '#음악', '#사진', '#스터디', '#맛집', '#나눔', '#봉사'];

export const auditLogs = [
  { time: '14:32', actor: 'admin@linkit', action: "회원 '홍길동' 정지 처리", result: '성공' },
  { time: '14:28', actor: 'mod@linkit', action: "게시글 '욕설' 삭제", result: '성공' },
  { time: '14:15', actor: 'cs@linkit', action: "클럽 '등산모임' 승인", result: '성공' },
];
