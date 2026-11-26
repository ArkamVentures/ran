import type { ReactNode } from 'react'

export function CoinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7v10M9 9.5h4.5a2 2 0 0 1 0 4H10.5a2 2 0 0 0 0 4H15" />
    </svg>
  )
}

export function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="2" />
        <rect x="14" y="3" width="7" height="7" rx="2" />
        <rect x="3" y="14" width="7" height="7" rx="2" />
        <rect x="14" y="14" width="7" height="7" rx="2" />
      </>
    ),
    users: (
      <>
        <circle cx="9" cy="8" r="3" />
        <circle cx="17" cy="9" r="2" />
        <path d="M3 19c0-4 2.5-6 6-6s6 2 6 6M14 14c3.5-.8 6 1 6 5" />
      </>
    ),
    store: (
      <>
        <path d="M4 10v10h16V10M3 10l2-6h14l2 6" />
        <path d="M3 10c0 2 2 3 3.5 3S9 12 9 10c0 2 2 3 3 3s3-1 3-3c0 2 2 3 3.5 3S21 12 21 10M9 20v-5h6v5" />
      </>
    ),
    chart: (
      <>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20V7" />
        <path d="M2 20h20" />
      </>
    ),
    bell: (
      <>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </>
    ),
    bag: (
      <>
        <path d="M5 8h14l-1 13H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    logout: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  }

  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}
