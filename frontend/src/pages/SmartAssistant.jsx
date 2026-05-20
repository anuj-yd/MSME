import { useEffect, useMemo, useState } from 'react'
import { PageShell, SectionCard } from './dashboard/DashboardComponents.jsx'
import { useAppState } from '../state/appStore.jsx'

const COPY = {
  en: {
    pageTitle: 'Smart Renewal Assistant',
    subtitle: 'Renewal Guide',
    back: 'Back',
    sectionTitle: 'Answer a few questions',
    sectionDescription: 'Select yes or no for each item to get the right next step.',
    stepLabel: 'Step',
    answered: 'answered',
    questionLabel: 'Question',
    yes: 'Yes',
    no: 'No',
    reset: 'Reset',
    next: 'Next',
    recommendation: 'Recommendation',
    recommendationDescription: 'Result appears after all answers are selected.',
    completeAll: 'Complete all questions',
    pendingResult: 'Your suggested next step will appear here.',
    checklistTitle: 'Checklist',
    checklistDescription: 'Keep these details ready before starting.',
    suggestedAction: 'Suggested action',
    startProcess: 'Start Update Process',
    questions: [
      {
        id: 'addressChanged',
        question: 'Has your business address changed?',
        detail: 'Registered office, shop, factory, or unit address update.',
      },
      {
        id: 'contactChanged',
        question: 'Has your mobile/email changed?',
        detail: 'Registered mobile number or email needs an update.',
      },
      {
        id: 'financialUpdate',
        question: 'Do turnover/investment details need an update?',
        detail: 'Latest financial year turnover or investment figures.',
      },
      {
        id: 'certificateDownload',
        question: 'Do you need to download the certificate?',
        detail: 'Fresh copy of the existing Udyam certificate.',
      },
      {
        id: 'detailsMistake',
        question: 'Is there a mistake in registration number or details?',
        detail: 'Correction for name, PAN, address, activity, or registration details.',
      },
    ],
    checklist: [
      'Udyam Registration Number',
      'Aadhaar/PAN',
      'Mobile number',
      'Email',
      'Business address',
      'Bank details',
      'GSTIN if applicable',
    ],
    results: {
      correction: {
        title: 'You need to follow the correction/update process',
        summary: 'There is a mistake in registration or business details, so prepare a correction/update request.',
      },
      update: {
        title: 'You do not need renewal, you need details update',
        summary: 'Your existing Udyam registration may be active, but changed details should be updated.',
      },
      download: {
        title: 'You need to download the certificate',
        summary: 'If details are unchanged, follow the certificate download flow.',
      },
      current: {
        title: 'Your details currently look updated',
        summary: 'Based on your answers, no renewal/update action appears necessary right now.',
      },
    },
  },
  hi: {
    pageTitle: 'स्मार्ट रिन्यूअल असिस्टेंट',
    subtitle: 'रिन्यूअल गाइड',
    back: 'वापस',
    sectionTitle: 'कुछ सवालों के जवाब दें',
    sectionDescription: 'हर सवाल के लिए हां या नहीं चुनें ताकि सही अगला कदम दिख सके.',
    stepLabel: 'स्टेप',
    answered: 'जवाब दिए',
    questionLabel: 'सवाल',
    yes: 'हां',
    no: 'नहीं',
    reset: 'रीसेट',
    next: 'आगे',
    recommendation: 'सुझाव',
    recommendationDescription: 'सभी जवाब चुनने के बाद परिणाम दिखेगा.',
    completeAll: 'सभी सवाल पूरे करें',
    pendingResult: 'आपका सुझाया गया अगला कदम यहां दिखेगा.',
    checklistTitle: 'चेकलिस्ट',
    checklistDescription: 'शुरू करने से पहले ये जानकारी तैयार रखें.',
    suggestedAction: 'सुझाया गया कार्य',
    startProcess: 'अपडेट प्रक्रिया शुरू करें',
    questions: [
      {
        id: 'addressChanged',
        question: 'क्या आपके व्यवसाय का पता बदला है?',
        detail: 'रजिस्टर्ड ऑफिस, दुकान, फैक्टरी या यूनिट के पते में बदलाव.',
      },
      {
        id: 'contactChanged',
        question: 'क्या मोबाइल/ईमेल बदला है?',
        detail: 'रजिस्टर्ड मोबाइल नंबर या ईमेल अपडेट करना है.',
      },
      {
        id: 'financialUpdate',
        question: 'क्या टर्नओवर/इन्वेस्टमेंट डिटेल अपडेट करनी है?',
        detail: 'नए वित्त वर्ष का टर्नओवर या निवेश विवरण.',
      },
      {
        id: 'certificateDownload',
        question: 'क्या आपको सर्टिफिकेट डाउनलोड करना है?',
        detail: 'मौजूदा उद्यम सर्टिफिकेट की नई कॉपी चाहिए.',
      },
      {
        id: 'detailsMistake',
        question: 'क्या रजिस्ट्रेशन नंबर या डिटेल में गलती है?',
        detail: 'नाम, PAN, पता, गतिविधि या रजिस्ट्रेशन डिटेल में सुधार.',
      },
    ],
    checklist: [
      'उद्यम रजिस्ट्रेशन नंबर',
      'आधार/PAN',
      'मोबाइल नंबर',
      'ईमेल',
      'बिजनेस एड्रेस',
      'बैंक डिटेल्स',
      'GSTIN अगर लागू हो',
    ],
    results: {
      correction: {
        title: 'आपको correction/update process follow करना है',
        summary: 'रजिस्ट्रेशन या बिजनेस डिटेल में गलती है, इसलिए correction/update request तैयार करें.',
      },
      update: {
        title: 'आपको renewal नहीं, details update करनी है',
        summary: 'आपकी existing Udyam registration active हो सकती है, लेकिन बदली हुई details update करनी जरूरी है.',
      },
      download: {
        title: 'आपको certificate download करना है',
        summary: 'अगर details same हैं, तो certificate download flow follow करें.',
      },
      current: {
        title: 'आपकी details currently update लग रही हैं',
        summary: 'आपके answers के basis पर अभी renewal/update action required नहीं लग रहा.',
      },
    },
  },
}

