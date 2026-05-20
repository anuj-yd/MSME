export function subscribeToApplicationUpdates(onUpdate) {
  if (typeof onUpdate !== 'function') return () => {}

  let closed = false
  let debounceTimer = null
  const debounceDelay = 500
  // BroadcastChannel (cross-tab) - best-effort
  try {
    const bc = new BroadcastChannel('application-updates')
    bc.onmessage = () => {
      if (closed) return
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        try { onUpdate() } catch (e) {}
      }, debounceDelay)
    }
    // return cleanup that closes channel
    return () => {
      closed = true
      try { bc.close() } catch (e) {}
    }
  } catch (e) {
    // ignore and fall through to storage/SSE fallback
  }

  // storage event fallback (other tabs)
  const storageHandler = (e) => {
    if (e.key === 'application-update-signal') {
      if (debounceTimer) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        try { onUpdate() } catch (e) {}
      }, debounceDelay)
    }
  }
  window.addEventListener('storage', storageHandler)

  // SSE fallback: try connecting to a server-sent-events endpoint if provided
  let es = null
  try {
    if ('EventSource' in window) {
      es = new EventSource('/sse/application-updates')
      es.onmessage = () => {
        onUpdate()
      }
    }
  } catch (e) {
    es = null
  }

  return () => {
    window.removeEventListener('storage', storageHandler)
    if (es) try { es.close() } catch (e) {}
    if (debounceTimer) try { clearTimeout(debounceTimer) } catch (e) {}
  }
}

export function notifyLocalApplicationUpdate() {
  // Best-effort: BroadcastChannel, then localStorage write to trigger storage event
  try {
    const bc = new BroadcastChannel('application-updates')
    bc.postMessage('update')
    bc.close()
    return
  } catch (e) {}
  try {
    localStorage.setItem('application-update-signal', Date.now().toString())
    // keep tiny window for other tabs
    setTimeout(() => localStorage.removeItem('application-update-signal'), 1000)
  } catch (e) {}
}
