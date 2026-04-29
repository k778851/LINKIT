const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, LevelFormat, PageBreak,
} = require('../node_modules/docx');
const fs = require('fs');

// ── 공통 스타일 헬퍼 ──────────────────────────────────────────────────
const FONT = 'Malgun Gothic';
const borderNone = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const noBorders = { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone };
const borderThin = { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' };
const borders = { top: borderThin, bottom: borderThin, left: borderThin, right: borderThin };
const borderBlue = { style: BorderStyle.SINGLE, size: 8, color: '1677FF' };

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align ?? AlignmentType.LEFT,
    spacing: { before: opts.before ?? 80, after: opts.after ?? 80 },
    children: [
      new TextRun({
        text,
        font: FONT,
        size: opts.size ?? 20,
        bold: opts.bold ?? false,
        color: opts.color ?? '000000',
        italics: opts.italic ?? false,
      }),
    ],
  });
}

function heading1(text) {
  return new Paragraph({
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '1677FF' } },
    children: [
      new TextRun({ text, font: FONT, size: 26, bold: true, color: '1677FF' }),
    ],
  });
}

function heading2(text) {
  return new Paragraph({
    spacing: { before: 200, after: 100 },
    children: [
      new TextRun({ text, font: FONT, size: 22, bold: true, color: '0A1628' }),
    ],
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    numbering: { reference: 'bullets', level },
    children: [new TextRun({ text, font: FONT, size: 20, color: '0A1628' })],
  });
}

function numbered(text, level = 0) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    numbering: { reference: 'numbers', level },
    children: [new TextRun({ text, font: FONT, size: 20, color: '0A1628' })],
  });
}

function cell(text, opts = {}) {
  return new TableCell({
    borders: opts.noBorder ? noBorders : borders,
    width: opts.width ? { size: opts.width, type: WidthType.DXA } : undefined,
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        children: [
          new TextRun({
            text,
            font: FONT,
            size: opts.size ?? 18,
            bold: opts.bold ?? false,
            color: opts.color ?? '0A1628',
          }),
        ],
      }),
    ],
  });
}

function row(cells) {
  return new TableRow({ children: cells });
}

function headerRow(labels, widths) {
  return row(labels.map((l, i) =>
    cell(l, { shading: 'D0E4FF', bold: true, color: '1F5FAF', width: widths[i] })
  ));
}

function tableOf(headers, widths, dataRows) {
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      headerRow(headers, widths),
      ...dataRows.map((r) => row(r.map((txt, i) => cell(txt, { width: widths[i] })))),
    ],
  });
}

function gap(n = 1) {
  return Array.from({ length: n }, () =>
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun('')] })
  );
}

