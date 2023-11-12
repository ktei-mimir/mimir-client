// const LoginButton = () => {
//   const { loginWithRedirect } = useAuth0()
//   return <button onClick={() => loginWithRedirect()}>Log In</button>
// }
// const LogoutButton = () => {
//   const { logout } = useAuth0()
//   return (
//     <button
//       onClick={() =>
//         logout({ logoutParams: { returnTo: window.location.origin } })
//       }
//     >
//       Log Out
//     </button>
//   )
// }
// const Profile = () => {
//   const { user, isAuthenticated, isLoading } = useAuth0()
//   if (isLoading) {
//     return <div>Loading ...</div>
//   }
//   if (isAuthenticated && user) {
//     return (
//       <div>
//         <img src={user.picture} alt={user.name} />
//         <h2>{user.name}</h2>
//         <p>{user.email}</p>
//       </div>
//     )
//   }
//   return null
// }
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

function App() {
  const authenticatedApi = useAuthenticatedApi()

  const { data, isLoading, isSuccess, isError } =
    useQuery<ListConversationsResponse>('conversations', async () => {
      return await listConversations(authenticatedApi)
    })

  // useEffect(() => {
  //   const getToken = async () => {
  //     const token = await getAccessTokenSilently({
  //       authorizationParams: {
  //         audience: `https://api.mimir`,
  //         scope: 'write:chatgpt'
  //       }
  //     })
  //     setToken(token)
  //   }
  //   getToken()
  // }, [getAccessTokenSilently])
  return (
    <div className="h-full font-primary">
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
        <div className="h-full">
          <div
            id="navigation-menu"
            className="hs-overlay scrollbar-y fixed bottom-0 left-0 top-0 z-[60] flex hidden
          w-64 -translate-x-full transform flex-col divide-y divide-zinc-800
          overflow-y-auto border-r border-zinc-800 bg-white text-sm
          text-white transition-all duration-300 hs-overlay-open:translate-x-0 sm:bottom-0 sm:right-auto
          sm:flex sm:translate-x-0"
          >
            <div className="grow overflow-y-auto bg-zinc-900 px-3 py-4">
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
            <div className="bg-zinc-900 px-3 py-4">
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

export default App
