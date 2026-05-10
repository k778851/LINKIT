import { ClientProviders } from '../components/ClientProviders';
import '../styles/global.css';

const basePath = process.env.NODE_ENV === 'production' ? '/LINKIT' : '';

export const metadata = {
  title: 'LINKIT — 우리 동네 소모임',
  description: '동네 주민들이 소모임을 자유롭게 생성하고 참여할 수 있는 모바일 커뮤니티',
  // 로컬 dev: /manifest.json, 프로덕션(GitHub Pages): /LINKIT/manifest.json
  manifest: `${basePath}/manifest.json`,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LINKIT',
  },
  icons: {
    icon: `${basePath}/favicon.svg`,
    apple: `${basePath}/icons/icon-192.png`,
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',          // 노치/홈바 영역 활용
  themeColor: '#1677FF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* PWA iOS 추가 메타 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LINKIT" />
        <link rel="apple-touch-icon" href={`${basePath}/icons/icon-192.png`} />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
