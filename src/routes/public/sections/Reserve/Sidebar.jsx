import { useEffect, useState } from "react";
import Reveal from "../../../../components/ui/Reveal";
import {
  DEFAULT_PRICING,
  computeBuffetPrice,
  getPricing,
} from "../../../../lib/reservations";

const won = (n) => `₩ ${Number(n).toLocaleString("ko-KR")}`;

function PriceTier({ tag, adult, child, active = false }) {
  return (
    <div className={`price-tier ${active ? "active" : ""}`}>
      <div className="price-tier-head">
        <span className="tier-tag">{tag}</span>
        <span
          className="tier-now"
          data-visible={active}
          aria-hidden={!active}
        >
          지금 적용
        </span>
      </div>
      <div className="price-tier-rows">
        <div className="price-tier-line">
          <span className="tier-who">성인</span>
          <span className="tier-amt">{won(adult)}</span>
        </div>
        <div className="price-tier-line">
          <span className="tier-who">미취학아동</span>
          <span className="tier-amt">{won(child)}</span>
        </div>
      </div>
    </div>
  );
}

function formatCutoff(time) {
  if (!time) return "오후 12시";
  const [h] = time.split(":").map(Number);
  if (h === 12) return "오후 12시";
  if (h === 0) return "자정";
  const period = h < 12 ? "오전" : "오후";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${hh}시`;
}

export default function Sidebar({ selectedDate }) {
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    getPricing().then(setPricing);
  }, []);

  // 1분마다 now 갱신 → cutoff 경계를 자연스럽게 넘어감
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const cutoffLabel = formatCutoff(pricing.early_cutoff_time);
  const isEarly =
    computeBuffetPrice(pricing, "regular", selectedDate, now).tier === "early";

  return (
    <aside className="reserve-side">
      <Reveal>
        <div className="side-mark">★ ★ ★</div>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="side-title">La Stella</h2>
        <div className="side-sub">Peak Season Buffet</div>
      </Reveal>

      <Reveal delay={160}>
        <div className="side-rule" />
      </Reveal>

      <Reveal delay={220} className="side-block">
        <div className="eyebrow">뷔페</div>
        <p>제철 식재로 차려내는 성수기 한정 뷔페.</p>
      </Reveal>

      <Reveal delay={300} className="side-block">
        <div className="eyebrow">요금</div>
        <div className="price-stack">
          <p className="price-note">
            <strong>예약일(방문일)의 {cutoffLabel}</strong> 전에 예약하면
            사전예약가가, 이후에는 방문 유형에 따른 단가가 적용됩니다. (앞=성인
            · 뒤=미취학아동, 성인 단가는 소인 포함)
          </p>

          <PriceTier
            tag={`예약일의 ${cutoffLabel} 전 · 사전예약`}
            adult={pricing.adult_early}
            child={pricing.child_early}
            active={isEarly}
          />
          <PriceTier
            tag="일반 (현장시점)"
            adult={pricing.adult_regular}
            child={pricing.child_regular}
            active={!isEarly}
          />
          <PriceTier
            tag="워터파크 입장·투숙"
            adult={pricing.adult_waterpark}
            child={pricing.child_waterpark}
          />

          <p className="price-note">
            워터파크·투숙 고객이 사전예약을 하면 둘 중 더 저렴한 사전예약가가
            적용됩니다.
          </p>
        </div>
      </Reveal>

      <Reveal delay={380} className="side-block">
        <div className="eyebrow">인원</div>
        <ul className="side-list">
          <li>성인 · 미취학아동 합산 최대 15명까지 예약 가능합니다.</li>
          <li>소인은 성인 요금으로 적용됩니다.</li>
          <li>유아는 인원에 산입되지 않으며 무료입니다.</li>
        </ul>
      </Reveal>

      <Reveal delay={460} className="side-block">
        <div className="eyebrow">예약 정책</div>
        <ul className="side-list">
          <li>토·일요일에만 운영합니다.</li>
          <li>예약은 매월 1일 다음 달까지 오픈됩니다.</li>
          <li>변경 및 취소는 방문 24시간 전까지 가능합니다.</li>
        </ul>
      </Reveal>

      <Reveal delay={540} className="side-block side-quote">
        <p>
          "음식이 아닌, <span className="italic">시간</span>을 대접합니다."
        </p>
        <div className="side-sign">— 이종현, Executive Chef</div>
      </Reveal>
    </aside>
  );
}
