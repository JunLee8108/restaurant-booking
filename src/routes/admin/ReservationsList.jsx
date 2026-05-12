import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import { listReservations, STATUS_META } from "../../lib/reservations";
import { fmtDateShort, fmtTime } from "../../lib/utils";
import "./admin.css";

const STATUSES = [
  { value: "all", label: "전체" },
  ...Object.entries(STATUS_META).map(([v, m]) => ({ value: v, label: m.label })),
];

export default function ReservationsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show loading on refetch
    setLoading(true);
    listReservations({ status, search: search.trim() || undefined }).then(
      ({ data }) => {
        setRows(data || []);
        setLoading(false);
      },
    );
  }, [status, search]);

  const grouped = useMemo(() => {
    const map = new Map();
    rows.forEach((r) => {
      const k = r.reservation_date;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [rows]);

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Reservations</div>
          <h1 className="page-title">예약 관리</h1>
        </div>
      </header>

      <div className="toolbar">
        <div className="search">
          <input
            placeholder="이름, 이메일, 예약 번호 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input"
          />
        </div>
        <div className="filters">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              className={`filter-chip ${status === s.value ? "active" : ""}`}
              onClick={() => setStatus(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="empty">불러오는 중…</div>}
      {!loading && rows.length === 0 && (
        <div className="empty">조건에 맞는 예약이 없습니다.</div>
      )}

      {!loading &&
        grouped.map(([date, items]) => (
          <section key={date} className="panel">
            <div className="panel-head">
              <h2>
                {fmtDateShort(date)} ·{" "}
                <span className="muted">{items.length}건</span>
              </h2>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>시간</th>
                  <th>예약자</th>
                  <th>인원</th>
                  <th>좌석</th>
                  <th>예약 번호</th>
                  <th>상태</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items
                  .sort((a, b) =>
                    a.reservation_time.localeCompare(b.reservation_time),
                  )
                  .map((r) => (
                    <tr key={r.id}>
                      <td className="mono">{fmtTime(r.reservation_time)}</td>
                      <td>
                        <div className="cell-strong">{r.customer_name}</div>
                        <div className="cell-sub">{r.email}</div>
                      </td>
                      <td>{r.party_size}명</td>
                      <td>{seatingLabel(r.seating)}</td>
                      <td className="mono small">{r.confirmation_code}</td>
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
                          상세
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </section>
        ))}
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
