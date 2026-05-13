import { format, addDays, startOfDay, isBefore } from "date-fns";
import { ko } from "date-fns/locale";

// "YYYY-MM-DD" 같은 date-only 문자열은 JS 가 UTC 자정으로 파싱해
// 타임존에 따라 하루 어긋날 수 있음 → 로컬 자정으로 강제 파싱.
function toLocalDate(d) {
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  }
  return new Date(d);
}

export function fmtDate(d, pattern = "yyyy년 M월 d일 (E)") {
  return format(toLocalDate(d), pattern, { locale: ko });
}

export function fmtDateShort(d) {
  return format(toLocalDate(d), "M.d (E)", { locale: ko });
}

export function fmtTime(t) {
  // "18:30" -> "오후 6:30"
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h < 12 ? "오전" : "오후";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hh}:${String(m).padStart(2, "0")}`;
}

export function toISO(date) {
  return format(date, "yyyy-MM-dd");
}

export function getNextDays(count = 60, from = new Date()) {
  const start = startOfDay(from);
  return Array.from({ length: count }, (_, i) => addDays(start, i));
}

export function isPast(date) {
  return isBefore(startOfDay(new Date(date)), startOfDay(new Date()));
}

export function cls(...args) {
  return args.filter(Boolean).join(" ");
}
