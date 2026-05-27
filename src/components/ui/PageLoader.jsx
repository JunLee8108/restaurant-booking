export default function PageLoader({ label = "La Stella" }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-inner">
        <div className="loader-stars" aria-hidden>
          <span className="loader-star">★</span>
          <span className="loader-star">★</span>
          <span className="loader-star">★</span>
        </div>
        <div className="loader-word">{label}</div>
        <span className="sr-only">불러오는 중…</span>
      </div>
    </div>
  );
}
