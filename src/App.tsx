import SidebarLink from '@/components/common/SidebarLink'
import { useAuth0 } from '@auth0/auth0-react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

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
import ConversationView from '@/views/conversations/ConversationView'
import { useQuery } from 'react-query'
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
      const response = await listConversations(token)
      return response
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
      <div className="h-full">
        <button
          data-drawer-target="default-sidebar"
          data-drawer-toggle="default-sidebar"
          aria-controls="default-sidebar"
          type="button"
          className="inline-flex items-center p-2 mt-2 ml-3 text-sm text-gray-500 
        fixed top-0 left-0 z-40
        rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 
        focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="w-6 h-6"
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

        <aside
          id="default-sidebar"
          className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full md:translate-x-0 overflow-hidden"
          aria-label="Sidebar"
        >
          <div className="h-full px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            {isError ? (
              <p className="text-red-900">
                There was a problem with fetching conversations
              </p>
            ) : null}
            {isLoading ? <p>Fetching conversations</p> : null}
            {isSuccess ? (
              <ul className="space-y-2 text-sm">
                {data?.items.map((conversation: Conversation) => (
                  <SidebarLink
                    text={conversation.title}
                    key={conversation.id}
                  />
                ))}
              </ul>
            ) : null}
          </div>
        </aside>

        <div className="md:ml-64 h-full overflow-hidden">
          <div className="relative flex w-full h-full justify-center">
            <main className="flex md:max-w-5xl w-full relative h-full transition-width flex-col items-stretch">
              <Routes>
                <Route index element={<Navigate to="/conversation" />} />
                <Route
                  path="/conversation/:conversationId"
                  element={<ConversationView />}
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
