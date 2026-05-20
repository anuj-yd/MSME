import { LanguageSelect } from '../../components/GoogleTranslate.jsx'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-xl shadow-sm dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-6 py-4">
        <a
          href="#top"
          className="group flex items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <div className="grid h-12 w-12 place-items-center rounded-3xl bg-primary-600 text-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <span className="text-lg font-bold tracking-tight">RP</span>
          </div>
          <div className="leading-tight">
            <div className="text-base font-semibold text-slate-900 tracking-tight">Renewal Portal</div>
            <div className="text-xs uppercase tracking-[0.35em] text-slate-500">For MSEs</div>
          </div>
        </a>

        <nav className="hidden items-center gap-4 md:flex">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#how">Process</NavLink>
          <NavLink href="#benefits">Benefits</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSelect compact />
          <a
            href="#/login"
            className="rounded-xl border border-primary-100 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-950/20 dark:text-primary-300"
          >
            User login
          </a>
          <a
            href="#/admin/login"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Admin login
          </a>
          <a
            href="#/register"
            className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform duration-300 hover:-translate-y-0.5"
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
      className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-primary-200"
    >
      {children}
    </a>
  )
}

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-20 pt-6 bg-[#F4F8FF] dark:bg-slate-950">
      <div className="absolute inset-0 -z-10 bg-linear-to-br from-white via-primary-100 to-primary-100" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(79,140,255,0.08),transparent_30%)]" />

      <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-24 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-3 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-xs uppercase tracking-[0.35em] text-primary-700 shadow-sm dark:border-primary-900/30 dark:bg-primary-950/25 dark:text-primary-200">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-700" />
            Renewal portal for MSEs
          </div>

          <h1 className="max-w-4xl text-4xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">
            Simplify renewals. Stay compliant.
          </h1>

          <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
            Manage applications, approvals, and documents from one secure dashboard built for modern enterprises.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <a
              href="#/login"
              className="inline-flex items-center justify-center rounded-full bg-linear-to-r from-primary-600 to-primary-700 px-8 py-4 text-base font-semibold text-white shadow-md transition hover:-translate-y-0.5"
            >
              User login
            </a>
            <a
              href="#/admin/login"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-base font-semibold text-slate-800 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Admin login
            </a>
          </div>

          <dl className="grid gap-4 sm:grid-cols-3">
            <Stat k="Renewals" unit="Tracked" />
            <Stat k="Approvals" unit="Managed" />
            <Stat k="Documents" unit="Secured" />
          </dl>
        </div>

        <div className="relative lg:ml-auto">
          <div className="absolute -left-8 top-10 h-28 w-28 rounded-full bg-primary-200/40 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200 dark:border-slate-700 dark:bg-slate-900/95 dark:shadow-slate-950/40">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(79,140,255,0.12),transparent_25%)]" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.35em] text-slate-500">Dashboard overview</p>
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Approval pipeline</h2>
                </div>
                <span className="rounded-full border border-slate-200 bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:border-slate-700 dark:bg-primary-950/20 dark:text-primary-300">Secure</span>
              </div>

              <div className="grid gap-4 rounded-4xl bg-primary-50 p-5 border border-slate-200 dark:border-slate-700 dark:bg-primary-950/20">
                <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>Application status</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Live</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>Document vault</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Encrypted</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
                  <span>Compliance alerts</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">Instant</span>
                </div>
              </div>

              <div className="rounded-4xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="text-xs uppercase tracking-[0.35em] text-primary-700 dark:text-primary-200">Support</div>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Get help with renewals, documents, and approvals from our support team.</p>
              </div>

              <div className="rounded-4xl border border-slate-200 bg-primary-50 p-5 dark:border-slate-700 dark:bg-primary-950/20">
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Premium workflow</div>
                <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">Centralized renewals, secure document access, and fast status updates.</p>
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
      <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">{k}</div>
      <div className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{unit}</div>
    </div>
  )
}

export function TrustBar() {
  return (
    <section className="border-y border-slate-200 bg-primary-100 py-10 dark:border-slate-700 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-6 px-6 md:flex-row md:justify-between">
        <p className="text-center text-sm font-semibold text-slate-700 dark:text-slate-300 md:text-left">
          Trusted for secure renewals, fast approvals, and reliable support.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge icon="🔒">Secure storage</Badge>
          <Badge icon="📄">Document tracking</Badge>
          <Badge icon="⚡">Real-time alerts</Badge>
        </div>
      </div>
    </section>
  )
}

