import Reveal from "../../../components/ui/Reveal";

export default function Visit() {
  return (
    <section id="visit" className="section visit">
      <div className="container">
        <div className="visit-grid">
          <Reveal className="visit-image">
            <img
              src="https://images.unsplash.com/photo-1592861956120-e524fc739696?auto=format&fit=crop&w=1600&q=80"
              alt="La Stella 다이닝 룸"
              loading="lazy"
            />
          </Reveal>

          <div className="visit-info">
            <Reveal>
              <div className="eyebrow">방문 안내</div>
            </Reveal>
            <Reveal delay={120}>
              <h2 className="section-title left">
                다녀가시는 <span className="italic">길.</span>
              </h2>
            </Reveal>
            <Reveal delay={240}>
              <div className="rule visit-rule" />
            </Reveal>

            <Reveal delay={300} className="visit-rows">
              <div className="visit-row">
                <div className="eyebrow">주소</div>
                <p>
                  서울특별시 강남구 도산대로 99길 12<br />
                  La Stella, 2F
                </p>
              </div>
              <div className="visit-row">
                <div className="eyebrow">영업 시간</div>
                <p>
                  화 – 일 · 18:00 – 22:00 (마지막 입장 20:30)
                  <br />
                  월요일 정기 휴무
                </p>
              </div>
              <div className="visit-row">
                <div className="eyebrow">예약 문의</div>
                <p>
                  <a href="tel:+82215881234">02 1588 1234</a>
                  <br />
                  <a href="mailto:reserve@lastella.kr">reserve@lastella.kr</a>
                </p>
              </div>
              <div className="visit-row">
                <div className="eyebrow">드레스 코드</div>
                <p>스마트 캐주얼 — 반바지, 슬리퍼는 정중히 사양합니다.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
