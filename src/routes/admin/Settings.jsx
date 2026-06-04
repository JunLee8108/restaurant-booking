import { useEffect, useState } from "react";
import { DEFAULT_PRICING, getPricing, updatePricing } from "../../lib/reservations";
import "./admin.css";

const won = (n) => `₩${Number(n || 0).toLocaleString("ko-KR")}`;

// [카테고리 라벨, 성인 필드, 미취학 필드, 안내]
const PRICE_GROUPS = [
  ["사전예약", "adult_early", "child_early", "예약일 기준 시간 전 예약 시 적용 (가장 저렴)"],
  ["일반", "adult_regular", "child_regular", "기준 시간 이후 현장시점 일반 고객"],
  ["워터파크·투숙", "adult_waterpark", "child_waterpark", "워터파크 입장·투숙 고객 (사전예약 시 더 싼 값 적용)"],
];

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
      adult_regular: Number(form.adult_regular),
      child_regular: Number(form.child_regular),
      adult_early: Number(form.adult_early),
      child_early: Number(form.child_early),
      adult_waterpark: Number(form.adult_waterpark),
      child_waterpark: Number(form.child_waterpark),
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

  return (
    <div className="page">
      <header className="page-head">
        <div>
          <div className="eyebrow">Settings</div>
          <h1 className="page-title">뷔페 요금 설정</h1>
        </div>
      </header>

      <form className="panel" onSubmit={onSave}>
        <h2 className="panel-h">단가 (1인 · 원)</h2>

        {PRICE_GROUPS.map(([label, adultKey, childKey, hint]) => (
          <div className="price-group" key={adultKey}>
            <div className="price-group-head">
              <span className="price-group-name">{label}</span>
              <span className="price-group-hint">{hint}</span>
            </div>
            <div className="settings-grid">
              <div className="field">
                <label className="field-label">성인 (소인 포함)</label>
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  step={100}
                  value={form[adultKey]}
                  onChange={set(adultKey)}
                />
              </div>
              <div className="field">
                <label className="field-label">미취학아동</label>
                <input
                  className="field-input"
                  type="number"
                  min={0}
                  step={100}
                  value={form[childKey]}
                  onChange={set(childKey)}
                />
                <div className="field-hint">
                  성인 {won(form[adultKey])} · 미취학 {won(form[childKey])}
                </div>
              </div>
            </div>
          </div>
        ))}

        <div className="price-group">
          <div className="price-group-head">
            <span className="price-group-name">사전예약 기준 시간</span>
            <span className="price-group-hint">
              예약일 이 시각 이전에 예약하면 사전예약가가 적용됩니다.
            </span>
          </div>
          <div className="settings-grid">
            <div className="field">
              <label className="field-label">기준 시간</label>
              <input
                className="field-input"
                type="time"
                value={form.early_cutoff_time?.slice(0, 5) || "12:00"}
                onChange={set("early_cutoff_time")}
              />
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
