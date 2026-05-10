import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { api } from '../lib/apiClient.js'

const AppStateContext = createContext(null)
const AppActionsContext = createContext(null)

const initialState = {
  authToken: localStorage.getItem('auth_token') || '',
  user: null,
  entitlement: null,
  documents: [],
  renewals: [],
  renewalTypes: [],
  loading: {
    bootstrap: false,
  },
  errors: {},
}

function reducer(state, action) {
  switch (action.type) {
    case 'auth/setToken': {
      const authToken = action.token || ''
      return { ...state, authToken }
    }
    case 'auth/setUser':
      return { ...state, user: action.user || null }
    case 'billing/setEntitlement':
      return { ...state, entitlement: action.entitlement || null }
    case 'docs/setAll':
      return { ...state, documents: Array.isArray(action.documents) ? action.documents : [] }
    case 'docs/prepend':
      return { ...state, documents: [action.document, ...state.documents].slice(0, 50) }
    case 'renewals/setAll':
      return { ...state, renewals: Array.isArray(action.renewals) ? action.renewals : [] }
    case 'renewalTypes/setAll':
      return { ...state, renewalTypes: Array.isArray(action.types) ? action.types : [] }
    case 'ui/setLoading':
      return { ...state, loading: { ...state.loading, [action.key]: !!action.value } }
    case 'ui/setError':
      return { ...state, errors: { ...state.errors, [action.key]: action.error || '' } }
    default:
      return state
  }
}

