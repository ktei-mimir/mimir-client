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
import NewConversation from '@/views/conversations/NewConversation'
import ViewConversation from '@/views/conversations/ViewConversation'
import { useAuth0, withAuthenticationRequired } from '@auth0/auth0-react'
import { useQuery } from 'react-query'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import {
  Conversation,
  ListConversationsResponse,
  listConversations
} from './api/conversationApi'

function App() {
  const { getAccessTokenSilently } = useAuth0()

  const { data, isLoading, isSuccess, isError } =
    useQuery<ListConversationsResponse>('conversations', async () => {
      const token = await getAccessTokenSilently()
      return await listConversations(token)
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
        data-drawer-target="default-sidebar"
        data-drawer-toggle="default-sidebar"
        aria-controls="default-sidebar"
        type="button"
        className="fixed left-0 top-0 z-40 ml-3 mt-2 inline-flex items-center 
        rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600 md:hidden"
      >
        <span className="sr-only">Open sidebar</span>
        <svg
          className="h-6 w-6"
          aria-hidden="true"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
          ></path>
        </svg>
      </button>
      <div className="h-full">
        <aside
          id="default-sidebar"
          className="fixed left-0 top-0 z-40 h-screen w-64 -translate-x-full transition-transform md:translate-x-0"
          aria-label="Sidebar"
        >
          <div className="h-full overflow-y-auto bg-gray-50 px-3 py-4 dark:bg-gray-800">
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
        </aside>

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

export default withAuthenticationRequired(App)
