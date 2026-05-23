import { useEffect, useState } from "react";
import { DEFAULT_PRICING, getPricing, updatePricing } from "../../lib/reservations";
import "./admin.css";

export default function Settings() {
  const [form, setForm] = useState(DEFAULT_PRICING);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getPricing().then((p) => {
      setForm(p);
      setLoading(false);
    });
  }, []);

  const set = (k) => (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, [k]: k === "early_cutoff_time" ? v : Number(v) }));
  };

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const { error: err } = await updatePricing({
      price_regular: Number(form.price_regular),
      price_early_bird: Number(form.price_early_bird),
      late_discount_pct: Number(form.late_discount_pct),
      early_cutoff_time: form.early_cutoff_time,
    });
    setSaving(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSavedAt(new Date());
  };

  if (loading) {
    return (
      <div className="page">
        <div className="empty">불러오는 중…</div>
      </div>
    );
  }

  const lateDiscounted = Math.round(
    form.price_regular * (1 - form.late_discount_pct / 100),
  );

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Settings</div>
          <h1 className="page-title">부페 요금 설정</h1>
        </div>
      </header>

      <form className="panel" onSubmit={onSave}>
        <h2 className="panel-h">단가</h2>

        <div className="settings-grid">
          <div className="field">
            <label className="field-label">정가 (1인 · 원)</label>
            <input
              className="field-input"
              type="number"
              min={0}
              step={100}
              value={form.price_regular}
              onChange={set("price_regular")}
            />
            <div className="field-hint">사이드바에 줄긋기로 표시됩니다.</div>
          </div>

          <div className="field">
            <label className="field-label">얼리버드 가격 (1인 · 원)</label>
            <input
              className="field-input"
              type="number"
              min={0}
              step={100}
              value={form.price_early_bird}
              onChange={set("price_early_bird")}
            />
            <div className="field-hint">기준 시간 이전 예약 시 적용.</div>
          </div>

          <div className="field">
            <label className="field-label">늦은 예약 할인율 (%)</label>
            <input
              className="field-input"
              type="number"
              min={0}
              max={100}
              step={1}
              value={form.late_discount_pct}
              onChange={set("late_discount_pct")}
            />
            <div className="field-hint">
              기준 시간 이후 예약 시 정가에서 할인 → 현재 ₩{" "}
              {lateDiscounted.toLocaleString("ko-KR")}
            </div>
          </div>

          <div className="field">
            <label className="field-label">얼리버드 기준 시간</label>
            <input
              className="field-input"
              type="time"
              value={form.early_cutoff_time?.slice(0, 5) || "12:00"}
              onChange={set("early_cutoff_time")}
            />
            <div className="field-hint">
              이 시각 이전에 예약하면 얼리버드 가격이 적용됩니다.
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn solid" type="submit" disabled={saving}>
            {saving ? "저장 중…" : "저장"}
          </button>
          {savedAt && !error && (
            <span className="settings-saved">
              저장됨 · {savedAt.toLocaleTimeString("ko-KR")}
            </span>
          )}
          {error && (
            <span className="field-error" role="alert">
              {error}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
