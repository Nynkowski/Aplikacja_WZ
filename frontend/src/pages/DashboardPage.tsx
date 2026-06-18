import type { UserRole } from '../types/auth'

type DashboardPageProps = {
  username: string
  role: UserRole
  onLogout: () => void
}

function DashboardPage({ username, role, onLogout }: DashboardPageProps) {
  const isAdmin = role === 'admin'

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-brand">
          <span className="dashboard__header-eyebrow">Aplikacja WZ</span>
          <span className="dashboard__header-title">Panel</span>
        </div>
        <div className="dashboard__header-user">
          <span className="dashboard__header-username">{username}</span>
          <span className="dashboard__header-username">Rola: {role}</span>
          <button className="dashboard__logout-btn" onClick={onLogout}>
            Wyloguj
          </button>
        </div>
      </header>

      <main className="dashboard__main">
        <section className="dashboard__welcome">
          <h1>Witaj, <span className="dashboard__welcome-name">{username.split('.')[0]}</span></h1>
          <p>Wybierz sekcję, aby wyświetlić dokumenty WZ.</p>
        </section>

        <div className="dashboard__grid">
          {isAdmin ? (
            <section className="dashboard__card">
              <div className="dashboard__card-header">
                <h2>Panel administratora</h2>
                <button className="dashboard__action-btn">+ Zarządzaj użytkownikami</button>
              </div>
              <div className="dashboard__empty">
                <p>Tu możesz dodać funkcje dostępne tylko dla roli admin.</p>
              </div>
            </section>
          ) : null}

          <section className="dashboard__card">
            <div className="dashboard__card-header">
              <h2>WZ Regular</h2>
              <button className="dashboard__action-btn">+ Nowy WZ</button>
            </div>
            <div className="dashboard__empty">
              <p>Brak danych — backend wymaga endpointu <code>GET /wz-regular</code></p>
            </div>
          </section>

          <section className="dashboard__card">
            <div className="dashboard__card-header">
              <h2>WZ Special</h2>
              <button className="dashboard__action-btn">+ Nowy WZ Special</button>
            </div>
            <div className="dashboard__empty">
              <p>Brak danych — backend wymaga endpointu <code>GET /wz-special</code></p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
