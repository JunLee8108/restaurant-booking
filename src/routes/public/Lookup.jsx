import { useState } from "react";
import { useSearchParams } from "react-router";
import Nav from "../../components/shared/Nav";
import Footer from "../../components/shared/Footer";
import { STATUS_META, lookupReservation } from "../../lib/reservations";
import { fmtDate } from "../../lib/utils";
import "./lookup.css";

export default function Lookup() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get("code") || "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    const { data, error: err } = await lookupReservation(code, phone);
    setLoading(false);
    setSearched(true);
    if (err) {
      setError(err.message);
      return;
    }
    setResult(data);
  };

  return (
    <div className="lookup-page">
      <Nav />
      <main className="lookup-main">
        <div className="container lookup-wrap">
          <header className="lookup-head">
            <div className="side-mark">★ ★ ★</div>
            <h1 className="lookup-title">예약 조회</h1>
            <p className="lookup-lead">
              예약번호와 전화번호로 예약 내용을 확인하실 수 있습니다.
            </p>
          </header>

          <form className="lookup-form" onSubmit={onSubmit}>
            <div className="field">
              <label className="field-label">예약번호</label>
              <input
                className="field-input"
                placeholder="LS-ABCDE"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                autoCapitalize="characters"
              />
            </div>
            <div className="field">
              <label className="field-label">전화번호</label>
              <input
                className="field-input"
                placeholder="01012345678"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="field-hint">'-' 를 제외하고 숫자만 입력해주세요.</div>
            </div>
            <button className="btn solid lookup-submit" type="submit" disabled={loading}>
              {loading ? "조회 중…" : "예약 조회"}
            </button>
          </form>

          {error && (
            <div className="lookup-msg error" role="alert">
              {error}
            </div>
          )}

          {searched && !error && !result && (
            <div className="lookup-msg">
              일치하는 예약을 찾을 수 없습니다. 예약번호와 전화번호를 다시
              확인해주세요.
            </div>
          )}

          {result && <ResultCard r={result} />}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function ResultCard({ r }) {
  const meta = STATUS_META[r.status] || { label: r.status, tone: "muted" };
  return (
    <section className="lookup-result">
      <div className="lookup-result-head">
        <div>
          <div className="eyebrow">예약 번호</div>
          <div className="lookup-code mono">{r.confirmation_code}</div>
        </div>
        <span className={`badge ${meta.tone}`}>{meta.label}</span>
      </div>

      <div className="lookup-rows">
        <LRow label="예약자" value={r.customer_name} />
        <LRow label="날짜" value={fmtDate(r.reservation_date)} />
        <LRow label="인원" value={partySummary(r)} />
        {r.special_requests && <LRow label="요청" value={r.special_requests} />}
        <LRow
          label="접수일"
          value={r.created_at ? fmtDate(r.created_at) : "—"}
        />
      </div>

      <p className="lookup-fine">
        예약 변경 또는 취소를 원하시면{" "}
        <a href="tel:+82215881234">02 1588 1234</a> 로 전화 주시기 바랍니다.
      </p>
    </section>
  );
}

function LRow({ label, value }) {
  return (
    <div className="lookup-row">
      <span className="lookup-row-label">{label}</span>
      <span className="lookup-row-value">{value}</span>
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
