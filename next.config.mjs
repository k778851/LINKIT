/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',          // GitHub Pages 정적 배포
  basePath: '/LINKIT',       // GitHub 레포 이름과 일치시킬 것
  trailingSlash: true,       // 정적 호스팅에서 경로 호환성
  images: {
    unoptimized: true,       // 정적 배포 시 필수
  },
};

export default nextConfig;
