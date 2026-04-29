'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginStep } from './LoginStep';
import { TermsStep } from './TermsStep';
import { ProfileStep } from './ProfileStep';
import { WelcomeStep } from './WelcomeStep';
import styles from './OnboardingFlow.module.css';

const STEPS = [LoginStep, TermsStep, ProfileStep, WelcomeStep];
const TOTAL_INNER = 2; // steps 1 and 2 (TermsStep, ProfileStep)

export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({});
  const router = useRouter();

  const next = (patch = {}) => {
    const nextData = { ...data, ...patch };
    setData(nextData);
    // Social login (Kakao/Apple) skips directly to home
    if (patch.skipToHome) {
      router.replace('/home');
      return;
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      router.replace('/home');
    }
  };

  const back = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
  };

  const StepComponent = STEPS[step];

  // Show progress bar only for inner steps (terms & profile)
  const showProgress = step > 0 && step < STEPS.length - 1;
  const innerStep = step - 1; // 0-indexed among inner steps
  const progressPct = showProgress ? ((innerStep + 1) / TOTAL_INNER) * 100 : 0;

  return (
    <div className={styles.page}>
      {showProgress && (
        <div className={styles.progressWrap}>
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPct}%` }} />
          </div>
          <p className={styles.progressLabel}>{innerStep + 1} / {TOTAL_INNER}</p>
        </div>
      )}
      <StepComponent onNext={next} onBack={back} data={data} />
    </div>
  );
}