function getCopy() {
  return COPY.en
}

function getRecommendation(answers, copy) {
  if (answers.detailsMistake === true) {
    return { ...copy.results.correction, tone: 'warn' }
  }

  if (answers.addressChanged || answers.contactChanged || answers.financialUpdate) {
    return { ...copy.results.update, tone: 'primary' }
  }

  if (answers.certificateDownload === true) {
    return { ...copy.results.download, tone: 'ok' }
  }

  return { ...copy.results.current, tone: 'neutral' }
}

function SmartAssistant() {
  const { authToken } = useAppState()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState({})

  const copy = getCopy()
  const currentQuestion = copy.questions[step]
  const answeredCount = copy.questions.filter((q) => typeof answers[q.id] === 'boolean').length
  const isComplete = answeredCount === copy.questions.length
  const recommendation = useMemo(() => getRecommendation(answers, copy), [answers, copy])

  useEffect(() => {
    if (!authToken) {
      window.location.hash = '#/login'
    }
  }, [authToken])

  if (!authToken) {
    return null
  }

  function setAnswer(value) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }))
  }

  function nextStep() {
    if (step < copy.questions.length - 1) setStep((current) => current + 1)
  }

  function previousStep() {
    if (step > 0) setStep((current) => current - 1)
  }

  function resetAssistant() {
    setAnswers({})
    setStep(0)
  }

  return (
    <PageShell
      title={copy.pageTitle}
      subtitle={copy.subtitle}
      right={
        <div className="flex items-center gap-2">
          <a
            href="#/dashboard"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
          >
            {copy.back}
          </a>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <SectionCard
          title={copy.sectionTitle}
          description={copy.sectionDescription}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>{copy.stepLabel} {step + 1} / {copy.questions.length}</span>
              <span>{answeredCount}/{copy.questions.length} {copy.answered}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-indigo-600 transition-all"
                style={{ width: `${((step + 1) / copy.questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm">
            <div className="text-xs font-bold uppercase tracking-wider text-primary-700">
              {copy.questionLabel}
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
              {currentQuestion.question}
            </h2>
            <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600">
              {currentQuestion.detail}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <AnswerOption
                label={copy.yes}
                checked={answers[currentQuestion.id] === true}
                onChange={() => setAnswer(true)}
              />
              <AnswerOption
                label={copy.no}
                checked={answers[currentQuestion.id] === false}
                onChange={() => setAnswer(false)}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={previousStep}
              disabled={step === 0}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copy.back}
            </button>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={resetAssistant}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                {copy.reset}
              </button>
              <button
                type="button"
                onClick={nextStep}
                disabled={typeof answers[currentQuestion.id] !== 'boolean' || step === copy.questions.length - 1}
                className="rounded-xl bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-primary-500/20 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
              >
                {copy.next}
              </button>
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title={copy.recommendation} description={copy.recommendationDescription}>
            {isComplete ? (
              <ResultCard recommendation={recommendation} copy={copy} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-8 text-center">
                <div className="text-sm font-bold text-slate-900">{copy.completeAll}</div>
                <div className="mt-1 text-sm text-slate-600">
                  {copy.pendingResult}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title={copy.checklistTitle} description={copy.checklistDescription}>
            <div className="grid gap-2">
              {copy.checklist.map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                    OK
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>
        </div>
      </div>
    </PageShell>
  )
}

function AnswerOption({ label, checked, onChange }) {
  return (
    <label
      className={[
        'flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 text-sm font-bold transition-all',
        checked
          ? 'border-primary-300 bg-primary-50 text-primary-800 ring-4 ring-primary-500/10'
          : 'border-slate-200 bg-white text-slate-700 hover:border-primary-200 hover:bg-primary-50/40',
      ].join(' ')}
    >
      <input
        type="radio"
        className="size-4 accent-primary-600"
        checked={checked}
        onChange={onChange}
      />
      {label}
    </label>
  )
}

function ResultCard({ recommendation, copy }) {
  const toneClass =
    recommendation.tone === 'warn'
      ? 'border-amber-200 bg-amber-50 text-amber-950'
      : recommendation.tone === 'ok'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
        : recommendation.tone === 'primary'
          ? 'border-primary-200 bg-primary-50 text-primary-950'
          : 'border-slate-200 bg-slate-50 text-slate-950'

  return (
    <div className={`rounded-2xl border p-5 ${toneClass}`}>
      <div className="text-xs font-bold uppercase tracking-wider opacity-70">{copy.suggestedAction}</div>
      <h3 className="mt-3 text-xl font-bold tracking-tight">{recommendation.title}</h3>
      <p className="mt-2 text-sm font-medium leading-relaxed opacity-80">
        {recommendation.summary}
      </p>
      <a
        href="#/renewals"
        className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white shadow-md transition-all hover:scale-105 hover:bg-slate-800"
      >
        {copy.startProcess}
      </a>
    </div>
  )
}

export default SmartAssistant
