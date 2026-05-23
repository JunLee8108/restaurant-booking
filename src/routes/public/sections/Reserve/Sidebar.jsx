import { useEffect, useState } from "react";
import Reveal from "../../../../components/ui/Reveal";
import {
  DEFAULT_PRICING,
  computeBuffetPrice,
  getPricing,
} from "../../../../lib/reservations";

const won = (n) => `₩ ${Number(n).toLocaleString("ko-KR")}`;

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

  const lateDiscounted = Math.round(
    pricing.price_regular * (1 - pricing.late_discount_pct / 100),
  );
  const cutoffLabel = formatCutoff(pricing.early_cutoff_time);
  const currentTier = computeBuffetPrice(pricing, selectedDate, now).tier;

  return (
    <aside className="reserve-side">
      <Reveal>
        <div className="side-mark">★ ★ ★</div>
      </Reveal>
      <Reveal delay={80}>
        <h2 className="side-title">
          성수기 <span className="italic">특선 부페</span>
        </h2>
        <div className="side-sub">Peak Season Buffet</div>
      </Reveal>

      <Reveal delay={160}>
        <div className="side-rule" />
      </Reveal>

      <Reveal delay={220} className="side-block">
        <div className="eyebrow">부페</div>
        <p>제철 식재로 차려내는 성수기 한정 부페. 1인 기준 요금 안내.</p>
      </Reveal>

      <Reveal delay={300} className="side-block">
        <div className="eyebrow">요금</div>
        <div className="price-stack">
          <div className="price-original">
            <span className="strike">{won(pricing.price_regular)}</span>
            <span className="price-unit"> / 1인</span>
          </div>

          <p className="price-note">
            예약 시점이 <strong>예약일(방문일)의 {cutoffLabel}</strong> 전이면
            얼리버드, 이후면 정가에서 {pricing.late_discount_pct}% 할인이
            적용됩니다.
          </p>

          <div
            className={`price-tier ${currentTier === "early" ? "active" : ""}`}
          >
            <div className="price-tier-head">
              <span className="tier-tag">
                예약일의 {cutoffLabel} 전 예약
              </span>
              <span
                className="tier-now"
                data-visible={currentTier === "early"}
                aria-hidden={currentTier !== "early"}
              >
                지금 적용
              </span>
            </div>
            <div className="price-tier-value">{won(pricing.price_early_bird)}</div>
          </div>

          <div
            className={`price-tier ${currentTier === "late" ? "active" : ""}`}
          >
            <div className="price-tier-head">
              <span className="tier-tag">
                예약일의 {cutoffLabel} 이후 예약 ({pricing.late_discount_pct}% 할인)
              </span>
              <span
                className="tier-now"
                data-visible={currentTier === "late"}
                aria-hidden={currentTier !== "late"}
              >
                지금 적용
              </span>
            </div>
            <div className="price-tier-value">{won(lateDiscounted)}</div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={380} className="side-block">
        <div className="eyebrow">인원</div>
        <ul className="side-list">
          <li>성인 · 소인 합산 최대 15명까지 예약 가능합니다.</li>
          <li>소인은 만 13세 미만 어린이입니다.</li>
          <li>유아(36개월 미만)는 인원에 산입되지 않고 무료입니다.</li>
        </ul>
      </Reveal>

      <Reveal delay={460} className="side-block">
        <div className="eyebrow">예약 정책</div>
        <ul className="side-list">
          <li>예약은 매월 1일 다음 달까지 오픈됩니다.</li>
          <li>변경 및 취소는 방문 24시간 전까지 가능합니다.</li>
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
