import { useState } from "react";
import {
  DASHBOARD_VIEWS,
  type AccessRole,
  type DashboardView,
} from "../config/dashboardViews";
import type { UserRole } from "../types/auth";

type DashboardPageProps = {
  username: string;
  role: UserRole;
  onLogout: () => void;
};

function DashboardPage({ username, role, onLogout }: DashboardPageProps) {
  const normalizedRole = String(role).trim().toLowerCase();
  const isAdmin = normalizedRole === "admin";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>(
    isAdmin ? "admin" : "wz-regular",
  );

  const hasRoleAccess = (allowedRoles: AccessRole[]) =>
    allowedRoles.includes(normalizedRole as AccessRole);

  const hasViewAccess = (view: DashboardView) => {
    const config = DASHBOARD_VIEWS.find((item) => item.id === view);
    return config ? hasRoleAccess(config.allowedRoles) : false;
  };

  const availableViews = DASHBOARD_VIEWS.filter((item) =>
    hasRoleAccess(item.allowedRoles),
  );

  const fallbackView = availableViews[0]?.id ?? "wz-regular";
  const resolvedActiveView = hasViewAccess(activeView)
    ? activeView
    : fallbackView;

  const handleSelectView = (view: DashboardView) => {
    if (hasViewAccess(view)) {
      setActiveView(view);
    } else {
      setActiveView(fallbackView);
    }

    setIsSidebarOpen(false);
  };

  const renderActiveSection = () => {
    if (resolvedActiveView === "admin" && isAdmin) {
      return (
        <section className="dashboard__card">
          <div className="dashboard__card-header">
            <h2>Panel administratora</h2>
            <button className="dashboard__action-btn">
              + Zarzadzaj uzytkownikami
            </button>
          </div>
          <div className="dashboard__empty">
            <p>Tu mozesz dodac funkcje dostepne tylko dla roli admin.</p>
          </div>
        </section>
      );
    }

    if (resolvedActiveView === "wz-special") {
      return (
        <section className="dashboard__card">
          <div className="dashboard__card-header">
            <h2>WZ Special</h2>
            <button className="dashboard__action-btn">+ Nowy WZ Special</button>
          </div>
          <div className="dashboard__empty">
            <p>
              Brak danych - backend wymaga endpointu{" "}
              <code>GET /wz-special</code>
            </p>
          </div>
        </section>
      );
    }

    return (
      <section className="dashboard__card">
        <div className="dashboard__card-header">
          <h2>WZ Regular</h2>
          <button className="dashboard__action-btn">+ Nowy WZ</button>
        </div>
        <div className="dashboard__empty">
          <p>
            Brak danych - backend wymaga endpointu <code>GET /wz-regular</code>
          </p>
        </div>
      </section>
    );
  };

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div className="dashboard__header-brand">
          <span className="dashboard__header-eyebrow">Aplikacja WZ</span>
          <span className="dashboard__header-title">Panel</span>
        </div>

        <button
          className="dashboard__menu-btn"
          onClick={() => setIsSidebarOpen((prev) => !prev)}
          aria-label="Otworz panel sekcji"
          type="button"
        >
          Menu
        </button>

        <div className="dashboard__header-user">
          <span className="dashboard__header-username">{username}</span>
          <span className="dashboard__header-username">Rola: {role}</span>
          <button className="dashboard__logout-btn" onClick={onLogout}>
            Wyloguj
          </button>
        </div>
      </header>

      <div className="dashboard__shell">
        <aside
          className={`dashboard__sidebar ${isSidebarOpen ? "dashboard__sidebar--open" : ""}`}
        >
          <p className="dashboard__sidebar-title">Sekcje</p>
          <nav className="dashboard__nav" aria-label="Nawigacja dashboardu">
            {availableViews.map((view) => (
              <button
                key={view.id}
                type="button"
                className={`dashboard__nav-tile ${resolvedActiveView === view.id ? "dashboard__nav-tile--active" : ""}`}
                onClick={() => handleSelectView(view.id)}
              >
                {view.label}
              </button>
            ))}
          </nav>
        </aside>

        {isSidebarOpen ? (
          <button
            className="dashboard__backdrop"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Zamknij panel boczny"
            type="button"
          />
        ) : null}

        <main className="dashboard__main">
          <section className="dashboard__welcome">
            <h1>
              Witaj,{" "}
              <span className="dashboard__welcome-name">
                {username.split(".")[0]}
              </span>
            </h1>
            <p>
              Wybrana sekcja:{" "}
              {
                DASHBOARD_VIEWS.find((item) => item.id === resolvedActiveView)
                  ?.label
              }
            </p>
          </section>

          <div className="dashboard__content">{renderActiveSection()}</div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
