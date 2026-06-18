function WzSpecialPage() {
  return (
    <section className="dashboard__card">
      <div className="dashboard__card-header">
        <h2>WZ Special</h2>
        <button className="dashboard__action-btn">+ Nowy WZ Special</button>
      </div>
      <div className="dashboard__empty">
        <p>
          Brak danych - backend wymaga endpointu <code>GET /wz-special</code>
        </p>
      </div>
    </section>
  );
}

export default WzSpecialPage;
