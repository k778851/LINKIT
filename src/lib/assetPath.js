/**
 * public 폴더 정적 파일 경로에 basePath를 붙여주는 유틸
 *
 * next/image의 `unoptimized: true` 모드에서는 basePath가 자동으로
 * 추가되지 않아 배포 시 404가 발생함. 이 함수로 명시적으로 처리.
 *
 * @example
 * assetPath('/logo-sig-white.png') // => '/LINKIT/logo-sig-white.png'
 */
export const assetPath = (src) =>
  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}${src}`;
