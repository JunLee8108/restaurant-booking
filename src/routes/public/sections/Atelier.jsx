import Reveal from "../../../components/ui/Reveal";

const IMAGES = [
  {
    src: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1400&q=80",
    alt: "정성스럽게 플레이팅된 디시",
    span: "tall",
  },
  {
    src: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80",
    alt: "다이닝 공간",
  },
  {
    src: "https://images.unsplash.com/photo-1432139509613-5c4255815697?auto=format&fit=crop&w=1400&q=80",
    alt: "와인 셀러",
  },
  {
    src: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1400&q=80",
    alt: "디저트",
    span: "wide",
  },
  {
    src: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80",
    alt: "셰프의 시그니처",
  },
];

export default function Atelier() {
  return (
    <section id="atelier" className="section atelier">
      <div className="container">
        <Reveal>
          <div className="eyebrow centered on-dark">갤러리</div>
        </Reveal>
        <Reveal delay={120}>
          <h2 className="section-title on-dark">
            아틀리에의 <span className="italic">기록.</span>
          </h2>
        </Reveal>
        <Reveal delay={240}>
          <div className="rule center" />
        </Reveal>

        <div className="atelier-grid">
          {IMAGES.map((img, i) => (
            <Reveal
              key={img.src}
              delay={i * 90}
              className={`atelier-cell ${img.span || ""}`}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
