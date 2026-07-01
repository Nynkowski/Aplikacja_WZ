import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  getAvailableViewsForRole,
  type DashboardViewConfig,
} from "../config/dashboardViews";
import type { UserRole } from "../types/auth";

type DashboardPageProps = {
  userId: number;
  username: string;
  role: UserRole;
  onLogout: () => void;
};

function DashboardPage({
  userId,
  username,
  role,
  onLogout,
}: DashboardPageProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const availableViews = useMemo(
    () => getAvailableViewsForRole(String(role)),
    [role],
  );

  const activeView = useMemo<DashboardViewConfig | null>(() => {
    return (
      availableViews.find((view) =>
        location.pathname.startsWith(`/dashboard/${view.path}`),
      ) ??
      availableViews[0] ??
      null
    );
  }, [availableViews, location.pathname]);

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
              <NavLink
                key={view.id}
                to={`/dashboard/${view.path}`}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) =>
                  `dashboard__nav-link dashboard__nav-tile ${isActive ? "dashboard__nav-tile--active" : ""}`
                }
              >
                {view.label}
              </NavLink>
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
            <p>Wybrana sekcja: {activeView?.label ?? "Brak dostepu"}</p>
          </section>

          <div className="dashboard__content">
            <Outlet context={{ userId, role, username }} />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