function Badge({ icon, children }) {
  return (
    <span className="flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-xs font-bold text-primary-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-primary-100 dark:border-primary-900/30 dark:bg-primary-950/20 dark:text-primary-300 dark:hover:bg-primary-900/40">
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
    <section id="features" className="relative mx-auto w-full max-w-6xl px-6 py-24 bg-white dark:bg-slate-950">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
          Everything you need for seamless experiences
        </h2>
        <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">
          Replace scattered journeys with a unified, premium experience built for modern exploration.
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
    <div className="group relative overflow-hidden rounded-4xl border border-slate-200 bg-[#F4F8FF] p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-primary-200 dark:bg-slate-900/90 dark:border-slate-700">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-100 opacity-30 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-3xl bg-primary-100 text-primary-700 shadow-inner">
          {icon}
        </div>
        <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-slate-100">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{desc}</p>
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
    <section id="how" className="relative py-24 bg-primary-50 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
            Four steps to renewal
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
            A streamlined process designed to save you time and eliminate errors.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-4">
          {steps.map((s, idx) => (
            <div key={s.title} className="relative rounded-4xl border border-slate-200 bg-white p-8 transition-colors hover:bg-primary-50/70 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-5xl font-black text-primary-100">{idx + 1}</div>
              <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-slate-100">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 overflow-hidden rounded-[2.5rem] bg-linear-to-r from-primary-600 to-primary-400 p-1 shadow-xl shadow-primary-500/10">
          <div className="rounded-[2.4rem] bg-white px-8 py-12 text-center md:px-12 md:py-16 dark:bg-slate-900">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 md:text-3xl">Ready to simplify your journey?</h3>
            <p className="mt-4 text-slate-600 dark:text-slate-300 max-w-xl mx-auto">Join teams who are already managing renewals, approvals, and documents from a single secure portal.</p>
            <a
              href="#/login"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-linear-to-r from-primary-700 to-primary-600 px-8 py-4 text-base font-bold text-white shadow-md transition-transform hover:scale-105"
            >
              User login
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
    <section id="benefits" className="relative mx-auto w-full max-w-6xl px-6 py-24 bg-white dark:bg-slate-950">
      <div className="grid gap-16 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 md:text-4xl">
            Benefits that make renewal simple and reliable
          </h2>
          <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
            A smooth compliance experience with fewer delays, better visibility, and secure document handling.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <span className="rounded-full bg-primary-100 px-4 py-2 text-sm font-bold text-primary-700 dark:bg-primary-950/20 dark:text-primary-300">Fast approvals</span>
            <span className="rounded-full bg-primary-50 px-4 py-2 text-sm font-bold text-slate-700 dark:bg-slate-900/80 dark:text-slate-200">Document vault</span>
            <span className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-bold text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-300">Automated alerts</span>
          </div>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-primary-50 p-5 shadow-sm transition-all duration-300 hover:shadow-md dark:border-slate-700 dark:bg-primary-950/20">
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className="h-20 w-20 rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-slate-700 dark:bg-slate-900" />
              <div className="text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Secure document vault</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  Your renewal documents stay protected, easy to access, and ready for every application.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {points.map((p) => (
            <div key={p.title} className="rounded-3xl border border-slate-200 bg-[#F4F8FF] p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-primary-200 hover:-translate-y-0.5 dark:border-slate-700 dark:bg-slate-900/90">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{p.title}</h3>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p.desc}</p>
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
    <section id="faq" className="bg-primary-50 py-24 dark:bg-slate-950">
      <div className="mx-auto w-full max-w-4xl px-6">
        <div className="text-center">
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg font-medium text-slate-600 dark:text-slate-300">Everything you need to know about your journey.</p>
        </div>

        <div className="mt-12 grid gap-4">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all open:border-primary-200 open:bg-primary-50 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:open:bg-slate-950"
            >
              <summary className="cursor-pointer list-none text-base font-bold text-slate-900 dark:text-slate-100 focus-visible:outline-none">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-300 transition-transform duration-300 group-open:rotate-180">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </span>
              </summary>
              <div className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 pr-12">
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
    <footer className="bg-white pb-8 pt-16 border-t border-slate-200 dark:bg-slate-950 dark:border-slate-700">
      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-3xl bg-primary-600 text-white shadow-md">
                <span className="text-sm font-bold tracking-wider">R</span>
              </div>
              <div>
                <div className="text-base font-semibold text-slate-900 dark:text-slate-100 tracking-tight">Renewal Portal</div>
                <div className="text-xs uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Enterprise renewal system</div>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              A secure platform for managing business renewals, approvals, and document workflows in one place.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Navigate</h4>
            <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li><a href="#features" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Features</a></li>
              <li><a href="#how" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Process</a></li>
              <li><a href="#benefits" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Benefits</a></li>
              <li><a href="#faq" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Connect</h4>
            <ul className="mt-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-primary-700 dark:hover:text-primary-300 transition-colors">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Renewal Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export function SupportWidget() {
  return (
    <div className="fixed bottom-6 right-6 z-50 hidden w-full max-w-xs lg:block">
      <div className="rounded-4xl border border-primary-100 bg-white p-4 shadow-2xl shadow-slate-200 dark:border-primary-900/30 dark:bg-slate-900 dark:shadow-slate-950/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-primary-700 dark:text-primary-300">How may we help you today?</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Instant support for renewals, compliance, and document questions.</p>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-3xl bg-primary-600 text-white shadow-md">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
