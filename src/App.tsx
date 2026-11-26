import { useEffect, useState } from 'react'
import './App.css'
import { AdminView } from './components/AdminView'
import { LoginView } from './components/LoginView'
import { UserView } from './components/UserView'
import { getCurrentUser, useRanDemoStore } from './demoStore'
import type { View } from './demoStore'

function getPanelFromHash(): View {
  const route = window.location.hash.replace('#', '').trim().toLowerCase()
  if (route === 'user') return 'user'
  if (route === 'admin') return 'admin'
  return 'login'
}

function App() {
  const [view, setView] = useState<View>(getPanelFromHash)
  const store = useRanDemoStore()
  const currentUser = getCurrentUser(store.state)

  useEffect(() => {
    const handleRouteChange = () => setView(getPanelFromHash())
    window.addEventListener('hashchange', handleRouteChange)
    if (!window.location.hash) {
      window.history.replaceState(null, '', '#login')
    }
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  const navigate = (nextView: View) => {
    if (nextView === 'login') {
      sessionStorage.removeItem('ran-role')
    } else {
      sessionStorage.setItem('ran-role', nextView)
    }
    window.location.hash = nextView
    setView(nextView)
  }

  return (
    <div className="app">
      {view === 'login' && (
        <LoginView
          currentGoldGrams={currentUser.goldGrams}
          onLogin={role => navigate(role)}
        />
      )}
      {view === 'user' && (
        <UserView
          state={store.state}
          onBuyGold={store.buyGold}
          onReverseToCash={store.reverseToCash}
          onRequestRedemption={store.requestRedemption}
          onMarkNotificationsRead={store.markAllNotificationsRead}
          onLogout={() => navigate('login')}
        />
      )}
      {view === 'admin' && (
        <AdminView
          state={store.state}
          onResolvePending={store.resolvePendingOrder}
          onApproveAllPending={store.approveAllPending}
          onToggleUserStatus={store.toggleUserStatus}
          onAddUser={store.addUser}
          onToggleShopStatus={store.toggleShopStatus}
          onAddShop={store.addShop}
          onUpdateSettings={store.updateSettings}
          onLogout={() => navigate('login')}
        />
      )}

      <div className="view-switcher" aria-label="Demo panel switcher">
        <button
          type="button"
          className={view === 'login' ? 'active' : ''}
          onClick={() => navigate('login')}
        >
          Login
        </button>
        <button
          type="button"
          className={view === 'user' ? 'active' : ''}
          onClick={() => navigate('user')}
        >
          User
        </button>
        <button
          type="button"
          className={view === 'admin' ? 'active' : ''}
          onClick={() => navigate('admin')}
        >
          Admin
        </button>
        <button
          type="button"
          className="reset-demo-btn"
          title="Reset demo data to initial defaults"
          onClick={store.resetDemo}
        >
          Reset
        </button>
      </div>
    </div>
  )
}

export default App
