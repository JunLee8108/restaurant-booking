import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * Google Calendar 스타일 월간 캘린더.
 *
 * Props:
 * - value: Date | null — 선택된 날짜
 * - onChange: (Date) => void
 * - minDate: Date — 선택 가능한 최소 날짜 (기본: 오늘)
 * - maxDate: Date — 선택 가능한 최대 날짜
 * - isClosed: (Date) => boolean — 휴무일 판정
 */
export default function MonthCalendar({
  value,
  onChange,
  minDate,
  maxDate,
  isClosed,
}) {
  const today = startOfDay(new Date());
  const min = startOfDay(minDate ?? today);
  const max = startOfDay(maxDate ?? addMonths(today, 12));

  // 처음 표시할 월: 선택된 값의 월, 없으면 min 의 월
  const [viewMonth, setViewMonth] = useState(
    startOfMonth(value ?? min),
  );

  const cells = useMemo(() => {
    // 월 시작주 ~ 월 마지막주 (일요일 시작 — Google Calendar 스타일)
    const gridStart = startOfWeek(startOfMonth(viewMonth), { weekStartsOn: 0 });
    const gridEnd = endOfWeek(endOfMonth(viewMonth), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: gridStart, end: gridEnd });
  }, [viewMonth]);

  const monthLabel = format(viewMonth, "yyyy년 M월", { locale: ko });

  const canPrev = !isBefore(
    subMonths(viewMonth, 1),
    startOfMonth(min),
  );
  const canNext = !isAfter(
    addMonths(viewMonth, 1),
    startOfMonth(max),
  );

  const goPrev = () => canPrev && setViewMonth((m) => subMonths(m, 1));
  const goNext = () => canNext && setViewMonth((m) => addMonths(m, 1));

  return (
    <div className="cal">
      <div className="cal-head">
        <button
          type="button"
          className="cal-nav"
          onClick={goPrev}
          disabled={!canPrev}
          aria-label="이전 달"
        >
          ‹
        </button>
        <div className="cal-month" aria-live="polite">
          {monthLabel}
        </div>
        <button
          type="button"
          className="cal-nav"
          onClick={goNext}
          disabled={!canNext}
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      <div className="cal-weekdays" role="row">
        {WEEKDAYS.map((d, i) => (
          <div
            key={d}
            className={`cal-weekday ${i === 0 ? "sun" : ""} ${i === 6 ? "sat" : ""}`}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="cal-grid" role="grid">
        {cells.map((d) => {
          const inMonth = isSameMonth(d, viewMonth);
          const closed = isClosed?.(d) ?? false;
          const past = isBefore(d, min);
          const future = isAfter(d, max);
          const disabled = past || future || closed;
          const selected = value && isSameDay(d, value);
          const isTodayCell = isToday(d);
          const dow = d.getDay();

          return (
            <button
              key={d.toISOString()}
              type="button"
              className={[
                "cal-cell",
                !inMonth && "is-other-month",
                disabled && "is-disabled",
                selected && "is-selected",
                isTodayCell && "is-today",
                closed && "is-closed",
                dow === 0 && "is-sun",
                dow === 6 && "is-sat",
              ]
                .filter(Boolean)
                .join(" ")}
              disabled={disabled}
              onClick={() => !disabled && onChange(d)}
              aria-pressed={selected || undefined}
              aria-label={format(d, "yyyy년 M월 d일 (E)", { locale: ko })}
            >
              <span className="cal-day">{d.getDate()}</span>
              {closed && inMonth && <span className="cal-closed">휴무</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
