import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";

import Home from "./routes/public/Home";
import Reserve from "./routes/public/Reserve";
import "./components/ui/ui.css";

const QrCode = lazy(() => import("./routes/public/QrCode"));
const Terms = lazy(() => import("./routes/public/Terms"));

const AdminLayout = lazy(() => import("./routes/admin/AdminLayout"));
const Login = lazy(() => import("./routes/admin/Login"));
const Dashboard = lazy(() => import("./routes/admin/Dashboard"));
const ReservationsList = lazy(() => import("./routes/admin/ReservationsList"));
const ReservationDetail = lazy(() => import("./routes/admin/ReservationDetail"));
const Stats = lazy(() => import("./routes/admin/Stats"));
const Settings = lazy(() => import("./routes/admin/Settings"));

function ScrollAndHashHandler() {
  const { hash, pathname } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(
          () => el.scrollIntoView({ behavior: "smooth", block: "start" }),
          0,
        );
        return;
      }
    }
    window.scrollTo({ top: 0 });
  }, [hash, pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollAndHashHandler />
      <Suspense fallback={<div className="admin-boot">불러오는 중…</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/reserve" element={<Reserve />} />
          <Route path="/qr" element={<QrCode />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="reservations" element={<ReservationsList />} />
            <Route path="reservations/:id" element={<ReservationDetail />} />
            <Route path="stats" element={<Stats />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
