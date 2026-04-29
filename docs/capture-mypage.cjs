const { chromium } = require('playwright');
const path = require('path');

const AUTH = JSON.stringify({
  state: {
    isAuthenticated: true,
    user: {
      id: 'user-me',
      nickname: '링킷유저',
      emoji: '🔥',
      bio: '소모임을 사랑하는 사람 🙌',
      handle: 'linkit_user',
      joinedClubs: ['club-1', 'club-6'],
      bookmarkedClubs: ['club-3', 'club-4', 'club-5'],
      settings: { theme: 'light' },
    },
  },
  version: 0,
});

const OUT = path.join(__dirname, 'screenshots');

async function shot(page, filename) {
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, filename), fullPage: false });
  console.log('✅ saved:', filename);
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  // 로그인 상태 주입
  await page.goto('http://localhost:5173');
  await page.evaluate((auth) => localStorage.setItem('linkit-auth', auth), AUTH);

  // ── 1. 마이페이지 메인 (활동 탭 상단) ──
  await page.goto('http://localhost:5173/mypage');
  await page.waitForTimeout(800);
  await shot(page, '01_mypage_activity_top.png');

  // ── 2. 활동 탭 스크롤 (찜한클럽 + 작성글) ──
  await page.evaluate(() => window.scrollTo(0, 550));
  await shot(page, '02_mypage_activity_bottom.png');

  // ── 3. 설정 탭 ──
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByText('설정').click();
  await shot(page, '03_mypage_settings.png');

  // ── 4. 알림 설정 ──
  await page.goto('http://localhost:5173/mypage/settings/notifications');
  await shot(page, '04_mypage_settings_notifications.png');

  // ── 5. 개인정보·보안 ──
  await page.goto('http://localhost:5173/mypage/settings/privacy');
  await shot(page, '05_mypage_settings_privacy.png');

  // ── 6. 언어 ──
  await page.goto('http://localhost:5173/mypage/settings/language');
  await shot(page, '06_mypage_settings_language.png');

  // ── 7. 앱 정보 ──
  await page.goto('http://localhost:5173/mypage/settings/about');
  await shot(page, '07_mypage_settings_about.png');

  // ── 8. 프로필 수정 ──
  await page.goto('http://localhost:5173/mypage/edit');
  await shot(page, '08_mypage_profile_edit_top.png');

  // 스크롤 내려서 저장 버튼까지
  await page.evaluate(() => window.scrollTo(0, 500));
  await shot(page, '09_mypage_profile_edit_bottom.png');

  // ── 9. 다크모드 적용 상태 ──
  await page.goto('http://localhost:5173/mypage');
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('linkit-auth'));
    s.state.user.settings.theme = 'dark';
    localStorage.setItem('linkit-auth', JSON.stringify(s));
  });
  await page.reload();
  await page.waitForTimeout(800);
  await shot(page, '10_mypage_dark_mode.png');

  await browser.close();
  console.log('\n🎉 모든 스크린샷 저장 완료 → docs/screenshots/');
})();
