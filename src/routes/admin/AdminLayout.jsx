import { useEffect, useState } from "react";
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router";
import { getSession, onAuthChange, signOut } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import { useNoIndex } from "../../lib/useNoIndex";
import PageLoader from "../../components/ui/PageLoader";
import "./admin.css";

export default function AdminLayout() {
  useNoIndex();
  const [session, setSession] = useState(undefined);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    getSession().then((s) => setSession(s));
    const off = onAuthChange((s) => setSession(s));
    return () => off?.();
  }, []);

  useEffect(() => {
    if (session === null) navigate("/admin/login", { replace: true });
  }, [session, navigate]);

  // 라우트 변경 시 모바일 드로어 자동 닫기
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close drawer on navigation
    setOpen(false);
  }, [pathname]);

  if (session === undefined) {
    return <PageLoader label="Concierge" />;
  }
  if (!session) return null;

  const onSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-side ${open ? "open" : ""}`}>
        <div className="admin-side-top">
          <Link to="/admin" className="admin-brand">
            <span className="admin-mark">★</span>
            <span>
              La Stella
              <em>Concierge</em>
            </span>
          </Link>
          <button
            type="button"
            className={`admin-toggle ${open ? "open" : ""}`}
            aria-label="메뉴 열기"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
          </button>
        </div>

        <div className="admin-side-body">
          <div className="admin-side-body-inner">
            <nav className="admin-nav">
              <NavLink to="/admin" end>
                대시보드
              </NavLink>
              <NavLink to="/admin/reservations">예약 관리</NavLink>
              <NavLink to="/admin/stats">통계</NavLink>
              <NavLink to="/admin/settings">요금 설정</NavLink>
            </nav>

            <div className="admin-foot">
              {!isSupabaseConfigured && (
                <div className="admin-demo">
                  데모 모드 — Supabase 미연결
                </div>
              )}
              <Link to="/" className="admin-home-link">
                ← 홈페이지
              </Link>
              <button className="btn ghost" onClick={onSignOut}>
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
