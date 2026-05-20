export function PaymentForm({ value, totalAmount, onChange }) {
  const payment = {
    transactionId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    receiptFile: '',
    paymentStatus: 'Pending Verification',
    ...(value || {}),
    mode: 'Razorpay',
    amountPaid: totalAmount || value?.amountPaid || 0,
  }

  function update(patch) {
    onChange?.({ ...payment, ...patch })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="text-sm font-semibold text-slate-700">
        Payment mode
        <div className="mt-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900">
          Razorpay
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        Razorpay payment will be collected when you submit the application.
      </div>

      <label className="text-sm font-semibold text-slate-700">
        Payment date
        <input
          type="date"
          value={payment.paymentDate}
          disabled
          onChange={(event) => update({ paymentDate: event.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700">
        Amount paid
        <input
          type="number"
          min="0"
          value={totalAmount || payment.amountPaid || 0}
          disabled
          onChange={(event) => update({ amountPaid: Number(event.target.value || 0) })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </label>
    </div>
  )
}
