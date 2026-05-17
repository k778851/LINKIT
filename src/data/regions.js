export const REGION_OPTIONS = ['전체', '본부', '광산', '북구'];

const REGION_ALIASES = {
  북구: ['북구', '오치동', '용봉동', '전남대', '풋살장'],
  광산: ['광산', '광산구', '수완동', '첨단', '송정'],
  본부: ['본부', '여의도', '한강', '서울', '성수동', '강남', '홍대'],
};

export function getRegionFromText(text) {
  const value = String(text ?? '');
  return REGION_OPTIONS.find((region) => (
    region !== '전체' && REGION_ALIASES[region].some((alias) => value.includes(alias))
  )) ?? '본부';
}

export function getItemRegion(item) {
  return item?.serviceRegion
    ?? item?.regionGroup
    ?? getRegionFromText(`${item?.region ?? ''} ${item?.location ?? ''} ${item?.ownerRegion ?? ''} ${(item?.tags ?? []).join(' ')}`);
}

export function matchesRegion(item, selectedRegion) {
  if (!selectedRegion || selectedRegion === '전체') return true;
  return getItemRegion(item) === selectedRegion;
}
