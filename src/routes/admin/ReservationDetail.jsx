import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import {
  STATUS_META,
  getReservation,
  updateReservation,
} from "../../lib/reservations";
import { fmtDate, fmtTime } from "../../lib/utils";
import "./admin.css";

const FLOW = ["pending", "confirmed", "seated", "completed"];
const TERMINAL = ["cancelled", "no_show"];

export default function ReservationDetail() {
  const { id } = useParams();
  const [r, setR] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getReservation(id).then(({ data }) => {
      setR(data);
      setNotes(data?.admin_notes || "");
      setLoading(false);
    });
  }, [id]);

  const saveStatus = async (status) => {
    setSaving(true);
    const { data } = await updateReservation(id, { status });
    if (data) setR(data);
    setSaving(false);
  };
  const saveNotes = async () => {
    setSaving(true);
    const { data } = await updateReservation(id, { admin_notes: notes });
    if (data) setR(data);
    setSaving(false);
  };

  if (loading) return <div className="page"><div className="empty">불러오는 중…</div></div>;
  if (!r)
    return (
      <div className="page">
        <div className="empty">예약을 찾을 수 없습니다.</div>
        <Link to="/admin/reservations" className="btn ghost">
          ← 목록으로
        </Link>
      </div>
    );

  return (
    <div className="page">
      <Link to="/admin/reservations" className="back-link">
        ← 예약 목록
      </Link>

      <header className="page-head">
        <div>
          <div className="eyebrow">예약 상세 · {r.confirmation_code}</div>
          <h1 className="page-title">{r.customer_name}</h1>
        </div>
        <span className={`badge ${STATUS_META[r.status].tone} lg`}>
          {STATUS_META[r.status].label}
        </span>
      </header>

      <section className="detail-grid">
        <div className="panel">
          <h2 className="panel-h">예약 정보</h2>
          <DRow label="날짜" value={fmtDate(r.reservation_date)} />
          <DRow label="시간" value={fmtTime(r.reservation_time)} />
          <DRow label="인원" value={`${r.party_size}명`} />
          <DRow label="좌석" value={seatingLabel(r.seating)} />
          <DRow
            label="요청"
            value={r.special_requests || "—"}
            multiline
          />
        </div>

        <div className="panel">
          <h2 className="panel-h">고객 정보</h2>
          <DRow label="이름" value={r.customer_name} />
          <DRow label="이메일" value={r.email} />
          <DRow label="전화" value={r.phone} />
          <DRow
            label="접수일"
            value={r.created_at ? fmtDate(r.created_at) : "—"}
          />
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-h">상태 변경</h2>
        <div className="status-row">
          {FLOW.map((s) => (
            <button
              key={s}
              className={`status-btn ${r.status === s ? "current" : ""}`}
              onClick={() => saveStatus(s)}
              disabled={saving}
            >
              {STATUS_META[s].label}
            </button>
          ))}
          <div className="status-divider" />
          {TERMINAL.map((s) => (
            <button
              key={s}
              className={`status-btn danger ${r.status === s ? "current" : ""}`}
              onClick={() => saveStatus(s)}
              disabled={saving}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-h">내부 메모</h2>
        <textarea
          className="field-textarea"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="고객 응대 시 참고할 메모를 남기세요."
        />
        <div style={{ marginTop: 16 }}>
          <button
            className="btn solid sm"
            onClick={saveNotes}
            disabled={saving}
          >
            {saving ? "저장 중…" : "메모 저장"}
          </button>
        </div>
      </section>
    </div>
  );
}

function DRow({ label, value, multiline }) {
  return (
    <div className={`d-row ${multiline ? "multiline" : ""}`}>
      <div className="d-label">{label}</div>
      <div className="d-value">{value}</div>
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
