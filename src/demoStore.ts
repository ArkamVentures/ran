import { useEffect, useState } from 'react'

export type View = 'login' | 'user' | 'admin'
export type UserStatus = 'Active' | 'Suspended'
export type ShopStatus = 'Approved' | 'Pending' | 'Suspended'

export interface DemoUser {
  id: number
  name: string
  email: string
  goldGrams: number
  status: UserStatus
}

export interface DemoShop {
  id: number
  name: string
  owner: string
  location: string
  status: ShopStatus
  offerTitle: string
  offerTag: string
  validTill: string
  tone: 'blush' | 'lavender'
}

export interface PendingOrder {
  id: string
  userId: number
  user: string
  shop: string
  grams: number
}

export interface ActivityItem {
  id: string
  userId: number
  type: 'buy' | 'redeem' | 'cashout' | 'approved' | 'rejected'
  title: string
  detail: string
  amountLabel: string
  timestamp: string
}

export interface NotificationItem {
  id: string
  userId: number
  title: string
  detail: string
  timestamp: string
  read: boolean
}

export interface PlatformSettings {
  goldRate: number
  commissionPercent: number
  minPurchase: number
}

export interface RanDemoState {
  currentUserId: number
  settings: PlatformSettings
  profitEarned: number
  users: DemoUser[]
  shops: DemoShop[]
  pending: PendingOrder[]
  activities: ActivityItem[]
  notifications: NotificationItem[]
}

export interface ActionResult {
  ok: boolean
  message: string
}

const STORAGE_KEY = 'ran-demo-state-v2'
const SYNC_EVENT = 'ran-demo-state-sync'

function nowLabel(): string {
  return new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function createInitialState(): RanDemoState {
  return {
    currentUserId: 1,
    settings: {
      goldRate: 25400,
      commissionPercent: 2.5,
      minPurchase: 20,
    },
    profitEarned: 48250,
    users: [
      {
        id: 1,
        name: 'Aisha Khan',
        email: 'aisha@ran.app',
        goldGrams: 0.845,
        status: 'Active',
      },
      {
        id: 2,
        name: 'Maya Shah',
        email: 'maya@ran.app',
        goldGrams: 1.2,
        status: 'Active',
      },
      {
        id: 3,
        name: 'Arjun Kumar',
        email: 'arjun@ran.app',
        goldGrams: 1.0,
        status: 'Active',
      },
      {
        id: 4,
        name: 'Sana Noor',
        email: 'sana@ran.app',
        goldGrams: 0.84,
        status: 'Suspended',
      },
    ],
    shops: [
      {
        id: 1,
        name: 'Vogue Jewellers',
        owner: 'Rohan Mehta',
        location: 'Mumbai',
        status: 'Approved',
        offerTitle: '5% off making charges on 1g coins',
        offerTag: 'POPULAR',
        validTill: 'Valid till 30 Nov',
        tone: 'blush',
      },
      {
        id: 2,
        name: 'Aurum House',
        owner: 'Leena Shah',
        location: 'Surat',
        status: 'Approved',
        offerTitle: 'Free engraving on gold above 1g',
        offerTag: 'NEW',
        validTill: 'Valid till 15 Dec',
        tone: 'lavender',
      },
      {
        id: 3,
        name: 'Golden Leaf',
        owner: 'Faizan Ali',
        location: 'Jaipur',
        status: 'Pending',
        offerTitle: '0% wastage on festive 1g bars',
        offerTag: 'PARTNER',
        validTill: 'Valid till 31 Dec',
        tone: 'blush',
      },
    ],
    pending: [
      {
        id: '#RAN-2401',
        userId: 2,
        user: 'Maya Shah',
        shop: 'Vogue Jewellers',
        grams: 1.2,
      },
      {
        id: '#RAN-2402',
        userId: 3,
        user: 'Arjun Kumar',
        shop: 'Aurum House',
        grams: 1.0,
      },
    ],
    activities: [
      {
        id: 'act-seed-1',
        userId: 1,
        type: 'buy',
        title: 'Digital gold purchase',
        detail: 'Bought at Rs. 25,400/g',
        amountLabel: '+0.0197g',
        timestamp: 'Today, 09:10',
      },
      {
        id: 'act-seed-2',
        userId: 1,
        type: 'buy',
        title: 'Auto-save top-up',
        detail: 'Weekly micro-gold deposit',
        amountLabel: '+0.0394g',
        timestamp: 'Yesterday',
      },
    ],
    notifications: [
      {
        id: 'notif-seed-1',
        userId: 1,
        title: 'Goal almost reached',
        detail: 'You are just 0.1550g away from unlocking 1g Gold Shop redemption.',
        timestamp: 'Today',
        read: false,
      },
      {
        id: 'notif-seed-2',
        userId: 1,
        title: 'Live gold rate active',
        detail: 'Today’s rate is Rs. 25,400 per gram.',
        timestamp: 'Today',
        read: true,
      },
    ],
  }
}

function loadState(): RanDemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createInitialState()
    const parsed = JSON.parse(raw) as Partial<RanDemoState>
    if (!parsed.settings || !Array.isArray(parsed.users) || !Array.isArray(parsed.shops)) {
      return createInitialState()
    }
    return {
      ...createInitialState(),
      ...parsed,
    }
  } catch {
    return createInitialState()
  }
}

