import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * 영업 정책
 * - 휴무 없음
 * - 인원: 성인 + 소인 ≤ 15 (유아 36개월 미만 무료, 소인 13세 미만)
 */
export const CLOSED_DAYS = [];
export const MAX_PARTY = 15;

export const DEFAULT_PRICING = {
  price_regular: 43000,
  price_early_bird: 30000,
  late_discount_pct: 10,
  early_cutoff_time: "12:00",
};

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

/* ---- 가격 ---- */

const PRICING_KEY = "la_stella_demo_pricing";

function readDemoPricing() {
  try {
    const raw = localStorage.getItem(PRICING_KEY);
    return raw ? { ...DEFAULT_PRICING, ...JSON.parse(raw) } : { ...DEFAULT_PRICING };
  } catch {
    return { ...DEFAULT_PRICING };
  }
}

function writeDemoPricing(next) {
  localStorage.setItem(PRICING_KEY, JSON.stringify(next));
}

export async function getPricing() {
  if (!isSupabaseConfigured) return readDemoPricing();
  const { data, error } = await supabase
    .from("pricing_settings")
    .select("price_regular,price_early_bird,late_discount_pct,early_cutoff_time")
    .eq("id", 1)
    .maybeSingle();
  if (error || !data) return { ...DEFAULT_PRICING };
  return data;
}

export async function updatePricing(patch) {
  if (!isSupabaseConfigured) {
    const next = { ...readDemoPricing(), ...patch };
    writeDemoPricing(next);
    return { data: next, error: null };
  }
  const { data, error } = await supabase
    .from("pricing_settings")
    .update(patch)
    .eq("id", 1)
    .select()
    .single();
  return { data, error };
}

/**
 * 부페 단가 계산. now 가 cutoff(예: 12:00) 이전이면 얼리버드, 이후면 정가에 할인 적용.
 */
export function computeBuffetPrice(settings, now = new Date()) {
  const cutoff = settings.early_cutoff_time || "12:00";
  const [ch, cm] = cutoff.split(":").map(Number);
  const cutoffDate = new Date(now);
  cutoffDate.setHours(ch, cm, 0, 0);
  if (now < cutoffDate) {
    return {
      tier: "early",
      perAdult: settings.price_early_bird,
    };
  }
  const discounted = Math.round(
    settings.price_regular * (1 - settings.late_discount_pct / 100),
  );
  return {
    tier: "late",
    perAdult: discounted,
  };
}

/* ---- 예약 ---- */

export async function createReservation(payload) {
  const confirmation_code = generateConfirmationCode();
  const adults = Number(payload.adults) || 0;
  const children = Number(payload.children) || 0;
  const infants = Number(payload.infants) || 0;
  const row = {
    customer_name: payload.customer_name,
    phone: payload.phone,
    reservation_date: payload.reservation_date,
    adults,
    children,
    infants,
    party_size: adults + children,
    special_requests: payload.special_requests ?? null,
    confirmation_code,
    status: "pending",
  };

  if (!isSupabaseConfigured) {
    const local = JSON.parse(
      localStorage.getItem("la_stella_demo_reservations") || "[]",
    );
    local.push({
      ...row,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    });
    localStorage.setItem(
      "la_stella_demo_reservations",
      JSON.stringify(local),
    );
    return { data: row, error: null, demo: true };
  }

  const { error } = await supabase.from("reservations").insert(row);
  return { data: row, error, demo: false };
}

/* ---- Admin ---- */

export async function listReservations({ from, to, status, search } = {}) {
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
    .order("created_at", { ascending: true });

  if (from) q = q.gte("reservation_date", from);
  if (to) q = q.lte("reservation_date", to);
  if (status && status !== "all") q = q.eq("status", status);
  if (search) {
    q = q.or(
      `customer_name.ilike.%${search}%,phone.ilike.%${search}%,confirmation_code.ilike.%${search}%`,
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
