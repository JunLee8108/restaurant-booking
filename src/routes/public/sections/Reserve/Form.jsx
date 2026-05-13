import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import Reveal from "../../../../components/ui/Reveal";
import MonthCalendar from "../../../../components/ui/MonthCalendar";
import {
  SEATING,
  createReservation,
  getAvailability,
  isClosed,
} from "../../../../lib/reservations";
import { fmtDate, fmtTime, toISO } from "../../../../lib/utils";
import "./reserve.css";

const STEPS = [
  { key: "date", label: "날짜" },
  { key: "time", label: "시간" },
  { key: "party", label: "인원" },
  { key: "seating", label: "좌석" },
  { key: "details", label: "정보" },
  { key: "confirm", label: "확인" },
];

const schema = z.object({
  customer_name: z.string().min(2, "이름을 입력해주세요"),
  email: z.string().email("올바른 이메일을 입력해주세요"),
  phone: z
    .string()
    .min(9, "전화번호를 입력해주세요")
    .regex(/^[0-9+\-\s]+$/, "숫자만 입력해주세요"),
  special_requests: z.string().max(500).optional().or(z.literal("")),
});

export default function Reservation() {
  const [step, setStep] = useState(0);
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [party, setParty] = useState(2);
  const [seating, setSeating] = useState(SEATING[0].value);
  const [slots, setSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const shellRef = useRef(null);
  const firstRenderRef = useRef(true);

  // 스텝/결과 전환 시 폼 상단으로 부드럽게 스크롤 (첫 마운트는 제외)
  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (!shellRef.current) return;
    const top =
      shellRef.current.getBoundingClientRect().top + window.scrollY - 100;
    window.scrollTo({ top, behavior: "smooth" });
  }, [step, result?.ok]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: {
      customer_name: "",
      email: "",
      phone: "",
      special_requests: "",
    },
  });

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 45);
    return d;
  }, []);

  useEffect(() => {
    if (!date) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- show loading on refetch
    setLoadingSlots(true);
    getAvailability(toISO(date)).then((s) => {
      setSlots(s);
      setLoadingSlots(false);
    });
  }, [date]);

  const canNext = () => {
    if (step === 0) return Boolean(date);
    if (step === 1) return Boolean(time);
    if (step === 2) return party > 0 && party <= 8;
    if (step === 3) return Boolean(seating);
    return true;
  };

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prev = () => setStep((s) => Math.max(0, s - 1));

  const onConfirm = async (values) => {
    setSubmitting(true);
    const payload = {
      customer_name: values.customer_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      reservation_date: toISO(date),
      reservation_time: time,
      party_size: party,
      seating,
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
    setDate(null);
    setTime(null);
    setParty(2);
    setSeating(SEATING[0].value);
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
            감사합니다,<br />
            <span className="italic">{result.payload.customer_name}</span> 님.
          </h2>
          <div className="rule center" />
          <p className="confirm-msg">
            예약이 접수되었습니다. 확인 메일이 곧 발송되며, 24시간 내 담당자가
            컨펌 연락을 드립니다.
          </p>
          <div className="confirm-summary">
            <div className="confirm-row">
              <span>예약 번호</span>
              <strong>{result.code}</strong>
            </div>
            <div className="confirm-row">
              <span>일시</span>
              <strong>
                {fmtDate(result.payload.reservation_date)} ·{" "}
                {fmtTime(result.payload.reservation_time)}
              </strong>
            </div>
            <div className="confirm-row">
              <span>인원</span>
              <strong>{result.payload.party_size}명</strong>
            </div>
            <div className="confirm-row">
              <span>좌석</span>
              <strong>
                {SEATING.find((s) => s.value === result.payload.seating)?.label}
              </strong>
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
        </div>
        </Reveal>
      </div>
    );
  }

  return (
    <div className="res-shell" ref={shellRef}>
      {/* Stepper */}
      <ol className="stepper" aria-label="예약 단계">
        {STEPS.map((s, i) => (
          <li
            key={s.key}
            className={`step ${i === step ? "current" : ""} ${
              i < step ? "done" : ""
            }`}
          >
            <span className="step-num">{String(i + 1).padStart(2, "0")}</span>
            <span className="step-label">{s.label}</span>
          </li>
        ))}
      </ol>

      <div className="res-stage">
        {step === 0 && (
          <DateStep
            maxDate={maxDate}
            value={date}
            onChange={(d) => {
              setDate(d);
              setTime(null);
            }}
          />
        )}
        {step === 1 && (
          <TimeStep
            date={date}
            slots={slots}
            loading={loadingSlots}
            party={party}
            value={time}
            onChange={setTime}
          />
        )}
        {step === 2 && <PartyStep value={party} onChange={setParty} />}
        {step === 3 && (
          <SeatingStep value={seating} onChange={setSeating} party={party} />
        )}
        {step === 4 && <DetailsStep register={register} errors={errors} />}
        {step === 5 && (
          <ConfirmStep
            date={date}
            time={time}
            party={party}
            seating={seating}
            values={getValues()}
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
            disabled={submitting}
          >
            {submitting ? "처리 중…" : "예약 확정하기"}
          </button>
        )}
      </div>
    </div>
  );
}

