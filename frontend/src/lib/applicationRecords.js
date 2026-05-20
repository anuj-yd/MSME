// Lazy-load `jspdf` inside the download function to avoid import-time failures

const STORAGE_KEY = 'msme_application_records'

export const APPLICATION_STATUSES = [
  'Draft',
  'Submitted',
  'Payment Verified',
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
  if (raw === 'payment_pending' || raw === 'payment_verified') return 'Payment Verified'
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
    mode: 'Razorpay',
    transactionId: '',
    paymentDate: new Date().toISOString().slice(0, 10),
    amountPaid: amount,
    receiptFile: '',
    paymentStatus: 'Pending Verification',
  }
}

export function validatePaymentDetails(paymentDetails, totalAmount) {
  if (!paymentDetails?.mode) return 'Select payment mode.'
  if (paymentDetails.mode === 'Razorpay') {
    if (Number(totalAmount || 0) <= 0) return 'Payment amount must be greater than zero.'
    return ''
  }
  if (!paymentDetails?.paymentDate) return 'Select payment date.'
  if (Number(paymentDetails?.amountPaid || 0) < Number(totalAmount || 0)) return 'Amount paid must match the total payable amount.'
  if (!String(paymentDetails?.transactionId || '').trim()) {
    return 'Enter Transaction ID / UTR number.'
  }
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

export async function downloadMockCertificate(record) {
  try {
    // dynamic import to avoid import-time failures
    const mod = await import('jspdf')
    const jsPDF = mod.jsPDF || mod.default?.jsPDF || mod.default || mod

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    // jsPDF exposes page size in different shapes depending on version/build.
    // Use safe fallbacks to obtain width/height.
    const pageSize = doc?.internal?.pageSize || doc?.internal?.pageSizePtr || {}
    const w = (typeof pageSize.getWidth === 'function') ? pageSize.getWidth() : (pageSize.width || pageSize.w || 595.28)
    const h = (typeof pageSize.getHeight === 'function') ? pageSize.getHeight() : (pageSize.height || pageSize.h || 841.89)

    // Colors
    const navy = [12, 48, 83]
    const lightNavy = [22, 66, 110]
    const gold = [212, 175, 55]

    // Background border
    doc.setFillColor(...navy)
    doc.rect(0, 0, w, h, 'F')

    // Inner white panel
    const margin = 28
    doc.setFillColor(255, 255, 255)
    doc.rect(margin, margin, w - margin * 2, h - margin * 2, 'F')

    // Left decorative panel
    const leftW = 220
    doc.setFillColor(...lightNavy)
    doc.rect(margin + 12, margin + 12, leftW, h - (margin + 12) * 2, 'F')

    // Main white area coordinates
    const innerX = margin + 12 + leftW + 20
    const innerWidth = w - (innerX + margin + 12)

    // Title
    doc.setTextColor(...navy)
    doc.setFont('times', 'normal')
    doc.setFontSize(36)
    doc.text('CERTIFICATE OF APPROVAL', innerX + innerWidth / 2, margin + 90, { align: 'center' })

    // Subtitle
    doc.setFontSize(12)
    doc.setFont('times', 'normal')
    doc.text('This certificate is proudly presented to', innerX + innerWidth / 2, margin + 130, { align: 'center' })

    // Recipient name (business name)
    const recipient = record?.businessName || '—'
    doc.setFontSize(34)
    doc.setFont('times', 'italic')
    doc.text(recipient, innerX + innerWidth / 2, margin + 180, { align: 'center' })

    // Detail line
    doc.setFontSize(12)
    doc.setFont('times', 'normal')
    const licenseLine = `Registration / License No: ${record.registrationNumber || '—'}`
    const trackingLine = `Tracking ID: ${record.trackingId || '—'}`
    const approvalLine = `Approval Date: ${record.approvalDate || new Date().toLocaleDateString()}`
    doc.text(licenseLine, innerX + 40, margin + 230)
    doc.text(trackingLine, innerX + 40, margin + 250)
    doc.text(approvalLine, innerX + 40, margin + 270)

    // Organization and website
    const org = (document.title && document.title.trim()) || window.location.hostname || 'MSME Portal'
    const site = window.location.origin || ''
    doc.setFontSize(11)
    doc.text(`${org} • ${site}`, innerX + innerWidth / 2, margin + 300, { align: 'center' })

    // Signature lines
    const sigY = h - margin - 140
    const sigWidth = 180
    // Left signature
    const leftSigX = innerX + 40
    doc.setDrawColor(...navy)
    doc.setLineWidth(0.8)
    doc.line(leftSigX, sigY, leftSigX + sigWidth, sigY)
    doc.setFontSize(11)
    doc.text('Authorized Signatory', leftSigX, sigY + 18)
    doc.text(org, leftSigX, sigY + 34)
    // Right signature
    const rightSigX = innerX + innerWidth - 40 - sigWidth
    doc.line(rightSigX, sigY, rightSigX + sigWidth, sigY)
    doc.text('Registrar', rightSigX, sigY + 18)
    doc.text(org, rightSigX, sigY + 34)

    // Gold seal (circle) at top-right of inner area
    const sealX = innerX + innerWidth - 100
    const sealY = margin + 140
    doc.setFillColor(...gold)
    doc.circle(sealX, sealY, 34, 'F')
    doc.setFillColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text('APPROVED', sealX, sealY + 4, { align: 'center' })

    // Footer small note
    doc.setFontSize(9)
    doc.setTextColor(120, 120, 120)
    doc.text('This certificate is system-generated. Verify at ' + site, innerX + 40, h - margin - 20)

    const fileName = `${record.trackingId || 'certificate'}.pdf`
    doc.save(fileName)
  } catch (e) {
    console.error('Certificate generation failed:', e)
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
}
