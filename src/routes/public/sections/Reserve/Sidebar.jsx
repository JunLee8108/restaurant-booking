import Reveal from "../../../../components/ui/Reveal";

export default function Sidebar() {
  return (
    <aside className="reserve-side">
      <Reveal>
        <div className="side-mark">★ ★ ★</div>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="side-title">
          La <span className="italic">Stagione</span>
        </h2>
        <div className="side-sub">셰프의 시즌 코스</div>
      </Reveal>

      <Reveal delay={160}>
        <div className="side-rule" />
      </Reveal>

      <Reveal delay={220} className="side-block">
        <div className="eyebrow">코스</div>
        <p>아뮈즈부쉬에서 미냐르디즈까지, 9개 코스로 펼쳐지는 한 시즌의 서사.</p>
      </Reveal>

      <Reveal delay={300} className="side-block">
        <div className="eyebrow">소요 시간</div>
        <p>약 2시간 30분</p>
      </Reveal>

      <Reveal delay={380} className="side-block">
        <div className="eyebrow">코스 요금</div>
        <p className="side-price">
          ₩ 380,000<span className="side-unit"> · 1인</span>
        </p>
        <p className="side-fine">와인 페어링 +₩ 220,000 · 셰프스 카운터 +₩ 80,000</p>
      </Reveal>

      <Reveal delay={460} className="side-block">
        <div className="eyebrow">예약 정책</div>
        <ul className="side-list">
          <li>예약은 매월 1일 다음 달까지 오픈됩니다.</li>
          <li>변경 및 취소는 방문 24시간 전까지 가능합니다.</li>
          <li>예약 확정 시 등록하신 이메일로 안내 메일이 발송됩니다.</li>
          <li>드레스 코드: 스마트 캐주얼.</li>
        </ul>
      </Reveal>

      <Reveal delay={540} className="side-block side-quote">
        <p>
          "음식이 아닌, <span className="italic">시간</span>을 대접합니다."
        </p>
        <div className="side-sign">— Marco Conti, Executive Chef</div>
      </Reveal>
    </aside>
  );
}
