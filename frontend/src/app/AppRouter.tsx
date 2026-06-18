import type { ReactElement } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import {
  DASHBOARD_VIEWS,
  getDefaultViewForRole,
  hasRoleAccess,
  type AccessRole,
  type DashboardView,
} from "../config/dashboardViews";
import AdminDashboardPage from "../pages/dashboard/AdminDashboardPage";
import HistoryPage from "../pages/dashboard/HistoryPage";
import SecurityConfirmationPage from "../pages/dashboard/SecurityConfirmationPage";
import WzRegularPage from "../pages/dashboard/WzRegularPage";
import WzSpecialPage from "../pages/dashboard/WzSpecialPage";
import DashboardPage from "../pages/DashboardPage";
import LoginPage from "../pages/LoginPage";
import type { UserRole } from "../types/auth";

type LoggedInUser = {
  username: string;
  role: UserRole;
};

type AppRouterProps = {
  loggedInUser: LoggedInUser | null;
  onLogin: (user: LoggedInUser) => void;
  onLogout: () => void;
};

type RoleGuardProps = {
  allowedRoles: AccessRole[];
  role: string;
  fallbackPath: string;
  children: ReactElement;
};

const dashboardRouteElements: Record<DashboardView, ReactElement> = {
  admin: <AdminDashboardPage />,
  "wz-regular": <WzRegularPage />,
  "wz-special": <WzSpecialPage />,
  history: <HistoryPage />,
  "potwierdzenie-ochrona": <SecurityConfirmationPage />,
};

const noAccessElement = (
  <section className="dashboard__card">
    <div className="dashboard__card-header">
      <h2>Brak dostepu</h2>
    </div>
    <div className="dashboard__empty">
      <p>Twoja rola nie ma przypisanych sekcji dashboardu.</p>
    </div>
  </section>
);

function RoleGuard({
  allowedRoles,
  role,
  fallbackPath,
  children,
}: RoleGuardProps) {
  if (!hasRoleAccess(allowedRoles, role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
}

function AppRouter({ loggedInUser, onLogin, onLogout }: AppRouterProps) {
  if (!loggedInUser) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage onLogin={onLogin} />} />
      </Routes>
    );
  }

  const defaultView = getDefaultViewForRole(String(loggedInUser.role));
  const defaultDashboardPath = `/dashboard/${defaultView?.path ?? "no-access"}`;

  return (
    <Routes>
      <Route
        path="/login"
        element={<Navigate to={defaultDashboardPath} replace />}
      />

      <Route
        path="/dashboard"
        element={
          <DashboardPage
            username={loggedInUser.username}
            role={loggedInUser.role}
            onLogout={onLogout}
          />
        }
      >
        <Route
          index
          element={<Navigate to={defaultView?.path ?? "no-access"} replace />}
        />
        <Route path="no-access" element={noAccessElement} />

        {DASHBOARD_VIEWS.map((view) => (
          <Route
            key={view.id}
            path={view.path}
            element={
              <RoleGuard
                allowedRoles={view.allowedRoles}
                role={String(loggedInUser.role)}
                fallbackPath={defaultDashboardPath}
              >
                {dashboardRouteElements[view.id]}
              </RoleGuard>
            }
          />
        ))}

        <Route
          path="*"
          element={<Navigate to={defaultView?.path ?? "no-access"} replace />}
        />
      </Route>

      <Route
        path="*"
        element={<Navigate to={defaultDashboardPath} replace />}
      />
    </Routes>
  );
}

export default AppRouter;
