import Reveal from "../../../components/ui/Reveal";

export default function Prelude() {
  return (
    <section id="story" className="section prelude">
      <div className="container narrow">
        <Reveal>
          <div className="eyebrow centered">철학</div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="prelude-title">
            <span>한 접시,</span>
            <span className="italic">하나의 시(詩).</span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <div className="rule center prelude-rule" />
        </Reveal>
        <Reveal delay={320}>
          <p className="prelude-body">
            La Stella는 이탈리아 북부의 농장과 한국의 사계가 만나는 곳입니다.
            셰프 마르코 콘티는 매일 새벽 직접 식재료를 선별하며, 단 한 차례의
            저녁 서비스에 두 시간 반의 코스를 정성껏 펼칩니다. 우리는 음식이
            아닌 시간을 대접합니다.
          </p>
        </Reveal>
        <Reveal delay={420}>
          <div className="prelude-sign">
            <div className="sign-name">Marco Conti</div>
            <div className="sign-role">Executive Chef</div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
