const STORAGE_KEY = 'msme_application_records'

export const APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'Payment Pending',
  'Under Review',
  'Approved',
  'Rejected',
  'Certificate Ready',
]

export function readApplicationRecords() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeApplicationRecords(records) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  window.dispatchEvent(new CustomEvent('application-records-change'))
}

export function normalizeStatus(status) {
  const raw = String(status || '').toLowerCase()
  if (raw === 'draft') return 'Draft'
  if (raw === 'submitted') return 'Submitted'
  if (raw === 'payment_pending') return 'Payment Pending'
  if (raw === 'in_review') return 'Under Review'
  if (raw === 'approved') return 'Approved'
  if (raw === 'rejected') return 'Rejected'
  if (raw === 'certificate_ready' || raw === 'completed') return 'Certificate Ready'
  return APPLICATION_STATUSES.includes(status) ? status : 'Draft'
}

export function generateTrackingId() {
  const part = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `MSME-${new Date().getFullYear()}-${part}`
}

export function defaultFeeDetails() {
  return {
    licenseType: '',
    enterpriseCategory: 'Micro',
    applicationType: 'Renewal',
    delayDays: 0,
    baseFee: 500,
    lateFee: 0,
    totalAmount: 500,
  }
}

export function calculateFeeDetails(input = {}) {
  const enterpriseCategory = input.enterpriseCategory || 'Micro'
  const applicationType = input.applicationType || 'Renewal'
  const delayDays = Math.max(0, Number(input.delayDays || 0))
  const categoryFee = enterpriseCategory === 'Small' ? 900 : 500
  const typeFee = applicationType === 'Update' ? 250 : categoryFee
  const lateFee = delayDays > 0 ? delayDays * 20 : 0

  return {
    ...defaultFeeDetails(),
    ...input,
    enterpriseCategory,
    applicationType,
    delayDays,
    baseFee: Number(input.baseFee || typeFee),
    lateFee,
    totalAmount: Number(input.baseFee || typeFee) + lateFee,
  }
}

export function defaultPaymentDetails(amount = 0) {
  return {
    mode: 'UPI',
    transactionId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    amountPaid: amount,
    receiptFile: '',
    paymentStatus: 'Pending Verification',
  }
}

export function validatePaymentDetails(paymentDetails, totalAmount) {
  if (!paymentDetails?.mode) return 'Select payment mode.'
  if (!String(paymentDetails?.transactionId || '').trim()) return 'Enter Transaction ID / UTR number.'
  if (!paymentDetails?.paymentDate) return 'Select payment date.'
  if (Number(paymentDetails?.amountPaid || 0) < Number(totalAmount || 0)) return 'Amount paid must match the total payable amount.'
  return ''
}

export function getApplicationRecord(id) {
  return readApplicationRecords().find((record) => record.id === id) || null
}

export function findApplicationByTrackingId(trackingId) {
  const normalized = String(trackingId || '').trim().toUpperCase()
  return readApplicationRecords().find((record) => record.trackingId === normalized) || null
}

export function saveApplicationRecord(nextRecord) {
  const records = readApplicationRecords()
  const now = new Date().toISOString()
  const existing = records.find((record) => record.id === nextRecord.id)
  const merged = {
    ...(existing || {}),
    ...nextRecord,
    trackingId: nextRecord.trackingId || existing?.trackingId || generateTrackingId(),
    createdAt: existing?.createdAt || nextRecord.createdAt || now,
    updatedAt: now,
  }

  writeApplicationRecords([
    merged,
    ...records.filter((record) => record.id !== merged.id),
  ])

  return merged
}

export function ensureApplicationRecord({ renewal, type, user, fields = {} }) {
  if (!renewal) return null
  const id = renewal._id || renewal.id
  const existing = getApplicationRecord(id)
  const feeDetails = calculateFeeDetails(existing?.feeDetails || {
    licenseType: type?.name || renewal.renewal_type_code || '',
  })
  const paymentDetails = existing?.paymentDetails || defaultPaymentDetails(feeDetails.totalAmount)

  return saveApplicationRecord({
    id,
    userId: user?.id || user?._id || renewal.user_id || '',
    user: user ? { id: user.id || user._id || '', name: user.name || '', email: user.email || '' } : existing?.user,
    renewalTypeCode: renewal.renewal_type_code || existing?.renewalTypeCode || '',
    renewalTypeName: type?.name || existing?.renewalTypeName || renewal.renewal_type_code || '',
    businessName: fields.business_name || fields.enterprise_name || existing?.businessName || '',
    registrationNumber: fields.registration_no || fields.udyam_no || existing?.registrationNumber || '',
    enterpriseCategory: feeDetails.enterpriseCategory,
    applicationType: feeDetails.applicationType,
    feeDetails,
    paymentDetails,
    status: normalizeStatus(renewal.status),
    certificateStatus: existing?.certificateStatus || 'Not Ready',
    rejectionReason: existing?.rejectionReason || '',
    trackingId: fields.tracking_id || existing?.trackingId,
    submittedAt: renewal.submitted_at || existing?.submittedAt || null,
  })
}

export function buildCertificateText(record) {
  const lines = [
    'MSME Renewal Portal Certificate',
    '',
    `Business Name: ${record.businessName || 'Not provided'}`,
    `Registration / License Number: ${record.registrationNumber || 'Not provided'}`,
    `Tracking ID: ${record.trackingId}`,
    `Approval Date: ${record.approvalDate || new Date().toLocaleDateString()}`,
    `Verification ID: VERIFY-${record.trackingId}`,
    '',
    'QR Code Placeholder: [Scan verification ID on official portal]',
  ]
  return lines.join('\n')
}

export function downloadMockCertificate(record) {
  const text = buildCertificateText(record)
  const blob = new Blob([text], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${record.trackingId || 'certificate'}.pdf`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
