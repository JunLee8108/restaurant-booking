// 통계 집계 헬퍼
const SERVED = ["completed", "seated"];
const NEGATIVE = ["cancelled", "no_show"];

export function filterByMonth(rows, year, monthIdx) {
  return rows.filter((r) => {
    if (!r.reservation_date) return false;
    const [y, m] = r.reservation_date.split("-").map(Number);
    return y === year && m === monthIdx + 1;
  });
}

export function computeMetrics(rows) {
  const total = rows.length;
  const served = rows.filter((r) => SERVED.includes(r.status));
  const negative = rows.filter((r) => NEGATIVE.includes(r.status));
  const totalGuests = served.reduce((s, r) => s + r.party_size, 0);
  const avgParty = served.length ? totalGuests / served.length : 0;
  const cancelRate = total ? (negative.length / total) * 100 : 0;
  return { total, totalGuests, avgParty, cancelRate };
}

export function countBySlot(rows) {
  const map = new Map();
  rows.forEach((r) => {
    if (!r.reservation_time) return;
    const t = r.reservation_time.slice(0, 5);
    map.set(t, (map.get(t) || 0) + 1);
  });
  return map;
}

export function countByStatus(rows) {
  const map = new Map();
  rows.forEach((r) => map.set(r.status, (map.get(r.status) || 0) + 1));
  return map;
}

export function countBySeating(rows) {
  const map = new Map();
  rows.forEach((r) => map.set(r.seating, (map.get(r.seating) || 0) + 1));
  return map;
}

/**
 * 단골 고객 — 완료된 방문(completed + seated) 기준 이메일별 집계.
 * 횟수 desc, 동률은 최근 방문일 desc.
 */
export function computeRegulars(allRows, topN = 10) {
  const visits = allRows.filter((r) => SERVED.includes(r.status));
  const byEmail = new Map();
  visits.forEach((r) => {
    const key = (r.email || "").trim().toLowerCase();
    if (!key) return;
    const entry = byEmail.get(key) || {
      email: r.email,
      name: r.customer_name,
      count: 0,
      totalGuests: 0,
      lastVisit: "",
    };
    entry.count += 1;
    entry.totalGuests += r.party_size;
    if (!entry.lastVisit || r.reservation_date > entry.lastVisit) {
      entry.lastVisit = r.reservation_date;
      entry.name = r.customer_name; // 최근 기록 사용
    }
    byEmail.set(key, entry);
  });
  return Array.from(byEmail.values())
    .sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return b.lastVisit.localeCompare(a.lastVisit);
    })
    .slice(0, topN);
}

/**
 * 취소·노쇼 명단 (현재 월). repeats = 전체 기간 누적 횟수.
 */
export function computeWatchlist(monthRows, allRows) {
  const repeatCount = new Map();
  allRows.forEach((r) => {
    if (!NEGATIVE.includes(r.status)) return;
    const key = (r.email || "").trim().toLowerCase();
    if (!key) return;
    repeatCount.set(key, (repeatCount.get(key) || 0) + 1);
  });

  return monthRows
    .filter((r) => NEGATIVE.includes(r.status))
    .map((r) => ({
      ...r,
      repeats: repeatCount.get((r.email || "").trim().toLowerCase()) || 1,
    }))
    .sort((a, b) =>
      (a.reservation_date + a.reservation_time).localeCompare(
        b.reservation_date + b.reservation_time,
      ),
    );
}

/**
 * 비교 정보 — 현재 vs 이전. higherIsBad 면 증가가 부정.
 */
export function compareDelta(current, last, higherIsBad = false) {
  const diff = current - last;
  if (diff === 0) return { arrow: "→", tone: "flat", text: "변화 없음" };
  const pct = last === 0 ? 100 : (diff / Math.abs(last)) * 100;
  const up = diff > 0;
  const arrow = up ? "↑" : "↓";
  const tone = up
    ? higherIsBad
      ? "down"
      : "up"
    : higherIsBad
      ? "up"
      : "down";
  return {
    arrow,
    tone,
    text: `${Math.abs(pct).toFixed(1)}% vs 지난달`,
  };
}
