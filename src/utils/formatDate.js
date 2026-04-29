export function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return formatDate(isoString);
}

export function formatDate(isoString) {
  const d = new Date(isoString);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

export function formatScheduleDate(isoString) {
  const d = new Date(isoString);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  const weekday = weekdays[d.getDay()];
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}(${weekday}) ${hours}:${minutes}`;
}

export function getDday(isoString) {
  const diff = new Date(isoString).getTime() - Date.now();
  const days = Math.ceil(diff / 86400000);
  if (days < 0) return '종료';
  if (days === 0) return 'D-Day';
  return `D-${days}`;
}

/** 오늘 기준 D-day 숫자 반환 (양수=미래, 음수=과거, 0=오늘) */
export function calcDdayNum(startAt) {
  if (!startAt) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(startAt);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

/** D-day 숫자 → 'D-DAY' / 'D-N' / 'D+N' 레이블 */
export function getDdayLabel(dday) {
  if (dday === 0) return 'D-DAY';
  if (dday > 0) return `D-${dday}`;
  return `D+${Math.abs(dday)}`;
}

/** ISO 날짜 → 'MM/DD (요일)' */
export function formatShortDate(isoString) {
  const d = new Date(isoString);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
  return `${mm}/${dd} (${weekdays[d.getDay()]})`;
}
