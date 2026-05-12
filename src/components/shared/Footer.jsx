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
            <p>서울특별시 강남구 도산대로 99길 12<br />La Stella, 2F</p>
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
              화 – 일 · 18:00 – 22:00
              <br />
              월요일 휴무
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} La Stella. All rights reserved.</span>
          <span>Crafted with reverence for seasonal Italian artistry.</span>
        </div>
      </div>
    </footer>
  );
}
