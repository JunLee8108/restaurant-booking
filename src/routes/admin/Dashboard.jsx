import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { listReservations, STATUS_META } from "../../lib/reservations";
import { fmtDate, fmtTime, toISO } from "../../lib/utils";
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
        r.reservation_date >= today && !["cancelled", "no_show"].includes(r.status),
    );
    const pending = rows.filter((r) => r.status === "pending");
    const todayGuests = todays.reduce(
      (sum, r) => (["cancelled", "no_show"].includes(r.status) ? sum : sum + r.party_size),
      0,
    );
    return {
      todayCount: todays.length,
      todayGuests,
      upcoming: upcoming.length,
      pending: pending.length,
    };
  }, [rows, today]);

  const todays = rows
    .filter((r) => r.reservation_date === today)
    .sort((a, b) => a.reservation_time.localeCompare(b.reservation_time));

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
                <th>시간</th>
                <th>예약자</th>
                <th>인원</th>
                <th>좌석</th>
                <th>상태</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {todays.map((r) => (
                <tr key={r.id}>
                  <td className="mono">{fmtTime(r.reservation_time)}</td>
                  <td>
                    <div className="cell-strong">{r.customer_name}</div>
                    <div className="cell-sub">{r.email}</div>
                  </td>
                  <td>{r.party_size}명</td>
                  <td>{seatingLabel(r.seating)}</td>
                  <td>
                    <span className={`badge ${STATUS_META[r.status].tone}`}>
                      {STATUS_META[r.status].label}
                    </span>
                  </td>
                  <td>
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

function seatingLabel(v) {
  return {
    dining_room: "다이닝 룸",
    chefs_counter: "셰프스 카운터",
    private_salon: "프라이빗 살롱",
  }[v] || v;
}
