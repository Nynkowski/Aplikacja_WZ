import { useState } from 'react'
import Button from '../components/Button'
import Input from '../components/Input'
import { login } from '../services/auth'
import type { UserRole } from '../types/auth'

type LoginPageProps = {
  onLogin: (user: { username: string; role: UserRole }) => void
}

function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')
    setIsLoading(true)

    try {
      const authResult = await login({ username, password })
      onLogin({ username: authResult.username, role: authResult.role })
    } catch {
      setError('Nieprawidłowy login lub hasło')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-card__header">
          <p className="auth-eyebrow">Aplikacja WZ</p>
          <h1>Logowanie</h1>
          <p className="auth-description">
            Zaloguj się adresem email i hasłem.
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <Input
            id="username"
            label="Login"
            name="username"
            type="text"
            autoComplete="username"
            placeholder="np. Bubik.Bubikowski@bubikon.com"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            required
          />

          <Input
            id="password"
            label="Hasło"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Wpisz hasło"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          {error ? <p className="auth-message auth-message--error">{error}</p> : null}
          {success ? (
            <p className="auth-message auth-message--success">{success}</p>
          ) : null}

          <Button type="submit" isBusy={isLoading} disabled={isLoading}>
            Zaloguj się
          </Button>
        </form>
      </section>
    </main>
  )
}

export default LoginPage
