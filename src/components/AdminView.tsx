import { useState } from 'react'
import type {
  ActionResult,
  DemoUser,
  PlatformSettings,
  RanDemoState,
  UserStatus,
} from '../demoStore'
import { CoinIcon, Icon } from './Icons'

interface AdminViewProps {
  state: RanDemoState
  onResolvePending: (orderId: string, decision: 'approve' | 'reject') => ActionResult
  onApproveAllPending: () => ActionResult
  onToggleUserStatus: (id: number) => void
  onToggleUserVerified: (id: number) => ActionResult
  onUpdateUser: (
    id: number,
    updates: {
      name: string
      email: string
      goldGrams: number
      status: UserStatus
      verified: boolean
    },
  ) => ActionResult
  onDeleteUser: (id: number) => ActionResult
  onAddUser: (name: string, email: string, initialGold?: number, verified?: boolean) => ActionResult
  onSwitchToUser: (userId: number) => void
  onToggleShopStatus: (id: number) => void
  onAddShop: (input: {
    name: string
    owner: string
    location: string
    offerTitle: string
  }) => ActionResult
  onUpdateSettings: (next: PlatformSettings) => ActionResult
  onLogout: () => void
}

type AdminMenu =
  | 'Dashboard'
  | 'Pending Approvals'
  | 'Users'
  | 'Gold Rate & Profit'
  | 'Shop Offers'

type UserFilter = 'all' | 'unverified' | 'suspended'

const MENU_ITEMS: { label: AdminMenu; icon: string }[] = [
  { label: 'Dashboard', icon: 'grid' },
  { label: 'Pending Approvals', icon: 'bag' },
  { label: 'Users', icon: 'users' },
  { label: 'Gold Rate & Profit', icon: 'chart' },
  { label: 'Shop Offers', icon: 'store' },
]

