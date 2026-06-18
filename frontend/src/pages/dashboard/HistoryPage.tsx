function HistoryPage() {
  return (
    <section className="dashboard__card">
      <div className="dashboard__card-header">
        <h2>Historia</h2>
        <button className="dashboard__action-btn">+ Nowa Historia</button>
      </div>
      <div className="dashboard__empty">
        <p>
          Brak danych - backend wymaga endpointu <code>GET /history</code>
        </p>
      </div>
    </section>
  );
}

export default HistoryPage;
