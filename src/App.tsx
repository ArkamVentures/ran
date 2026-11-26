import { useEffect, useState } from 'react'
import './App.css'

type View = 'login' | 'user' | 'admin'

const coinIcon = (
  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 7v10M9 9.5h4.5a2 2 0 0 1 0 4H10.5a2 2 0 0 0 0 4H15"/></svg>
)

function Icon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></>,
    users: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 19c0-4 2.5-6 6-6s6 2 6 6M14 14c3.5-.8 6 1 6 5"/></>,
    store: <><path d="M4 10v10h16V10M3 10l2-6h14l2 6"/><path d="M3 10c0 2 2 3 3.5 3S9 12 9 10c0 2 2 3 3 3s3-1 3-3c0 2 2 3 3.5 3S21 12 21 10M9 20v-5h6v5"/></>,
    chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20V7"/><path d="M2 20h20"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></>,
    bag: <><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/></>,
  }
  return <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>
}

function UserView() {
  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState('')
  const [goldGrams, setGoldGrams] = useState(0.845)
  const [purchaseMessage, setPurchaseMessage] = useState('')
  const choices = [20, 50, 100]
  const goldRate = 25400
  const walletValue = goldGrams * goldRate
  const progress = Math.min((goldGrams / 1) * 100, 100)
  const remaining = Math.max(1 - goldGrams, 0)

  const buyGold = () => {
    const purchaseAmount = custom ? Number(custom) : amount
    if (!Number.isFinite(purchaseAmount) || purchaseAmount < 20) {
      setPurchaseMessage('Enter an amount of at least Rs. 20')
      return
    }

    const gramsBought = purchaseAmount / goldRate
    setGoldGrams(previous => previous + gramsBought)
    setPurchaseMessage(`Purchase successful — ${gramsBought.toFixed(4)}g added to your wallet`)
  }

  return (
    <main className="user-shell">
      <header className="user-header">
        <div className="brand"><span className="brand-mark">{coinIcon}</span><span>Ran</span></div>
        <div className="gold-rate"><span className="live-dot" />1g = Rs. 25,400</div>
        <div className="profile"><span className="profile-copy"><b>Aisha Khan</b><small>Gold saver</small></span><span className="avatar">AK</span></div>
      </header>

      <section className="user-content">
        <div className="welcome-row"><div><p className="eyebrow">MONDAY, 26 NOVEMBER</p><h1>Good morning, Aisha</h1></div><div className="welcome-actions"><button className="outline-btn"><Icon name="bell" />Notifications</button><button className="outline-btn" onClick={() => { sessionStorage.removeItem('ran-role'); window.location.hash = 'login' }}>Logout</button></div></div>

        <div className="dashboard-grid">
          <section className="wallet-card">
            <div className="wallet-top"><div><p>YOUR GOLD WALLET</p><div className="wallet-amount">{goldGrams.toFixed(4)} <span>g</span></div></div><div className="coin-visual"><span>{coinIcon}</span></div></div>
            <div className="wallet-bottom"><div><small>Equivalent value</small><strong>Rs. {walletValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div><button>View activity <span>→</span></button></div>
          </section>

          <section className="buy-card">
            <div className="card-heading"><div><p className="eyebrow">MICRO INVEST</p><h2>Buy digital gold</h2></div><span className="secure">● Secure</span></div>
            <div className="amount-row">
              {choices.map(value => <button type="button" key={value} className={amount === value && !custom ? 'active' : ''} onClick={() => {setAmount(value); setCustom('')}}>+ Rs. {value}</button>)}
              <input type="number" min="20" aria-label="Custom amount" placeholder="Custom" value={custom} onChange={e => {setCustom(e.target.value); setAmount(0)}} />
            </div>
            <button type="button" className="primary-btn" onClick={buyGold}>Buy for Rs. {custom || amount}</button>
            {purchaseMessage && <p className={`purchase-message ${purchaseMessage.startsWith('Purchase') ? 'success' : 'error'}`} role="status">{purchaseMessage}</p>}
          </section>
        </div>

        <section className="progress-card">
          <div className="progress-main">
            <div className="progress-ring" style={{'--progress': `${progress}%`} as React.CSSProperties}><span>{progress.toFixed(1)}%</span></div>
            <div className="progress-copy"><p>YOUR NEXT GOAL</p><h2>{goldGrams >= 1 ? 'Goal reached — ready to redeem' : `Just ${remaining.toFixed(4)}g away from 1g`}</h2><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><small>{goldGrams.toFixed(4)}g <b>earned</b></small></div>
          </div>
          <div className="progress-actions"><button className="secondary-btn">Reverse to Cash</button><button className={goldGrams >= 1 ? 'unlocked-btn' : 'locked-btn'} disabled={goldGrams < 1}><span>⌑</span> Redeem at Gold Shop</button></div>
        </section>

        <section className="offers-section">
          <div className="section-heading"><div><p className="eyebrow">PARTNER OFFERS</p><h2>More shine for every gram</h2></div><button>View all <span>→</span></button></div>
          <div className="offers-grid">
            <article className="offer-card blush"><div className="offer-logo">V</div><div><span className="offer-tag">POPULAR</span><h3>Vogue Jewellers</h3><p>5% off making charges on 1g coins</p><small>Valid till 30 Nov</small></div><button>→</button></article>
            <article className="offer-card lavender"><div className="offer-logo rose">A</div><div><span className="offer-tag">NEW</span><h3>Aurum House</h3><p>Free engraving on gold above 1g</p><small>Valid till 15 Dec</small></div><button>→</button></article>
          </div>
        </section>
      </section>
    </main>
  )
}

function AdminView() {
  const [menu, setMenu] = useState('Dashboard')
  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [users, setUsers] = useState([
    { id: 1, name: 'Maya Shah', email: 'maya@ran.app', gold: '1.20g', status: 'Active' },
    { id: 2, name: 'Arjun Kumar', email: 'arjun@ran.app', gold: '1.00g', status: 'Active' },
    { id: 3, name: 'Sana Noor', email: 'sana@ran.app', gold: '0.84g', status: 'Suspended' },
  ])
  const [shops, setShops] = useState([
    { id: 1, name: 'Vogue Jewellers', owner: 'Rohan Mehta', location: 'Mumbai', status: 'Approved' },
    { id: 2, name: 'Aurum House', owner: 'Leena Shah', location: 'Surat', status: 'Approved' },
    { id: 3, name: 'Golden Leaf', owner: 'Faizan Ali', location: 'Jaipur', status: 'Pending' },
  ])
  const [pending, setPending] = useState([
    { id: '#RAN-2401', user: 'Maya Shah', shop: 'Vogue Jewellers', amount: '1.20g' },
    { id: '#RAN-2402', user: 'Arjun Kumar', shop: 'Aurum House', amount: '1.00g' },
  ])
  const menuItems = ['Dashboard', 'Pending Approvals', 'Users', 'Gold Rate & Profit', 'Shop Offers']

  const toggleUser = (id: number) => setUsers(list => list.map(user => user.id === id ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' } : user))
  const toggleShop = (id: number) => setShops(list => list.map(shop => shop.id === id ? { ...shop, status: shop.status === 'Approved' ? 'Suspended' : 'Approved' } : shop))
  const addUser = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return
    setUsers(list => [...list, { id: Date.now(), name: newUserName.trim(), email: newUserEmail.trim(), gold: '0.0000g', status: 'Active' }])
    setNewUserName('')
    setNewUserEmail('')
    setShowAddUser(false)
    setMenu('Users')
  }

  return (
    <main className="admin-shell">
      <header className="wp-bar"><b>Ran Admin</b><div>Howdy, <span className="admin-avatar">A</span><button className="logout-btn" onClick={logoutRan}>Logout</button></div></header>
      <aside className="wp-sidebar"><div className="admin-brand"><span>{coinIcon}</span><b>Ran</b></div><nav>{menuItems.map((item, i) => <button key={item} className={menu === item ? 'active' : ''} onClick={() => setMenu(item)}><Icon name={i === 0 ? 'grid' : i === 1 ? 'bag' : i === 2 ? 'users' : i === 3 ? 'chart' : 'store'} /><span>{item}</span>{i === 1 && pending.length > 0 && <em>{pending.length}</em>}</button>)}</nav></aside>
      <section className="wp-content">
        <div className="wp-heading"><div><p>RAN PLATFORM</p><h1>{menu}</h1></div><button className="admin-action" onClick={() => { if (menu === 'Users') setShowAddUser(true); else setMenu(menu === 'Shop Offers' ? 'Shop Offers' : 'Dashboard') }}>{menu === 'Users' ? '+ Add User' : menu === 'Shop Offers' ? 'Manage Shops' : '+ Add New'}</button></div>

        {menu === 'Dashboard' && <>
          <div className="kpi-grid">
            <article className="kpi gold"><span className="kpi-icon">●</span><div><p>Total Platform Gold</p><h2>142.50g</h2></div><small>+6.2% this week</small></article>
            <article className="kpi mint"><span className="kpi-icon">↗</span><div><p>Admin Profit Earned</p><h2>Rs. 48,250</h2></div><small>+12.4% this month</small></article>
            <article className="kpi lavender"><span className="kpi-icon">♙</span><div><p>Active Users</p><h2>{users.filter(user => user.status === 'Active').length + 317} Users</h2></div><small>{users.length} managed locally</small></article>
            <article className="kpi peach"><span className="kpi-icon">◷</span><div><p>Pending Shop Approvals</p><h2>{shops.filter(shop => shop.status === 'Pending').length + pending.length} Requests</h2></div><small>Needs review</small></article>
          </div>
          <div className="admin-main-grid">
            <section className="approval-card"><div className="panel-heading"><div><p>WORK QUEUE</p><h2>Middleman Approval Queue</h2></div><button onClick={() => setMenu('Pending Approvals')}>View all</button></div><div className="table-wrap"><table><thead><tr><th>Transaction</th><th>User</th><th>Gold Shop</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>
              {pending.map(order => <tr key={order.id}><td><b>{order.id}</b></td><td>{order.user}</td><td>{order.shop}</td><td><b>{order.amount}</b></td><td><span className="status pending">Pending Admin</span></td><td><button className="approve" onClick={() => setPending(list => list.filter(item => item.id !== order.id))}>Approve</button></td></tr>)}
            </tbody></table></div></section>
            <section className="settings-card"><div className="panel-heading"><div><p>QUICK SETTINGS</p><h2>Gold Rate & Profit</h2></div></div><label>Today's 1g gold rate<div className="input-wrap"><span>Rs.</span><input defaultValue="25,400" /></div></label><label>Commission percentage<div className="input-wrap percent"><input defaultValue="2.5" /><span>%</span></div></label><button className="save-btn">Save changes</button></section>
          </div>
        </>}

        {menu === 'Pending Approvals' && <section className="approval-card management-card"><div className="panel-heading"><div><p>APPROVAL QUEUE</p><h2>Pending transactions</h2></div></div><div className="table-wrap"><table><thead><tr><th>Transaction</th><th>User</th><th>Gold Shop</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{pending.map(order => <tr key={order.id}><td><b>{order.id}</b></td><td>{order.user}</td><td>{order.shop}</td><td><b>{order.amount}</b></td><td><span className="status pending">Pending</span></td><td><button className="approve" onClick={() => setPending(list => list.filter(item => item.id !== order.id))}>Approve & send</button></td></tr>)}</tbody></table></div></section>}

        {menu === 'Users' && <section className="approval-card management-card"><div className="panel-heading"><div><p>USER CONTROL</p><h2>Manage users</h2></div><span className="manage-count">{users.length} accounts</span></div><div className="table-wrap"><table><thead><tr><th>User</th><th>Email</th><th>Gold balance</th><th>Status</th><th>Action</th></tr></thead><tbody>{users.map(user => <tr key={user.id}><td><b>{user.name}</b></td><td>{user.email}</td><td><b>{user.gold}</b></td><td><span className={`status ${user.status === 'Active' ? 'approved' : 'pending'}`}>{user.status}</span></td><td><button className={user.status === 'Active' ? 'suspend-btn' : 'approve'} onClick={() => toggleUser(user.id)}>{user.status === 'Active' ? 'Suspend' : 'Activate'}</button></td></tr>)}</tbody></table></div>
          {showAddUser && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowAddUser(false) }}><form className="add-user-modal" onSubmit={addUser}><div className="panel-heading"><div><p>USER ACCOUNT</p><h2>Add a new user</h2></div><button type="button" className="modal-close" onClick={() => setShowAddUser(false)}>×</button></div><label>Full name<input value={newUserName} onChange={event => setNewUserName(event.target.value)} placeholder="Enter full name" /></label><label>Email address<input type="email" value={newUserEmail} onChange={event => setNewUserEmail(event.target.value)} placeholder="user@ran.app" /></label><button className="save-btn" type="submit">Create user</button></form></div>}
          </section>}

        {menu === 'Gold Rate & Profit' && <section className="settings-card management-card"><div className="panel-heading"><div><p>MARKET SETTINGS</p><h2>Gold rate and commission</h2></div></div><label>Today's 1g gold rate<div className="input-wrap"><span>Rs.</span><input defaultValue="25,400" /></div></label><label>Commission percentage<div className="input-wrap percent"><input defaultValue="2.5" /><span>%</span></div></label><label>Minimum purchase amount<div className="input-wrap"><span>Rs.</span><input defaultValue="20" /></div></label><button className="save-btn">Save changes</button></section>}

        {menu === 'Shop Offers' && <section className="approval-card management-card"><div className="panel-heading"><div><p>PARTNER CONTROL</p><h2>Manage gold shops</h2></div><span className="manage-count">{shops.length} partners</span></div><div className="table-wrap"><table><thead><tr><th>Shop</th><th>Owner</th><th>Location</th><th>Status</th><th>Action</th></tr></thead><tbody>{shops.map(shop => <tr key={shop.id}><td><b>{shop.name}</b></td><td>{shop.owner}</td><td>{shop.location}</td><td><span className={`status ${shop.status === 'Approved' ? 'approved' : 'pending'}`}>{shop.status}</span></td><td><button className={shop.status === 'Approved' ? 'suspend-btn' : 'approve'} onClick={() => toggleShop(shop.id)}>{shop.status === 'Approved' ? 'Suspend' : shop.status === 'Pending' ? 'Approve' : 'Restore'}</button></td></tr>)}</tbody></table></div></section>}
      </section>
      {showAddUser && <div className="modal-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setShowAddUser(false) }}><form className="add-user-modal" onSubmit={addUser}><div className="panel-heading"><div><p>USER ACCOUNT</p><h2>Add a new user</h2></div><button type="button" className="modal-close" onClick={() => setShowAddUser(false)}>×</button></div><label>Full name<input value={newUserName} onChange={event => setNewUserName(event.target.value)} placeholder="Enter full name" /></label><label>Email address<input type="email" value={newUserEmail} onChange={event => setNewUserEmail(event.target.value)} placeholder="user@ran.app" /></label><button className="save-btn" type="submit">Create user</button></form></div>}
    </main>
  )
}

function LoginView({ onLogin }: { onLogin: (role: 'user' | 'admin') => void }) {
  const [role, setRole] = useState<'user' | 'admin'>('user')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() || !password.trim()) {
      setError('Enter both email and password')
      return
    }
    setError('')
    onLogin(role)
  }

  return (
    <main className="login-shell">
      <section className="login-brand-panel">
        <div className="login-brand"><span className="brand-mark">{coinIcon}</span><b>Ran</b></div>
        <div className="login-brand-copy"><p>MICRO-GOLD PLATFORM</p><h1>Build your gold future,<br />one gram at a time.</h1><div className="login-glow"><span>0.8450g</span><small>Secure digital gold wallet</small></div></div>
      </section>
      <section className="login-form-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to Ran</h2>
          <div className="login-roles">
            <button type="button" className={role === 'user' ? 'active' : ''} onClick={() => setRole('user')}>User</button>
            <button type="button" className={role === 'admin' ? 'active' : ''} onClick={() => setRole('admin')}>Admin</button>
          </div>
          <label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={role === 'admin' ? 'admin@ran.app' : 'you@ran.app'} /></label>
          <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Enter your password" /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button className="login-submit" type="submit">Sign in as {role === 'admin' ? 'Admin' : 'User'} <span>→</span></button>
          <div className="login-divider"><span>or</span></div>
          <button type="button" className="google-signin" onClick={() => onLogin(role)}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.89h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.89-1.74 2.98-4.31 2.98-7.37Z"/>
              <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.4l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.6A10 10 0 0 0 12 22Z"/>
              <path fill="#FBBC05" d="M6.39 13.91A6 6 0 0 1 6.07 12c0-.66.11-1.3.32-1.91v-2.6H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.51l3.35-2.6Z"/>
              <path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.49l3.35 2.6A6 6 0 0 1 12 5.96Z"/>
            </svg>
            Continue with Google
          </button>
          <button type="button" className="forgot-btn">Forgot password?</button>
        </form>
      </section>
    </main>
  )
}

function logoutRan() {
  sessionStorage.removeItem('ran-role')
  window.history.replaceState(null, '', '#login')
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

function getPanelFromHash(): View {
  const route = window.location.hash.replace('#', '')
  const sessionRole = sessionStorage.getItem('ran-role')
  if (route === 'login' || !sessionRole) return 'login'
  if (sessionRole === 'admin' && route === 'admin') return 'admin'
  if (sessionRole === 'user' && route === 'user') return 'user'
  return 'login'
}

function App() {
  const [view, setView] = useState<View>(getPanelFromHash)

  useEffect(() => {
    const handleRouteChange = () => setView(getPanelFromHash())
    window.addEventListener('hashchange', handleRouteChange)
    if (!window.location.hash) window.history.replaceState(null, '', '#login')
    return () => window.removeEventListener('hashchange', handleRouteChange)
  }, [])

  const handleLogin = (role: 'user' | 'admin') => {
    sessionStorage.setItem('ran-role', role)
    window.location.hash = role
  }

  return (
    <div className="app">
      {view === 'login' && <LoginView onLogin={handleLogin} />}
      {view === 'user' && <UserView />}
      {view === 'admin' && <AdminView />}
    </div>
  )
}

export default App
