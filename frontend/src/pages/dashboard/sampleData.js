export function getSampleRenewals() {
  return [
    {
      id: 'r1',
      title: 'Trade License Renewal',
      status: 'In review',
      due: '15 days',
      tone: 'info',
    },
    {
      id: 'r2',
      title: 'Udyam Update',
      status: 'Approved',
      due: 'Completed',
      tone: 'ok',
    },
    {
      id: 'r3',
      title: 'Shop & Establishment',
      status: 'Action needed',
      due: '3 days',
      tone: 'warn',
    },
  ]
}

export function statusPillClass(tone) {
  if (tone === 'ok') return 'bg-emerald-600/10 text-emerald-700'
  if (tone === 'warn') return 'bg-amber-500/15 text-amber-800'
  return 'bg-[#1E5AA6]/10 text-[#1E5AA6]'
}

