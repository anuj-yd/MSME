import { calculateFeeDetails } from '../lib/applicationRecords.js'

export function FeeCalculator({ value, onChange, licenseTypes = [] }) {
  const fee = calculateFeeDetails(value)

  function update(patch) {
    onChange?.(calculateFeeDetails({ ...fee, ...patch }))
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          License / registration type
          <select
            value={fee.licenseType}
            onChange={(event) => update({ licenseType: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option value="">Select type</option>
            {licenseTypes.map((item) => (
              <option key={item.value} value={item.label}>{item.label}</option>
            ))}
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Enterprise category
          <select
            value={fee.enterpriseCategory}
            onChange={(event) => update({ enterpriseCategory: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option>Micro</option>
            <option>Small</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Application type
          <select
            value={fee.applicationType}
            onChange={(event) => update({ applicationType: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            <option>Renewal</option>
            <option>Update</option>
          </select>
        </label>

        <label className="text-sm font-semibold text-slate-700">
          Delay days
          <input
            type="number"
            min="0"
            value={fee.delayDays}
            onChange={(event) => update({ delayDays: event.target.value })}
            className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </label>
      </div>

      <PaymentSummary fee={fee} />
    </div>
  )
}

export function PaymentSummary({ fee }) {
  const details = calculateFeeDetails(fee)

  return (
    <div className="rounded-2xl border border-primary-100 bg-primary-50/60 p-5">
      <div className="text-sm font-bold text-slate-900">Payment summary</div>
      <div className="mt-4 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Base Fee</span>
          <span className="font-bold text-slate-900">Rs. {details.baseFee}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600">Late Fee</span>
          <span className="font-bold text-slate-900">Rs. {details.lateFee}</span>
        </div>
        <div className="border-t border-primary-200 pt-3 flex items-center justify-between">
          <span className="font-bold text-slate-900">Total Amount</span>
          <span className="text-xl font-black text-primary-700">Rs. {details.totalAmount}</span>
        </div>
      </div>
    </div>
  )
}
