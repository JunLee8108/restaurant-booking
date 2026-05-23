import { useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNoIndex } from "../../lib/useNoIndex";
import "./qr.css";

const RESERVE_URL =
  import.meta.env.VITE_RESERVE_URL ||
  "https://la-stella-one.vercel.app/reserve";

export default function QrCode() {
  useNoIndex();
  const svgWrapRef = useRef(null);

  const onDownload = async () => {
    const svg = svgWrapRef.current?.querySelector("svg");
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([xml], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const size = 1024;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "la-stella-reserve-qr.png";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
      }, "image/png");
    };
    img.src = url;
  };

  const onPrint = () => window.print();

  return (
    <main className="qr-page">
      <section className="qr-frame">
        <div className="qr-mark">★ ★ ★</div>
        <h1 className="qr-title">La Stella</h1>
        <div className="qr-sub">성수기 특선 부페</div>

        <div className="qr-rule" />

        <div className="qr-card" ref={svgWrapRef}>
          <QRCodeSVG
            value={RESERVE_URL}
            size={280}
            level="M"
            bgColor="#ffffff"
            fgColor="#1a1a1a"
            marginSize={2}
          />
        </div>

        <p className="qr-instr">QR 코드를 스캔하여 예약하세요.</p>

        <div className="qr-actions">
          <button type="button" className="btn solid" onClick={onDownload}>
            PNG 다운로드
          </button>
          <button type="button" className="btn ghost" onClick={onPrint}>
            인쇄
          </button>
        </div>
      </section>
    </main>
  );
}
