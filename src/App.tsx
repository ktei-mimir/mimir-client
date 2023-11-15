import NewConversationLink from '@/components/conversation/NewConversationLink'
import ViewConversationLink from '@/components/conversation/ViewConversationLink'
import useAuthenticatedApi from '@/hooks/useAuthenticatedApi'
import NewConversation from '@/views/conversation/NewConversation'
import ViewConversation from '@/views/conversation/ViewConversation'
import { useQuery } from 'react-query'
import { Navigate, Route, HashRouter as Router, Routes } from 'react-router-dom'

import LogoutLink from '@/components/conversation/LogoutLink'
import GlobalAlertContextProvider from '@/context/GlobalAlertContext'
import {
  Conversation,
  ListConversationsResponse,
  listConversations
} from './api/conversationApi'
import WebSocketContextProvider from '@/context/WebSocketContext'
import CostEstimate from '@/views/cost/CostEstimate'
import {
  useColorSchemeActionsContext,
  useColorSchemeContext
} from '@/context/ColorSchemeContext'
import { memo, useCallback, useEffect } from 'react'
import classnames from 'classnames'
import dark from 'highlight.js/styles/atom-one-dark.css?raw'
import light from 'highlight.js/styles/atom-one-light.css?raw'

const ColorModeSwitcherComponent = () => {
  const { colorMode } = useColorSchemeContext()
  const { setColorMode } = useColorSchemeActionsContext()

  const toggleColorMode = useCallback(() => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark')
  }, [colorMode, setColorMode])

  return (
    <label className="relative mb-5 inline-flex cursor-pointer items-center">
      <input
        type="checkbox"
        value=""
        className="peer sr-only"
        onClick={toggleColorMode}
      />
      <div
        className="dark:peer-focus:ring-zic-800 peer h-6 w-11 rounded-full bg-gray-200 after:absolute
      after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border
      after:border-gray-300 after:bg-white after:transition-all after:content-['']
      peer-checked:bg-zinc-600 peer-checked:after:translate-x-full peer-checked:after:border-white
      peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-zinc-800
      rtl:peer-checked:after:-translate-x-full dark:border-gray-600 dark:bg-gray-700"
      ></div>
      <span className="drak:text-gray-400 ms-3 text-sm font-medium text-white">
        {colorMode === 'dark' ? 'Dark' : 'Light'}
      </span>
    </label>
  )
}

const ColorModeSwitcher = memo(ColorModeSwitcherComponent)

function App() {
  const authenticatedApi = useAuthenticatedApi()

  const { colorMode } = useColorSchemeContext()

  const { data, isLoading, isSuccess, isError } =
    useQuery<ListConversationsResponse>('conversations', async () => {
      return await listConversations(authenticatedApi)
    })

  useEffect(() => {
    const tagId = '__mimir_code_style__'
    let styleTag = document.getElementById(tagId)
    if (!styleTag) {
      styleTag = document.createElement('style')
      styleTag.id = tagId
    }
    document.head.appendChild(styleTag)
    // Dynamically import the appropriate theme based on the dark mode state
    if (colorMode === 'dark') {
      styleTag.innerHTML = dark
    } else {
      styleTag.innerHTML = light
    }
  }, [colorMode])

  return (
    <div
      className={classnames('h-full font-primary', {
        dark: colorMode === 'dark'
      })}
    >
      <Router>
        <button
          type="button"
          className="fixed left-0 top-0 z-[60] text-gray-500 hover:text-gray-600"
          data-hs-overlay="#navigation-menu"
          aria-controls="navigation-menu"
          aria-label="Toggle navigation"
        >
          <span className="sr-only">Toggle Navigation</span>
          <svg
            className="h-9 w-9"
            fill="none"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            strokeWidth="2.25"
            stroke="currentColor"
          >
            <path
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            ></path>
          </svg>
        </button>
        <div className="h-full bg-white dark:bg-zinc-800">
          <div
            id="navigation-menu"
            className="hs-overlay scrollbar-y fixed bottom-0 left-0 top-0 z-[60] flex hidden
          w-64 -translate-x-full transform flex-col divide-y divide-zinc-800
          overflow-y-auto border-r border-zinc-800 bg-white text-sm
          text-white transition-all duration-300 hs-overlay-open:translate-x-0 sm:bottom-0 sm:right-auto
          sm:flex sm:translate-x-0"
          >
            <div className="grow overflow-y-auto bg-black px-3 py-4 dark:bg-zinc-900">
              {isError ? (
                <p>There was a problem with fetching conversations</p>
              ) : null}
              {isLoading ? <p>Fetching conversations</p> : null}
              {isSuccess ? (
                <ul className="space-y-2">
                  <NewConversationLink text="New Conversation" />
                  {data?.items.map((conversation: Conversation) => (
                    <ViewConversationLink
                      conversationId={conversation.id}
                      text={conversation.title}
                      key={conversation.id}
                    />
                  ))}
                </ul>
              ) : null}
            </div>
            <div className="flex flex-col bg-black px-3 py-4 dark:bg-zinc-900">
              <ColorModeSwitcher />
              <CostEstimate />
              <LogoutLink />
            </div>
          </div>

          <div className="flex h-full flex-col overflow-hidden sm:ml-64">
            <div className="relative flex w-full grow justify-center overflow-y-auto">
              <main className="transition-width  flex h-full w-full flex-col items-stretch sm:max-w-5xl">
                <GlobalAlertContextProvider>
                  <WebSocketContextProvider>
                    <Routes>
                      <Route index element={<Navigate to="/conversation" />} />
                      <Route
                        path="/conversation"
                        element={<NewConversation />}
                      />
                      <Route
                        path="/conversation/:conversationId"
                        element={<ViewConversation />}
                      />
                    </Routes>
                  </WebSocketContextProvider>
                </GlobalAlertContextProvider>
              </main>
            </div>
            <footer className="flex w-full justify-center pb-4 text-sm text-gray-500">
              <div>
                &copy; {new Date().getFullYear()} Mimir. All rights reserved.
              </div>
            </footer>
          </div>
        </div>
      </Router>
    </div>
  )
}

export default memo(App)
