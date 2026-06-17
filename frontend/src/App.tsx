import { useState } from 'react'
import DashboardPage from './pages/DashboardPage'
import LoginPage from './pages/LoginPage'

function App() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)

  if (loggedInUser) {
    return <DashboardPage username={loggedInUser} onLogout={() => setLoggedInUser(null)} />
  }

  return <LoginPage onLogin={(username) => setLoggedInUser(username)} />
}

export default App
