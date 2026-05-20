import heroImg from '../../assets/hero.png'
import { LanguageSelect } from '../../components/GoogleTranslate.jsx'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-xl shadow-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <a
          href="#top"
          className="group flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
        >
          <div className="relative grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-800 text-white shadow-lg shadow-primary-500/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <span className="text-sm font-bold tracking-wider">RP</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-bold text-slate-900 tracking-tight">
              Renewal Portal
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">For MSEs</div>
          </div>
        </a>

        <nav className="hidden items-center gap-2 md:flex">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how">Process</NavLink>
          <NavLink href="#benefits">Benefits</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelect compact />
          <a
            href="#/login"
            className="hidden rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900 md:inline-flex"
          >
            User login
          </a>
          <a
            href="#/admin/login"
            className="hidden rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:bg-slate-50 md:inline-flex"
          >
            Admin
          </a>
          <a
            href="#/register"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/25 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
          >
            Sign up
          </a>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, children }) {
  return (
    <a
      href={href}
      className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100/80 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
    >
      {children}
    </a>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pt-8 pb-20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-20 top-0 h-[500px] w-[500px] rounded-full bg-primary-400/20 blur-[100px]" />
        <div className="absolute -right-20 top-40 h-[400px] w-[400px] rounded-full bg-indigo-500/15 blur-[100px]" />
        <div className="absolute left-1/2 top-[30rem] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-blue-300/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-2 md:py-24">
        <div className="z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/60 px-4 py-1.5 text-xs font-semibold text-primary-700 shadow-sm backdrop-blur-md">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-primary-500"></span>
            </span>
            Smart Renewal for Micro &amp; Small Enterprises
          </div>

          <h1 className="mt-6 text-balance text-5xl font-extrabold tracking-tight text-slate-900 md:text-6xl md:leading-[1.1]">
            Renew licenses <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-indigo-600">without the hassle.</span>
          </h1>

          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-600">
            Track applications, manage documents, and never miss a deadline. Experience a faster flow, clear status tracking, and smart automated reminders.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#/register"
              className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-primary-500/30 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              Start Renewal Now
            </a>
            <a
              href="#/admin/login"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 bg-white/80 backdrop-blur-md px-6 py-3.5 text-base font-semibold text-slate-800 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              Admin console
            </a>
            <a
              href="#how"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-md px-6 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              See how it works
            </a>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-slate-200/60 pt-8 sm:max-w-lg">
            <Stat k="All in 1" unit="portal" />
            <Stat k="24/7" unit="access" />
            <Stat k="Smart" unit="alerts" />
          </dl>
        </div>

        <div className="relative z-10 lg:ml-auto w-full max-w-md">
          <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[2.5rem] bg-gradient-to-br from-primary-200 to-indigo-200 blur-xl opacity-60" />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/50 bg-white/70 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-rose-400"></div>
                <div className="size-2.5 rounded-full bg-amber-400"></div>
                <div className="size-2.5 rounded-full bg-emerald-400"></div>
              </div>
              <span className="rounded-full bg-slate-100/80 px-3 py-1 text-xs font-semibold text-slate-500">
                Live Preview
              </span>
            </div>

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3">
                <CardMetric label="Pending Renewals" value="3" hint="Due in 15 days" color="rose" />
                <CardMetric label="Documents" value="12" hint="Verified: 9" color="emerald" />
              </div>

              <div className="rounded-2xl border border-white/60 bg-white/50 p-5 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between text-sm mb-4">
                  <div className="font-semibold text-slate-800">Application Status</div>
                  <div className="text-xs font-medium text-slate-500">Today</div>
                </div>
                <div className="space-y-3">
                  <StatusRow label="Trade License" status="In review" tone="info" />
                  <StatusRow label="Udyam Update" status="Approved" tone="ok" />
                  <StatusRow label="Shop & Est." status="Action needed" tone="warn" />
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm">
                <div className="flex flex-col gap-1 relative z-10">
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary-600">Next Reminder</div>
                  <div className="text-sm font-medium text-slate-700 mt-1">
                    Upload address proof by <span className="font-bold text-slate-900">Friday</span>
                  </div>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] opacity-20 transform rotate-12 scale-150">
                  <span className="text-8xl">📅</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({ k, unit }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-slate-900">{k}</div>
      <div className="mt-1 text-sm font-medium text-slate-500 uppercase tracking-widest">{unit}</div>
    </div>
  )
}

