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
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import {
  Conversation,
  ListConversationsResponse,
  listConversations
} from './api/conversationApi'

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
    <BrowserRouter>
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
          className="hs-overlay scrollbar-y fixed bottom-0 left-0 top-0 z-[60] hidden w-64
          -translate-x-full transform overflow-y-auto border-r border-gray-200 bg-white
          transition-all duration-300 hs-overlay-open:translate-x-0
          lg:bottom-0 lg:right-auto lg:block lg:translate-x-0"
        >
          <div className="h-full overflow-y-auto bg-gray-50 px-3 py-4">
            {isError ? (
              <p className="text-red-900">
                There was a problem with fetching conversations
              </p>
            ) : null}
            {isLoading ? <p>Fetching conversations</p> : null}
            {isSuccess ? (
              <ul className="space-y-2 text-sm">
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
        </div>

        <div className="h-full overflow-hidden md:ml-64">
          <div className="relative flex h-full w-full justify-center">
            <main className="transition-width relative flex h-full w-full flex-col items-stretch md:max-w-5xl">
              <Routes>
                <Route index element={<Navigate to="/conversation" />} />
                <Route path="/conversation" element={<NewConversation />} />
                <Route
                  path="/conversation/:conversationId"
                  element={<ViewConversation />}
                />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
