function SecurityConfirmationPage() {
  return (
    <section className="dashboard__card">
      <div className="dashboard__card-header">
        <h2>Potwierdzenie Ochrona</h2>
        <button className="dashboard__action-btn">
          + Nowe Potwierdzenie Ochrona
        </button>
      </div>
      <div className="dashboard__empty">
        <p>
          Brak danych - backend wymaga endpointu{" "}
          <code>GET /potwierdzenie-ochrona</code>
        </p>
      </div>
    </section>
  );
}

export default SecurityConfirmationPage;