// ── 표지 섹션 ────────────────────────────────────────────────────────
function coverSection() {
  return [
    ...gap(4),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 240 },
      children: [new TextRun({ text: 'LINKIT', font: 'Segoe UI', size: 72, bold: true, color: '1677FF' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 120 },
      children: [new TextRun({ text: '개발 착수 보고 제안서', font: FONT, size: 44, bold: true, color: '0A1628' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
      children: [new TextRun({ text: 'LINKIT Platform v1.0', font: 'Segoe UI', size: 22, color: '5C7085' })],
    }),
    // 메타 테이블
    new Table({
      width: { size: 6000, type: WidthType.DXA },
      columnWidths: [2200, 3800],
      rows: [
        row([cell('보고 지파', { shading: 'EEF4FA', bold: true, width: 2200 }), cell('', { width: 3800 })]),
        row([cell('보고 교회', { shading: 'EEF4FA', bold: true, width: 2200 }), cell('', { width: 3800 })]),
        row([cell('작  성  자', { shading: 'EEF4FA', bold: true, width: 2200 }), cell('', { width: 3800 })]),
        row([cell('작성 일자', { shading: 'EEF4FA', bold: true, width: 2200 }), cell('2026년 4월', { width: 3800 })]),
      ],
    }),
    ...gap(2),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

// ── 문서 본문 ────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: '-', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 240 } } } },
          { level: 1, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 800, hanging: 240 } } } },
        ],
      },
      {
        reference: 'numbers',
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: '%1)', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 480, hanging: 280 } } } },
          { level: 1, format: LevelFormat.DECIMAL, text: '(%2)', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 800, hanging: 300 } } } },
        ],
      },
    ],
  },
  styles: {
    default: { document: { run: { font: FONT, size: 20 } } },
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 11906, height: 16838 }, // A4
          margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 120 },
              children: [
                new TextRun({ text: 'LINKIT 개발 착수 보고 제안서', font: FONT, size: 16, color: '8FA3BD' }),
              ],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
              spacing: { before: 80 },
              children: [
                new TextRun({ text: '- ', font: FONT, size: 16, color: '8FA3BD' }),
                new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16, color: '8FA3BD' }),
                new TextRun({ text: ' -', font: FONT, size: 16, color: '8FA3BD' }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ── 표지 ──
        ...coverSection(),

        // ════════════════════════════════════════════════
        // 1. 프로젝트 개요
        // ════════════════════════════════════════════════
        heading1('1. 프로젝트 개요'),

        heading2('1.1 프로젝트명'),
        p('LINKIT (링킷) — 동네 소모임 연결 플랫폼', { before: 60, after: 120 }),

        heading2('1.2 개발 요청부서'),
        p('', { before: 40, after: 100 }),

        heading2('1.3 개발 담당자'),
        tableOf(
          ['역할', '이름 (경력)', '연락처'],
          [2200, 3600, 3226],
          [
            ['기획자', '', ''],
            ['개발자 — 백엔드 (Java)', '', ''],
            ['개발자 — 프론트엔드 (Next.js)', '', ''],
            ['개발자 — Android', '', ''],
            ['QA 담당자', '', ''],
            ['서비스 응대 담당자', '', ''],
          ]
        ),
        ...gap(1),

        heading2('1.4 프로젝트 목적'),
        numbered('동네 기반 소모임(클럽) 탐색·참여 기능을 제공하여 20~30대 지역 커뮤니티 활성화에 기여'),
        numbered('교회 청년부 등 오프라인 공동체의 디지털 소통 허브 역할 수행'),
        numbered('커뮤니티 게시판, 알림, 일정 관리 등을 통해 지속적인 모임 문화 정착 지원'),
        ...gap(1),

        heading2('1.5 예상 개발 기간 및 비용'),
        tableOf(
          ['단계', '내용', '기간'],
          [2000, 5000, 2026],
          [
            ['1단계', '1차 시안 — 핵심 화면(홈·클럽·커뮤니티·마이페이지) 개발', '착수 후 5영업일'],
            ['2단계', '내부 피드백 반영 및 디테일 고도화', '피드백 후 3영업일'],
            ['3단계', '핸드오프 및 최종 QA', '협의'],
          ]
        ),
        ...gap(1),

        heading2('1.6 분야별 담당자'),
        p('※ 아래는 예시이며, 없는 항목은 삭제 가능합니다. / 팀원: 총 O O명', { size: 18, color: '5C7085', italic: true }),
        numbered('기획자 : 이름 (경력 O년)'),
        numbered('개발자'),
        bullet('백엔드 — 이름 (경력 O년) · Java / Spring Boot', 1),
        bullet('프론트엔드 — 이름 (경력 O년) · Next.js / TypeScript', 1),
        bullet('Android — 이름 (경력 O년)', 1),
        bullet('인프라 — 이름 (경력 O년)', 1),
        numbered('QA 담당자 : 이름 (경력 O년)'),
        numbered('서비스 응대 담당자 : 이름 (경력 O년)'),

        ...gap(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════════════
        // 2. 시스템 기능 개발 범위
        // ════════════════════════════════════════════════
        heading1('2. 시스템 기능 개발 범위'),
        p('※ 착수보고 시 보고되지 않은 기능은 임의로 추가하여 개발할 수 없습니다. 최대한 상세히 기술바랍니다.',
          { size: 18, color: '5C7085', italic: true }),
        ...gap(1),

        heading2('2.1 스플래시 / 온보딩'),
        numbered('스플래시 화면 — LINKIT 로고 + 브랜드 페이드인(1.6s), 2초 후 로그인 화면 자동 전환'),
        numbered('회원가입 4-Step 플로우'),
        bullet('Step 1 : 기존 회원 로그인 (ID / 비밀번호)'),
        bullet('Step 2 : 약관 및 개인정보 동의 (필수/선택 항목 구분)'),
        bullet('Step 3 : 기본 정보 입력 (닉네임 최대 10자, @handle, 한 줄 소개)'),
        bullet('Step 4 : 가입 완료 환영 화면 → 홈 진입'),
        ...gap(1),

        heading2('2.2 홈 화면'),
        numbered('프로모션 배너 자동 슬라이드 (4초 주기, 좌우 스와이프)'),
        numbered('추천 클럽 가로 스크롤 카드 목록 (그라디언트 포스터)'),
        numbered('인기 모임 랭킹 리스트 (1~4위)'),
        numbered('상단 검색 아이콘(🔍) 탭 → 검색 페이지, 알림 벨(🔔) 탭 → 알림 센터'),
        ...gap(1),

        heading2('2.3 클럽 탭'),
        numbered('클럽 목록 (2열 그리드, 카테고리 필터 칩 + 최신순/인기순/신규순 정렬)'),
        numbered('클럽 상세'),
        bullet('히어로 이미지(그라디언트) + 24px 오버랩 콘텐츠 카드'),
        bullet('서브탭 — 소개 / 게시판 / 멤버'),
        bullet('하단 고정 CTA: [모임 신청하기] / [참여 취소]'),
        bullet('찜하기(북마크) 토글'),
        numbered('클럽 게시판'),
        bullet('공지 / 자유 / 질문 카테고리 필터'),
        bullet('글쓰기 바텀시트 (제목·내용·카테고리 입력)'),
        bullet('게시글 좋아요 토글'),
        numbered('클럽 만들기'),
        bullet('클럽 이름 (최대 20자), 카테고리 (운동/음식/아트/스터디/음악/기타)'),
        bullet('대표 이모지 선택 (12종), 소개 (최대 100자)'),
        bullet('공개 범위 선택 (전체공개 / 승인제)'),
        bullet('실시간 미리보기 카드'),
        ...gap(1),

        heading2('2.4 커뮤니티 탭'),
        numbered('게시글 목록 — 카테고리 필터(전체/인기/일상/질문/모임/나눔/정보/생활정보)'),
        numbered('게시글 상세'),
        bullet('본문 전체 표시, 조회수 자동 증가'),
        bullet('좋아요(♥) 토글, 공유, 댓글 목록'),
        bullet('하단 고정 댓글 입력창 (Enter 전송)'),
        numbered('게시글 작성'),
        bullet('카테고리·제목(최대 50자)·내용(최대 500자)·위치(선택) 입력'),
        bullet('헤더 "등록" 버튼 + 하단 CTA 버튼 — 유효성 검사 후 활성화'),
        ...gap(1),

        heading2('2.5 마이페이지 탭'),
        numbered('프로필 영역 — 이모지 아바타, 닉네임, @handle, 한 줄 소개, [프로필 수정] 버튼'),
        numbered('활동 통계 — 참여클럽 / 찜한클럽 / 작성한글 수치'),
        numbered('활동 탭 — 내 모임 일정(D-day 뱃지), 찜한 클럽 썸네일, 작성한 게시글 목록'),
        numbered('설정 탭'),
        bullet('다크모드 토글 — Midnight Breeze 테마 즉시 전환'),
        bullet('알림 설정 (푸시·이메일·마케팅 on/off)'),
        bullet('언어 설정, 앱 정보 (v1.0.0), 로그아웃'),
        numbered('프로필 수정 — 이모지·닉네임·@handle·한 줄 소개 편집, 실시간 아바타 미리보기'),
        ...gap(1),

        heading2('2.6 추가 기능'),
        numbered('검색 (SearchPage) — 클럽·게시글 통합 검색, 최근 검색어, 인기 키워드 2열 그리드'),
        numbered('알림 센터 (NotificationPage) — 댓글/좋아요/클럽/시스템 유형별 알림 목록, 읽음 처리'),
        numbered('전역 Toast 피드백 — 찜·좋아요·신청·댓글·등록 등 모든 액션에 하단 팝업 표시'),

        ...gap(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════════════
        // 3. 시스템 구성
        // ════════════════════════════════════════════════
        heading1('3. 시스템 구성'),
        ...gap(1),

        heading2('3.1 기술 스택'),
        tableOf(
          ['구분', '기술 / 프레임워크', '비고'],
          [2000, 4000, 3026],
          [
            ['프론트엔드', 'Next.js 14+ (App Router) / TypeScript', 'SSR·SSG 지원, SEO 최적화'],
            ['스타일링', 'CSS Modules + CSS Custom Properties', '다크/라이트 테마 토큰 관리'],
            ['상태 관리', 'Zustand (persist 미들웨어)', 'localStorage 영속화'],
            ['백엔드', 'Java / Spring Boot 3.x', 'REST API 서버'],
            ['데이터베이스', 'MySQL / PostgreSQL', '사용자·클럽·게시글 데이터'],
            ['인증', 'JWT (Access + Refresh Token)', '세션 만료 자동 갱신'],
            ['인프라', '협의', 'AWS / 자체 서버'],
            ['폰트', 'Noto Sans KR (한글), Space Grotesk (영문)', 'Google Fonts CDN'],
            ['아이콘', 'lucide-react', 'SVG 기반 경량 아이콘'],
          ]
        ),
        ...gap(1),

        heading2('3.2 화면 구성 (플로우)'),
        tableOf(
          ['화면', '경로 (URL)', '설명'],
          [2400, 2600, 4026],
          [
            ['스플래시', '/', '브랜드 로딩, 2초 후 온보딩 이동'],
            ['온보딩', '/onboarding/*', '로그인·회원가입 4-Step'],
            ['홈', '/home', '배너·추천클럽·인기모임'],
            ['검색', '/search', '통합 검색, 인기 키워드'],
            ['알림', '/notifications', '유형별 알림 목록'],
            ['클럽 목록', '/clubs', '필터·정렬 그리드'],
            ['클럽 상세', '/clubs/:id', '소개·게시판·멤버 서브탭'],
            ['클럽 만들기', '/clubs/new', '미리보기 + 폼'],
            ['커뮤니티 목록', '/community', '카테고리 필터 피드'],
            ['게시글 상세', '/community/:id', '본문·댓글·좋아요'],
            ['게시글 작성', '/community/new', '카테고리·제목·내용'],
            ['마이페이지', '/mypage', '프로필·활동·설정'],
            ['프로필 수정', '/mypage/edit', '이모지·닉네임·소개'],
          ]
        ),
        ...gap(1),

        heading2('3.3 디자인 시스템 — 컬러 토큰'),
        tableOf(
          ['용도', '라이트모드', '다크모드 (Midnight Breeze)'],
          [2600, 3200, 3226],
          [
            ['기본 배경', '#F1F4F9', '#0B1525'],
            ['카드 배경', '#FFFFFF', '#13203A'],
            ['Primary (Blue)', '#0088FF', '#2E9BFF'],
            ['Accent (Pink)', '#FF668A', '#FF668A'],
            ['Accent (Mint)', '#00C3D0', '#28D6E0'],
            ['기본 텍스트', '#0A1628', '#EAF2FC'],
            ['보조 텍스트', '#41536B', '#B5C3D6'],
            ['보더', '#E4E9F2', '#1F2D47'],
          ]
        ),

        ...gap(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════════════
        // 4. 보안 정책
        // ════════════════════════════════════════════════
        heading1('4. 보안 정책'),
        p('※ 파란색 이탤릭체 항목은 예시이며, 실제 정책에 맞춰 수정·확정해 주세요.',
          { size: 18, color: '5C7085', italic: true }),
        ...gap(1),

        heading2('4.1 사용자 인증'),
        tableOf(
          ['대상', '인증 수단', '오류 횟수 제한'],
          [3000, 3000, 3026],
          [
            ['일반 서비스 이용자', 'ID / Password', '5회 실패 시 일시 잠금'],
            ['서비스 관리자', 'ID / Password + OTP (권장)', '5회 실패 시 잠금'],
          ]
        ),
        ...gap(1),

        heading2('4.2 페이지(메뉴)별 접근 권한'),
        tableOf(
          ['페이지', '일반 사용자', '관리자'],
          [3000, 3013, 3013],
          [
            ['홈·클럽·커뮤니티', '조회·참여', '조회·수정·삭제'],
            ['클럽 만들기', '작성', '작성·승인·삭제'],
            ['관리자 대시보드', '접근 불가', '전체 조회·관리'],
          ]
        ),
        ...gap(1),

        heading2('4.3 데이터 암호화'),
        numbered('저장 : 사용자 비밀번호 SHA-256 단방향 암호화 저장'),
        numbered('전송 : TLS 1.3 적용 (HTTPS 필수)'),
        numbered('개인정보 항목 : 이메일·연락처 등 마스킹 처리(표시 시)'),
        ...gap(1),

        heading2('4.4 로그 기록'),
        numbered('시스템 관리자 접속 로그 1년 보관'),
        numbered('개인정보 삭제·다운로드 로그(수행자·대상자·IP·처리일시) 5년 보관'),
        ...gap(1),

        heading2('4.5 처리 개인정보 항목'),
        tableOf(
          ['항목', '예상 정보주체 수', '암호화/마스킹', '목적'],
          [1800, 2200, 2200, 2826],
          [
            ['닉네임', '제한 없음', '마스킹 없음', '사용자 식별'],
            ['이메일·연락처', '제한 없음', '출력 시 마스킹', '계정 인증·알림'],
            ['비밀번호', '제한 없음', 'SHA-256 암호화', '로그인 인증'],
            ['서비스 관리자 ID/PW', '10명 내외', 'PW SHA-256', '관리자 식별 및 인증'],
          ]
        ),

        ...gap(2),
        new Paragraph({ children: [new PageBreak()] }),

        // ════════════════════════════════════════════════
        // 필수 체크사항 + 서명
        // ════════════════════════════════════════════════
        heading1('개발 시 필수 체크 사항'),
        ...gap(1),

        heading2('1. 개발착수 보고 검토 주체'),
        bullet('시온로그인 연동이 필요하지 않은 경우, 총회 전산개발과에서 검토합니다.'),
        bullet('시온로그인 연동이 필요한 경우, 총회 행정서무부와 함께 검토합니다.'),
        bullet('담당자 변경 시 총회에 보고해야 합니다.'),
        ...gap(1),

        p('착수 보고 승인 후 개발 프로세스', { bold: true }),
        tableOf(
          ['착수보고서 제출 및 승인', '화면설계서 제출 및 승인', '개발 착수', '최종 통합 테스트 및 보안점검', '총회 인증마크 발급 및 배포'],
          [1805, 1805, 1600, 2400, 1416],
          []
        ),
        ...gap(1),

        heading2('2. 개발 진행 시 유의 사항'),
        bullet('모든 어플리케이션은 개발자 센터에 등록하여 사용해야 합니다.'),
        bullet('총회 서버 사용은 전체/총회 범위로 사용되는 경우에 한해 허가됩니다. 지파/교회 범위에서 사용 시 총회 전산과와 사전 협의합니다.'),
        ...gap(1),

        p('시온로그인 연동', { bold: true }),
        bullet('성도 정보를 활용하거나 계정 관리가 필요한 시스템은 반드시 시온로그인 시스템을 연동해야 합니다.'),
        ...gap(1),

        p('총회 기능 중복 개발 금지', { bold: true }),
        bullet('총회에서 이미 제공하고 있는 기능을 자체적으로 중복 개발하는 것은 승인되지 않습니다.'),
        ...gap(1),

        p('법적 요건 및 품질 보장', { bold: true }),
        bullet('개인정보보호법 등 법적 기준을 철저히 준수해야 하며, 교회의 공식 시스템으로서 높은 품질과 안전성을 갖추어야 합니다.'),

        ...gap(4),

        // 서명 영역
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 160 },
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'CCCCCC' } },
          children: [
            new TextRun({ text: '위와 같이 보고합니다.', font: FONT, size: 22 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({ text: '신천기 43(2026)년     월     일', font: FONT, size: 20 }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [
            new TextRun({ text: '보고자 :           지파 정보통신부장                  (인)', font: FONT, size: 20 }),
          ],
        }),
      ],
    },
  ],
});

// ── 파일 저장 ────────────────────────────────────────────────────────
const OUT = 'C:/Users/k7788/Downloads/Telegram Desktop/LINKIT_개발착수보고서.docx';

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log('✅ 저장 완료:', OUT);
});
