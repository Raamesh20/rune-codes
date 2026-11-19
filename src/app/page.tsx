import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/hero/Hero";
import { About } from "@/components/sections/about/About";
import { Purpose } from "@/components/sections/Purpose";
import { Programs } from "@/components/sections/programs/Programs";
import { Approach } from "@/components/sections/Approach";
import { Playground } from "@/components/sections/playground/Playground";
import { Testimonials } from "@/components/sections/Testimonials";
import { Contact } from "@/components/sections/Contact";
import { MascotCompanion } from "@/components/mascot/MascotCompanion";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        <Hero />
        <About />
        <Purpose />
        <Programs />
        <Approach />
        <Playground />
        <Testimonials />
        <Contact />
      </main>
      <Footer />
      <MascotCompanion />
    </>
  );
}
