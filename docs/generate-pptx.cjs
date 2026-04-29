const PptxGenJS = require('../node_modules/pptxgenjs');
const fs = require('fs');
const path = require('path');

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5 inches

// ── 디자인 토큰 ─────────────────────────────────────────────────────
const C = {
  navy:      '1E3A5F',
  blue:      '1677FF',
  blueLight: 'D0E8FF',
  blueMid:   '5B9BD5',
  white:     'FFFFFF',
  gray1:     'F5F7FA',
  gray2:     'E4E9F2',
  gray3:     '8FA3BD',
  ink:       '0A1628',
  ink2:      '41536B',
  pink:      'FF668A',
  mint:      '00C3D0',
  yellow:    'FFC300',
};
const FONT = 'Malgun Gothic';
const SS = C.gray2; // screenshot border

// ── 슬라이드 공통 레이아웃 상수 ─────────────────────────────────────
const HEADER_H   = 0.55;   // 상단 헤더 높이
const FOOTER_H   = 0.55;   // 하단 정보바 높이
const MARGIN     = 0.25;
const SLIDE_W    = 13.33;
const SLIDE_H    = 7.5;
const CONTENT_H  = SLIDE_H - HEADER_H - FOOTER_H;
const LEFT_W     = 5.2;    // 기능 설명 영역
const RIGHT_W    = 5.0;    // 화면 이미지 영역
const RIGHT_X    = LEFT_W + MARGIN * 2.5;
const SS_DIR     = 'C:/Code/LINKIT/docs/screenshots';

function ssPath(file) { return path.join(SS_DIR, file); }

// ── 공통: 상단 헤더 ─────────────────────────────────────────────────
function addHeader(slide, title, subTitle) {
  // 배경 바
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: SLIDE_W, h: HEADER_H,
    fill: { color: C.navy },
    line: { color: C.navy },
  });
  // 왼쪽 강조 바
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y: 0, w: 0.07, h: HEADER_H,
    fill: { color: C.blue },
    line: { color: C.blue },
  });
  // 제목
  slide.addText(title, {
    x: 0.22, y: 0, w: 7, h: HEADER_H,
    fontSize: 16, bold: true, color: C.white, fontFace: FONT,
    valign: 'middle',
  });
  // 서브 (오른쪽)
  if (subTitle) {
    slide.addText(subTitle, {
      x: 7.3, y: 0, w: 5.8, h: HEADER_H,
      fontSize: 11, color: 'A8C8F0', fontFace: FONT,
      valign: 'middle', align: 'right',
    });
  }
}