/* ---- Steps ---- */

function DateStep({ maxDate, value, onChange }) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 01</div>
        <h3>방문하실 날짜를 선택해주세요.</h3>
        <p className="step-hint">월요일은 정기 휴무이며, 최대 45일 이내까지 예약 가능합니다.</p>
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

function TimeStep({ date, slots, loading, party, value, onChange }) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 02</div>
        {date && <div className="step-meta">{fmtDate(date)}</div>}
        <h3>시간을 선택해주세요.</h3>
        <p className="step-hint">
          코스는 약 2시간 30분 진행되며, 마지막 입장은 20:30입니다.
        </p>
      </div>
      <div className="time-grid">
        {loading && (
          <div className="time-loading shimmer">슬롯을 불러오는 중…</div>
        )}
        {!loading &&
          slots.map((s) => {
            const disabled = s.remaining < party;
            const selected = value === s.slot_time;
            return (
              <button
                key={s.slot_time}
                type="button"
                className={`chip ${selected ? "selected" : ""}`}
                disabled={disabled}
                onClick={() => onChange(s.slot_time)}
              >
                {fmtTime(s.slot_time)}
              </button>
            );
          })}
      </div>
    </div>
  );
}

function PartyStep({ value, onChange }) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 03</div>
        <h3>몇 분이 방문하시나요?</h3>
        <p className="step-hint">9명 이상은 컨시어지로 문의 부탁드립니다.</p>
      </div>
      <div className="party-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button
            key={n}
            type="button"
            className={`chip party ${value === n ? "selected" : ""}`}
            onClick={() => onChange(n)}
          >
            {n}명
          </button>
        ))}
      </div>
    </div>
  );
}

function SeatingStep({ value, onChange, party }) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 04</div>
        <h3>좌석을 선택해주세요.</h3>
      </div>
      <div className="seat-grid">
        {SEATING.map((s) => {
          const disabled =
            (s.value === "private_salon" && party < 4) ||
            (s.value === "chefs_counter" && party > 4);
          return (
            <button
              key={s.value}
              type="button"
              className={`seat-card ${value === s.value ? "selected" : ""}`}
              disabled={disabled}
              onClick={() => onChange(s.value)}
            >
              <div className="seat-title">{s.label}</div>
              <div className="seat-desc">{s.desc}</div>
              {disabled && (
                <div className="seat-note">
                  {s.value === "private_salon"
                    ? "최소 4인부터"
                    : "최대 4인까지"}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailsStep({ register, errors }) {
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 05</div>
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
          <label className="field-label">이메일</label>
          <input
            className="field-input"
            placeholder="name@example.com"
            type="email"
            {...register("email")}
          />
          {errors.email && (
            <div className="field-error">{errors.email.message}</div>
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

function ConfirmStep({ date, time, party, seating, values, error }) {
  const seat = SEATING.find((s) => s.value === seating);
  return (
    <div className="step-pane">
      <div className="step-head">
        <div className="eyebrow">Step 06</div>
        <h3>예약 내용을 확인해주세요.</h3>
      </div>
      <div className="summary">
        <Row label="날짜" value={date ? fmtDate(date) : "—"} />
        <Row label="시간" value={fmtTime(time)} />
        <Row label="인원" value={`${party}명`} />
        <Row label="좌석" value={seat?.label || "—"} />
        <Row label="예약자" value={values.customer_name || "—"} />
        <Row label="이메일" value={values.email || "—"} />
        <Row label="전화번호" value={values.phone || "—"} />
        {values.special_requests && (
          <Row label="요청" value={values.special_requests} />
        )}
      </div>
      <p className="confirm-fine">
        ※ 예약 확정 후 변경/취소는 방문 24시간 전까지 가능합니다.
      </p>
      {error && <div className="field-error" role="alert">{error}</div>}
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
