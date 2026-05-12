import Reveal from "../../../components/ui/Reveal";

const ITEMS = [
  {
    eyebrow: "Tasting",
    title: "La Stagione",
    subtitle: "계절의 코스",
    desc:
      "9개의 코스로 펼쳐지는 한 시즌의 서사. 아뮈즈부쉬에서 미냐르디즈까지, 약 2시간 30분의 여정.",
    price: "₩ 380,000",
    img:
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80",
  },
  {
    eyebrow: "Pairing",
    title: "Sommelier's Voyage",
    subtitle: "와인 페어링",
    desc:
      "이탈리아 전 지역에서 엄선한 7잔의 와인. 소믈리에 카를로의 큐레이션으로 코스와 함께 호흡합니다.",
    price: "+ ₩ 220,000",
    img:
      "https://images.unsplash.com/photo-1474722883778-792e7990302f?auto=format&fit=crop&w=1400&q=80",
  },
  {
    eyebrow: "Counter",
    title: "Chef's Counter",
    subtitle: "셰프스 카운터 · 8석 한정",
    desc:
      "오픈 키친 앞 단 여덟 석. 셰프와 마주하며 매 코스의 이야기를 직접 듣는 가장 가까운 자리.",
    price: "+ ₩ 80,000",
    img:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80",
  },
];

export default function Experience() {
  return (
    <section id="experience" className="section experience">
      <div className="container">
        <Reveal>
          <div className="eyebrow centered">경험</div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="section-title">
            세 가지 <span className="italic">선율.</span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <div className="rule center" />
        </Reveal>

        <div className="exp-grid">
          {ITEMS.map((it, i) => (
            <Reveal key={it.title} delay={i * 140} className="exp-card">
              <div className="exp-img-wrap">
                <img src={it.img} alt={it.title} loading="lazy" />
              </div>
              <div className="exp-body">
                <div className="eyebrow">{it.eyebrow}</div>
                <h3 className="exp-title">{it.title}</h3>
                <div className="exp-sub">{it.subtitle}</div>
                <p className="exp-desc">{it.desc}</p>
                <div className="exp-price">{it.price}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
