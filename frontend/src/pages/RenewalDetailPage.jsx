import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import { Pill } from './renewals/RenewalComponents.jsx'
import { FeeCalculator } from '../components/FeeCalculator.jsx'
import { PaymentForm } from '../components/PaymentForm.jsx'
import { ApplicationTracker } from '../components/ApplicationTracker.jsx'
import { CertificateDownload } from '../components/CertificateDownload.jsx'
import {
  calculateFeeDetails,
  defaultPaymentDetails,
  ensureApplicationRecord,
  normalizeStatus,
  saveApplicationRecord,
  validatePaymentDetails,
} from '../lib/applicationRecords.js'
import { loadRazorpayCheckout } from '../lib/razorpay.js'
import { subscribeToApplicationUpdates } from '../lib/realtime.js'

const FORM_STEPS = [
  { id: 'basic', title: 'Basic Details' },
  { id: 'business', title: 'Business Details' },
  { id: 'address', title: 'Address Details' },
  { id: 'bank', title: 'Bank Details' },
  { id: 'activity', title: 'Activity / NIC Code Details' },
  { id: 'review', title: 'Review & Submit' },
]

const REVIEW_STEP_INDEX = FORM_STEPS.length - 1
const DRAFT_SAVE_DELAY_MS = 600

function RenewalDetailPage({ id }) {
  const { documents, user, renewalTypes } = useAppState()
  const { getRenewal, updateRenewalDraft, submitRenewal, refreshRenewals, createRazorpayOrder, verifyRazorpayPayment } = useAppActions()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [renewal, setRenewal] = useState(null)
  const [type, setType] = useState(null)

  const [selectedDocs, setSelectedDocs] = useState([])
  const [fields, setFields] = useState({})
  const [currentStep, setCurrentStep] = useState(0)
  const [touchedFields, setTouchedFields] = useState({})
  const [formError, setFormError] = useState('')
  const [draftMessage, setDraftMessage] = useState('')
  const [feeDetails, setFeeDetails] = useState(calculateFeeDetails())
  const [paymentDetails, setPaymentDetails] = useState(defaultPaymentDetails())
  const [paymentMessage, setPaymentMessage] = useState('')
  const [applicationRecord, setApplicationRecord] = useState(null)

  const draftKey = useMemo(() => `renewal-draft:${id}`, [id])

  const submitButtonLabel = submitting
    ? 'Submitting...'
    : paymentDetails.mode === 'Razorpay' && currentStep === REVIEW_STEP_INDEX
      ? 'Pay & Submit'
      : currentStep === REVIEW_STEP_INDEX
        ? 'Submit Application'
        : 'Review & Submit'

  useEffect(() => {
    let mounted = true
    async function load() {
      setError('')
      setLoading(true)
      try {
        const res = await getRenewal(id)
        if (!mounted) return
        const loadedRenewal = res.renewal
        let nextFields = loadedRenewal?.fields || {}
        let nextDocs = loadedRenewal?.document_ids || []
        let nextStep = 0

        // Frontend-only draft restore; backend field names and payload shape stay unchanged.
        if (loadedRenewal?.status === 'draft') {
          try {
            const saved = JSON.parse(localStorage.getItem(draftKey) || 'null')
            if (saved && typeof saved === 'object') {
              if (saved.fields && typeof saved.fields === 'object') nextFields = saved.fields
              if (Array.isArray(saved.documentIds)) nextDocs = saved.documentIds
              if (Number.isInteger(saved.currentStep)) {
                nextStep = Math.min(Math.max(saved.currentStep, 0), REVIEW_STEP_INDEX)
              }
              setDraftMessage('Draft restored from this browser.')
            }
          } catch {
            localStorage.removeItem(draftKey)
          }
        }

        setRenewal(loadedRenewal)
        setType(res.type)
        setFields(nextFields)
        setSelectedDocs(nextDocs)
        const record = ensureApplicationRecord({
          renewal: loadedRenewal,
          type: res.type,
          user,
          fields: nextFields,
        })
        if (record) {
          setApplicationRecord(record)
          setFeeDetails(calculateFeeDetails(record.feeDetails))
          setPaymentDetails({
            ...defaultPaymentDetails(record.feeDetails?.totalAmount),
            ...(record.paymentDetails || {}),
          })
        }
        setCurrentStep(nextStep)
        setTouchedFields({})
        setFormError('')
      } catch (e) {
        setError(e?.response?.data?.message || e.message || 'Failed to load')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [getRenewal, id, draftKey, user])

  useEffect(() => {
    if (!renewal || renewal.status === 'draft') return undefined

    const unsubscribe = subscribeToApplicationUpdates(async () => {
      try {
        const res = await getRenewal(id)
        const latest = res?.renewal
        if (!latest) return
        setRenewal(latest)
        const fieldsFromApi = latest.fields || {}
        const latestStatus = normalizeStatus(latest.status)
        setApplicationRecord((current) => saveApplicationRecord({
          ...(current || {}),
          id: latest._id || latest.id || id,
          renewalTypeCode: latest.renewal_type_code || current?.renewalTypeCode || '',
          renewalTypeName: res?.type?.name || type?.name || current?.renewalTypeName || latest.renewal_type_code || '',
          businessName: fieldsFromApi.business_name || fieldsFromApi.enterprise_name || current?.businessName || '',
          registrationNumber: fieldsFromApi.registration_no || fieldsFromApi.udyam_no || current?.registrationNumber || '',
          paymentDetails: fieldsFromApi.payment_details || current?.paymentDetails,
          status: latestStatus,
          certificateStatus: latestStatus === 'Certificate Ready' ? 'Ready' : current?.certificateStatus || 'Not Ready',
          trackingId: fieldsFromApi.tracking_id || current?.trackingId,
          submittedAt: latest.submitted_at || current?.submittedAt,
        }))
      } catch {
        // Keep the currently visible status if a background refresh fails.
      }
    })

    return () => {
      try { unsubscribe() } catch (e) {}
    }
  }, [renewal, getRenewal, id, type])

  const requiredTags = useMemo(() => (type?.required_document_tags || []).filter(Boolean), [type])
  const schemaItems = useMemo(() => (Array.isArray(type?.fields_schema) ? type.fields_schema : []), [type])
  const fieldsByStep = useMemo(() => groupFieldsByStep(schemaItems), [schemaItems])
  const validationErrors = useMemo(() => validateFields(schemaItems, fields), [schemaItems, fields])
  const currentStepFields = useMemo(
    () => fieldsByStep[FORM_STEPS[currentStep]?.id] || [],
    [fieldsByStep, currentStep],
  )
  const currentStepErrors = useMemo(
    () => getStepErrors(currentStepFields, validationErrors),
    [currentStepFields, validationErrors],
  )
  const firstInvalidStep = useMemo(
    () => getFirstInvalidStep(fieldsByStep, validationErrors),
    [fieldsByStep, validationErrors],
  )

  const docsById = useMemo(() => {
    const map = new Map()
    for (const d of documents || []) map.set(d._id || d.id, d)
    return map
  }, [documents])

  const selected = useMemo(
    () => (selectedDocs || []).map((did) => docsById.get(did)).filter(Boolean),
    [selectedDocs, docsById],
  )

  const selectedTagSet = useMemo(() => {
    const set = new Set()
    for (const d of selected) for (const t of d.tags || []) set.add(t)
    return set
  }, [selected])

  const missingTags = useMemo(
    () => requiredTags.filter((t) => !selectedTagSet.has(t)),
    [requiredTags, selectedTagSet],
  )

  const hasFieldErrors = Object.keys(validationErrors).length > 0
  const canReview = renewal?.status === 'draft' && !hasFieldErrors
  const paymentError = validatePaymentDetails(paymentDetails, feeDetails.totalAmount)
  const canSubmit = canReview && missingTags.length === 0 && !paymentError

  useEffect(() => {
    if (!renewal || renewal.status !== 'draft' || loading) return undefined

    const timer = window.setTimeout(() => {
      const payload = {
        fields,
        documentIds: selectedDocs,
        currentStep,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(draftKey, JSON.stringify(payload))
      setDraftMessage('Draft saved automatically')
    }, DRAFT_SAVE_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [fields, selectedDocs, currentStep, renewal, loading, draftKey])

  function updateField(key, value) {
    setFields((prev) => ({ ...(prev || {}), [key]: value }))
    setTouchedFields((prev) => ({ ...prev, [key]: true }))
    setFormError('')
  }

  function markFieldTouched(key) {
    setTouchedFields((prev) => ({ ...prev, [key]: true }))
  }

  function touchStepFields(items = currentStepFields) {
    setTouchedFields((prev) => {
      const next = { ...prev }
      for (const field of items) next[field.key] = true
      return next
    })
  }

  function touchAllInvalidFields() {
    setTouchedFields((prev) => {
      const next = { ...prev }
      for (const key of Object.keys(validationErrors)) next[key] = true
      return next
    })
  }

  function goToNextStep() {
    if (currentStep === REVIEW_STEP_INDEX) return

    if (Object.keys(currentStepErrors).length) {
      touchStepFields()
      setFormError('Please complete the required fields in this step before continuing.')
      return
    }

    setFormError('')
    setCurrentStep((step) => Math.min(step + 1, REVIEW_STEP_INDEX))
  }

  function goToPreviousStep() {
    setFormError('')
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  function clearLocalDraft() {
    localStorage.removeItem(draftKey)
    setDraftMessage('Local draft cleared.')
  }

  function reviewOrSubmit() {
    if (currentStep !== REVIEW_STEP_INDEX) {
      if (!canReview) {
        touchAllInvalidFields()
        setCurrentStep(firstInvalidStep)
        setFormError('Please fix validation errors before review.')
        return
      }

      setFormError('')
      setCurrentStep(REVIEW_STEP_INDEX)
      return
    }

    onSubmit()
  }

  async function persistDraft() {
    if (!renewal) return
    const calculatedFeeDetails = calculateFeeDetails({
      ...feeDetails,
      licenseType: feeDetails.licenseType || type?.name || renewal.renewal_type_code,
    })
    const updated = await updateRenewalDraft(renewal._id || renewal.id, {
      fields: {
        ...fields,
        payment_details: paymentDetails,
        fee_details: calculatedFeeDetails,
      },
      documentIds: selectedDocs,
    })
    setRenewal(updated)
    const record = saveApplicationRecord({
      ...(applicationRecord || {}),
      id: updated._id || updated.id,
      userId: user?.id || user?._id || updated.user_id || '',
      user: user ? { id: user.id || user._id || '', name: user.name || '', email: user.email || '' } : applicationRecord?.user,
      renewalTypeCode: updated.renewal_type_code,
      renewalTypeName: type?.name || updated.renewal_type_code,
      businessName: fields.business_name || fields.enterprise_name || applicationRecord?.businessName || '',
      registrationNumber: fields.registration_no || fields.udyam_no || applicationRecord?.registrationNumber || '',
      enterpriseCategory: feeDetails.enterpriseCategory,
      applicationType: feeDetails.applicationType,
      feeDetails: calculatedFeeDetails,
      paymentDetails,
      status: applicationRecord?.status || 'Draft',
      certificateStatus: applicationRecord?.certificateStatus || 'Not Ready',
    })
    setApplicationRecord(record)
    await refreshRenewals()
    return updated
  }

  async function onSave() {
    setError('')
    setSaving(true)
    try {
      await persistDraft()
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.documents?.[0] ||
        e?.response?.data?.message ||
        e.message
      setError(msg || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  async function processRazorpayPayment() {
    if (!renewal) throw new Error('Renewal not loaded.')
    const amount = Number(feeDetails.totalAmount || 0)
    if (amount <= 0) {
      throw new Error('Invalid payment amount.')
    }

    const orderData = await createRazorpayOrder({
      purpose: 'renewal_fee',
      amount_inr: Math.round(amount),
      renewal_id: renewal._id || renewal.id,
    })

    if (!orderData?.order?.id) {
      throw new Error('Could not create Razorpay order.')
    }

    const loaded = await loadRazorpayCheckout()
    if (!loaded) {
      throw new Error('Unable to load Razorpay checkout.')
    }

    return new Promise((resolve, reject) => {
      const options = {
        key: orderData.key_id,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'MSME Renewal Portal',
        description: `${type?.name || 'Renewal'} application fee`,
        order_id: orderData.order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        handler: async function (response) {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            })
            resolve(response)
          } catch (error) {
            reject(error)
          }
        },
        modal: {
          ondismiss: function () {
            reject(new Error('Razorpay payment was cancelled.'))
          },
        },
        theme: { color: '#1E5AA6' },
      }

      const checkout = new window.Razorpay(options)
      checkout.open()
    })
  }

  async function onSubmit() {
    if (!renewal) return
    if (!canSubmit) {
      touchAllInvalidFields()
      if (hasFieldErrors) setCurrentStep(firstInvalidStep)
      setFormError(
        hasFieldErrors
          ? 'Please fix validation errors before submitting.'
          : missingTags.length
            ? 'Please attach all required documents before submitting.'
            : paymentError,
      )
      return
    }

    setError('')
    setFormError('')
    setPaymentMessage('')
    setSubmitting(true)
    try {
      await persistDraft()

      let updatedPaymentDetails = paymentDetails
      if (paymentDetails.mode === 'Razorpay') {
        setPaymentMessage('Opening Razorpay payment...')
        const response = await processRazorpayPayment()
        updatedPaymentDetails = {
          ...paymentDetails,
          transactionId: response.razorpay_payment_id,
          paymentStatus: 'Paid',
        }
        setPaymentDetails(updatedPaymentDetails)
        setPaymentMessage('Payment successful. Saving payment details...')

        await updateRenewalDraft(renewal._id || renewal.id, {
          fields: {
            ...fields,
            payment_details: updatedPaymentDetails,
            fee_details: calculateFeeDetails({
              ...feeDetails,
              licenseType: feeDetails.licenseType || type?.name || renewal.renewal_type_code,
            }),
          },
          documentIds: selectedDocs,
        })
      }

      const updated = await submitRenewal(renewal._id || renewal.id)
      setRenewal(updated)
      const record = saveApplicationRecord({
        ...(applicationRecord || {}),
        id: updated._id || updated.id,
        renewalTypeCode: updated.renewal_type_code,
        renewalTypeName: type?.name || updated.renewal_type_code,
        businessName: fields.business_name || fields.enterprise_name || applicationRecord?.businessName || '',
        registrationNumber: fields.registration_no || fields.udyam_no || applicationRecord?.registrationNumber || '',
        enterpriseCategory: feeDetails.enterpriseCategory,
        applicationType: feeDetails.applicationType,
        feeDetails: calculateFeeDetails({
          ...feeDetails,
          licenseType: feeDetails.licenseType || type?.name || updated.renewal_type_code,
        }),
        paymentDetails: {
          ...paymentDetails,
          amountPaid: Number(paymentDetails.amountPaid || feeDetails.totalAmount),
          paymentStatus: paymentDetails.mode === 'Razorpay' ? 'Paid' : 'Pending Verification',
        },
        status: normalizeStatus(updated.status),
        trackingId: updated.fields?.tracking_id || applicationRecord?.trackingId,
        certificateStatus: 'Not Ready',
        submittedAt: new Date().toISOString(),
      })
      setApplicationRecord(record)
      localStorage.removeItem(draftKey)
      setDraftMessage('Submitted with payment details. Tracking ID generated.')
    } catch (e) {
      const msg =
        e?.response?.data?.errors?.documents?.[0] ||
        e?.response?.data?.message ||
        e.message
      setError(msg || 'Submit failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell
      title="Renewal details"
      subtitle={type?.name || renewal?.renewal_type_code || 'Renewal'}
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/renewals"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Back
          </a>
          {renewal?.status === 'draft' ? (
            <>
              <button
                onClick={onSave}
                disabled={saving || loading}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save draft'}
              </button>
              <button
                onClick={reviewOrSubmit}
                disabled={submitting || loading || (currentStep === REVIEW_STEP_INDEX ? !canSubmit : !canReview)}
                className="rounded-xl bg-[#1E5AA6] px-3 py-2 text-sm font-semibold text-white hover:bg-[#184D8E] disabled:opacity-60"
              >
                {currentStep === REVIEW_STEP_INDEX ? submitButtonLabel : 'Review & Submit'}
              </button>
            </>
          ) : (
            <Pill tone="ok">Submitted</Pill>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">{error}</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <SectionCard
              title={FORM_STEPS[currentStep]?.title || 'Renewal details'}
              description="Complete each step and review all details before submitting."
            >
              <StepIndicator currentStep={currentStep} onStepClick={(index) => {
                if (renewal.status !== 'draft') {
                  setCurrentStep(index)
                  return
                }

                if (index <= currentStep) {
                  setCurrentStep(index)
                  setFormError('')
                  return
                }

                if (index > currentStep + 1) return

                if (Object.keys(currentStepErrors).length) {
                  touchStepFields()
                  setFormError('Please complete this step before moving ahead.')
                  return
                }

                setCurrentStep(index)
                setFormError('')
              }} />

              {formError ? (
                <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                  {formError}
                </div>
              ) : null}

              {paymentMessage ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {paymentMessage}
                </div>
              ) : null}

              {draftMessage && renewal.status === 'draft' ? (
                <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  {draftMessage}
                </div>
              ) : null}

              <div className="mt-6">
                {currentStep === REVIEW_STEP_INDEX ? (
                  <ReviewStep
                    fieldsByStep={fieldsByStep}
                    values={fields}
                    documents={documents}
                    selectedDocs={selectedDocs}
                    requiredTags={requiredTags}
                    missingTags={missingTags}
                    selectedTagSet={selectedTagSet}
                    disabled={renewal.status !== 'draft'}
                    onSelectedDocsChange={setSelectedDocs}
                    feeDetails={feeDetails}
                    paymentDetails={paymentDetails}
                    paymentError={paymentError}
                    type={type}
                    renewalTypes={renewalTypes}
                    onFeeChange={(next) => {
                      const calculated = calculateFeeDetails(next)
                      setFeeDetails(calculated)
                      setPaymentDetails((current) => ({
                        ...current,
                        amountPaid: current.amountPaid || calculated.totalAmount,
                      }))
                    }}
                    onPaymentChange={setPaymentDetails}
                  />
                ) : (
                  <DynamicFields
                    schema={currentStepFields}
                    values={fields}
                    disabled={renewal.status !== 'draft'}
                    errors={validationErrors}
                    touched={touchedFields}
                    onChange={updateField}
                    onBlur={markFieldTouched}
                  />
                )}
              </div>

              {renewal.status === 'draft' ? (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={goToPreviousStep}
                    disabled={currentStep === 0}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={clearLocalDraft}
                      className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
                    >
                      Clear Draft
                    </button>
                    {currentStep < REVIEW_STEP_INDEX ? (
                      <button
                        type="button"
                        onClick={goToNextStep}
                        className="rounded-xl bg-[#1E5AA6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#184D8E]"
                      >
                        Next
                      </button>
                    ) : (
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={onSubmit}
                          disabled={submitting || !canSubmit}
                          className="rounded-xl bg-[#1E5AA6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#184D8E] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitButtonLabel}
                        </button>
                        {paymentDetails.mode === 'Razorpay' ? (
                          <div className="text-xs text-slate-500">
                            The same button will open Razorpay and automatically submit after successful payment.
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                  This application has been submitted and cannot be edited.
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <SectionCard title="Checklist" description="Required documents for submission.">
              {requiredTags.length ? (
                <div className="space-y-2">
                  {requiredTags.map((t) => {
                    const ok = selectedTagSet.has(t)
                    return (
                      <div key={t} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                        <span className="text-sm text-slate-800">{t}</span>
                        <span className={ok ? 'text-emerald-700' : 'text-amber-800'}>{ok ? '✓' : '!'}</span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-sm text-slate-600">No checklist configured.</div>
              )}

              {missingTags.length ? (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Missing: {missingTags.join(', ')}
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  Ready to submit.
                </div>
              )}
            </SectionCard>

            <SectionCard title="Status" description="Current stage of your renewal.">
              <ApplicationTracker record={applicationRecord || { status: renewal.status }} />
              {applicationRecord?.trackingId ? (
                <a
                  href={`#/track?trackingId=${encodeURIComponent(applicationRecord.trackingId)}`}
                  className="mt-4 inline-flex w-full justify-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"
                >
                  Track Application
                </a>
              ) : null}
            </SectionCard>

            <SectionCard title="Certificate download" description="Available after approval, payment verification, and certificate readiness.">
              <CertificateDownload record={applicationRecord} />
            </SectionCard>
          </div>
        </div>
      )}
    </PageShell>
  )
}

function StepIndicator({ currentStep, onStepClick }) {
  return (
    <div className="grid gap-2 md:grid-cols-6">
      {FORM_STEPS.map((step, index) => {
        const active = index === currentStep
        const complete = index < currentStep
        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick(index)}
            className={[
              'rounded-xl border px-3 py-3 text-left text-xs font-bold transition',
              active
                ? 'border-[#1E5AA6]/30 bg-[#1E5AA6]/10 text-[#1E5AA6]'
                : complete
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
            ].join(' ')}
          >
            <span className="block text-[11px] uppercase tracking-wider">Step {index + 1}</span>
            <span className="mt-1 block leading-snug">{step.title}</span>
          </button>
        )
      })}
    </div>
  )
}

function ReviewStep({
  fieldsByStep,
  values,
  documents,
  selectedDocs,
  requiredTags,
  missingTags,
  selectedTagSet,
  disabled,
  onSelectedDocsChange,
  feeDetails,
  paymentDetails,
  paymentError,
  type,
  renewalTypes,
  onFeeChange,
  onPaymentChange,
}) {
  const fieldSteps = FORM_STEPS.filter((step) => step.id !== 'review')
  const docsById = new Map((documents || []).map((doc) => [doc._id || doc.id, doc]))
  const selected = (selectedDocs || []).map((docId) => docsById.get(docId)).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {fieldSteps.map((step) => {
          const fields = fieldsByStep[step.id] || []
          if (!fields.length) return null

          return (
            <div key={step.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="text-sm font-semibold text-slate-900">{step.title}</div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {fields.map((field) => (
                  <div key={field.key} className="rounded-xl bg-slate-50 px-3 py-2">
                    <div className="text-xs font-semibold text-slate-500">{field.label || field.key}</div>
                    <div className="mt-1 whitespace-pre-wrap text-sm font-medium text-slate-900">
                      {formatReviewValue(values?.[field.key])}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm font-semibold text-slate-900">Attached documents</div>
            <div className="text-xs text-slate-600">Select uploaded documents required for this renewal.</div>
          </div>
          {missingTags.length ? (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-900">
              Missing: {missingTags.join(', ')}
            </span>
          ) : (
            <span className="rounded-full bg-emerald-600/10 px-3 py-1 text-xs font-semibold text-emerald-700">
              Documents ready
            </span>
          )}
        </div>

        <DocumentSelector
          documents={documents}
          selectedDocs={selectedDocs}
          disabled={disabled}
          onSelectedDocsChange={onSelectedDocsChange}
        />

        {selected.length ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            Selected: {selected.map((doc) => doc.original_name).join(', ')}
          </div>
        ) : null}
      </div>

      {requiredTags.length ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Document checklist</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {requiredTags.map((tag) => {
              const ok = selectedTagSet.has(tag)
              return (
                <div key={tag} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <span className="text-sm text-slate-800">{tag}</span>
                  <span className={ok ? 'text-emerald-700' : 'text-amber-800'}>{ok ? 'OK' : 'Needed'}</span>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Fee calculator</div>
        <div className="mt-1 text-xs text-slate-600">Amount auto-calculates before final submission.</div>
        <div className="mt-4">
          <FeeCalculator
            value={{
              ...feeDetails,
              licenseType: feeDetails?.licenseType || type?.name || '',
            }}
            onChange={onFeeChange}
            licenseTypes={(renewalTypes || []).map((item) => ({
              value: item.code,
              label: item.name,
            }))}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Payment details</div>
        <div className="mt-1 text-xs text-slate-600">Payment details are required before application submission.</div>
        <div className="mt-4">
          <PaymentForm
            value={paymentDetails}
            totalAmount={feeDetails?.totalAmount || 0}
            onChange={onPaymentChange}
            disabled={disabled}
          />
        </div>
        {paymentError ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            {paymentError}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
            Payment details ready. Submit will send this application to admin for payment verification.
          </div>
        )}
      </div>
    </div>
  )
}

function DocumentSelector({ documents, selectedDocs, disabled, onSelectedDocsChange }) {
  if (!documents?.length) {
    return (
      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
        No documents found. Upload documents from Dashboard first.
      </div>
    )
  }

  return (
    <div className="mt-4 grid gap-3 md:grid-cols-2">
      {documents.slice(0, 20).map((doc) => {
        const docId = doc._id || doc.id
        const checked = selectedDocs.includes(docId)
        return (
          <label
            key={docId}
            className={[
              'flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition',
              checked ? 'border-[#1E5AA6]/40 bg-[#1E5AA6]/5' : 'border-slate-200 bg-white hover:bg-slate-50',
            ].join(' ')}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={disabled}
              onChange={(event) => {
                const next = event.target.checked
                  ? Array.from(new Set([...selectedDocs, docId]))
                  : selectedDocs.filter((id) => id !== docId)
                onSelectedDocsChange(next)
              }}
              className="mt-1"
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{doc.original_name}</div>
              <div className="mt-1 flex flex-wrap gap-1">
                {(doc.tags || []).slice(0, 4).map((tag) => (
                  <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </label>
        )
      })}
    </div>
  )
}

function DynamicFields({ schema, values, onChange, onBlur, disabled, errors = {}, touched = {} }) {
  const items = Array.isArray(schema) ? schema : []
  if (!items.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
        No fields configured for this step.
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((f) => {
        const key = f.key
        const label = f.label || key
        const required = !!f.required
        const type = f.type || 'text'
        const max = typeof f.max === 'number' ? f.max : undefined
        const value = values?.[key] ?? ''
        const error = errors[key]
        const showError = !!error && (touched[key] || String(value).trim() !== '')

        const common = {
          value,
          disabled,
          maxLength: max,
          onBlur: () => onBlur(key),
          onChange: (e) => onChange(key, e.target.value),
          className:
            [
              'mt-1 w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E5AA6]/30 disabled:bg-slate-50',
              showError ? 'border-rose-300' : 'border-slate-200',
            ].join(' '),
        }

        return (
          <label key={key} className="block text-sm font-medium text-slate-700">
            <span className="inline-flex items-center gap-2">
              {label}
              {required ? (
                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-800">
                  Required
                </span>
              ) : null}
            </span>
            {type === 'textarea' ? (
              <textarea {...common} rows={4} placeholder={f.placeholder || ''} />
            ) : (
              <input {...common} type="text" placeholder={f.placeholder || ''} />
            )}
            {max ? (
              <div className="mt-1 text-xs text-slate-500">Max {max} characters</div>
            ) : null}
            {showError ? (
              <div className="mt-1 text-xs font-medium text-rose-600">{error}</div>
            ) : null}
          </label>
        )
      })}
    </div>
  )
}

function normalizeText(value) {
  return String(value || '').toLowerCase()
}

function fieldText(field) {
  return normalizeText(`${field?.key || ''} ${field?.label || ''}`)
}

function fieldBelongsTo(field, keywords) {
  const text = fieldText(field)
  return keywords.some((keyword) => text.includes(keyword))
}

function getFieldStepId(field) {
  // Infer steps from existing dynamic schema without changing any backend field names.
  if (fieldBelongsTo(field, ['address', 'city', 'state', 'pincode', 'pin code', 'postal'])) return 'address'
  if (fieldBelongsTo(field, ['bank', 'account', 'ifsc', 'branch'])) return 'bank'
  if (fieldBelongsTo(field, ['activity', 'nic', 'industry', 'sector'])) return 'activity'
  if (fieldBelongsTo(field, ['business', 'enterprise', 'udyam', 'registration', 'gst'])) return 'business'
  return 'basic'
}

function groupFieldsByStep(schema) {
  const grouped = FORM_STEPS.reduce((acc, step) => ({ ...acc, [step.id]: [] }), {})
  for (const field of schema || []) {
    grouped[getFieldStepId(field)].push(field)
  }
  return grouped
}

function hasFieldValue(value) {
  return String(value ?? '').trim() !== ''
}

function validateField(field, value) {
  const label = field.label || field.key
  const text = fieldText(field)
  const raw = String(value ?? '').trim()

  if (field.required && !raw) return `${label} is required.`
  if (!raw) return ''

  if (text.includes('mobile') || text.includes('phone')) {
    return /^[0-9]{10}$/.test(raw) ? '' : 'Mobile number must be exactly 10 digits.'
  }

  if (text.includes('email')) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw) ? '' : 'Enter a valid email address.'
  }

  if (text.includes('pan')) {
    return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(raw) ? '' : 'Enter a valid PAN, for example ABCDE1234F.'
  }

  if (text.includes('aadhaar') || text.includes('aadhar')) {
    return /^[0-9]{12}$/.test(raw) ? '' : 'Aadhaar number must be exactly 12 digits.'
  }

  if (text.includes('gst') || text.includes('gstin')) {
    return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(raw)
      ? ''
      : 'Enter a valid GSTIN.'
  }

  return ''
}

function validateFields(schema, values) {
  const errors = {}
  for (const field of schema || []) {
    const error = validateField(field, values?.[field.key])
    if (error) errors[field.key] = error
  }
  return errors
}

function getStepErrors(stepFields, errors) {
  const stepErrors = {}
  for (const field of stepFields || []) {
    if (errors[field.key]) stepErrors[field.key] = errors[field.key]
  }
  return stepErrors
}

function getFirstInvalidStep(fieldsByStep, errors) {
  for (let index = 0; index < REVIEW_STEP_INDEX; index += 1) {
    const step = FORM_STEPS[index]
    const hasError = (fieldsByStep[step.id] || []).some((field) => errors[field.key])
    if (hasError) return index
  }
  return 0
}

function formatReviewValue(value) {
  return hasFieldValue(value) ? String(value) : 'Not provided'
}

export default RenewalDetailPage
