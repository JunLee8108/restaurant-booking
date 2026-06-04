import { supabase, isSupabaseConfigured } from "./supabase";

/**
 * 영업 정책
 * - 운영일: 토·일요일만 (0=일, 6=토)
 * - 인원: 성인(소인 포함) + 미취학아동 ≤ 15 (유아는 무료, 인원 미산입)
 */
export const OPEN_DAYS = [0, 6];
export const MAX_PARTY = 15;

/**
 * 방문 유형 — 예약 시 고객이 선택.
 * - regular: 일반 고객
 * - waterpark: 워터파크 입장 / 투숙 고객 (할인 단가)
 */
export const CUSTOMER_TYPES = [
  { value: "regular", label: "일반" },
  { value: "waterpark", label: "워터파크·투숙" },
];

/**
 * 요금 모델 — 3카테고리 × (성인 / 미취학아동) 고정 단가.
 * - early   : 사전예약(예약일 cutoff 전) — 방문 유형과 무관하게 가장 저렴
 * - regular : 현장시점(cutoff 이후) 일반 고객
 * - waterpark: 현장시점(cutoff 이후) 워터파크·투숙 고객
 * (성인 단가는 소인 포함, 유아는 무료)
 */
export const DEFAULT_PRICING = {
  adult_regular: 40000,
  child_regular: 28000,
  adult_early: 30000,
  child_early: 20000,
  adult_waterpark: 36000,
  child_waterpark: 25000,
  early_cutoff_time: "12:00",
};

const PRICING_FIELDS = [
  "adult_regular",
  "child_regular",
  "adult_early",
  "child_early",
  "adult_waterpark",
  "child_waterpark",
  "early_cutoff_time",
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
  return !OPEN_DAYS.includes(new Date(date).getDay());
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
    .select(PRICING_FIELDS.join(","))
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
 * 뷔페 단가 계산.
 * - 시점 판정: **예약일(reservationDate)의 cutoff(예: 12:00)** 기준.
 *   now < 예약일 cutoff → 사전예약(early), 이후 → 현장시점.
 * - 현장시점에는 방문 유형(customerType)에 따라 일반/워터파크 단가 적용.
 * - 사전예약 + 워터파크가 겹치면 규칙대로 **둘 중 싼 단가**를 적용.
 * - reservationDate 미지정 시 오늘을 기준 날짜로 사용 (사이드바 기본 표시용).
 *
 * 반환: { tier, perAdult, perChild } — 성인/미취학아동 1인 단가 (유아는 무료).
 */
export function computeBuffetPrice(
  settings,
  customerType = "regular",
  reservationDate,
  now = new Date(),
) {
  const cutoff = settings.early_cutoff_time || "12:00";
  const [ch, cm] = cutoff.split(":").map(Number);
  const refDate = reservationDate ? toLocalDate(reservationDate) : new Date(now);
  const cutoffMoment = new Date(refDate);
  cutoffMoment.setHours(ch, cm, 0, 0);

  const isEarly = now < cutoffMoment;
  const isWaterpark = customerType === "waterpark";

  const early = {
    tier: "early",
    perAdult: settings.adult_early,
    perChild: settings.child_early,
  };
  const waterpark = {
    tier: "waterpark",
    perAdult: settings.adult_waterpark,
    perChild: settings.child_waterpark,
  };
  const regular = {
    tier: "regular",
    perAdult: settings.adult_regular,
    perChild: settings.child_regular,
  };

  // 사전예약 + 워터파크 → 둘 중 싼 단가
  if (isEarly && isWaterpark) {
    return early.perAdult <= waterpark.perAdult ? early : waterpark;
  }
  if (isEarly) return early;
  if (isWaterpark) return waterpark;
  return regular;
}

function toLocalDate(d) {
  if (d instanceof Date) return new Date(d);
  if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day);
  }
  return new Date(d);
}

/* ---- 예약 ---- */

export async function createReservation(payload) {
  const confirmation_code = generateConfirmationCode();
  const adults = Number(payload.adults) || 0;
  const children = Number(payload.children) || 0;
  const infants = Number(payload.infants) || 0;
  const customer_type =
    payload.customer_type === "waterpark" ? "waterpark" : "regular";

  // 예약 시점 단가 스냅샷 — 이후 단가가 바뀌어도 이 예약 금액은 고정
  const settings = await getPricing();
  const { tier, perAdult, perChild } = computeBuffetPrice(
    settings,
    customer_type,
    payload.reservation_date,
  );
  const total_amount = adults * perAdult + children * perChild;

  const row = {
    customer_name: payload.customer_name,
    phone: payload.phone,
    reservation_date: payload.reservation_date,
    customer_type,
    adults,
    children,
    infants,
    party_size: adults + children,
    price_tier: tier,
    price_adult: perAdult,
    price_child: perChild,
    total_amount,
    special_requests: payload.special_requests ?? null,
    privacy_consent: true,
    consent_at: new Date().toISOString(),
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

/**
 * 고객 본인 예약 조회 — 예약번호 + 전화번호 일치 시 1건 반환.
 */
export async function lookupReservation(code, phone) {
  const normCode = (code || "").trim().toUpperCase();
  const normPhone = (phone || "").replace(/\D/g, "");
  if (!normCode || !normPhone) {
    return { data: null, error: { message: "예약번호와 전화번호를 입력해주세요." } };
  }

  if (!isSupabaseConfigured) {
    const local = JSON.parse(
      localStorage.getItem("la_stella_demo_reservations") || "[]",
    );
    const found = local.find(
      (r) =>
        (r.confirmation_code || "").trim().toUpperCase() === normCode &&
        (r.phone || "").replace(/\D/g, "") === normPhone,
    );
    return { data: found ?? null, error: null, demo: true };
  }

  const { data, error } = await supabase.rpc("lookup_reservation", {
    p_code: normCode,
    p_phone: normPhone,
  });
  if (error) return { data: null, error };
  return { data: data?.[0] ?? null, error: null };
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
