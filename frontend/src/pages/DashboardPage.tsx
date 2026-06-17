type DashboardPageProps = {
  username: string
  onLogout: () => void
}

function DashboardPage({ username, onLogout }: DashboardPageProps) {
  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-brand">
          <span className="dashboard__header-eyebrow">Aplikacja WZ</span>
          <span className="dashboard__header-title">Panel</span>
        </div>
        <div className="dashboard__header-user">
          <span className="dashboard__header-username">{username}</span>
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
