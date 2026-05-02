import { Nav } from "./components/Nav";
import { Hero } from "./components/Hero";
import { Problem } from "./components/Problem";
import { HowItWorks } from "./components/HowItWorks";
import { Features } from "./components/Features";
import { Demo } from "./components/Demo";
import { Pricing } from "./components/Pricing";
import { QuoteSection } from "./components/QuoteSection";
import { Footer } from "./components/Footer";
import { ScrollAnimations } from "./components/ScrollAnimations";
import "./landing.css";

function Divider() {
  return <div className="accent-divider" />;
}

export default function Home() {
  return (
    <>
      <ScrollAnimations />
      <Nav />
      <Hero />
      <Divider />
      <Problem />
      <Divider />
      <HowItWorks />
      <Divider />
      <Features />
      <Divider />
      <Demo />
      <Divider />
      <Pricing />
      <Divider />
      <QuoteSection />
      <Footer />
    </>
  );
}
