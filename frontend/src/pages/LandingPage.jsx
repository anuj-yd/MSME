import {
  Benefits,
  Faq,
  Features,
  Hero,
  HowItWorks,
  SiteFooter,
  SiteHeader,
  TrustBar,
} from './landing/LandingComponents.jsx'

function LandingPage() {
  return (
    <div className="min-h-dvh bg-[#F4F8FF] text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <SiteHeader />

      <main>
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <Benefits />
        <Faq />
      </main>

      <SiteFooter />
    </div>
  )
}

export default LandingPage
