import { useAuthStore } from '../../store/authStore';
import { defaultUser } from '../../data/sampleData';
import styles from './LoginStep.module.css';

function SocialBtn({ kind, label, onClick, recommended }) {
  const styleMap = {
    kakao: { background: '#FEE500', color: '#191919' },
    apple: { background: '#000000', color: '#ffffff' },
    email: { background: '#ffffff', color: 'var(--ink-2)', border: '1.5px solid var(--base-border)' },
  };
  const s = styleMap[kind] ?? {};

  return (
    <div style={{ position: 'relative' }}>
      {recommended && (
        <span style={{
          position: 'absolute',
          top: -8,
          right: 12,
          background: 'var(--pink)',
          color: '#fff',
          fontSize: 10,
          fontWeight: 700,
          padding: '2px 8px',
          borderRadius: 999,
          zIndex: 1,
        }}>추천</span>
      )}
      <button
        onClick={onClick}
        style={{
          width: '100%',
          height: 52,
          borderRadius: 14,
          border: s.border ?? 'none',
          background: s.background,
          color: s.color,
          fontSize: 15,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
      >
        {kind === 'kakao' && (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2C5.58 2 2 4.91 2 8.5c0 2.28 1.47 4.28 3.69 5.47L4.8 17.2a.3.3 0 0 0 .43.33l3.96-2.62A8.7 8.7 0 0 0 10 15c4.42 0 8-2.91 8-6.5S14.42 2 10 2Z" fill="#191919"/>
          </svg>
        )}
        {kind === 'apple' && (
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none">
            <path d="M15.1 10.6c0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.2-2.1-3.9-2.2-1.7-.2-3.3 1-4.1 1-.8 0-2.1-1-3.4-1-1.8 0-3.4 1-4.3 2.6C-.4 9.7.3 14.5 2.3 17c1 1.2 2.1 2.6 3.6 2.5 1.4 0 2-.9 3.7-.9s2.2.9 3.7.9c1.5 0 2.5-1.3 3.5-2.6.7-1 1.3-2.1 1.6-3.3-3.5-1.3-3.3-6.1 3.3-3Zm-3-6.5c.8-1 1.4-2.4 1.2-3.8-1.2.1-2.6.8-3.4 1.8-.8.9-1.4 2.3-1.2 3.7 1.3.1 2.6-.7 3.4-1.7Z" fill="white"/>
          </svg>
        )}
        {kind === 'email' && (
          <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
            <rect x="1" y="1" width="18" height="14" rx="3" stroke="var(--ink-3)" strokeWidth="1.5"/>
            <path d="M1 4l9 6 9-6" stroke="var(--ink-3)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
        {label}
      </button>
    </div>
  );
}

export function LoginStep({ onNext }) {
  const login = useAuthStore((s) => s.login);

  const handleSocial = (provider) => {
    // Simulate social login → go to terms step
    if (provider === 'email') {
      onNext({ provider });
    } else {
      // Kakao/Apple: directly log in with default user for prototype
      login(defaultUser);
      onNext({ skipToHome: true });
    }
  };

  return (
    <div className={styles.step}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroIcon}>
          <svg width="84" height="84" viewBox="0 0 84 84" fill="none">
            <defs>
              <linearGradient id="hero-grad" x1="0" y1="0" x2="84" y2="84" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0088FF"/>
                <stop offset="1" stopColor="#00C3D0"/>
              </linearGradient>
            </defs>
            <rect width="84" height="84" rx="24" fill="url(#hero-grad)"/>
            <path d="M24 42 L42 24 L60 42 L42 60 Z" fill="white" opacity="0.9"/>
            <circle cx="42" cy="42" r="9" fill="white"/>
          </svg>
        </div>
        <div className={styles.wordmark}>
          <span className={styles.wordmarkText}>LINKIT</span>
        </div>
        <p className={styles.tagline}>우리 동네 소모임 커뮤니티</p>
      </div>

      {/* Social buttons */}
      <div className={styles.socialList}>
        <SocialBtn kind="kakao" label="카카오로 시작하기" onClick={() => handleSocial('kakao')} recommended />
        <SocialBtn kind="apple" label="Apple로 시작하기" onClick={() => handleSocial('apple')} />
        <SocialBtn kind="email" label="이메일로 시작하기" onClick={() => handleSocial('email')} />
      </div>

      <p className={styles.terms}>
        가입 시 <span className={styles.termsLink}>이용약관</span> 및{' '}
        <span className={styles.termsLink}>개인정보처리방침</span>에 동의하게 됩니다
      </p>
    </div>
  );
}
