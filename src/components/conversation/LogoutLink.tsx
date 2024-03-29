import { useAuth0 } from '@auth0/auth0-react'
import React, { useCallback } from 'react'

const LogoutLink = () => {
  const { logout } = useAuth0()

  const handleLogout = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault()
      await logout({ logoutParams: { returnTo: window.location.origin } })
    },
    [logout]
  )

  return (
    <a
      href="#"
      className="flex items-center p-2
        text-white
        transition-colors
        hover:bg-white hover:text-gray-900 dark:hover:bg-slate-700 dark:hover:text-white"
      onClick={handleLogout}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1}
        stroke="currentColor"
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
        />
      </svg>
      <span className="ml-3 flex-1 text-ellipsis">Log out</span>
    </a>
  )
}

export default LogoutLink