// ── 공통: 하단 정보 바 ───────────────────────────────────────────────
function addFooter(slide, screenId, screenName, navPath, version = 'v1.0') {
  const y = SLIDE_H - FOOTER_H;
  // 배경
  slide.addShape(pptx.ShapeType.rect, {
    x: 0, y, w: SLIDE_W, h: FOOTER_H,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  // 구분선
  slide.addShape(pptx.ShapeType.line, {
    x: 0, y, w: SLIDE_W, h: 0,
    line: { color: C.blue, width: 2 },
  });

  const items = [
    { label: '화면이름', value: `[${screenId}] ${screenName}` },
    { label: '화면경로', value: navPath },
    { label: '버전', value: version },
  ];
  const colW = SLIDE_W / items.length;
  items.forEach((item, i) => {
    const x = i * colW + 0.15;
    slide.addText(`${item.label}  `, {
      x, y: y + 0.03, w: colW - 0.2, h: 0.22,
      fontSize: 9, color: C.gray3, fontFace: FONT, bold: true,
    });
    slide.addText(item.value, {
      x, y: y + 0.25, w: colW - 0.2, h: 0.25,
      fontSize: 10, color: C.white, fontFace: FONT, bold: false,
    });
    if (i < items.length - 1) {
      slide.addShape(pptx.ShapeType.line, {
        x: colW * (i + 1), y: y + 0.08, w: 0, h: FOOTER_H - 0.16,
        line: { color: '2A4A70', width: 1 },
      });
    }
  });
}

// ── 공통: 기능 설명 테이블 ───────────────────────────────────────────
function addDescTable(slide, rows) {
  // 테이블 헤더
  const tX = MARGIN;
  const tY = HEADER_H + 0.22;
  const tW = LEFT_W - 0.1;

  slide.addText('기능 설명', {
    x: tX, y: HEADER_H + 0.08, w: tW, h: 0.25,
    fontSize: 11, bold: true, color: C.navy, fontFace: FONT,
  });

  // 헤더 배경
  slide.addShape(pptx.ShapeType.rect, {
    x: tX, y: tY, w: tW, h: 0.3,
    fill: { color: C.navy }, line: { color: C.navy },
  });
  slide.addText('No', { x: tX + 0.05, y: tY, w: 0.4, h: 0.3, fontSize: 9, bold: true, color: C.white, fontFace: FONT, valign: 'middle' });
  slide.addText('항목', { x: tX + 0.5, y: tY, w: 1.1, h: 0.3, fontSize: 9, bold: true, color: C.white, fontFace: FONT, valign: 'middle' });
  slide.addText('설명', { x: tX + 1.65, y: tY, w: tW - 1.7, h: 0.3, fontSize: 9, bold: true, color: C.white, fontFace: FONT, valign: 'middle' });

  // 데이터 rows
  const rowH = 0.48;
  rows.forEach((r, i) => {
    const ry = tY + 0.3 + i * rowH;
    const bg = i % 2 === 0 ? C.white : C.gray1;
    // row 배경
    slide.addShape(pptx.ShapeType.rect, {
      x: tX, y: ry, w: tW, h: rowH,
      fill: { color: bg }, line: { color: C.gray2, width: 0.5 },
    });
    // No
    slide.addText(String(i + 1), {
      x: tX + 0.05, y: ry, w: 0.4, h: rowH,
      fontSize: 11, bold: true, color: C.blue, fontFace: FONT,
      valign: 'middle', align: 'center',
    });
    // 항목 (구분선)
    slide.addShape(pptx.ShapeType.line, {
      x: tX + 0.45, y: ry + 0.06, w: 0, h: rowH - 0.12,
      line: { color: C.gray2, width: 0.5 },
    });
    slide.addText(r.label, {
      x: tX + 0.5, y: ry, w: 1.1, h: rowH,
      fontSize: 9, bold: true, color: C.ink2, fontFace: FONT,
      valign: 'middle', wrap: true,
    });
    slide.addShape(pptx.ShapeType.line, {
      x: tX + 1.6, y: ry + 0.06, w: 0, h: rowH - 0.12,
      line: { color: C.gray2, width: 0.5 },
    });
    // 설명
    slide.addText(r.desc, {
      x: tX + 1.65, y: ry + 0.04, w: tW - 1.7, h: rowH - 0.08,
      fontSize: 9, color: C.ink, fontFace: FONT,
      valign: 'middle', wrap: true,
    });
  });
}

// ── 공통: 화면 이미지 영역 ───────────────────────────────────────────
function addScreenImage(slide, imgFile, label) {
  const x = RIGHT_X;
  const y = HEADER_H + 0.15;
  const w = RIGHT_W;
  const h = CONTENT_H - 0.25;

  // 이미지 레이블
  slide.addText(label, {
    x, y: y - 0.02, w, h: 0.22,
    fontSize: 11, bold: true, color: C.navy, fontFace: FONT, align: 'center',
  });

  // 폰 외곽 배경 (둥근 직사각형 - 폰 형태)
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + w/2 - 1.5, y: y + 0.22, w: 3.0, h: h - 0.22,
    fill: { color: 'F0F4F8' }, line: { color: C.gray3, width: 1.5 },
    rectRadius: 0.25,
  });

  // 실제 화면 이미지
  slide.addImage({
    path: ssPath(imgFile),
    x: x + w/2 - 1.42, y: y + 0.3, w: 2.84, h: h - 0.38,
  });
}

