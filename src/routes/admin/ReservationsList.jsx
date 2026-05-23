import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router";
import {
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";
import { listReservations, STATUS_META } from "../../lib/reservations";
import { fmtDateShort, toISO } from "../../lib/utils";
import { useDebounce } from "../../lib/useDebounce";
import "./admin.css";

const STATUSES = [
  { value: "all", label: "전체" },
  ...Object.entries(STATUS_META).map(([v, m]) => ({ value: v, label: m.label })),
];

const PAGE_SIZE = 10;
const GROUP_SIZE = 5;

export default function ReservationsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(new Date()));
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 350);

  const from = useMemo(() => toISO(startOfMonth(viewMonth)), [viewMonth]);
  const to = useMemo(() => toISO(endOfMonth(viewMonth)), [viewMonth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show loading on refetch
    setLoading(true);
    listReservations({
      from,
      to,
      status,
      search: debouncedSearch.trim() || undefined,
    }).then(({ data }) => {
      setRows(data || []);
      setLoading(false);
    });
  }, [status, debouncedSearch, from, to]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset paging on filter change
    setPage(1);
  }, [status, debouncedSearch, from, to]);

  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const groupIdx = Math.floor((safePage - 1) / GROUP_SIZE);
  const startPage = groupIdx * GROUP_SIZE + 1;
  const endPage = Math.min(startPage + GROUP_SIZE - 1, totalPages);
  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  const pageRows = useMemo(
    () => rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [rows, safePage],
  );

  const grouped = useMemo(() => {
    const map = new Map();
    pageRows.forEach((r) => {
      const k = r.reservation_date;
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(r);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [pageRows]);

  const monthLabel = format(viewMonth, "yyyy년 M월", { locale: ko });

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Reservations</div>
          <h1 className="page-title">예약 관리</h1>
        </div>
        <div className="page-head-search">
          <input
            placeholder="이름, 전화번호, 예약 번호 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="field-input"
          />
        </div>
      </header>

      <div className="toolbar">
        <div className="month-nav">
          <button
            type="button"
            className="cal-nav"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            aria-label="이전 달"
          >
            ‹
          </button>
          <div className="month-nav-label">
            {monthLabel}
            <span className="month-nav-count">{totalCount}건</span>
          </div>
          <button
            type="button"
            className="cal-nav"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            aria-label="다음 달"
          >
            ›
          </button>
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

      {loading && (
        <section className="panel">
          <div className="empty">불러오는 중…</div>
        </section>
      )}
      {!loading && totalCount === 0 && (
        <section className="panel">
          <div className="empty">조건에 맞는 예약이 없습니다.</div>
        </section>
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
                  <th>예약자</th>
                  <th>인원</th>
                  <th>전화</th>
                  <th>예약 번호</th>
                  <th>상태</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.id}>
                    <td className="td-customer">
                      <div className="cell-strong">{r.customer_name}</div>
                    </td>
                    <td className="td-party">{partySummary(r)}</td>
                    <td className="td-seating mono small">{r.phone || "—"}</td>
                    <td className="td-code mono small">
                      {r.confirmation_code}
                    </td>
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
          </section>
        ))}

      {!loading && totalPages > 1 && (
        <nav className="pagination" aria-label="페이지 네비게이션">
          {groupIdx > 0 && (
            <button
              type="button"
              className="page-btn"
              onClick={() => setPage(startPage - 1)}
              aria-label="이전 그룹"
            >
              ‹
            </button>
          )}
          {pages.map((p) => (
            <button
              key={p}
              type="button"
              className={`page-btn ${p === safePage ? "active" : ""}`}
              onClick={() => setPage(p)}
              aria-current={p === safePage ? "page" : undefined}
            >
              {p}
            </button>
          ))}
          {endPage < totalPages && (
            <button
              type="button"
              className="page-btn"
              onClick={() => setPage(endPage + 1)}
              aria-label="다음 그룹"
            >
              ›
            </button>
          )}
        </nav>
      )}
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
