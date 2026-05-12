import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { getSession, onAuthChange, signOut } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import "./admin.css";

export default function AdminLayout() {
  const [session, setSession] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    getSession().then((s) => setSession(s));
    const off = onAuthChange((s) => setSession(s));
    return () => off?.();
  }, []);

  useEffect(() => {
    if (session === null) navigate("/admin/login", { replace: true });
  }, [session, navigate]);

  if (session === undefined) {
    return <div className="admin-boot">불러오는 중…</div>;
  }
  if (!session) return null;

  const onSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <Link to="/admin" className="admin-brand">
          <span className="admin-mark">★</span>
          <span>
            La Stella
            <em>Concierge</em>
          </span>
        </Link>

        <nav className="admin-nav">
          <NavLink to="/admin" end>
            대시보드
          </NavLink>
          <NavLink to="/admin/reservations">예약 관리</NavLink>
        </nav>

        <div className="admin-foot">
          {!isSupabaseConfigured && (
            <div className="admin-demo">
              데모 모드 — Supabase 미연결
            </div>
          )}
          <button className="btn ghost" onClick={onSignOut}>
            로그아웃
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
