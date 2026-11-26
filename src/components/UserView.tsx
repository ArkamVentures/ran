import { useMemo, useState } from 'react'
import { getCurrentUser } from '../demoStore'
import type { ActionResult, DemoShop, RanDemoState } from '../demoStore'
import { CoinIcon, Icon } from './Icons'

interface UserViewProps {
  state: RanDemoState
  onBuyGold: (rupees: number) => ActionResult
  onReverseToCash: (grams: number) => ActionResult
  onRequestRedemption: (shopName: string, grams: number) => ActionResult
  onMarkNotificationsRead: () => void
  onLogout: () => void
}

type UserModal =
  | null
  | { type: 'activity' }
  | { type: 'notifications' }
  | { type: 'cashout' }
  | { type: 'redeem'; preselectedShop?: string }
  | { type: 'offers' }
  | { type: 'offer-detail'; shop: DemoShop }

function formatHeaderDate(): string {
  return new Date()
    .toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    })
    .toUpperCase()
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  return parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function UserView({
  state,
  onBuyGold,
  onReverseToCash,
  onRequestRedemption,
  onMarkNotificationsRead,
  onLogout,
}: UserViewProps) {
  const user = getCurrentUser(state)
  const { goldRate, minPurchase } = state.settings
  const choices = useMemo(() => {
    const base = [20, 50, 100]
    return minPurchase > 20
      ? [minPurchase, minPurchase * 2, minPurchase * 5]
      : base
  }, [minPurchase])

  const [amount, setAmount] = useState(50)
  const [custom, setCustom] = useState('')
  const [purchaseMessage, setPurchaseMessage] = useState<ActionResult | null>(null)
  const [modal, setModal] = useState<UserModal>(null)

  const [cashoutGrams, setCashoutGrams] = useState('0.2000')
  const [redeemShop, setRedeemShop] = useState('')
  const [redeemGrams, setRedeemGrams] = useState('1.0000')
  const [modalError, setModalError] = useState('')

  const goldGrams = user.goldGrams
  const walletValue = goldGrams * goldRate
  const progress = Math.min((goldGrams / 1) * 100, 100)
  const remaining = Math.max(1 - goldGrams, 0)
  const approvedShops = state.shops.filter(shop => shop.status === 'Approved')
  const unreadCount = state.notifications.filter(item => !item.read).length

  const effectivePurchaseAmount = custom.trim() ? Number(custom) : amount || choices[1]

  const handleBuy = () => {
    const result = onBuyGold(effectivePurchaseAmount)
    setPurchaseMessage(result)
  }

  const openNotifications = () => {
    setModalError('')
    setModal({ type: 'notifications' })
    onMarkNotificationsRead()
  }

  const openCashout = () => {
    setModalError('')
    setCashoutGrams(Math.min(goldGrams, 0.25).toFixed(4))
    setModal({ type: 'cashout' })
  }

  const openRedeem = (preselectedShop?: string) => {
    setModalError('')
    setRedeemShop(preselectedShop ?? approvedShops[0]?.name ?? '')
    setRedeemGrams(Math.min(goldGrams, 1).toFixed(4))
    setModal({ type: 'redeem', preselectedShop })
  }

  const submitCashout = (event: React.FormEvent) => {
    event.preventDefault()
    const result = onReverseToCash(Number(cashoutGrams))
    if (!result.ok) {
      setModalError(result.message)
      return
    }
    setPurchaseMessage(result)
    setModal(null)
  }

  const submitRedeem = (event: React.FormEvent) => {
    event.preventDefault()
    const result = onRequestRedemption(redeemShop, Number(redeemGrams))
    if (!result.ok) {
      setModalError(result.message)
      return
    }
    setPurchaseMessage(result)
    setModal(null)
  }

  return (
    <main className="user-shell">
      <header className="user-header">
        <div className="brand">
          <span className="brand-mark"><CoinIcon /></span>
          <span>Ran</span>
        </div>
        <div className="gold-rate">
          <span className="live-dot" />
          1g = Rs. {goldRate.toLocaleString('en-IN')}
        </div>
        <div className="profile">
          <span className="profile-copy">
            <b>{user.name}</b>
            <small>{user.status === 'Suspended' ? 'Account suspended' : 'Gold saver'}</small>
          </span>
          <span className="avatar">{getInitials(user.name)}</span>
        </div>
      </header>

      <section className="user-content">
        <div className="welcome-row">
          <div>
            <p className="eyebrow">{formatHeaderDate()}</p>
            <h1>Good morning, {user.name.split(' ')[0]}</h1>
          </div>
          <div className="welcome-actions">
            <button type="button" className="outline-btn notif-btn" onClick={openNotifications}>
              <Icon name="bell" />
              <span>Notifications</span>
              {unreadCount > 0 && <em className="notif-badge">{unreadCount}</em>}
            </button>
            <button type="button" className="outline-btn logout-outline-btn" onClick={onLogout}>
              <Icon name="logout" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {user.status === 'Suspended' && (
          <div className="demo-alert" role="alert">
            Your user account is suspended by Admin. Reactivate {user.name} in the Admin panel to
            buy or redeem gold.
          </div>
        )}

        <div className="dashboard-grid">
          <section className="wallet-card">
            <div className="wallet-top">
              <div>
                <p>YOUR GOLD WALLET</p>
                <div className="wallet-amount">
                  {goldGrams.toFixed(4)} <span>g</span>
                </div>
              </div>
              <div className="coin-visual">
                <span><CoinIcon /></span>
              </div>
            </div>
            <div className="wallet-bottom">
              <div>
                <small>Equivalent value</small>
                <strong>
                  Rs.{' '}
                  {walletValue.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
              <button type="button" onClick={() => setModal({ type: 'activity' })}>
                View activity <span>→</span>
              </button>
            </div>
          </section>

          <section className="buy-card">
            <div className="card-heading">
              <div>
                <p className="eyebrow">MICRO INVEST</p>
                <h2>Buy digital gold</h2>
              </div>
              <span className="secure">● Secure</span>
            </div>
            <div className="amount-row">
              {choices.map(value => (
                <button
                  type="button"
                  key={value}
                  className={amount === value && !custom.trim() ? 'active' : ''}
                  onClick={() => {
                    setAmount(value)
                    setCustom('')
                  }}
                >
                  + Rs. {value}
                </button>
              ))}
              <input
                type="number"
                min={minPurchase}
                aria-label="Custom amount"
                placeholder="Custom"
                value={custom}
                onChange={event => {
                  const val = event.target.value
                  setCustom(val)
                  if (!val.trim() && amount === 0) {
                    setAmount(choices[1])
                  }
                }}
              />
            </div>
            <button type="button" className="primary-btn" onClick={handleBuy}>
              Buy for Rs.{' '}
              {Number.isFinite(effectivePurchaseAmount) && effectivePurchaseAmount > 0
                ? effectivePurchaseAmount
                : choices[1]}
            </button>
            {purchaseMessage && (
              <p
                className={`purchase-message ${purchaseMessage.ok ? 'success' : 'error'}`}
                role="status"
              >
                {purchaseMessage.message}
              </p>
            )}
          </section>
        </div>

        <section className="progress-card">
          <div className="progress-main">
            <div
              className="progress-ring"
              style={{ '--progress': `${progress}%` } as React.CSSProperties}
            >
              <span>{progress.toFixed(1)}%</span>
            </div>
            <div className="progress-copy">
              <p>YOUR NEXT GOAL</p>
              <h2>
                {goldGrams >= 1
                  ? 'Goal reached — ready to redeem'
                  : `Just ${remaining.toFixed(4)}g away from 1g`}
              </h2>
              <div className="progress-track">
                <span style={{ width: `${progress}%` }} />
              </div>
              <small>
                {goldGrams.toFixed(4)}g <b>earned</b>
              </small>
            </div>
          </div>
          <div className="progress-actions">
            <button
              type="button"
              className="secondary-btn"
              disabled={goldGrams <= 0}
              onClick={openCashout}
            >
              Reverse to Cash
            </button>
            <button
              type="button"
              className={goldGrams >= 1 && approvedShops.length > 0 ? 'unlocked-btn' : 'locked-btn'}
              disabled={goldGrams < 1 || approvedShops.length === 0}
              onClick={() => openRedeem()}
            >
              <span>⌑</span> Redeem at Gold Shop
            </button>
          </div>
        </section>

        <section className="offers-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">PARTNER OFFERS</p>
              <h2>More shine for every gram</h2>
            </div>
            <button type="button" onClick={() => setModal({ type: 'offers' })}>
              View all <span>→</span>
            </button>
          </div>
          {approvedShops.length === 0 ? (
            <div className="empty-state">
              No partner shops are currently approved. Approve a shop in the Admin panel to display
              offers here.
            </div>
          ) : (
            <div className="offers-grid">
              {approvedShops.slice(0, 2).map(shop => (
                <article key={shop.id} className={`offer-card ${shop.tone}`}>
                  <div className={`offer-logo ${shop.tone === 'lavender' ? 'rose' : ''}`}>
                    {shop.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <span className="offer-tag">{shop.offerTag}</span>
                    <h3>{shop.name}</h3>
                    <p>{shop.offerTitle}</p>
                    <small>
                      {shop.location} · {shop.validTill}
                    </small>
                  </div>
                  <button
                    type="button"
                    aria-label={`View offer at ${shop.name}`}
                    onClick={() => setModal({ type: 'offer-detail', shop })}
                  >
                    →
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>

      {modal?.type === 'activity' && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <div className="add-user-modal modal-wide">
            <div className="panel-heading">
              <div>
                <p>WALLET LEDGER</p>
                <h2>Recent activity</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            {state.activities.length === 0 ? (
              <p className="empty-state">No transactions recorded yet.</p>
            ) : (
              <ul className="activity-list">
                {state.activities.map(item => (
                  <li key={item.id} className="activity-item">
                    <div>
                      <strong>{item.title}</strong>
                      <small>{item.detail}</small>
                    </div>
                    <div className="activity-right">
                      <span className={item.amountLabel.startsWith('+') ? 'pos' : 'neg'}>
                        {item.amountLabel}
                      </span>
                      <small>{item.timestamp}</small>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {modal?.type === 'notifications' && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <div className="add-user-modal modal-wide">
            <div className="panel-heading">
              <div>
                <p>UPDATES</p>
                <h2>Notifications</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <ul className="activity-list">
              {state.notifications.map(item => (
                <li key={item.id} className="activity-item">
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </div>
                  <div className="activity-right">
                    <small>{item.timestamp}</small>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {modal?.type === 'cashout' && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <form className="add-user-modal" onSubmit={submitCashout}>
            <div className="panel-heading">
              <div>
                <p>INSTANT LIQUIDITY</p>
                <h2>Reverse gold to cash</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <p className="modal-subtext">
              Available balance: <b>{goldGrams.toFixed(4)}g</b> (Rs. {goldRate.toLocaleString('en-IN')}
              /g)
            </p>
            <label>
              Grams to convert
              <input
                type="number"
                step="0.0001"
                min="0.0001"
                max={goldGrams}
                value={cashoutGrams}
                onChange={event => setCashoutGrams(event.target.value)}
              />
            </label>
            <p className="modal-subtext">
              Estimated payout:{' '}
              <b>
                Rs.{' '}
                {(Math.max(0, Number(cashoutGrams) || 0) * goldRate).toLocaleString('en-IN', {
                  maximumFractionDigits: 2,
                })}
              </b>
            </p>
            {modalError && (
              <p className="login-error" role="alert">
                {modalError}
              </p>
            )}
            <div className="modal-actions">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setCashoutGrams(goldGrams.toFixed(4))}
              >
                Use max
              </button>
              <button type="submit" className="save-btn">
                Confirm reversal
              </button>
            </div>
          </form>
        </div>
      )}

      {modal?.type === 'redeem' && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <form className="add-user-modal" onSubmit={submitRedeem}>
            <div className="panel-heading">
              <div>
                <p>GOLD SHOP REDEMPTION</p>
                <h2>Redeem physical gold</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <label>
              Partner Gold Shop
              <select
                value={redeemShop}
                onChange={event => setRedeemShop(event.target.value)}
              >
                {approvedShops.map(shop => (
                  <option key={shop.id} value={shop.name}>
                    {shop.name} ({shop.location})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Grams to redeem (min 1.0000g)
              <input
                type="number"
                step="0.0001"
                min="1"
                max={goldGrams}
                value={redeemGrams}
                onChange={event => setRedeemGrams(event.target.value)}
              />
            </label>
            {modalError && (
              <p className="login-error" role="alert">
                {modalError}
              </p>
            )}
            <button type="submit" className="save-btn">
              Submit for Admin approval
            </button>
          </form>
        </div>
      )}

      {modal?.type === 'offers' && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <div className="add-user-modal modal-wide">
            <div className="panel-heading">
              <div>
                <p>ALL PARTNER SHOPS</p>
                <h2>Gold shop offers</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            {approvedShops.length === 0 ? (
              <p className="empty-state">No approved shops available right now.</p>
            ) : (
              <ul className="activity-list">
                {approvedShops.map(shop => (
                  <li key={shop.id} className="activity-item">
                    <div>
                      <strong>
                        {shop.name} · {shop.location}
                      </strong>
                      <small>{shop.offerTitle}</small>
                    </div>
                    <button
                      type="button"
                      className="approve"
                      onClick={() => setModal({ type: 'offer-detail', shop })}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {modal?.type === 'offer-detail' && (
        <div
          className="modal-backdrop"
          role="presentation"
          onMouseDown={event => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <div className="add-user-modal">
            <div className="panel-heading">
              <div>
                <p>{modal.shop.offerTag} OFFER</p>
                <h2>{modal.shop.name}</h2>
              </div>
              <button type="button" className="modal-close" onClick={() => setModal(null)}>
                ×
              </button>
            </div>
            <p className="modal-subtext">{modal.shop.offerTitle}</p>
            <p className="modal-subtext">
              Location: <b>{modal.shop.location}</b> · Owner: <b>{modal.shop.owner}</b> ·{' '}
              {modal.shop.validTill}
            </p>
            <div className="modal-actions">
              {goldGrams >= 1 ? (
                <button
                  type="button"
                  className="save-btn"
                  onClick={() => openRedeem(modal.shop.name)}
                >
                  Redeem at {modal.shop.name}
                </button>
              ) : (
                <button type="button" className="save-btn" onClick={() => setModal(null)}>
                  Need {remaining.toFixed(4)}g more to redeem
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
