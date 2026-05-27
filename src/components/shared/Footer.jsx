import { Link } from "react-router";
import "./shared.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <div className="brand-mark big">★ ★ ★</div>
          <div className="footer-name">La Stella</div>
          <div className="footer-tag">Three Michelin Stars · Est. 2014</div>
        </div>

        <div className="footer-cols">
          <div>
            <div className="eyebrow on-dark">방문</div>
            <p>경기도 의정부시 장곡로 22 (장암동)<br />아일랜드 캐슬 리조트 2F</p>
          </div>
          <div>
            <div className="eyebrow on-dark">문의</div>
            <p>
              <a href="tel:+82215881234">02 1588 1234</a>
              <br />
              <a href="mailto:reserve@lastella.kr">reserve@lastella.kr</a>
            </p>
          </div>
          <div>
            <div className="eyebrow on-dark">영업 시간</div>
            <p>
              조식 07:00 – 10:00
              <br />
              저녁 18:00 – 22:00
              <br />
              중식 단체 예약 시
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} La Stella. All rights reserved.</span>
          <div className="footer-bottom-right">
            <span>Crafted with reverence for seasonal Italian artistry.</span>
            <span className="footer-dot" aria-hidden>·</span>
            <Link to="/lookup" className="footer-admin-link">
              예약 조회
            </Link>
            <span className="footer-dot" aria-hidden>·</span>
            <Link to="/admin" className="footer-admin-link">
              관리자
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
