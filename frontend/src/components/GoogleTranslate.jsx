import { useEffect, useRef } from 'react'
import { useAppActions, useAppState } from '../state/appStore.jsx'
import { SUPPORTED_LANGUAGES } from '../lib/languages.js'

const GOOGLE_TRANSLATE_ELEMENT_ID = 'google_translate_element'
const GOOGLE_TRANSLATE_SCRIPT_ID = 'google-translate-script'

function setGoogleTranslateCookie(language) {
  const value = language === 'en' ? '/en/en' : `/en/${language}`
  const expires = 'expires=Fri, 31 Dec 9999 23:59:59 GMT'
  document.cookie = `googtrans=${value}; ${expires}; path=/`

  if (!/^\d+\.\d+\.\d+\.\d+$/.test(window.location.hostname) && window.location.hostname !== 'localhost') {
    document.cookie = `googtrans=${value}; ${expires}; path=/; domain=${window.location.hostname}`
  }
}

function applyGoogleLanguage(language, attempt = 0) {
  const select = document.querySelector('.goog-te-combo')

  if (!select) {
    if (attempt < 40) {
      window.setTimeout(() => applyGoogleLanguage(language, attempt + 1), 250)
    }
    return
  }

  if (select.value === language) return
  select.value = language
  select.dispatchEvent(new Event('change'))
}

export function GoogleTranslateElement() {
  const selectedLanguageRef = useRef('en')

  function translateTo(language) {
    selectedLanguageRef.current = language
    setGoogleTranslateCookie(language)
    applyGoogleLanguage(language)
  }

  useEffect(() => {
    window.googleTranslateElementInit = function googleTranslateElementInit() {
      if (!window.google?.translate?.TranslateElement) return

      new window.google.translate.TranslateElement(
        {
          pageLanguage: 'en',
          includedLanguages: SUPPORTED_LANGUAGES.map((item) => item.code).join(','),
          autoDisplay: false,
        },
        GOOGLE_TRANSLATE_ELEMENT_ID,
      )

      window.setTimeout(() => {
        translateTo(selectedLanguageRef.current)
      }, 500)
    }

    if (!document.getElementById(GOOGLE_TRANSLATE_SCRIPT_ID)) {
      const script = document.createElement('script')
      script.id = GOOGLE_TRANSLATE_SCRIPT_ID
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
      script.async = true
      document.body.appendChild(script)
    } else if (window.google?.translate?.TranslateElement) {
      window.googleTranslateElementInit()
    }
  }, [])

  useEffect(() => {
    function onLanguageChange(event) {
      const language = event.detail?.language || 'en'
      translateTo(language)
    }

    window.addEventListener('app-language-change', onLanguageChange)
    return () => window.removeEventListener('app-language-change', onLanguageChange)
  }, [])

  return <div id={GOOGLE_TRANSLATE_ELEMENT_ID} className="google-translate-host" aria-hidden="true" />
}

export function LanguageSelect({ compact = false }) {
  const { language } = useAppState()
  const { setLanguage } = useAppActions()

  return (
    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm">
      <span className={compact ? 'sr-only' : 'hidden sm:inline'}>Language</span>
      <select
        value={language}
        onChange={(event) => {
          const nextLanguage = event.target.value
          setLanguage(nextLanguage)
          window.dispatchEvent(new CustomEvent('app-language-change', {
            detail: { language: nextLanguage },
          }))
        }}
        className="bg-transparent text-xs font-bold text-slate-800 outline-none"
        aria-label="Change language"
      >
        {SUPPORTED_LANGUAGES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  )
}
