export function PaymentForm({ value, totalAmount, onChange, disabled = false }) {
  const payment = {
    mode: 'Razorpay',
    transactionId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    amountPaid: totalAmount || 0,
    receiptFile: '',
    paymentStatus: 'Pending Verification',
    ...(value || {}),
  }

  function update(patch) {
    onChange?.({ ...payment, ...patch })
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <label className="text-sm font-semibold text-slate-700">
        Payment mode
        <select
          value={payment.mode}
          disabled={disabled}
          onChange={(event) => update({ mode: event.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
        >
          <option>Razorpay</option>
          <option>UPI</option>
          <option>Card</option>
          <option>Net Banking</option>
        </select>
      </label>

      {payment.mode !== 'Razorpay' ? (
        <label className="text-sm font-semibold text-slate-700">
          Transaction ID / UTR number
          <input
            value={payment.transactionId}
            disabled={disabled}
            onChange={(event) => update({ transactionId: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
            placeholder="Example: UTR123456789"
          />
        </label>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          Razorpay payment will be collected when you submit the application.
        </div>
      )}

      <label className="text-sm font-semibold text-slate-700">
        Payment date
        <input
          type="date"
          value={payment.paymentDate}
          disabled={disabled}
          onChange={(event) => update({ paymentDate: event.target.value })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700">
        Amount paid
        <input
          type="number"
          min="0"
          value={payment.amountPaid}
          disabled={disabled}
          onChange={(event) => update({ amountPaid: Number(event.target.value || 0) })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </label>

      <label className="text-sm font-semibold text-slate-700 md:col-span-2">
        Upload payment screenshot / receipt optional
        <input
          type="file"
          disabled={disabled}
          accept="image/*,.pdf"
          onChange={(event) => update({ receiptFile: event.target.files?.[0]?.name || '' })}
          className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
        />
        {payment.receiptFile ? (
          <span className="mt-1 block text-xs text-slate-500">Selected: {payment.receiptFile}</span>
        ) : null}
      </label>
    </div>
  )
}
