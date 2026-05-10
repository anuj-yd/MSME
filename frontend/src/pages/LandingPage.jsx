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
    <div className="min-h-dvh bg-[#f7f9fc] text-slate-900">
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
