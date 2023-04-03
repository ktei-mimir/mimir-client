import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'
import './App.css'

const LoginButton = () => {
  const { loginWithRedirect } = useAuth0()

  return <button onClick={() => loginWithRedirect()}>Log In</button>
}

const LogoutButton = () => {
  const { logout } = useAuth0()

  return (
    <button
      onClick={() =>
        logout({ logoutParams: { returnTo: window.location.origin } })
      }
    >
      Log Out
    </button>
  )
}

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0()

  if (isLoading) {
    return <div>Loading ...</div>
  }

  if (isAuthenticated && user) {
    return (
      <div>
        <img src={user.picture} alt={user.name} />
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    )
  }

  return null
}

function App() {
  const { getAccessTokenSilently } = useAuth0()
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    const getToken = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: `https://api.mimir`,
          scope: 'write:chatgpt'
        }
      })
      setToken(token)
    }
    getToken()
  }, [])
  return (
    <div>
      <h1>Hello! Welcome</h1>
      <div>Token: {token}</div>
      <div>
        <Profile />
      </div>
      <div>
        <LoginButton />
      </div>
      <div>
        <LogoutButton />
      </div>
    </div>
  )
}

export default App
