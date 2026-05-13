import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { addMonths, format, startOfMonth, subMonths } from "date-fns";
import { ko } from "date-fns/locale";
import { listReservations, STATUS_META } from "../../lib/reservations";
import { fmtDateShort, fmtTime } from "../../lib/utils";
import {
  compareDelta,
  computeMetrics,
  computeRegulars,
  computeWatchlist,
  countBySeating,
  countBySlot,
  countByStatus,
  filterByMonth,
} from "../../lib/stats";
import "./admin.css";

const SEAT_LABELS = {
  dining_room: "다이닝 룸",
  chefs_counter: "셰프스 카운터",
  private_salon: "프라이빗 살롱",
};

export default function Stats() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    listReservations().then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  const year = viewMonth.getFullYear();
  const monthIdx = viewMonth.getMonth();
  const lastMonth = subMonths(viewMonth, 1);

  const currentRows = useMemo(
    () => filterByMonth(rows, year, monthIdx),
    [rows, year, monthIdx],
  );
  const lastRows = useMemo(
    () =>
      filterByMonth(rows, lastMonth.getFullYear(), lastMonth.getMonth()),
    [rows, lastMonth],
  );

  const metrics = useMemo(() => computeMetrics(currentRows), [currentRows]);
  const lastMetrics = useMemo(() => computeMetrics(lastRows), [lastRows]);
  const hasLast = lastRows.length > 0;

  const slotCounts = useMemo(() => countBySlot(currentRows), [currentRows]);
  const statusCounts = useMemo(() => countByStatus(currentRows), [currentRows]);
  const seatingCounts = useMemo(() => countBySeating(currentRows), [currentRows]);
  const regulars = useMemo(() => computeRegulars(rows, 10), [rows]);
  const watchlist = useMemo(
    () => computeWatchlist(currentRows, rows),
    [currentRows, rows],
  );

  const monthLabel = format(viewMonth, "yyyy년 M월", { locale: ko });

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Insights</div>
          <h1 className="page-title">통계</h1>
        </div>
      </header>

      <div className="month-nav">
        <button
          type="button"
          className="cal-nav"
          onClick={() => setViewMonth((m) => subMonths(m, 1))}
          aria-label="이전 달"
        >
          ‹
        </button>
        <div className="month-nav-label">{monthLabel}</div>
        <button
          type="button"
          className="cal-nav"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {loading && (
        <section className="panel">
          <div className="empty">불러오는 중…</div>
        </section>
      )}

      {!loading && currentRows.length === 0 && (
        <section className="panel">
          <div className="empty">이 달의 예약 데이터가 없습니다.</div>
        </section>
      )}

      {!loading && currentRows.length > 0 && (
        <>
          <MetricCards metrics={metrics} last={hasLast ? lastMetrics : null} />
          <SlotChart slotCounts={slotCounts} />
          <StatusChart statusCounts={statusCounts} total={metrics.total} />
          <SeatingChart seatingCounts={seatingCounts} total={metrics.total} />
          <RegularsPanel regulars={regulars} />
          <WatchlistPanel watchlist={watchlist} />
        </>
      )}
    </div>
  );
}

/* ---- Metric cards ---- */