// ══════════════════════════════════════════════════════════════════════
// 슬라이드 1: 표지
// ══════════════════════════════════════════════════════════════════════
const cover = pptx.addSlide();

cover.addShape(pptx.ShapeType.rect, {
  x: 0, y: 0, w: SLIDE_W, h: SLIDE_H,
  fill: { color: C.navy }, line: { color: C.navy },
});
// 사선 장식
cover.addShape(pptx.ShapeType.rect, {
  x: 8.5, y: 0, w: 5.0, h: SLIDE_H,
  fill: { color: '162D4E' }, line: { color: '162D4E' },
  rotate: 0,
});
cover.addShape(pptx.ShapeType.rect, {
  x: 9.2, y: 0, w: 4.3, h: SLIDE_H,
  fill: { color: '1A3460' }, line: { color: '1A3460' },
});
// 파란 강조선
cover.addShape(pptx.ShapeType.rect, {
  x: 0, y: 2.8, w: 7.5, h: 0.06,
  fill: { color: C.blue }, line: { color: C.blue },
});

// LINKIT 로고 텍스트
cover.addText('LINKIT', {
  x: 0.7, y: 1.1, w: 7, h: 1.1,
  fontSize: 64, bold: true, color: C.blue, fontFace: 'Segoe UI',
});
// 서비스 설명
cover.addText('동네 소모임 연결 플랫폼', {
  x: 0.72, y: 2.1, w: 7, h: 0.5,
  fontSize: 18, color: 'A8C8F0', fontFace: FONT,
});
// 구분선 아래 제목
cover.addText('마이페이지 화면 설계서', {
  x: 0.72, y: 3.0, w: 7, h: 0.65,
  fontSize: 26, bold: true, color: C.white, fontFace: FONT,
});
// 메타
cover.addText('버전: v1.0    |    작성일: 2026. 04', {
  x: 0.72, y: 3.75, w: 7, h: 0.4,
  fontSize: 13, color: C.gray3, fontFace: FONT,
});

// 오른쪽 화면 목차
const pages = [
  'MY-001  마이페이지 메인 (상단)',
  'MY-002  마이페이지 메인 (하단)',
  'MY-003  설정 탭',
  'MY-004  프로필 수정 (상단)',
  'MY-005  프로필 수정 (하단)',
  'MY-006  다크모드',
];
cover.addText('화면 목록', {
  x: 9.5, y: 1.3, w: 3.5, h: 0.35,
  fontSize: 13, bold: true, color: C.blue, fontFace: FONT,
});
pages.forEach((p, i) => {
  cover.addText(`${p}`, {
    x: 9.5, y: 1.75 + i * 0.55, w: 3.6, h: 0.45,
    fontSize: 11.5, color: i % 2 === 0 ? C.white : 'B0C8E8', fontFace: FONT,
    bullet: { type: 'number', style: '1.', color: C.blue },
  });
});


// ══════════════════════════════════════════════════════════════════════
// 슬라이드 2: 마이페이지 메인 (상단) — MY-001
// ══════════════════════════════════════════════════════════════════════
const s2 = pptx.addSlide();
addHeader(s2, '마이페이지 — 메인 화면 (활동 탭 상단)', 'MY-001');
addDescTable(s2, [
  { label: '프로필 카드',   desc: '이모지 아바타, 닉네임, @handle, 한 줄 소개를 하나의 카드로 표시. 우측 [프로필 수정] 버튼 탭 시 MY-004 화면으로 이동' },
  { label: '활동 통계 바',  desc: '참여클럽 / 찜한클럽 / 작성한글 수치를 가로로 나열. 각 항목 탭 시 해당 섹션으로 포커스 이동' },
  { label: '탭 전환',       desc: '[활동] / [설정] 2-Tab 구성. 선택된 탭은 블루 배경 pill 형태로 강조' },
  { label: '내 모임 일정',  desc: 'D-day 뱃지(D-1, D-3 등)와 클럽 이모지, 시간·장소 정보 표시. [전체 보기] 탭 시 전체 일정 화면으로 이동' },
]);
addScreenImage(s2, '01_mypage_activity_top.png', '화면 미리보기');
addFooter(s2, 'MY-001', '마이페이지 메인 (활동-상단)', '/mypage');


