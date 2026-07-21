import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import App from './App.tsx'
import { mockTransitService } from './services/mockTransitService'
import { useTransitStore } from './store/useTransitStore'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

/** Dev-only harness for verifying the network-error UI path */
if (import.meta.env.DEV) {
  Object.assign(window, {
    __NOVA_FAIL_NEXT__: () => {
      mockTransitService.failNext()
    },
    __NOVA_STORE__: useTransitStore,
  })
}