function CardMetric({ label, value, hint, color }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-md transition-transform hover:-translate-y-1">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-slate-900">{value}</div>
      <div className={`mt-2 text-xs font-medium ${color === 'rose' ? 'text-rose-600' : 'text-emerald-600'}`}>{hint}</div>
    </div>
  )
}

function StatusRow({ label, status, tone }) {
  const toneClasses =
    tone === 'ok'
      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
      : tone === 'warn'
        ? 'bg-amber-100 text-amber-800 border-amber-200'
        : 'bg-primary-100 text-primary-700 border-primary-200'

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2 border border-white/40 shadow-sm transition-colors hover:bg-white">
      <div className="truncate text-sm font-medium text-slate-700">{label}</div>
      <span className={`shrink-0 rounded-lg border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${toneClasses}`}>
        {status}
      </span>
    </div>
  )
}

export function TrustBar() {
  return (
    <section className="border-y border-slate-200/60 bg-white/50 py-10 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
        <p className="text-center text-sm font-medium text-slate-600 md:text-left">
          Trusted for simplifying renewals with clear steps & fewer follow-ups.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge icon="🔒">Bank-level Security</Badge>
          <Badge icon="📄">100% Paperless</Badge>
          <Badge icon="⚡">Real-time Tracking</Badge>
        </div>
      </div>
    </section>
  )
}

function Badge({ icon, children }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md">
      <span>{icon}</span> {children}
    </span>
  )
}

export function Features() {
  const items = [
    {
      icon: "📋",
      title: 'Auto Checklist',
      desc: 'Get precise requirements for every license and registration tailored to your profile.',
    },
    {
      icon: "🎯",
      title: 'Live Tracking',
      desc: 'Real-time visibility from submission to approval. Know exactly where your application stands.',
    },
    {
      icon: "🔔",
      title: 'Smart Alerts',
      desc: 'Automated reminders via email and dashboard well before your due dates arrive.',
    },
    {
      icon: "🔐",
      title: 'Secure Vault',
      desc: 'Store KYC, proofs, and certificates safely. Reuse them across multiple applications effortlessly.',
    },
    {
      icon: "🏢",
      title: 'Unified Profile',
      desc: 'Maintain a single source of truth for your enterprise details, addresses, and contacts.',
    },
    {
      icon: "🎧",
      title: 'Guided Support',
      desc: 'Integrated help desk, FAQs, and guided filing flows to completely eliminate confusion.',
    },
  ]

  return (
    <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          Everything you need for seamless compliance
        </h2>
        <p className="mt-4 text-lg text-slate-600">
          Replace scattered documents and manual tracking with our unified, intelligent portal.
        </p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <FeatureCard key={it.title} icon={it.icon} title={it.title} desc={it.desc} />
        ))}
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-primary-500/10">
      <div className="absolute -right-10 -top-10 size-40 rounded-full bg-primary-50 opacity-0 transition-opacity group-hover:opacity-100"></div>
      <div className="relative">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-indigo-100 text-2xl shadow-inner">
          {icon}
        </div>
        <h3 className="mt-6 text-xl font-bold text-slate-900">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          {desc}
        </p>
      </div>
    </div>
  )
}

