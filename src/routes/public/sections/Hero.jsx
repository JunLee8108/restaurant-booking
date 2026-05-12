import { useEffect, useState } from "react";
import { Link } from "react-router";
import "./public.css";

const HERO_IMG =
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=2400&q=80";

export default function Hero() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = HERO_IMG;
    img.onload = () => setLoaded(true);
  }, []);

  return (
    <section className={`hero ${loaded ? "loaded" : ""}`}>
      <div
        className="hero-bg"
        style={{ backgroundImage: `url(${HERO_IMG})` }}
      />
      <div className="hero-veil" />

      <div className="hero-content">
        <div className="hero-stars">★ ★ ★</div>
        <h1 className="hero-title">
          <span className="line">La</span>
          <span className="line italic"> Stella</span>
        </h1>
        <div className="hero-rule" />
        <p className="hero-sub">
          계절의 정수에 바치는 헌사<br />
          이탈리아 미식의 조용한 우아함
        </p>
        <div className="hero-meta">
          <span>Three Michelin Stars</span>
          <span className="dot">·</span>
          <span>Est. 2014</span>
          <span className="dot">·</span>
          <span>Seoul</span>
        </div>

        <Link to="/reserve" className="hero-cta">
          <span>예약하기</span>
          <svg
            width="14"
            height="10"
            viewBox="0 0 14 10"
            fill="none"
            aria-hidden
          >
            <path
              d="M1 5h12m0 0L9 1m4 4L9 9"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="square"
            />
          </svg>
        </Link>
      </div>

      <a href="#story" className="hero-scroll" aria-label="아래로 스크롤">
        <span>SCROLL</span>
        <div className="hero-scroll-line" />
      </a>
    </section>
  );
}
