import { useState } from "react";
import Nav from "../../components/shared/Nav";
import Footer from "../../components/shared/Footer";
import Form from "./sections/Reserve/Form";
import Sidebar from "./sections/Reserve/Sidebar";
import "./sections/Reserve/reserve.css";

export default function Reserve() {
  const [selectedDate, setSelectedDate] = useState(null);

  return (
    <div className="reserve-page">
      <Nav />
      <main className="reserve-main">
        <div className="container reserve-grid">
          <Sidebar selectedDate={selectedDate} />
          <div className="reserve-form-wrap">
            <Form date={selectedDate} onDateChange={setSelectedDate} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