// ══════════════════════════════════════════════════════════════════════
// 슬라이드 3: 마이페이지 메인 (하단) — MY-002
// ══════════════════════════════════════════════════════════════════════
const s3 = pptx.addSlide();
addHeader(s3, '마이페이지 — 메인 화면 (활동 탭 하단)', 'MY-002');
addDescTable(s3, [
  { label: '찜한 클럽',    desc: '북마크한 클럽을 그라디언트 포스터 썸네일(하트 아이콘 오버레이)로 가로 나열. 카드 탭 시 해당 클럽 상세 화면 이동. [전체 보기] 제공' },
  { label: '작성한 게시글', desc: '내가 작성한 커뮤니티 글 목록. 카테고리 뱃지 + 제목 + 작성시간 + 좋아요/댓글 수 표시. 항목 탭 시 게시글 상세 이동' },
  { label: '전체 보기',    desc: '각 섹션의 [전체 보기] 버튼 탭 시 해당 전체 목록 페이지로 이동' },
  { label: '빈 상태',      desc: '찜한 클럽 또는 작성 글이 없는 경우 EmptyState 컴포넌트 표시 (이모지 + 안내 문구)' },
]);
addScreenImage(s3, '02_mypage_activity_bottom.png', '화면 미리보기');
addFooter(s3, 'MY-002', '마이페이지 메인 (활동-하단)', '/mypage');


// ══════════════════════════════════════════════════════════════════════
// 슬라이드 4: 설정 탭 — MY-003
// ══════════════════════════════════════════════════════════════════════
const s4 = pptx.addSlide();
addHeader(s4, '마이페이지 — 설정 탭', 'MY-003');
addDescTable(s4, [
  { label: '알림 설정',      desc: '탭 시 알림 설정 세부 화면으로 이동. 푸시·이메일·마케팅 알림 각각 on/off 토글 제공' },
  { label: '개인정보·보안',  desc: '탭 시 개인정보 보안 설정 화면으로 이동. 비밀번호 변경, 계정 탈퇴 메뉴 포함' },
  { label: '언어',           desc: '탭 시 언어 선택 화면 이동. 한국어 / English 지원 (기본: 한국어)' },
  { label: '앱 정보',        desc: '탭 시 앱 버전 정보, 오픈소스 라이선스 화면으로 이동. 현재 버전 v1.0.0 표시' },
  { label: '다크모드',       desc: '토글 스위치 ON/OFF. 활성화 시 Midnight Breeze 다크 테마 즉시 전환. 상태는 localStorage에 영속화' },
  { label: '로그아웃',       desc: '탭 시 확인 다이얼로그 노출 → 확인 클릭 시 인증 초기화 후 온보딩 화면으로 이동' },
]);
addScreenImage(s4, '03_mypage_settings.png', '화면 미리보기');
addFooter(s4, 'MY-003', '설정 탭', '/mypage (설정)');


