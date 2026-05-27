import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import "./shared.css";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- close mobile menu on route change
    setOpen(false);
  }, [pathname, hash]);

  const onPublic = pathname === "/";

  return (
    <header className={`nav ${scrolled || !onPublic ? "is-scrolled" : ""}`}>
      <div className="nav-inner container">
        <Link to="/" className="brand" aria-label="La Stella 홈">
          <span className="brand-mark">★</span>
          <span className="brand-name">La Stella</span>
        </Link>

        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="주요">
          <Link to="/" onClick={() => setOpen(false)}>
            홈
          </Link>
          <Link to="/lookup" onClick={() => setOpen(false)}>
            예약 조회
          </Link>
          <Link to="/reserve" className="nav-cta" onClick={() => setOpen(false)}>
            예약하기
          </Link>
        </nav>

        <button
          className={`nav-toggle ${open ? "open" : ""}`}
          aria-label="메뉴 열기"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