export function AppStoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (state.authToken) localStorage.setItem('auth_token', state.authToken)
    else localStorage.removeItem('auth_token')
  }, [state.authToken])

  const actions = useMemo(() => {
    async function bootstrap() {
      if (!state.authToken) return
      dispatch({ type: 'ui/setLoading', key: 'bootstrap', value: true })
      dispatch({ type: 'ui/setError', key: 'bootstrap', error: '' })
      try {
        const [me, ent, docs, renewals] = await Promise.all([
          api.get('/auth/me'),
          api.get('/billing/entitlement'),
          api.get('/documents'),
          api.get('/renewals'),
        ])
        const typesRes = await api.get('/renewal-types')
        dispatch({ type: 'auth/setUser', user: me?.data?.user || null })
        dispatch({
          type: 'billing/setEntitlement',
          entitlement: ent?.data?.entitlement || null,
        })
        dispatch({ type: 'docs/setAll', documents: docs?.data?.documents || [] })
        dispatch({ type: 'renewals/setAll', renewals: renewals?.data?.renewals || [] })
        dispatch({ type: 'renewalTypes/setAll', types: typesRes?.data?.types || [] })
      } catch (e) {
        dispatch({
          type: 'ui/setError',
          key: 'bootstrap',
          error: e?.response?.data?.message || e.message || 'Failed to load',
        })
      } finally {
        dispatch({ type: 'ui/setLoading', key: 'bootstrap', value: false })
      }
    }

    async function login(email, password) {
      const res = await api.post('/auth/login', { email, password })
      if (res?.data?.requires_otp) return { requiresOtp: true, email: res.data.email || email }
      dispatch({ type: 'auth/setToken', token: res.data.token })
      dispatch({ type: 'auth/setUser', user: res.data.user })
      return { ok: true }
    }

    async function logout() {
      try {
        await api.post('/auth/logout')
      } finally {
        dispatch({ type: 'auth/setToken', token: '' })
        dispatch({ type: 'auth/setUser', user: null })
        dispatch({ type: 'billing/setEntitlement', entitlement: null })
        dispatch({ type: 'docs/setAll', documents: [] })
        dispatch({ type: 'renewals/setAll', renewals: [] })
      }
    }

    async function register(name, email, password) {
      const res = await api.post('/auth/register', { name, email, password })
      return { email: res.data.email || email }
    }

    async function verifyOtp(email, otp) {
      await api.post('/auth/verify-otp', { email, otp })
      return { ok: true }
    }

    async function resendOtp(email) {
      await api.post('/auth/resend-otp', { email })
      return { ok: true }
    }

    async function uploadDocument(file, tags = ['general']) {
      const form = new FormData()
      form.append('file', file)
      for (const t of tags) form.append('tags[]', t)
      const res = await api.post('/documents', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      if (res?.data?.document) dispatch({ type: 'docs/prepend', document: res.data.document })
      return res?.data?.document
    }

    async function refreshDocuments() {
      const docs = await api.get('/documents')
      dispatch({ type: 'docs/setAll', documents: docs?.data?.documents || [] })
      return docs?.data?.documents || []
    }

    async function refreshRenewals() {
      const res = await api.get('/renewals')
      dispatch({ type: 'renewals/setAll', renewals: res?.data?.renewals || [] })
      return res?.data?.renewals || []
    }

    async function fetchRenewalTypes() {
      const res = await api.get('/renewal-types')
      dispatch({ type: 'renewalTypes/setAll', types: res?.data?.types || [] })
      return res?.data?.types || []
    }

    async function createRenewal(renewalTypeCode) {
      const res = await api.post('/renewals', { renewal_type_code: renewalTypeCode })
      await refreshRenewals()
      return res?.data?.renewal
    }

    async function updateRenewalDraft(id, { fields, documentIds }) {
      const res = await api.patch(`/renewals/${id}`, {
        fields,
        document_ids: documentIds,
      })
      await refreshRenewals()
      return res?.data?.renewal
    }

    async function getRenewal(id) {
      const res = await api.get(`/renewals/${id}`)
      return res?.data
    }

    async function submitRenewal(id) {
      const res = await api.post(`/renewals/${id}/submit`)
      await refreshRenewals()
      return res?.data?.renewal
    }

    async function adminListRenewals(status = 'submitted') {
      const res = await api.get(`/admin/renewals?status=${encodeURIComponent(status)}`)
      return res?.data?.renewals || []
    }

    async function adminGetRenewal(id) {
      const res = await api.get(`/admin/renewals/${id}`)
      return res?.data
    }

    async function adminSetRenewalStatus(id, status, note = '') {
      const res = await api.post(`/admin/renewals/${id}/status`, { status, note })
      return res?.data?.renewal
    }

    async function adminRequestOtp(id, note = '') {
      const res = await api.post(`/admin/renewals/${id}/otp/request`, { note })
      return res?.data?.otp_request
    }

    async function adminGetOtp(id) {
      const res = await api.get(`/admin/renewals/${id}/otp`)
      return res?.data
    }

    async function submitGovOtp(renewalId, otp) {
      const res = await api.post(`/renewals/${renewalId}/otp`, { otp })
      return res?.data
    }

    async function createRazorpayOrder(purpose) {
      const res = await api.post('/billing/order', { purpose })
      return res.data
    }

    async function verifyRazorpayPayment(payload) {
      const res = await api.post('/billing/verify', payload)
      if (res?.data?.entitlement) {
        dispatch({ type: 'billing/setEntitlement', entitlement: res.data.entitlement })
      }
      return res.data
    }

    return {
      bootstrap,
      login,
      logout,
      register,
      verifyOtp,
      resendOtp,
      uploadDocument,
      refreshDocuments,
      refreshRenewals,
      fetchRenewalTypes,
      createRenewal,
      updateRenewalDraft,
      getRenewal,
      submitRenewal,
      submitGovOtp,
      adminListRenewals,
      adminGetRenewal,
      adminSetRenewalStatus,
      adminRequestOtp,
      adminGetOtp,
      createRazorpayOrder,
      verifyRazorpayPayment,
    }
  }, [state.authToken])

  return (
    <AppStateContext.Provider value={state}>
      <AppActionsContext.Provider value={actions}>{children}</AppActionsContext.Provider>
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const ctx = useContext(AppStateContext)
  if (!ctx) throw new Error('useAppState must be used within AppStoreProvider')
  return ctx
}

export function useAppActions() {
  const ctx = useContext(AppActionsContext)
  if (!ctx) throw new Error('useAppActions must be used within AppStoreProvider')
  return ctx
}
