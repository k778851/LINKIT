/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: isProd ? 'export' : undefined,     // 개발 시 비활성 → 모든 동적 라우트 허용
  basePath: isProd ? '/LINKIT' : '',         // 개발 시 basePath 없음 → localhost:3000 바로 접속
  trailingSlash: isProd ? true : false,      // 정적 호스팅에서만 경로 호환성 필요
  images: {
    unoptimized: true,                       // 정적 배포 시 필수
  },
  // public 폴더 정적 파일 경로에 basePath를 주입 (빌드/CI 환경 모두 적용)
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? '/LINKIT' : '',
  },
};

export default nextConfig;
