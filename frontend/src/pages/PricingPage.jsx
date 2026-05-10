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
        price: '₹99',
        desc: 'Unlock downloads, full details, and priority support.',
      },
      {
        id: 'premium_yearly',
        name: 'Premium Yearly',
        price: '₹999',
        desc: 'Best value for year-round renewals.',
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
            setMessage('Payment verified. Premium unlocked. Redirecting to dashboard…')
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
    <div className="min-h-dvh bg-[#f7f9fc] text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-12">
        <a className="text-sm text-slate-600 hover:underline" href="#/dashboard">
          ← Back to dashboard
        </a>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:items-start">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Go Premium</h1>
            <p className="mt-3 text-slate-700">
              Pay once and unlock full access. Razorpay integration will be connected
              using test keys for demo. Production (webhooks/KYC) later.
            </p>
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
              Demo tip: checkout is configured to use <span className="font-semibold">Netbanking</span> so the payment can
              succeed reliably in test mode.
            </div>

            {!authToken ? (
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                Please login first to create an order.
              </div>
            ) : null}

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {message ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                {message}
              </div>
            ) : null}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              <div className="font-semibold">Required env (backend)</div>
              <ul className="mt-2 list-disc pl-5">
                <li>
                  <code>RAZORPAY_KEY_ID</code>
                </li>
                <li>
                  <code>RAZORPAY_KEY_SECRET</code>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid gap-4">
            {plans.map((p) => (
              <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="mt-1 text-sm text-slate-600">{p.desc}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold tracking-tight">{p.price}</div>
                    <div className="text-xs text-slate-500">INR</div>
                  </div>
                </div>
                <button
                  onClick={() => createOrder(p.id)}
                  disabled={!!loading || !authToken}
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:scale-105 shadow-md shadow-primary-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading === p.id ? 'Creating order…' : 'Pay with Razorpay'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PricingPage
