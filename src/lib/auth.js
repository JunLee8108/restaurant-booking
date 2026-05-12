import { supabase, isSupabaseConfigured } from "./supabase";

const DEMO_KEY = "la_stella_demo_admin";

export async function signIn(email, password) {
  if (!isSupabaseConfigured) {
    // 데모 모드 — 데모 자격 증명: admin@lastella.kr / lastella
    if (email === "admin@lastella.kr" && password === "lastella") {
      sessionStorage.setItem(
        DEMO_KEY,
        JSON.stringify({ email, signedInAt: Date.now() }),
      );
      return { data: { user: { email } }, error: null };
    }
    return {
      data: null,
      error: {
        message:
          "데모 모드 — 이메일: admin@lastella.kr / 비밀번호: lastella 를 입력하세요.",
      },
    };
  }
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (!isSupabaseConfigured) {
    sessionStorage.removeItem(DEMO_KEY);
    return { error: null };
  }
  return supabase.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseConfigured) {
    const raw = sessionStorage.getItem(DEMO_KEY);
    return raw ? { user: JSON.parse(raw) } : null;
  }
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb) {
  if (!isSupabaseConfigured) {
    const handler = () => cb(JSON.parse(sessionStorage.getItem(DEMO_KEY) || "null"));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }
  const sub = supabase.auth.onAuthStateChange((_e, session) =>
    cb(session),
  );
  return () => sub.data.subscription.unsubscribe();
}
