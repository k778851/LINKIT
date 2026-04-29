import { useAuthStore } from '../../store/authStore';
import { Button } from '../../components/common/Button';
import { defaultUser } from '../../data/sampleData';
import styles from './OnboardingStep.module.css';

export function WelcomeStep({ onNext, data }) {
  const login = useAuthStore((s) => s.login);
  const { nickname = '링킷유저', emoji = '😊' } = data;

  const handleStart = () => {
    login({ ...defaultUser, nickname, emoji });
    onNext();
  };

  return (
    <div className={styles.step}>
      <div className={styles.welcomeCenter}>
        <div className={styles.welcomeEmoji}>{emoji}</div>
        <h2 className={styles.welcomeTitle}>{nickname}님,<br />환영해요!</h2>
        <p className={styles.welcomeDesc}>
          LINKIT에서 취미가 같은 사람들을 만나고<br />
          우리 동네 소모임을 즐겨보세요.
        </p>
      </div>
      <Button onClick={handleStart} className={styles.cta}>
        시작하기
      </Button>
    </div>
  );
}