function MetricCards({ metrics, last }) {
  const cards = [
    {
      label: "총 예약",
      value: metrics.total,
      suffix: "건",
      compare: last ? compareDelta(metrics.total, last.total, false) : null,
    },
    {
      label: "총 게스트",
      value: metrics.totalGuests,
      suffix: "명",
      compare: last
        ? compareDelta(metrics.totalGuests, last.totalGuests, false)
        : null,
    },
    {
      label: "평균 파티",
      value: metrics.avgParty.toFixed(1),
      suffix: "명",
      compare: last
        ? compareDelta(metrics.avgParty, last.avgParty, false)
        : null,
    },
    {
      label: "노쇼·취소율",
      value: metrics.cancelRate.toFixed(1),
      suffix: "%",
      compare: last
        ? compareDelta(metrics.cancelRate, last.cancelRate, true)
        : null,
    },
  ];

  return (
    <section className="stat-grid">
      {cards.map((c) => (
        <div key={c.label} className="stat">
          <div className="stat-label">{c.label}</div>
          <div className="stat-value">
            {c.value}
            <span className="stat-suffix">{c.suffix}</span>
          </div>
          {c.compare && (
            <div className={`stat-compare tone-${c.compare.tone}`}>
              <span className="stat-arrow">{c.compare.arrow}</span>{" "}
              {c.compare.text}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}

/* ---- Slot chart ---- */

function SlotChart({ slotCounts }) {
  const all = Array.from(slotCounts.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (all.length === 0) return null;
  const breakfast = all.filter(([t]) => t < "12:00");
  const dinner = all.filter(([t]) => t >= "12:00");
  const max = Math.max(...all.map(([, c]) => c));
  const minVal = Math.min(...all.map(([, c]) => c));

  const row = ([t, c]) => {
    const isMax = c === max;
    const isMin = c === minVal && c < max;
    return (
      <div key={t} className="bar-row">
        <span className="bar-label mono">{fmtTime(t)}</span>
        <div className="bar-track">
          <div
            className="bar-fill"
            style={{ width: `${(c / max) * 100}%` }}
          />
        </div>
        <span className="bar-value">
          {c}건
          {isMax && <span className="bar-note">★ 인기</span>}
          {isMin && <span className="bar-note muted">한산</span>}
        </span>
      </div>
    );
  };

  return (
    <section className="panel">
      <h2 className="panel-h">시간대별 예약</h2>
      {breakfast.length > 0 && (
        <div className="bar-group">
          <div className="eyebrow">조식 · Breakfast</div>
          {breakfast.map(row)}
        </div>
      )}
      {dinner.length > 0 && (
        <div className="bar-group">
          <div className="eyebrow">저녁 · Dinner</div>
          {dinner.map(row)}
        </div>
      )}
    </section>
  );
}

/* ---- Status chart ---- */

function StatusChart({ statusCounts, total }) {
  const items = Object.entries(STATUS_META).map(([key, meta]) => {
    const count = statusCounts.get(key) || 0;
    const pct = total ? (count / total) * 100 : 0;
    return { key, label: meta.label, count, pct };
  });
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <section className="panel">
      <h2 className="panel-h">상태 분포</h2>
      <div className="bar-group">
        {items.map((it) => (
          <div key={it.key} className="bar-row">
            <span className="bar-label">{it.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(it.count / max) * 100}%` }}
              />
            </div>
            <span className="bar-value">
              {it.count}
              <span className="bar-pct">{it.pct.toFixed(0)}%</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Seating chart ---- */

function SeatingChart({ seatingCounts, total }) {
  const items = Object.entries(SEAT_LABELS).map(([key, label]) => {
    const count = seatingCounts.get(key) || 0;
    const pct = total ? (count / total) * 100 : 0;
    return { key, label, count, pct };
  });
  const max = Math.max(...items.map((i) => i.count), 1);

  return (
    <section className="panel">
      <h2 className="panel-h">좌석 분포</h2>
      <div className="bar-group">
        {items.map((it) => (
          <div key={it.key} className="bar-row">
            <span className="bar-label">{it.label}</span>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${(it.count / max) * 100}%` }}
              />
            </div>
            <span className="bar-value">
              {it.count}
              <span className="bar-pct">{it.pct.toFixed(0)}%</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---- Regulars ---- */

function RegularsPanel({ regulars }) {
  return (
    <section className="panel">
      <h2 className="panel-h">단골 고객</h2>
      {regulars.length === 0 ? (
        <div className="empty">방문 완료된 예약이 아직 없습니다.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>순위</th>
              <th>이름</th>
              <th>방문</th>
              <th>총 게스트</th>
              <th>최근 방문</th>
            </tr>
          </thead>
          <tbody>
            {regulars.map((r, i) => (
              <tr key={r.email}>
                <td className="td-rank mono">{String(i + 1).padStart(2, "0")}</td>
                <td className="td-customer">
                  <div className="cell-strong">{r.name}</div>
                  <div className="cell-sub">{r.email}</div>
                </td>
                <td className="td-party">{r.count}회</td>
                <td className="td-seating">{r.totalGuests}명</td>
                <td className="td-status mono small">
                  {r.lastVisit ? fmtDateShort(r.lastVisit) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}

/* ---- Watchlist ---- */

function WatchlistPanel({ watchlist }) {
  return (
    <section className="panel">
      <h2 className="panel-h">취소 · 노쇼</h2>
      {watchlist.length === 0 ? (
        <div className="empty">이번 달 취소·노쇼가 없습니다.</div>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>일시</th>
              <th>예약자</th>
              <th>상태</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {watchlist.map((r) => (
              <tr key={r.id}>
                <td className="td-time mono">
                  {fmtDateShort(r.reservation_date)} ·{" "}
                  {fmtTime(r.reservation_time)}
                </td>
                <td className="td-customer">
                  <div className="cell-strong">{r.customer_name}</div>
                  <div className="cell-sub">{r.email}</div>
                </td>
                <td className="td-status">
                  <span className={`badge ${STATUS_META[r.status].tone}`}>
                    {STATUS_META[r.status].label}
                  </span>
                  {r.repeats >= 2 && (
                    <span className="repeat-badge">⚠ {r.repeats}회째</span>
                  )}
                </td>
                <td className="td-action">
                  <Link
                    to={`/admin/reservations/${r.id}`}
                    className="btn ghost sm"
                  >
                    상세보기
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
