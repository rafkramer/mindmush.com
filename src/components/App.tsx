import Stars from './Stars';
import Navbar from './Navbar';
import Hero from './Hero';
import ImpactStats from './ImpactStats';
import Portfolio from './Portfolio';
import Philosophy from './Philosophy';
import Contact from './Contact';
import Footer from './Footer';

export default function App() {
  return (
    <>
      <Stars />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ImpactStats />
          <Portfolio />
          <Philosophy />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
}
