import { Link } from "react-router";
import Nav from "../../components/shared/Nav";
import Footer from "../../components/shared/Footer";
import Reveal from "../../components/ui/Reveal";
import Hero from "./sections/Hero";
import Prelude from "./sections/Prelude";
import Experience from "./sections/Experience";
import Atelier from "./sections/Atelier";
import Visit from "./sections/Visit";
import "./sections/public.css";

function ReserveCta() {
  return (
    <section className="reserve-cta">
      <div className="container narrow reserve-cta-inner">
        <Reveal>
          <div className="eyebrow on-dark centered">예약</div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="section-title on-dark">
            오늘 저녁, <span className="italic">한 자리.</span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <div className="rule center" />
        </Reveal>
        <Reveal delay={320}>
          <p className="reserve-cta-text">
            La Stella의 한 시즌은 단 한 차례의 저녁으로 흐릅니다.<br />
            아래에서 테이블을 예약하세요.
          </p>
        </Reveal>
        <Reveal delay={420}>
          <Link to="/reserve" className="btn gold on-dark reserve-cta-btn">
            <span>예약하러 가기</span>
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
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Prelude />
        <Experience />
        <Atelier />
        <Visit />
        <ReserveCta />
      </main>
      <Footer />
    </>
  );
}
