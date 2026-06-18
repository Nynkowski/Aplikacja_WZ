import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'
import type { UserRole } from './types/auth'

type LoggedInUser = {
  username: string
  role: UserRole
}

function App() {
  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(null)

  if (loggedInUser) {
    return (
      <DashboardPage
        username={loggedInUser.username}
        role={loggedInUser.role}
        onLogout={() => setLoggedInUser(null)}
      />
    )
  }

  return (
    <LoginPage
      onLogin={(user) => setLoggedInUser(user)}
    />
  )
}

export default App
