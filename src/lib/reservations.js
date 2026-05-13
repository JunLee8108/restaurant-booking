import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * 영업 정책 (Supabase 미연결 시에도 동작하는 클라이언트 기본값)
 * - 영업일: 매일 (휴무 없음)
 * - 디너 슬롯: 18:00 / 18:30 / 19:00 / 19:30 / 20:00 / 20:30
 * - 슬롯당 capacity: 20
 */
export const CLOSED_DAYS = []; // 휴무일 없음
export const DEFAULT_SLOTS = [
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
];
export const DEFAULT_CAPACITY = 20;

export const SEATING = [
  {
    value: "dining_room",
    label: "다이닝 룸",
    desc: "주 다이닝 공간 · 셰프의 코스 메뉴",
  },
  {
    value: "chefs_counter",
    label: "셰프스 카운터",
    desc: "오픈 키친 카운터 · 8석 한정",
  },
  {
    value: "private_salon",
    label: "프라이빗 살롱",
    desc: "독립된 룸 · 최소 4인부터",
  },
];

export const STATUS_META = {
  pending: { label: "대기", tone: "warning" },
  confirmed: { label: "확정", tone: "info" },
  seated: { label: "착석", tone: "accent" },
  completed: { label: "완료", tone: "success" },
  cancelled: { label: "취소", tone: "muted" },
  no_show: { label: "노쇼", tone: "danger" },
};

export function generateConfirmationCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "LS-";
  for (let i = 0; i < 5; i++)
    s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export function isClosed(date) {
  return CLOSED_DAYS.includes(new Date(date).getDay());
}

/**
 * 특정 날짜의 시간 슬롯 가용 잔여 좌석을 반환.
 * Supabase 미연결 시 모든 슬롯을 capacity로 반환 (데모용).
 */
export async function getAvailability(dateISO) {
  if (!isSupabaseConfigured) {
    return DEFAULT_SLOTS.map((t) => ({
      slot_time: t,
      remaining: DEFAULT_CAPACITY,
    }));
  }
  const { data, error } = await supabase.rpc("available_slots", {
    p_date: dateISO,
  });
  if (error) {
    console.error("[getAvailability]", error);
    return DEFAULT_SLOTS.map((t) => ({
      slot_time: t,
      remaining: DEFAULT_CAPACITY,
    }));
  }
  return data ?? [];
}

export async function createReservation(payload) {
  const confirmation_code = generateConfirmationCode();
  const row = { ...payload, confirmation_code, status: "pending" };

  if (!isSupabaseConfigured) {
    // 데모 모드 — 로컬에 저장만 하고 코드 반환
    const local = JSON.parse(
      localStorage.getItem("la_stella_demo_reservations") || "[]",
    );
    local.push({ ...row, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    localStorage.setItem(
      "la_stella_demo_reservations",
      JSON.stringify(local),
    );
    return { data: row, error: null, demo: true };
  }

  // RLS 주의: .select() 를 붙이면 INSERT 후 행을 다시 읽기 위해
  // SELECT 권한도 필요해짐. anon 손님은 SELECT 권한이 없으므로
  // .insert() 만 호출하고 클라이언트가 들고 있는 row 를 그대로 반환.
  const { error } = await supabase.from("reservations").insert(row);
  return { data: row, error, demo: false };
}

/* ---- Admin ---- */

export async function listReservations({
  from,
  to,
  status,
  search,
} = {}) {
  if (!isSupabaseConfigured) {
    const local = JSON.parse(
      localStorage.getItem("la_stella_demo_reservations") || "[]",
    );
    return { data: local, error: null, demo: true };
  }
  let q = supabase
    .from("reservations")
    .select("*")
    .order("reservation_date", { ascending: true })
    .order("reservation_time", { ascending: true });

  if (from) q = q.gte("reservation_date", from);
  if (to) q = q.lte("reservation_date", to);
  if (status && status !== "all") q = q.eq("status", status);
  if (search) {
    q = q.or(
      `customer_name.ilike.%${search}%,email.ilike.%${search}%,confirmation_code.ilike.%${search}%`,
    );
  }
  const { data, error } = await q;
  return { data, error, demo: false };
}

export async function getReservation(id) {
  if (!isSupabaseConfigured) {
    const local = JSON.parse(
      localStorage.getItem("la_stella_demo_reservations") || "[]",
    );
    return { data: local.find((r) => r.id === id) ?? null, error: null };
  }
  const { data, error } = await supabase
    .from("reservations")
    .select("*")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function updateReservation(id, patch) {
  if (!isSupabaseConfigured) {
    const local = JSON.parse(
      localStorage.getItem("la_stella_demo_reservations") || "[]",
    );
    const idx = local.findIndex((r) => r.id === id);
    if (idx >= 0) local[idx] = { ...local[idx], ...patch };
    localStorage.setItem(
      "la_stella_demo_reservations",
      JSON.stringify(local),
    );
    return { data: local[idx], error: null };
  }
  const { data, error } = await supabase
    .from("reservations")
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}
