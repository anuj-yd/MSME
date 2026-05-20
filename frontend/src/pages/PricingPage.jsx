import { useMemo, useState } from 'react'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import { loadRazorpayCheckout } from '../lib/razorpay.js'

function PricingPage() {
  const { authToken, user } = useAppState()
  const { createRazorpayOrder, verifyRazorpayPayment } = useAppActions()
  const [loading, setLoading] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const plans = useMemo(
    () => [
      {
        id: 'premium_monthly',
        name: 'Premium Monthly',
        price: 'Rs. 99',
        cadence: 'per month',
        desc: 'Unlock downloads, full details, and priority support.',
        highlight: false,
        savings: 'Flexible monthly access',
        features: ['Detailed renewal reports', 'Full application timeline', 'Priority support', 'Certificate download access'],
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        price: 'Rs. 999',
        cadence: 'per year',
        desc: 'Best value for year-round renewals.',
        highlight: true,
        savings: 'Save compared with monthly billing',
        features: ['Everything in monthly', 'Best for multiple renewals', 'Year-round compliance support', 'Lower annual cost'],
      },
    ],
    [],
  )

  async function createOrder(purpose) {
    setError('')
    setMessage('')
    setLoading(purpose)
    try {
      const ok = await loadRazorpayCheckout()
      if (!ok) throw new Error('Failed to load Razorpay Checkout script.')

      const data = await createRazorpayOrder(purpose)
      const order = data?.order
      const keyId = data?.key_id

      if (!order?.id || !keyId) throw new Error('Order create response is missing order/key.')

      const rz = new window.Razorpay({
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Renewal Portal for MSEs',
        description: purpose === 'premium_yearly' ? 'Premium Yearly' : 'Premium Monthly',
        order_id: order.id,
        method: {
          netbanking: true,
          card: false,
          upi: false,
          wallet: false,
          paylater: false,
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: { color: '#1E5AA6' },
        handler: async (response) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            setMessage('Payment verified. Premium unlocked. Redirecting to dashboard...')
            setTimeout(() => {
              window.location.hash = '#/dashboard'
            }, 700)
          } catch (e) {
            setError(e?.response?.data?.message || e.message || 'Payment verify failed')
          }
        },
      })

      rz.on('payment.failed', (resp) => {
        const msg =
          resp?.error?.description ||
          resp?.error?.reason ||
          'Payment failed. Please try again.'
        setError(msg)
      })

      rz.open()
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors?.razorpay?.[0] ||
        err.message
      setError(msg || 'Failed to create order')
    } finally {
      setLoading('')
    }
  }

  return (
    <div className="relative min-h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary-200/30 dark:bg-primary-950/15 blur-[110px]" />
        <div className="absolute -right-24 top-40 h-[460px] w-[460px] rounded-full bg-emerald-200/25 dark:bg-emerald-950/10 blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/50 dark:border-slate-850 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <a href="#/dashboard" className="flex items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400">
            <div className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-primary-600 to-indigo-800 text-white shadow-md">
              <span className="text-sm font-bold tracking-wider">RP</span>
            </div>
            <div>
              <div className="text-base font-bold tracking-tight text-slate-900 dark:text-white">Premium Access</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Renewal Portal for MSEs</div>
            </div>
          </a>
          <a className="rounded-xl border border-slate-205 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-bold text-slate-800 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors" href="#/dashboard">
            Dashboard
          </a>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-6">
            <div>
              <div className="inline-flex rounded-full border border-primary-100 dark:border-primary-900/35 bg-white/80 dark:bg-slate-900 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary-700 dark:text-primary-400 shadow-sm">
                Premium plan
              </div>
              <h1 className="mt-5 max-w-xl text-4xl font-black tracking-tight text-slate-950 dark:text-white md:text-5xl">
                Unlock faster renewals and complete compliance records.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 dark:text-slate-400">
                Get report downloads, complete application details, certificate access, and priority support for your renewal workflow.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniStat label="Reports" value="CSV" />
              <MiniStat label="Support" value="Priority" />
              <MiniStat label="Access" value="Full" />
            </div>

            {!authToken ? (
              <StatusBox tone="warn">Please login first to create an order.</StatusBox>
            ) : null}
            {error ? <StatusBox tone="error">{error}</StatusBox> : null}
            {message ? <StatusBox tone="success">{message}</StatusBox> : null}

            <div className="rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/80 dark:bg-slate-900/60 p-5 text-sm text-slate-700 dark:text-slate-350 shadow-sm backdrop-blur">
              <div className="font-bold text-slate-905 dark:text-white">Checkout note</div>
              <p className="mt-2 leading-relaxed">
                Razorpay checkout is configured for Net Banking in test mode. Backend must have <code>RAZORPAY_KEY_ID</code> and <code>RAZORPAY_KEY_SECRET</code> configured.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {plans.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                loading={loading === p.id}
                disabled={!!loading || !authToken}
                onPay={() => createOrder(p.id)}
              />
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-3xl border border-white/70 dark:border-slate-850 bg-white/70 dark:bg-slate-900/40 p-6 shadow-sm backdrop-blur-xl">
          <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">What premium unlocks</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Designed for repeated compliance work, not just one-time checkout.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {[
              ['Detailed reports', 'Download renewal summaries and keep records audit-ready.'],
              ['Full application details', 'View complete status timeline and submitted data.'],
              ['Certificate access', 'Download certificates after approval and verification.'],
              ['Priority support', 'Get faster help for renewal and document issues.'],
            ].map(([title, desc]) => (
              <div key={title} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
                <div className="text-sm font-bold text-slate-900 dark:text-white">{title}</div>
                <div className="mt-2 text-sm leading-relaxed text-slate-655 dark:text-slate-400">{desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

function PlanCard({ plan, loading, disabled, onPay }) {
  return (
    <div
      className={[
        'relative overflow-hidden rounded-3xl border bg-white dark:bg-slate-900/40 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700',
        plan.highlight ? 'border-primary-200 dark:border-primary-800/80 ring-4 ring-primary-500/10 dark:ring-primary-950/20' : 'border-slate-200 dark:border-slate-850',
      ].join(' ')}
    >
      {plan.highlight ? (
        <div className="absolute right-4 top-4 rounded-full bg-primary-600 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
          Best value
        </div>
      ) : null}

      <div className="pr-20">
        <div className="text-sm font-black uppercase tracking-wider text-primary-700 dark:text-primary-400">{plan.name}</div>
        <p className="mt-3 min-h-12 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{plan.desc}</p>
      </div>

      <div className="mt-6">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-black tracking-tight text-slate-950 dark:text-white">{plan.price}</span>
          <span className="pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{plan.cadence}</span>
        </div>
        <div className="mt-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{plan.savings}</div>
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm font-medium text-slate-700 dark:text-slate-300">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-black text-emerald-700 dark:text-emerald-400">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onPay}
        disabled={disabled}
        className={[
          'mt-7 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm font-black text-white dark:text-slate-900 shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98]',
          plan.highlight
            ? 'bg-gradient-to-r from-primary-600 to-indigo-600 shadow-primary-500/25'
            : 'bg-slate-900 dark:bg-white shadow-slate-900/15 hover:bg-slate-800 dark:hover:bg-slate-100',
        ].join(' ')}
      >
        {loading ? 'Creating order...' : 'Pay with Razorpay'}
      </button>
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/70 dark:border-slate-850 bg-white/70 dark:bg-slate-900/50 p-4 shadow-sm backdrop-blur">
      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
      <div className="mt-1 text-lg font-black text-slate-900 dark:text-white">{value}</div>
    </div>
  )
}

function StatusBox({ tone, children }) {
  const className =
    tone === 'error'
      ? 'border-rose-200 dark:border-rose-900/35 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-455'
      : tone === 'success'
        ? 'border-emerald-200 dark:border-emerald-900/35 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-808 dark:text-emerald-400'
        : 'border-amber-200 dark:border-amber-900/35 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-400'

  return (
    <div className={`rounded-2xl border p-4 text-sm font-medium ${className}`}>
      {children}
    </div>
  )
}

export default PricingPage