export function AdminView({
  state,
  onResolvePending,
  onApproveAllPending,
  onToggleUserStatus,
  onToggleUserVerified,
  onUpdateUser,
  onDeleteUser,
  onAddUser,
  onSwitchToUser,
  onToggleShopStatus,
  onAddShop,
  onUpdateSettings,
  onLogout,
}: AdminViewProps) {
  const [menu, setMenu] = useState<AdminMenu>('Dashboard')
  const [feedback, setFeedback] = useState<ActionResult | null>(null)
  const [userFilter, setUserFilter] = useState<UserFilter>('all')

  const [showAddUser, setShowAddUser] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserGold, setNewUserGold] = useState('0')
  const [newUserVerified, setNewUserVerified] = useState(true)
  const [userFormError, setUserFormError] = useState('')

  const [managedUserId, setManagedUserId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editGold, setEditGold] = useState('0')
  const [editStatus, setEditStatus] = useState<UserStatus>('Active')
  const [editVerified, setEditVerified] = useState(true)
  const [manageError, setManageError] = useState('')

  const [showAddShop, setShowAddShop] = useState(false)
  const [shopName, setShopName] = useState('')
  const [shopOwner, setShopOwner] = useState('')
  const [shopLocation, setShopLocation] = useState('')
  const [shopOffer, setShopOffer] = useState('')
  const [shopFormError, setShopFormError] = useState('')

  const [rateDraft, setRateDraft] = useState<string | null>(null)
  const [commissionDraft, setCommissionDraft] = useState<string | null>(null)
  const [minPurchaseDraft, setMinPurchaseDraft] = useState<string | null>(null)

  const rateInput = rateDraft ?? String(state.settings.goldRate)
  const commissionInput = commissionDraft ?? String(state.settings.commissionPercent)
  const minPurchaseInput = minPurchaseDraft ?? String(state.settings.minPurchase)

  const totalPlatformGold = state.users.reduce((sum, user) => sum + user.goldGrams, 0)
  const activeUsersCount = state.users.filter(user => user.status === 'Active').length
  const unverifiedUsersCount = state.users.filter(user => !user.verified).length
  const pendingShopsCount = state.shops.filter(shop => shop.status === 'Pending').length

  const filteredUsers = state.users.filter(user => {
    if (userFilter === 'unverified') return !user.verified
    if (userFilter === 'suspended') return user.status === 'Suspended'
    return true
  })

  const managedUser = state.users.find(user => user.id === managedUserId) ?? null
  const managedUserActivities = managedUser
    ? state.activities.filter(item => item.userId === managedUser.id).slice(0, 4)
    : []

  const openManageUser = (user: DemoUser) => {
    setManagedUserId(user.id)
    setEditName(user.name)
    setEditEmail(user.email)
    setEditGold(user.goldGrams.toFixed(4))
    setEditStatus(user.status)
    setEditVerified(user.verified)
    setManageError('')
  }

  const handleSaveManagedUser = (event: React.FormEvent) => {
    event.preventDefault()
    if (!managedUser) return
    const result = onUpdateUser(managedUser.id, {
      name: editName,
      email: editEmail,
      goldGrams: Number(editGold),
      status: editStatus,
      verified: editVerified,
    })
    if (!result.ok) {
      setManageError(result.message)
      return
    }
    setManagedUserId(null)
    setFeedback(result)
  }

  const handleDeleteManagedUser = () => {
    if (!managedUser) return
    const result = onDeleteUser(managedUser.id)
    if (!result.ok) {
      setManageError(result.message)
      return
    }
    setManagedUserId(null)
    setFeedback(result)
  }

  const handleSaveSettings = (event?: React.FormEvent) => {
    event?.preventDefault()
    const parsedRate = Number(rateInput.replace(/,/g, '').trim())
    const parsedCommission = Number(commissionInput.trim())
    const parsedMinPurchase = Number(minPurchaseInput.replace(/,/g, '').trim())
    const result = onUpdateSettings({
      goldRate: parsedRate,
      commissionPercent: parsedCommission,
      minPurchase: parsedMinPurchase,
    })
    if (result.ok) {
      setRateDraft(null)
      setCommissionDraft(null)
      setMinPurchaseDraft(null)
    }
    setFeedback(result)
  }

  const handleAddUserSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const result = onAddUser(
      newUserName,
      newUserEmail,
      Number(newUserGold) || 0,
      newUserVerified,
    )
    if (!result.ok) {
      setUserFormError(result.message)
      return
    }
    setUserFormError('')
    setNewUserName('')
    setNewUserEmail('')
    setNewUserGold('0')
    setNewUserVerified(true)
    setShowAddUser(false)
    setMenu('Users')
    setFeedback(result)
  }

  const handleAddShopSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const result = onAddShop({
      name: shopName,
      owner: shopOwner,
      location: shopLocation,
      offerTitle: shopOffer,
    })
    if (!result.ok) {
      setShopFormError(result.message)
      return
    }
    setShopFormError('')
    setShopName('')
    setShopOwner('')
    setShopLocation('')
    setShopOffer('')
    setShowAddShop(false)
    setMenu('Shop Offers')
    setFeedback(result)
  }

  const handleHeaderAction = () => {
    if (menu === 'Shop Offers') {
      setShopFormError('')
      setShowAddShop(true)
      return
    }
    if (menu === 'Pending Approvals') {
      setFeedback(onApproveAllPending())
      return
    }
    if (menu === 'Gold Rate & Profit') {
      const result = onUpdateSettings({
        goldRate: 25400,
        commissionPercent: 2.5,
        minPurchase: 20,
      })
      setRateDraft(null)
      setCommissionDraft(null)
      setMinPurchaseDraft(null)
      setFeedback({ ok: result.ok, message: 'Restored default gold rate & commission settings.' })
      return
    }
    setUserFormError('')
    setShowAddUser(true)
  }

  const headerActionLabel =
    menu === 'Shop Offers'
      ? '+ Add Shop'
      : menu === 'Pending Approvals'
        ? 'Approve All'
        : menu === 'Gold Rate & Profit'
          ? 'Reset Defaults'
          : '+ Add User'

  return (
    <main className="admin-shell">
      <header className="wp-bar">
        <b>Ran Admin</b>
        <div>
          Howdy, <span className="admin-avatar">A</span>
          <button type="button" className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <aside className="wp-sidebar">
        <div className="admin-brand">
          <span>
            <CoinIcon />
          </span>
          <b>Ran</b>
        </div>
        <nav>
          {MENU_ITEMS.map((item, idx) => (
            <button
              type="button"
              key={item.label}
              className={menu === item.label ? 'active' : ''}
              onClick={() => {
                setMenu(item.label)
                setFeedback(null)
              }}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
              {idx === 1 && state.pending.length > 0 && <em>{state.pending.length}</em>}
              {idx === 2 && unverifiedUsersCount > 0 && <em>{unverifiedUsersCount}</em>}
            </button>
          ))}
        </nav>
      </aside>

      <section className="wp-content">
        <div className="wp-heading">
          <div>
            <p>RAN PLATFORM</p>
            <h1>{menu}</h1>
          </div>
          <button type="button" className="admin-action" onClick={handleHeaderAction}>
            {headerActionLabel}
          </button>
        </div>

        {feedback && (
          <div className={`admin-feedback ${feedback.ok ? 'success' : 'error'}`} role="status">
            <span>{feedback.message}</span>
            <button type="button" onClick={() => setFeedback(null)} aria-label="Dismiss message">
              ×
            </button>
          </div>
        )}

        {menu === 'Dashboard' && (
          <>
            <div className="kpi-grid">
              <article className="kpi gold">
                <span className="kpi-icon">●</span>
                <div>
                  <p>Total Platform Gold</p>
                  <h2>{totalPlatformGold.toFixed(2)}g</h2>
                </div>
                <small>Synced across {state.users.length} wallets</small>
              </article>
              <article className="kpi mint">
                <span className="kpi-icon">↗</span>
                <div>
                  <p>Admin Profit Earned</p>
                  <h2>Rs. {Math.round(state.profitEarned).toLocaleString('en-IN')}</h2>
                </div>
                <small>{state.settings.commissionPercent}% commission rate</small>
              </article>
              <article className="kpi lavender">
                <span className="kpi-icon">♙</span>
                <div>
                  <p>Active Users</p>
                  <h2>{activeUsersCount} Users</h2>
                </div>
                <small>
                  {unverifiedUsersCount > 0
                    ? `${unverifiedUsersCount} awaiting verification`
                    : 'All users verified'}
                </small>
              </article>
              <article className="kpi peach">
                <span className="kpi-icon">◷</span>
                <div>
                  <p>Pending Approvals</p>
                  <h2>{pendingShopsCount + state.pending.length} Requests</h2>
                </div>
                <small>
                  {state.pending.length} orders · {pendingShopsCount} shops
                </small>
              </article>
            </div>

            <div className="admin-main-grid">
              <section className="approval-card">
                <div className="panel-heading">
                  <div>
                    <p>WORK QUEUE</p>
                    <h2>Middleman Approval Queue</h2>
                  </div>
                  <button type="button" onClick={() => setMenu('Pending Approvals')}>
                    View all
                  </button>
                </div>
                {state.pending.length === 0 ? (
                  <p className="empty-state">All caught up — no pending redemption orders.</p>
                ) : (
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Transaction</th>
                          <th>User</th>
                          <th>Gold Shop</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {state.pending.map(order => (
                          <tr key={order.id}>
                            <td>
                              <b>{order.id}</b>
                            </td>
                            <td>{order.user}</td>
                            <td>{order.shop}</td>
                            <td>
                              <b>{order.grams.toFixed(4)}g</b>
                            </td>
                            <td>
                              <span className="status pending">Pending Admin</span>
                            </td>
                            <td className="action-cell">
                              <button
                                type="button"
                                className="approve"
                                onClick={() =>
                                  setFeedback(onResolvePending(order.id, 'approve'))
                                }
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                className="suspend-btn"
                                onClick={() =>
                                  setFeedback(onResolvePending(order.id, 'reject'))
                                }
                              >
                                Reject
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <form className="settings-card" onSubmit={handleSaveSettings}>
                <div className="panel-heading">
                  <div>
                    <p>QUICK SETTINGS</p>
                    <h2>Gold Rate & Profit</h2>
                  </div>
                </div>
                <label>
                  Today's 1g gold rate
                  <div className="input-wrap">
                    <span>Rs.</span>
                    <input
                      value={rateInput}
                      onChange={event => setRateDraft(event.target.value)}
                    />
                  </div>
                </label>
                <label>
                  Commission percentage
                  <div className="input-wrap percent">
                    <input
                      value={commissionInput}
                      onChange={event => setCommissionDraft(event.target.value)}
                    />
                    <span>%</span>
                  </div>
                </label>
                <button type="submit" className="save-btn">
                  Save changes
                </button>
              </form>
            </div>
          </>
        )}

        {menu === 'Pending Approvals' && (
          <section className="approval-card management-card">
            <div className="panel-heading">
              <div>
                <p>APPROVAL QUEUE</p>
                <h2>Pending transactions</h2>
              </div>
              <span className="manage-count">{state.pending.length} pending</span>
            </div>
            {state.pending.length === 0 ? (
              <p className="empty-state">
                No pending redemption requests. Verified users can submit new requests once they
                reach 1.0000g.
              </p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>User</th>
                      <th>Gold Shop</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.pending.map(order => (
                      <tr key={order.id}>
                        <td>
                          <b>{order.id}</b>
                        </td>
                        <td>{order.user}</td>
                        <td>{order.shop}</td>
                        <td>
                          <b>{order.grams.toFixed(4)}g</b>
                        </td>
                        <td>
                          <span className="status pending">Pending</span>
                        </td>
                        <td className="action-cell">
                          <button
                            type="button"
                            className="approve"
                            onClick={() => setFeedback(onResolvePending(order.id, 'approve'))}
                          >
                            Approve & send
                          </button>
                          <button
                            type="button"
                            className="suspend-btn"
                            onClick={() => setFeedback(onResolvePending(order.id, 'reject'))}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {menu === 'Users' && (
          <section className="approval-card management-card">
            <div className="panel-heading">
              <div>
                <p>USER CONTROL & KYC</p>
                <h2>Verify & manage users</h2>
              </div>
              <div className="user-filter-tabs" role="tablist" aria-label="Filter users">
                <button
                  type="button"
                  className={userFilter === 'all' ? 'active' : ''}
                  onClick={() => setUserFilter('all')}
                >
                  All ({state.users.length})
                </button>
                <button
                  type="button"
                  className={userFilter === 'unverified' ? 'active' : ''}
                  onClick={() => setUserFilter('unverified')}
                >
                  Unverified ({unverifiedUsersCount})
                </button>
                <button
                  type="button"
                  className={userFilter === 'suspended' ? 'active' : ''}
                  onClick={() => setUserFilter('suspended')}
                >
                  Suspended ({state.users.filter(u => u.status === 'Suspended').length})
                </button>
              </div>
            </div>
            {filteredUsers.length === 0 ? (
              <p className="empty-state">No users match the selected filter.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Gold balance</th>
                      <th>Verification</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>
                          <b>{user.name}</b>
                          {user.id === state.currentUserId && (
                            <span className="you-pill">Active view</span>
                          )}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <b>{user.goldGrams.toFixed(4)}g</b>
                        </td>
                        <td>
                          <span
                            className={`status ${user.verified ? 'approved' : 'pending'}`}
                          >
                            {user.verified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`status ${user.status === 'Active' ? 'approved' : 'pending'}`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="action-cell">
                          <button
                            type="button"
                            className={user.verified ? 'suspend-btn' : 'approve'}
                            onClick={() => setFeedback(onToggleUserVerified(user.id))}
                          >
                            {user.verified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            type="button"
                            className="approve"
                            onClick={() => openManageUser(user)}
                          >
                            Manage
                          </button>
                          <button
                            type="button"
                            className="approve"
                            onClick={() => onSwitchToUser(user.id)}
                          >
                            Open Wallet
                          </button>
                          <button
                            type="button"
                            className={user.status === 'Active' ? 'suspend-btn' : 'approve'}
                            onClick={() => onToggleUserStatus(user.id)}
                          >
                            {user.status === 'Active' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {menu === 'Gold Rate & Profit' && (
          <form className="settings-card management-card" onSubmit={handleSaveSettings}>
            <div className="panel-heading">
              <div>
                <p>MARKET SETTINGS</p>
                <h2>Gold rate and commission</h2>
              </div>
            </div>
            <label>
              Today's 1g gold rate
              <div className="input-wrap">
                <span>Rs.</span>
                <input value={rateInput} onChange={event => setRateDraft(event.target.value)} />
              </div>
            </label>
            <label>
              Commission percentage
              <div className="input-wrap percent">
                <input
                  value={commissionInput}
                  onChange={event => setCommissionDraft(event.target.value)}
                />
                <span>%</span>
              </div>
            </label>
            <label>
              Minimum purchase amount
              <div className="input-wrap">
                <span>Rs.</span>
                <input
                  value={minPurchaseInput}
                  onChange={event => setMinPurchaseDraft(event.target.value)}
                />
              </div>
            </label>
            <button type="submit" className="save-btn">
              Save changes
            </button>
          </form>
        )}

        {menu === 'Shop Offers' && (
          <section className="approval-card management-card">
            <div className="panel-heading">
              <div>
                <p>PARTNER CONTROL</p>
                <h2>Manage gold shops</h2>
              </div>
              <span className="manage-count">{state.shops.length} partners</span>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Shop</th>
                    <th>Owner</th>
                    <th>Location</th>
                    <th>Offer</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {state.shops.map(shop => (
                    <tr key={shop.id}>
                      <td>
                        <b>{shop.name}</b>
                      </td>
                      <td>{shop.owner}</td>
                      <td>{shop.location}</td>
                      <td>{shop.offerTitle}</td>
                      <td>
                        <span
                          className={`status ${shop.status === 'Approved' ? 'approved' : 'pending'}`}
                        >
                          {shop.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={shop.status === 'Approved' ? 'suspend-btn' : 'approve'}
                          onClick={() => onToggleShopStatus(shop.id)}
                        >
                          {shop.status === 'Approved'
                            ? 'Suspend'
                            : shop.status === 'Pending'
                              ? 'Approve'
                              : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </section>

      {showAddUser && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowAddUser(false)
          }}
        >
          <form className="add-user-modal" onSubmit={handleAddUserSubmit}>
            <div className="panel-heading">
              <div>
                <p>USER ACCOUNT</p>
                <h2>Add a new user</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddUser(false)}
              >
                ×
              </button>
            </div>
            <label>
              Full name
              <input
                value={newUserName}
                onChange={event => setNewUserName(event.target.value)}
                placeholder="Enter full name"
              />
            </label>
            <label>
              Email address
              <input
                type="email"
                value={newUserEmail}
                onChange={event => setNewUserEmail(event.target.value)}
                placeholder="user@ran.app"
              />
            </label>
            <label>
              Starting gold balance (g)
              <input
                type="number"
                step="0.0001"
                min="0"
                value={newUserGold}
                onChange={event => setNewUserGold(event.target.value)}
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={newUserVerified}
                onChange={event => setNewUserVerified(event.target.checked)}
              />
              <span>Mark user as KYC verified</span>
            </label>
            {userFormError && (
              <p className="login-error" role="alert">
                {userFormError}
              </p>
            )}
            <button className="save-btn" type="submit">
              Create user
            </button>
          </form>
        </div>
      )}

      {managedUser && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setManagedUserId(null)
          }}
        >
          <form className="add-user-modal modal-wide" onSubmit={handleSaveManagedUser}>
            <div className="panel-heading">
              <div>
                <p>MANAGE USER</p>
                <h2>{managedUser.name}</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setManagedUserId(null)}
              >
                ×
              </button>
            </div>

            <div className="manage-grid">
              <label>
                Full name
                <input
                  value={editName}
                  onChange={event => setEditName(event.target.value)}
                />
              </label>
              <label>
                Email address
                <input
                  type="email"
                  value={editEmail}
                  onChange={event => setEditEmail(event.target.value)}
                />
              </label>
            </div>

            <div className="manage-grid">
              <label>
                Gold balance (g)
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={editGold}
                  onChange={event => setEditGold(event.target.value)}
                />
              </label>
              <label>
                Account status
                <select
                  value={editStatus}
                  onChange={event => setEditStatus(event.target.value as UserStatus)}
                >
                  <option value="Active">Active</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </label>
            </div>

            <div className="quick-gold-adjust">
              <span>Quick balance adjust:</span>
              <button
                type="button"
                onClick={() =>
                  setEditGold(prev => Math.max(0, (Number(prev) || 0) + 0.5).toFixed(4))
                }
              >
                +0.5g
              </button>
              <button
                type="button"
                onClick={() =>
                  setEditGold(prev => Math.max(0, (Number(prev) || 0) + 1).toFixed(4))
                }
              >
                +1.0g
              </button>
              <button
                type="button"
                onClick={() => setEditGold('0.0000')}
              >
                Clear (0g)
              </button>
            </div>

            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={editVerified}
                onChange={event => setEditVerified(event.target.checked)}
              />
              <span>Verified user (allows Gold Shop redemptions)</span>
            </label>

            {managedUserActivities.length > 0 && (
              <div className="manage-activity-box">
                <p className="eyebrow">RECENT USER ACTIVITY</p>
                <ul>
                  {managedUserActivities.map(act => (
                    <li key={act.id}>
                      <span>{act.title}</span>
                      <b>{act.amountLabel}</b>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {manageError && (
              <p className="login-error" role="alert">
                {manageError}
              </p>
            )}

            <div className="modal-actions">
              <button
                type="button"
                className="danger-btn"
                onClick={handleDeleteManagedUser}
              >
                Delete
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => {
                  setManagedUserId(null)
                  onSwitchToUser(managedUser.id)
                }}
              >
                Open Wallet
              </button>
              <button className="save-btn" type="submit">
                Save user changes
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddShop && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setShowAddShop(false)
          }}
        >
          <form className="add-user-modal" onSubmit={handleAddShopSubmit}>
            <div className="panel-heading">
              <div>
                <p>PARTNER GOLD SHOP</p>
                <h2>Add a new partner shop</h2>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddShop(false)}
              >
                ×
              </button>
            </div>
            <label>
              Shop name
              <input
                value={shopName}
                onChange={event => setShopName(event.target.value)}
                placeholder="e.g. Zaveri & Sons"
              />
            </label>
            <label>
              Owner name
              <input
                value={shopOwner}
                onChange={event => setShopOwner(event.target.value)}
                placeholder="Owner full name"
              />
            </label>
            <label>
              City
              <input
                value={shopLocation}
                onChange={event => setShopLocation(event.target.value)}
                placeholder="e.g. Delhi"
              />
            </label>
            <label>
              Partner offer
              <input
                value={shopOffer}
                onChange={event => setShopOffer(event.target.value)}
                placeholder="e.g. Zero making charges on 1g coins"
              />
            </label>
            {shopFormError && (
              <p className="login-error" role="alert">
                {shopFormError}
              </p>
            )}
            <button className="save-btn" type="submit">
              Add partner shop
            </button>
          </form>
        </div>
      )}
    </main>
  )
}