function persistState(next: RanDemoState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new Event(SYNC_EVENT))
  } catch {
    // Ignore storage quota errors in restricted browsing modes
  }
}

export function getCurrentUser(state: RanDemoState): DemoUser {
  return state.users.find(user => user.id === state.currentUserId) ?? state.users[0]
}

export function useRanDemoStore() {
  const [state, setState] = useState<RanDemoState>(loadState)

  useEffect(() => {
    const sync = () => setState(loadState())
    window.addEventListener('storage', sync)
    window.addEventListener(SYNC_EVENT, sync)
    return () => {
      window.removeEventListener('storage', sync)
      window.removeEventListener(SYNC_EVENT, sync)
    }
  }, [])

  const commit = (updater: (prev: RanDemoState) => RanDemoState) => {
    setState(prev => {
      const next = updater(prev)
      persistState(next)
      return next
    })
  }

  const switchCurrentUser = (userId: number) => {
    commit(prev => {
      if (!prev.users.some(user => user.id === userId)) return prev
      return { ...prev, currentUserId: userId }
    })
  }

  const loginUserByEmail = (email?: string) => {
    const cleanEmail = email?.trim().toLowerCase()
    if (!cleanEmail) return
    commit(prev => {
      const match = prev.users.find(user => user.email.toLowerCase() === cleanEmail)
      if (!match) return prev
      return { ...prev, currentUserId: match.id }
    })
  }

  const createNewUser = (
    name: string,
    email: string,
    initialGold = 0,
    switchToNewUser = false,
  ): ActionResult => {
    const cleanName = name.trim()
    const cleanEmail = email.trim().toLowerCase()
    if (!cleanName || !cleanEmail) {
      return { ok: false, message: 'Enter both full name and email address.' }
    }
    if (state.users.some(user => user.email.toLowerCase() === cleanEmail)) {
      return { ok: false, message: 'A user with that email already exists.' }
    }

    const newId = Date.now()
    const time = nowLabel()

    commit(prev => ({
      ...prev,
      currentUserId: switchToNewUser ? newId : prev.currentUserId,
      users: [
        ...prev.users,
        {
          id: newId,
          name: cleanName,
          email: cleanEmail,
          goldGrams: Math.max(0, initialGold),
          status: 'Active',
        },
      ],
      notifications: [
        {
          id: `notif-${newId}`,
          userId: newId,
          title: `Welcome to Ran, ${cleanName.split(' ')[0]}!`,
          detail: 'Start investing in digital gold from Rs. 20.',
          timestamp: time,
          read: false,
        },
        ...prev.notifications,
      ],
    }))

    return { ok: true, message: `Created user account for ${cleanName}.` }
  }

  const buyGold = (rupees: number): ActionResult => {
    const currentUser = getCurrentUser(state)
    if (currentUser.status === 'Suspended') {
      return { ok: false, message: 'Account is suspended by admin. Activate user in Admin to buy.' }
    }
    if (!Number.isFinite(rupees) || rupees < state.settings.minPurchase) {
      return {
        ok: false,
        message: `Enter an amount of at least Rs. ${state.settings.minPurchase}`,
      }
    }

    const gramsBought = rupees / state.settings.goldRate
    const commission = (rupees * state.settings.commissionPercent) / 100
    const time = nowLabel()

    commit(prev => ({
      ...prev,
      profitEarned: prev.profitEarned + commission,
      users: prev.users.map(user =>
        user.id === currentUser.id
          ? { ...user, goldGrams: user.goldGrams + gramsBought }
          : user,
      ),
      activities: [
        {
          id: `act-${Date.now()}`,
          userId: currentUser.id,
          type: 'buy',
          title: 'Digital gold purchase',
          detail: `Paid Rs. ${rupees.toLocaleString('en-IN')} at Rs. ${prev.settings.goldRate.toLocaleString('en-IN')}/g`,
          amountLabel: `+${gramsBought.toFixed(4)}g`,
          timestamp: time,
        },
        ...prev.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: currentUser.id,
          title: 'Gold added to wallet',
          detail: `${gramsBought.toFixed(4)}g purchased for Rs. ${rupees.toLocaleString('en-IN')}.`,
          timestamp: time,
          read: false,
        },
        ...prev.notifications,
      ],
    }))

    return {
      ok: true,
      message: `Purchase successful — ${gramsBought.toFixed(4)}g added to your wallet`,
    }
  }

  const reverseToCash = (grams: number): ActionResult => {
    const currentUser = getCurrentUser(state)
    if (currentUser.status === 'Suspended') {
      return { ok: false, message: 'Account is suspended by admin.' }
    }
    if (!Number.isFinite(grams) || grams <= 0 || grams > currentUser.goldGrams + 1e-9) {
      return { ok: false, message: 'Enter a valid gold amount within your wallet balance.' }
    }

    const safeGrams = Math.min(grams, currentUser.goldGrams)
    const cashValue = safeGrams * state.settings.goldRate
    const time = nowLabel()

    commit(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id
          ? { ...user, goldGrams: Math.max(0, user.goldGrams - safeGrams) }
          : user,
      ),
      activities: [
        {
          id: `act-${Date.now()}`,
          userId: currentUser.id,
          type: 'cashout',
          title: 'Reversed gold to cash',
          detail: `Credited Rs. ${cashValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
          amountLabel: `-${safeGrams.toFixed(4)}g`,
          timestamp: time,
        },
        ...prev.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: currentUser.id,
          title: 'Cash reversal processed',
          detail: `${safeGrams.toFixed(4)}g converted to Rs. ${cashValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}.`,
          timestamp: time,
          read: false,
        },
        ...prev.notifications,
      ],
    }))

    return {
      ok: true,
      message: `Reversed ${safeGrams.toFixed(4)}g for Rs. ${cashValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
    }
  }

  const requestRedemption = (shopName: string, grams: number): ActionResult => {
    const currentUser = getCurrentUser(state)
    if (currentUser.status === 'Suspended') {
      return { ok: false, message: 'Account is suspended by admin.' }
    }
    if (!shopName) {
      return { ok: false, message: 'Select a partner gold shop.' }
    }
    if (!Number.isFinite(grams) || grams < 1 || grams > currentUser.goldGrams + 1e-9) {
      return { ok: false, message: 'Redemption requires at least 1.0000g from your balance.' }
    }

    const safeGrams = Math.min(grams, currentUser.goldGrams)
    const orderId = `#RAN-${Math.floor(2403 + Math.random() * 590)}`
    const time = nowLabel()

    commit(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === currentUser.id
          ? { ...user, goldGrams: Math.max(0, user.goldGrams - safeGrams) }
          : user,
      ),
      pending: [
        {
          id: orderId,
          userId: currentUser.id,
          user: currentUser.name,
          shop: shopName,
          grams: Number(safeGrams.toFixed(4)),
        },
        ...prev.pending,
      ],
      activities: [
        {
          id: `act-${Date.now()}`,
          userId: currentUser.id,
          type: 'redeem',
          title: `Redemption requested (${orderId})`,
          detail: `Awaiting admin approval for ${shopName}`,
          amountLabel: `-${safeGrams.toFixed(4)}g`,
          timestamp: time,
        },
        ...prev.activities,
      ],
      notifications: [
        {
          id: `notif-${Date.now()}`,
          userId: currentUser.id,
          title: `Redemption ${orderId} submitted`,
          detail: `Sent to admin approval queue for ${shopName}.`,
          timestamp: time,
          read: false,
        },
        ...prev.notifications,
      ],
    }))

    return {
      ok: true,
      message: `Redemption ${orderId} submitted for ${shopName} — awaiting Admin approval`,
    }
  }

  const resolvePendingOrder = (orderId: string, decision: 'approve' | 'reject'): ActionResult => {
    const order = state.pending.find(item => item.id === orderId)
    if (!order) {
      return { ok: false, message: 'Order not found.' }
    }

    const time = nowLabel()

    commit(prev => {
      const nextUsers =
        decision === 'reject'
          ? prev.users.map(user =>
              user.id === order.userId
                ? { ...user, goldGrams: user.goldGrams + order.grams }
                : user,
            )
          : prev.users

      const feeEarned =
        decision === 'approve'
          ? (order.grams * prev.settings.goldRate * prev.settings.commissionPercent) / 100
          : 0

      return {
        ...prev,
        profitEarned: prev.profitEarned + feeEarned,
        users: nextUsers,
        pending: prev.pending.filter(item => item.id !== orderId),
        activities: [
          {
            id: `act-${Date.now()}`,
            userId: order.userId,
            type: decision === 'approve' ? 'approved' : 'rejected',
            title:
              decision === 'approve'
                ? `Redemption ${order.id} approved`
                : `Redemption ${order.id} rejected`,
            detail:
              decision === 'approve'
                ? `Collect ${order.grams.toFixed(4)}g at ${order.shop}`
                : `${order.grams.toFixed(4)}g refunded to wallet`,
            amountLabel:
              decision === 'approve'
                ? `${order.grams.toFixed(4)}g`
                : `+${order.grams.toFixed(4)}g`,
            timestamp: time,
          },
          ...prev.activities,
        ],
        notifications: [
          {
            id: `notif-${Date.now()}`,
            userId: order.userId,
            title:
              decision === 'approve'
                ? `Redemption ${order.id} approved`
                : `Redemption ${order.id} rejected`,
            detail:
              decision === 'approve'
                ? `Your ${order.grams.toFixed(4)}g voucher is ready at ${order.shop}.`
                : `Admin refunded ${order.grams.toFixed(4)}g back to your wallet.`,
            timestamp: time,
            read: false,
          },
          ...prev.notifications,
        ],
      }
    })

    return {
      ok: true,
      message:
        decision === 'approve'
          ? `Approved ${order.id} for ${order.user} (${order.shop})`
          : `Rejected ${order.id} and refunded ${order.grams.toFixed(4)}g`,
    }
  }

  const approveAllPending = (): ActionResult => {
    if (state.pending.length === 0) {
      return { ok: false, message: 'No pending approvals in queue.' }
    }
    const count = state.pending.length
    const time = nowLabel()

    commit(prev => {
      const totalCommission = prev.pending.reduce(
        (sum, item) =>
          sum + (item.grams * prev.settings.goldRate * prev.settings.commissionPercent) / 100,
        0,
      )

      const newActivities: ActivityItem[] = prev.pending.map((order, idx) => ({
        id: `act-${Date.now()}-${idx}`,
        userId: order.userId,
        type: 'approved',
        title: `Redemption ${order.id} approved`,
        detail: `Collect ${order.grams.toFixed(4)}g at ${order.shop}`,
        amountLabel: `${order.grams.toFixed(4)}g`,
        timestamp: time,
      }))

      const newNotifications: NotificationItem[] = prev.pending.map((order, idx) => ({
        id: `notif-${Date.now()}-${idx}`,
        userId: order.userId,
        title: `Redemption ${order.id} approved`,
        detail: `Your ${order.grams.toFixed(4)}g voucher is ready at ${order.shop}.`,
        timestamp: time,
        read: false,
      }))

      return {
        ...prev,
        profitEarned: prev.profitEarned + totalCommission,
        pending: [],
        activities: [...newActivities, ...prev.activities],
        notifications: [...newNotifications, ...prev.notifications],
      }
    })

    return { ok: true, message: `Approved all ${count} pending transactions.` }
  }

  const toggleUserStatus = (id: number) => {
    commit(prev => ({
      ...prev,
      users: prev.users.map(user =>
        user.id === id
          ? { ...user, status: user.status === 'Active' ? 'Suspended' : 'Active' }
          : user,
      ),
    }))
  }

  const addUser = (name: string, email: string, initialGold = 0): ActionResult =>
    createNewUser(name, email, initialGold, false)

  const registerAndSwitchUser = (name: string, email: string, initialGold = 0): ActionResult =>
    createNewUser(name, email, initialGold, true)

  const toggleShopStatus = (id: number) => {
    commit(prev => ({
      ...prev,
      shops: prev.shops.map(shop =>
        shop.id === id
          ? { ...shop, status: shop.status === 'Approved' ? 'Suspended' : 'Approved' }
          : shop,
      ),
    }))
  }

  const addShop = (input: {
    name: string
    owner: string
    location: string
    offerTitle: string
  }): ActionResult => {
    const name = input.name.trim()
    const owner = input.owner.trim()
    const location = input.location.trim()
    const offerTitle = input.offerTitle.trim()

    if (!name || !owner || !location || !offerTitle) {
      return { ok: false, message: 'Fill out shop name, owner, location, and offer details.' }
    }

    commit(prev => ({
      ...prev,
      shops: [
        ...prev.shops,
        {
          id: Date.now(),
          name,
          owner,
          location,
          status: 'Approved',
          offerTitle,
          offerTag: 'NEW',
          validTill: 'Valid till 31 Dec',
          tone: prev.shops.length % 2 === 0 ? 'blush' : 'lavender',
        },
      ],
    }))

    return { ok: true, message: `Added partner shop ${name}.` }
  }

  const updateSettings = (next: PlatformSettings): ActionResult => {
    if (!Number.isFinite(next.goldRate) || next.goldRate < 1000) {
      return { ok: false, message: 'Gold rate must be at least Rs. 1,000.' }
    }
    if (
      !Number.isFinite(next.commissionPercent) ||
      next.commissionPercent < 0 ||
      next.commissionPercent > 50
    ) {
      return { ok: false, message: 'Commission must be between 0% and 50%.' }
    }
    if (!Number.isFinite(next.minPurchase) || next.minPurchase < 1) {
      return { ok: false, message: 'Minimum purchase must be at least Rs. 1.' }
    }

    const rateChanged = next.goldRate !== state.settings.goldRate
    const time = nowLabel()

    commit(prev => ({
      ...prev,
      settings: next,
      notifications: rateChanged
        ? [
            ...prev.users.map(user => ({
              id: `notif-${Date.now()}-${user.id}`,
              userId: user.id,
              title: 'Gold rate updated',
              detail: `Live rate is now Rs. ${next.goldRate.toLocaleString('en-IN')} per gram.`,
              timestamp: time,
              read: false,
            })),
            ...prev.notifications,
          ]
        : prev.notifications,
    }))

    return { ok: true, message: 'Gold rate & platform settings saved.' }
  }

  const markAllNotificationsRead = (userId: number) => {
    commit(prev => ({
      ...prev,
      notifications: prev.notifications.map(item =>
        item.userId === userId ? { ...item, read: true } : item,
      ),
    }))
  }

  const resetDemo = () => {
    const fresh = createInitialState()
    persistState(fresh)
    setState(fresh)
  }

  return {
    state,
    switchCurrentUser,
    loginUserByEmail,
    buyGold,
    reverseToCash,
    requestRedemption,
    resolvePendingOrder,
    approveAllPending,
    toggleUserStatus,
    addUser,
    registerAndSwitchUser,
    toggleShopStatus,
    addShop,
    updateSettings,
    markAllNotificationsRead,
    resetDemo,
  }
}
