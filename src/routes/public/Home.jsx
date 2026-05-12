import Nav from "../../components/shared/Nav";
import Footer from "../../components/shared/Footer";
import Hero from "./sections/Hero";
import Prelude from "./sections/Prelude";
import Experience from "./sections/Experience";
import Atelier from "./sections/Atelier";
import Reservation from "./sections/Reservation/Reservation";
import Visit from "./sections/Visit";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Prelude />
        <Experience />
        <Atelier />
        <Reservation />
        <Visit />
      </main>
      <Footer />
    </>
  );
}
