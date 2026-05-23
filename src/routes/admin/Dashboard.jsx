import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { listReservations, STATUS_META } from "../../lib/reservations";
import { fmtDate, toISO } from "../../lib/utils";
import "./admin.css";

export default function Dashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listReservations().then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, []);

  const today = toISO(new Date());

  const stats = useMemo(() => {
    const todays = rows.filter((r) => r.reservation_date === today);
    const upcoming = rows.filter(
      (r) =>
        r.reservation_date >= today &&
        !["cancelled", "no_show"].includes(r.status),
    );
    const pending = rows.filter((r) => r.status === "pending");
    const todayGuests = todays.reduce(
      (sum, r) =>
        ["cancelled", "no_show"].includes(r.status)
          ? sum
          : sum + (r.party_size || 0),
      0,
    );
    return {
      todayCount: todays.length,
      todayGuests,
      upcoming: upcoming.length,
      pending: pending.length,
    };
  }, [rows, today]);

  const todays = rows.filter((r) => r.reservation_date === today);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Dashboard</div>
          <h1 className="page-title">오늘의 La Stella</h1>
        </div>
        <div className="page-date">{fmtDate(new Date())}</div>
      </header>

      <section className="stat-grid">
        <Stat label="오늘 예약" value={stats.todayCount} suffix="건" />
        <Stat label="오늘 게스트" value={stats.todayGuests} suffix="명" />
        <Stat label="다가오는 예약" value={stats.upcoming} suffix="건" />
        <Stat
          label="확정 대기"
          value={stats.pending}
          suffix="건"
          accent={stats.pending > 0}
        />
      </section>

      <section className="panel">
        <div className="panel-head">
          <h2>오늘의 예약</h2>
          <Link to="/admin/reservations" className="panel-link">
            전체 예약 →
          </Link>
        </div>

        {loading && <div className="empty">불러오는 중…</div>}
        {!loading && todays.length === 0 && (
          <div className="empty">오늘 예약된 일정이 없습니다.</div>
        )}
        {!loading && todays.length > 0 && (
          <table className="table">
            <thead>
              <tr>
                <th>예약자</th>
                <th>인원</th>
                <th>전화</th>
                <th>상태</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {todays.map((r) => (
                <tr key={r.id}>
                  <td className="td-customer">
                    <div className="cell-strong">{r.customer_name}</div>
                    <div className="cell-sub mono small">
                      {r.confirmation_code}
                    </div>
                  </td>
                  <td className="td-party">{partySummary(r)}</td>
                  <td className="td-seating mono small">{r.phone || "—"}</td>
                  <td className="td-status">
                    <span className={`badge ${STATUS_META[r.status].tone}`}>
                      {STATUS_META[r.status].label}
                    </span>
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
    </div>
  );
}

function Stat({ label, value, suffix, accent }) {
  return (
    <div className={`stat ${accent ? "accent" : ""}`}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">
        {value}
        <span className="stat-suffix">{suffix}</span>
      </div>
    </div>
  );
}

function partySummary(r) {
  const parts = [];
  if (r.adults) parts.push(`성인 ${r.adults}`);
  if (r.children) parts.push(`소인 ${r.children}`);
  if (r.infants) parts.push(`유아 ${r.infants}`);
  return parts.join(" · ") || `${r.party_size || 0}명`;
}
