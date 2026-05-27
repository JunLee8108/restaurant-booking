import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Reveal from "../../../../components/ui/Reveal";
import MonthCalendar from "../../../../components/ui/MonthCalendar";
import {
  MAX_PARTY,
  createReservation,
  isClosed,
} from "../../../../lib/reservations";
import { fmtDate, toISO } from "../../../../lib/utils";
import "./reserve.css";

const STEPS = [
  { key: "date", label: "날짜" },
  { key: "party", label: "인원" },
  { key: "details", label: "정보" },
  { key: "confirm", label: "확인" },
];

const schema = z.object({
  customer_name: z.string().min(2, "이름을 입력해주세요"),
  phone: z
    .string()
    .min(9, "전화번호를 입력해주세요")
    .regex(/^[0-9+\-\s]+$/, "숫자만 입력해주세요"),
  special_requests: z.string().max(500).optional().or(z.literal("")),
});

export default function Reservation({ date, onDateChange }) {
  const [step, setStep] = useState(0);
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const shellRef = useRef(null);
  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (!shellRef.current) return;
    const top =
      shellRef.current.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "instant" });
  }, [step, result?.ok]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
    trigger,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      customer_name: "",
      phone: "",
      special_requests: "",
    },
  });

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d;
  }, []);

  const partyCount = adults + children;

  const canNext = () => {
    if (step === 0) return Boolean(date);
    if (step === 1) return adults >= 1 && partyCount <= MAX_PARTY;
    return true;
  };

  const next = async () => {
    if (step === 2) {
      const ok = await trigger(["customer_name", "phone"]);
      if (!ok) return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const onConfirm = async (values) => {
    setSubmitting(true);
    const payload = {
      customer_name: values.customer_name.trim(),
      phone: values.phone.trim(),
      reservation_date: toISO(date),
      adults,
      children,
      infants,
      special_requests: values.special_requests?.trim() || null,
    };
    const { data, error, demo } = await createReservation(payload);
    setSubmitting(false);
    if (error) {
      setResult({ ok: false, message: error.message });
      return;
    }
    setResult({ ok: true, demo, code: data.confirmation_code, payload });
  };

  const restart = () => {
    setStep(0);
    onDateChange(null);
    setAdults(2);
    setChildren(0);
    setInfants(0);
    setAgreed(false);
    setResult(null);
    reset();
  };

  if (result?.ok) {
    return (
      <div ref={shellRef}>
        <Reveal>
          <div className="confirm-card">
            <div className="confirm-stars">★ ★ ★</div>
            <div className="eyebrow">예약 접수 완료</div>
            <h2 className="confirm-title">
              감사합니다,
              <br />
              <span className="italic">{result.payload.customer_name}</span> 님.
            </h2>
            <div className="rule center" />
            <p className="confirm-msg">
              예약이 접수되었습니다. 24시간 내 담당자가 전화로 컨펌 연락을
              드립니다.
            </p>
            <div className="confirm-summary">
              <div className="confirm-row">
                <span>예약 번호</span>
                <strong>{result.code}</strong>
              </div>
              <div className="confirm-row">
                <span>날짜</span>
                <strong>{fmtDate(result.payload.reservation_date)}</strong>
              </div>
              <div className="confirm-row">
                <span>인원</span>
                <strong>{summarizeParty(result.payload)}</strong>
              </div>
            </div>
            {result.demo && (
              <div className="confirm-demo">
                데모 모드 — Supabase가 연결되지 않아 예약이 브라우저에 임시
                저장되었습니다.
              </div>
            )}
            <button className="btn gold" onClick={restart}>
              새 예약 만들기
            </button>
            <a
              className="confirm-lookup"
              href={`/lookup?code=${encodeURIComponent(result.code)}`}
            >
              내 예약 조회하기
            </a>
          </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="res-shell" ref={shellRef}>
      <div className="res-stage">
        {step === 0 && (
          <DateStep maxDate={maxDate} value={date} onChange={onDateChange} />
        )}
        {step === 1 && (
          <PartyStep
            adults={adults}
            children={children}
            infants={infants}
            setAdults={setAdults}
            setChildren={setChildren}
            setInfants={setInfants}
          />
        )}
        {step === 2 && <DetailsStep register={register} errors={errors} />}
        {step === 3 && (
          <ConfirmStep
            date={date}
            adults={adults}
            childrenCount={children}
            infants={infants}
            values={getValues()}
            agreed={agreed}
            onAgreedChange={setAgreed}
            error={result?.message}
          />
        )}
      </div>

      <div className="res-nav">
        <button
          type="button"
          className="btn ghost"
          onClick={prev}
          disabled={step === 0}
        >
          ← 이전
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            className="btn solid"
            onClick={next}
            disabled={!canNext()}
          >
            다음 →
          </button>
        ) : (
          <button
            type="button"
            className="btn solid"
            onClick={handleSubmit(onConfirm)}
            disabled={submitting || !agreed}
          >
            {submitting ? "처리 중…" : "동의하고 예약 신청하기"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---- 헬퍼 ---- */

function summarizeParty({ adults, children, infants }) {
  const parts = [];
  if (adults) parts.push(`성인 ${adults}`);
  if (children) parts.push(`소인 ${children}`);
  if (infants) parts.push(`유아 ${infants}`);
  return parts.join(" · ") || "—";
}

/* ---- Steps ---- */

function DateStep({ maxDate, value, onChange }) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 01</div>
        <h3>방문하실 날짜를 선택해주세요.</h3>
        <p className="step-hint">
          토·일요일에만 운영합니다 · 최대 45일 이내 예약 가능
        </p>
      </div>
      <MonthCalendar
        value={value}
        onChange={onChange}
        maxDate={maxDate}
        isClosed={isClosed}
      />
    </div>
  );
}

function PartyStep({
  adults,
  children,
  infants,
  setAdults,
  setChildren,
  setInfants,
}) {
  const partyCount = adults + children;
  const over = partyCount > MAX_PARTY;

  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 02</div>
        <h3>몇 분이 방문하시나요?</h3>
        <p className="step-hint">
          성인 · 소인 합산 최대 {MAX_PARTY}명 · 유아(36개월 미만)는 무료
        </p>
      </div>
      <div className="party-stack">
        <Counter
          label="성인"
          sub="만 13세 이상"
          value={adults}
          min={1}
          max={MAX_PARTY}
          onChange={setAdults}
        />
        <Counter
          label="소인"
          sub="만 13세 미만"
          value={children}
          min={0}
          max={MAX_PARTY - 1}
          onChange={setChildren}
        />
        <Counter
          label="유아"
          sub="36개월 미만 · 무료"
          value={infants}
          min={0}
          max={8}
          onChange={setInfants}
        />
      </div>
      {over && (
        <div className="party-warn" role="alert">
          성인 · 소인 합산이 최대 {MAX_PARTY}명을 초과했습니다.
        </div>
      )}
    </div>
  );
}

function Counter({ label, sub, value, min, max, onChange }) {
  const dec = () => onChange(Math.max(min, value - 1));
  const inc = () => onChange(Math.min(max, value + 1));
  return (
    <div className="counter-row">
      <div className="counter-text">
        <div className="counter-label">{label}</div>
        <div className="counter-sub">{sub}</div>
      </div>
      <div className="counter-ctrl">
        <button
          type="button"
          className="counter-btn"
          onClick={dec}
          disabled={value <= min}
          aria-label={`${label} 감소`}
        >
          −
        </button>
        <span className="counter-value mono">{value}</span>
        <button
          type="button"
          className="counter-btn"
          onClick={inc}
          disabled={value >= max}
          aria-label={`${label} 증가`}
        >
          +
        </button>
      </div>
    </div>
  );
}

function DetailsStep({ register, errors }) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 03</div>
        <h3>예약자 정보를 입력해주세요.</h3>
      </div>
      <div className="details-form">
        <div className="field">
          <label className="field-label">이름</label>
          <input
            className="field-input"
            placeholder="홍길동"
            {...register("customer_name")}
          />
          {errors.customer_name && (
            <div className="field-error">{errors.customer_name.message}</div>
          )}
        </div>
        <div className="field">
          <label className="field-label">전화번호</label>
          <input
            className="field-input"
            placeholder="010 1234 5678"
            type="tel"
            {...register("phone")}
          />
          {errors.phone && (
            <div className="field-error">{errors.phone.message}</div>
          )}
        </div>
        <div className="field full">
          <label className="field-label">알레르기 · 특별 요청 (선택)</label>
          <textarea
            className="field-textarea"
            placeholder="예: 갑각류 알레르기, 기념일, 거동이 불편한 동반자 동행 등"
            rows={4}
            {...register("special_requests")}
          />
        </div>
      </div>
    </div>
  );
}