export function HowItWorks() {
  const steps = [
    {
      title: 'Create Your Profile',
      desc: 'Sign up securely and add your basic enterprise details just once.',
    },
    {
      title: 'Select Renewal Type',
      desc: 'Choose the license you need and get a customized, simple checklist.',
    },
    {
      title: 'Upload Documents',
      desc: 'Easily upload required proofs to your secure, reusable vault.',
    },
    {
      title: 'Track to Approval',
      desc: 'Monitor real-time status and get notified as soon as it is approved.',
    },
  ]

  return (
    <section id="how" className="relative py-24">
      <div className="absolute inset-0 -z-10 bg-slate-900"></div>
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-900 to-slate-900"></div>
      
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Four steps to renewal
          </h2>
          <p className="mt-4 text-lg text-slate-300">
            A streamlined process designed to save you time and eliminate errors.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((s, idx) => (
            <div key={s.title} className="relative rounded-[2rem] border border-white/10 bg-white/5 p-8 backdrop-blur-md transition-colors hover:bg-white/10">
              <div className="text-5xl font-black text-white/10">{idx + 1}</div>
              <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-primary-600 to-indigo-600 p-1">
          <div className="rounded-[2.4rem] bg-slate-900/50 backdrop-blur-xl px-8 py-12 text-center md:px-12 md:py-16">
            <h3 className="text-2xl font-bold text-white md:text-3xl">Ready to simplify your renewals?</h3>
            <p className="mt-4 text-slate-300 max-w-xl mx-auto">Join thousands of MSEs who have already streamlined their compliance with our unified portal.</p>
            <a
              href="#/register"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary-900 shadow-xl transition-transform hover:scale-105"
            >
              Get Started for Free
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

export function Benefits() {
  const points = [
    {
      title: 'Save Countless Hours',
      desc: 'Dramatically reduce turnaround time and minimize frustrating follow-ups with authorities.',
    },
    {
      title: 'Ensure 100% Compliance',
      desc: 'Completely lower the risk of missing deadlines and incurring heavy penalties.',
    },
    {
      title: 'Audit-Ready Always',
      desc: 'Maintain an organized, perfectly clear status history and document trail for audits.',
    },
    {
      title: 'Intelligent Vault',
      desc: 'Never upload the same document twice. Our system reuses your verified proofs safely.',
    },
  ]

  return (
    <section id="benefits" className="relative mx-auto w-full max-w-6xl px-6 py-24">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Benefits that drive your business forward
          </h2>
          <p className="mt-6 text-lg text-slate-600 leading-relaxed">
            We understand that renewals can be an incredibly confusing process for micro and small enterprises. Our platform is meticulously engineered to provide absolute clarity and unparalleled speed.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <span className="rounded-full bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700">Multi-renewal Support</span>
            <span className="rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">Document Reuse</span>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">Clear Timeline</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {points.map((p) => (
            <div key={p.title} className="rounded-[1.5rem] border border-slate-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
              <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
              <p className="mt-3 text-sm text-slate-600 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Faq() {
  const faqs = [
    {
      q: 'Can this portal handle multiple licenses?',
      a: 'Absolutely. The core concept is a centralized dashboard where you can manage, track, and renew all your various licenses and registrations simultaneously.',
    },
    {
      q: 'Are my enterprise documents secure?',
      a: 'Yes. We utilize a highly secure document vault designed specifically for safe storage, robust encryption, and strict access control.',
    },
    {
      q: 'How will I receive status updates?',
      a: 'You will have a real-time status timeline directly in the portal, alongside automated email and SMS reminders well before any due dates.',
    },
  ]

  return (
    <section id="faq" className="bg-slate-50 py-24">
      <div className="mx-auto w-full max-w-4xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-slate-600">Everything you need to know about the platform.</p>
        </div>

        <div className="mt-12 grid gap-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all open:bg-white hover:shadow-md"
            >
              <summary className="cursor-pointer list-none text-base font-bold text-slate-900 focus-visible:outline-none">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-transform group-open:rotate-180">
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </span>
              </summary>
              <div className="mt-4 text-sm leading-relaxed text-slate-600 pr-12">
                {f.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-white pb-8 pt-16">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-800 text-white shadow-md">
                <span className="text-sm font-bold tracking-wider">RP</span>
              </div>
              <div>
                <div className="text-base font-bold text-slate-900 tracking-tight">Renewal Portal</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">For MSEs</div>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm text-slate-600 leading-relaxed">
              Empowering micro and small enterprises with a unified, intelligent compliance and renewal management platform.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">Platform</h4>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              <li><a href="#features" className="hover:text-primary-600 transition-colors">Features</a></li>
              <li><a href="#how" className="hover:text-primary-600 transition-colors">How it works</a></li>
              <li><a href="#benefits" className="hover:text-primary-600 transition-colors">Benefits</a></li>
              <li><a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900">Legal</h4>
            <ul className="mt-6 space-y-4 text-sm text-slate-600">
              <li><a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-600 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Renewal Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
