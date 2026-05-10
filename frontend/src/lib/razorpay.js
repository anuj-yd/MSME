let loadingPromise = null

export function loadRazorpayCheckout() {
  if (typeof window !== 'undefined' && window.Razorpay) return Promise.resolve(true)

  if (loadingPromise) return loadingPromise

  loadingPromise = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })

  return loadingPromise
}

