import { Link } from "react-router";
import Nav from "../../components/shared/Nav";
import Footer from "../../components/shared/Footer";
import Reveal from "../../components/ui/Reveal";
import Form from "./sections/Reserve/Form";
import Sidebar from "./sections/Reserve/Sidebar";
import "./sections/Reserve/reserve.css";

export default function Reserve() {
  return (
    <div className="reserve-page">
      <Nav />

      <header className="reserve-hero">
        <div className="container reserve-hero-inner">
          <Link to="/" className="back-link on-dark">
            ← 홈으로
          </Link>
          <Reveal>
            <div className="eyebrow on-dark centered">예약</div>
          </Reveal>
          <Reveal delay={120}>
            <h1 className="reserve-h1">
              테이블을 <span className="italic">예약하세요.</span>
            </h1>
          </Reveal>
          <Reveal delay={240}>
            <div className="rule center" />
          </Reveal>
          <Reveal delay={300}>
            <p className="reserve-lede">
              화요일부터 일요일까지, 단 한 차례의 저녁 서비스.<br />
              두 시간 반의 여정에 정성껏 모시겠습니다.
            </p>
          </Reveal>
        </div>
      </header>

      <main className="reserve-main">
        <div className="container reserve-grid">
          <Sidebar />
          <div className="reserve-form-wrap">
            <Form />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
