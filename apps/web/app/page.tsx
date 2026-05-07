import Nav from '@/components/landing/Nav'
import Hero from '@/components/landing/Hero'
import Ticker from '@/components/landing/Ticker'
import Differentiators from '@/components/landing/Differentiators'
import DemoSection from '@/components/landing/LiveDemo'
import SnippetSection from '@/components/landing/HowItWorks'
import TelegramSection from '@/components/landing/TelegramSection'
import FooterSection from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="site-root">
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Differentiators />
        <DemoSection />
        <SnippetSection />
        <TelegramSection />
      </main>
      <FooterSection />
    </div>
  )
}
