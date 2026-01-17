import Stars from './Stars';
import Navbar from './Navbar';
import Hero from './Hero';
import ImpactStats from './ImpactStats';
import Portfolio from './Portfolio';
import Philosophy from './Philosophy';
import Contact from './Contact';
import CustomCursor from './CustomCursor';
import ClickEffect from './ClickEffect';
import ScrollIconOrbit from './ScrollIconOrbit';

export default function App() {
  return (
    <>
      <CustomCursor />
      <ClickEffect />
      <Stars />
      <ScrollIconOrbit />
      <div className="relative z-10">
        <Navbar />
        <main>
          <Hero />
          <ImpactStats />
          <Portfolio />
          <Philosophy />
          <Contact />
        </main>
      </div>
    </>
  );
}
