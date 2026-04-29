import { ClientProviders } from '../components/ClientProviders';
import '../styles/global.css';

export const metadata = {
  title: 'LINKIT',
  description: '우리 동네 소모임 커뮤니티',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