function ConfirmStep({
  date,
  adults,
  childrenCount,
  infants,
  values,
  agreed,
  onAgreedChange,
  error,
}) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 04</div>
        <h3>예약 내용을 확인해주세요.</h3>
      </div>
      <div className="summary">
        <Row label="날짜" value={date ? fmtDate(date) : "—"} />
        <Row
          label="인원"
          value={summarizeParty({
            adults,
            children: childrenCount,
            infants,
          })}
        />
        <Row label="예약자" value={values.customer_name || "—"} />
        <Row label="전화번호" value={values.phone || "—"} />
        {values.special_requests && (
          <Row label="요청" value={values.special_requests} />
        )}
      </div>
      <p className="confirm-fine">
        ※ 예약 확정 후 변경/취소는 방문 24시간 전까지 가능합니다.
      </p>

      <label className={`consent ${agreed ? "checked" : ""}`}>
        <input
          type="checkbox"
          className="consent-box"
          checked={agreed}
          onChange={(e) => onAgreedChange(e.target.checked)}
        />
        <span className="consent-check" aria-hidden />
        <span className="consent-text">
          예약 서비스 약관 및 개인정보 수집·이용, 제3자 제공에 동의합니다.{" "}
          <a
            href="/terms"
            target="_blank"
            rel="noopener noreferrer"
            className="consent-link"
            onClick={(e) => e.stopPropagation()}
          >
            약관 전체보기
          </a>
        </span>
      </label>

      {error && (
        <div className="field-error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="sum-row">
      <span className="sum-label">{label}</span>
      <span className="sum-value">{value}</span>
    </div>
  );
}