// ══════════════════════════════════════════════════════════════════════
// 슬라이드 5: 프로필 수정 상단 — MY-004
// ══════════════════════════════════════════════════════════════════════
const s5 = pptx.addSlide();
addHeader(s5, '프로필 수정 — 상단 (아바타 미리보기 · 이모지 선택)', 'MY-004');
addDescTable(s5, [
  { label: '헤더 저장 버튼',  desc: '우측 상단 [저장] 버튼. 닉네임 미입력 시 비활성(회색), 입력 시 파란색으로 활성화. 탭 시 유효성 검사 후 저장' },
  { label: '아바타 미리보기', desc: '선택한 이모지가 원형 카드(blue-soft 배경)에 실시간 반영. 닉네임·@handle도 아래에 즉시 업데이트' },
  { label: '이모지 그리드',   desc: '16종 이모지를 8×2 그리드로 표시. 선택된 항목은 파란 테두리(outline)로 강조. 탭 시 아바타 미리보기 즉시 변경' },
]);
addScreenImage(s5, '08_mypage_profile_edit_top.png', '화면 미리보기');
addFooter(s5, 'MY-004', '프로필 수정 (상단)', '/mypage/edit');


// ══════════════════════════════════════════════════════════════════════
// 슬라이드 6: 프로필 수정 하단 — MY-005
// ══════════════════════════════════════════════════════════════════════
const s6 = pptx.addSlide();
addHeader(s6, '프로필 수정 — 하단 (입력 필드 · 저장 버튼)', 'MY-005');
addDescTable(s6, [
  { label: '닉네임 (필수)',    desc: '최대 10자. 미입력 시 저장 버튼 비활성. 글자수 카운터(N/10) 표시. 포커스 시 파란 테두리. 오류 시 핑크 테두리 + 에러 메시지' },
  { label: '@handle (선택)',   desc: '영문·숫자·언더바만 허용. @ 프리픽스 고정 표시. 최대 20자. 형식 오류 시 에러 메시지 표시' },
  { label: '한 줄 소개 (선택)', desc: '자유 텍스트, 최대 50자, 글자수 카운터(N/50) 표시' },
  { label: '[저장하기] CTA',   desc: '하단 고정 버튼. 닉네임 입력 시 블루 배경 + 그림자로 활성화. 탭 시 유효성 검사 → 저장 완료 Toast("프로필을 저장했어요 ✨") → 이전 화면 복귀' },
]);
addScreenImage(s6, '09_mypage_profile_edit_bottom.png', '화면 미리보기');
addFooter(s6, 'MY-005', '프로필 수정 (하단)', '/mypage/edit');


// ══════════════════════════════════════════════════════════════════════
// 슬라이드 7: 다크모드 — MY-006
// ══════════════════════════════════════════════════════════════════════
const s7 = pptx.addSlide();
addHeader(s7, '마이페이지 — 다크모드 (Midnight Breeze)', 'MY-006');
addDescTable(s7, [
  { label: '다크모드 전환',  desc: '설정 탭 [다크모드] 토글 ON 시 html[data-theme="dark"] 속성이 즉시 변경되어 전체 앱에 어두운 테마 적용' },
  { label: '배경 색상',      desc: '기본 배경 #0B1525 (Midnight), 카드 배경 #13203A, 보더 #1F2D47로 전환' },
  { label: '텍스트 색상',    desc: '기본 텍스트 #EAF2FC, 보조 텍스트 #B5C3D6으로 전환. 명도 대비 4.5:1 이상 유지' },
  { label: '브랜드 컬러',    desc: 'Blue #2E9BFF, Mint #28D6E0으로 밝게 조정. Pink(#FF668A)는 동일 유지' },
  { label: '상태 영속화',    desc: '선택한 테마는 Zustand persist (localStorage: linkit-auth)에 저장되어 앱 재시작 시에도 유지' },
]);
addScreenImage(s7, '10_mypage_dark_mode.png', '화면 미리보기');
addFooter(s7, 'MY-006', '다크모드', '/mypage (설정)');


// ── 저장 ─────────────────────────────────────────────────────────────
const OUT = 'C:/Users/k7788/Downloads/Telegram Desktop/LINKIT_마이페이지_화면설계서.pptx';
pptx.writeFile({ fileName: OUT }).then(() => {
  console.log('✅ 저장 완료:', OUT);
}).catch(e => console.error('❌ 오류:', e));
