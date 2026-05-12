import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession, signIn } from "../../lib/auth";
import { isSupabaseConfigured } from "../../lib/supabase";
import "./admin.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    getSession().then((s) => {
      if (s) navigate("/admin", { replace: true });
    });
  }, [navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await signIn(email, password);
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="brand-mark big" style={{ color: "var(--gold)" }}>
            ★ ★ ★
          </div>
          <div className="login-name">La Stella</div>
          <div className="login-sub">Concierge · 관리자 로그인</div>
        </div>

        <form onSubmit={onSubmit} className="login-form">
          <div className="field">
            <label className="field-label">이메일</label>
            <input
              type="email"
              className="field-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="field">
            <label className="field-label">비밀번호</label>
            <input
              type="password"
              className="field-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="field-error">{error}</div>}

          <button className="btn solid" type="submit" disabled={loading}>
            {loading ? "확인 중…" : "로그인"}
          </button>

          {!isSupabaseConfigured && (
            <div className="login-demo">
              <strong>데모 모드</strong>
              <br />
              이메일: <code>admin@lastella.kr</code>
              <br />
              비밀번호: <code>lastella</code>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
