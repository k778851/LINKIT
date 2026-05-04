import { useState } from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '../../components/common/Button';
import styles from './OnboardingStep.module.css';

const TERMS = [
  { id: 'service',   label: '서비스 이용약관 동의',   required: true,  link: '#' },
  { id: 'privacy',   label: '개인정보 처리방침 동의', required: true,  link: '#' },
  { id: 'marketing', label: '마케팅 정보 수신 동의',  required: false, link: '#' },
];

export function TermsStep({ onNext, onBack }) {
  const [agreed, setAgreed] = useState({});

  const allRequired = TERMS.filter((t) => t.required).every((t) => agreed[t.id]);
  const allAgreed   = TERMS.every((t) => agreed[t.id]);

  const toggle    = (id) => setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));
  const toggleAll = () => {
    if (allAgreed) setAgreed({});
    else setAgreed(Object.fromEntries(TERMS.map((t) => [t.id, true])));
  };

  return (
    <div className={styles.step}>
      <button onClick={onBack} className={styles.backBtn}>
        <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} /> 뒤로
      </button>

      <p className={styles.stepTitle}>약관에 동의해 주세요</p>
      <p className={styles.stepDesc}>서비스 이용을 위해 약관 동의가 필요합니다.</p>

      <div className={styles.form}>
        {/* 전체 동의 */}
        <button type="button" className={styles.allAgreeRow} onClick={toggleAll}>
          전체 동의하기
          <span className={`${styles.checkbox} ${allAgreed ? styles.checkboxChecked : ''}`}>
            {allAgreed && <Check size={14} strokeWidth={3} />}
          </span>
        </button>

        {/* 개별 약관 */}
        <ul className={styles.termsList}>
          {TERMS.map((term) => (
            <li key={term.id} className={styles.termRow}>
              <button
                type="button"
                className={styles.termCheckArea}
                onClick={() => toggle(term.id)}
              >
                <span className={`${styles.checkbox} ${agreed[term.id] ? styles.checkboxChecked : ''}`}>
                  {agreed[term.id] && <Check size={14} strokeWidth={3} />}
                </span>
                <span className={styles.termLabel}>
                  {term.required
                    ? <span className={styles.required}>[필수]</span>
                    : <span className={styles.optional2}>[선택]</span>
                  }
                  {' '}{term.label}
                </span>
              </button>
              <a
                href={term.link}
                className={styles.termViewBtn}
                onClick={(e) => e.stopPropagation()}
              >
                보기 <ChevronRight size={12} />
              </a>
            </li>
          ))}
        </ul>

        <Button onClick={() => onNext({ terms: agreed })} disabled={!allRequired} className={styles.cta}>
          다음
        </Button>
      </div>
    </div>
  );
}
