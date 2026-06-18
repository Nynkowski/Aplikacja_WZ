import { useState } from "react";

type AdminTab = "overview" | "users";

function AdminDashboardPage() {
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>("overview");
  const isOverviewTab = activeAdminTab === "overview";

  return (
    <section className="dashboard__card">
      <div className="dashboard__card-header">
        <h2>Panel administratora</h2>
        
      </div>

      <div
        className="dashboard__tabs"
        role="tablist"
        aria-label="Zakladki panelu administratora"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isOverviewTab}
          className={`dashboard__tab-btn ${isOverviewTab ? "dashboard__tab-btn--active" : ""}`}
          onClick={() => setActiveAdminTab("overview")}
        >
          Adresy
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isOverviewTab}
          className={`dashboard__tab-btn ${!isOverviewTab ? "dashboard__tab-btn--active" : ""}`}
          onClick={() => setActiveAdminTab("users")}
        >
          Uzytkownicy
        </button>
      </div>

      <div className="dashboard__admin-panel">
        {isOverviewTab ? (
          <div className="dashboard__empty" role="tabpanel">
            <p>
              Lista miejsc pojawi sie po dodaniu endpointu{" "}
              <code>GET /adress</code>.
              
            </p>
          </div>
        ) : (
          <div className="dashboard__empty" role="tabpanel">
            <p>
              Lista uzytkownikow pojawi sie tutaj po podpieciu endpointu{" "}
              <code>GET /users</code>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminDashboardPage;
