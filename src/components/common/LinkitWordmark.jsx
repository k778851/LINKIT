'use client';

import Image from 'next/image';
import { useTheme } from '../../hooks/useTheme';
import { assetPath } from '../../lib/assetPath';

/**
 * LINKIT 브랜드 워드마크
 * - 라이트 모드: 컬러(파란) 로고
 * - 다크 모드:   흰색 로고
 * @param {number} height - 로고 높이 (px), 비율 자동 유지
 */
export function LinkitWordmark({ height = 22 }) {
  const { isDark } = useTheme();
  // 원본 비율: 가로형 시그니처 = 약 3.33:1 (1456 × 437 기준)
  const width = Math.round(height * 3.33);

  return (
    <Image
      src={assetPath(isDark ? '/logo-sig-white.png' : '/logo-sig-color.png')}
      alt="LINKIT"
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
