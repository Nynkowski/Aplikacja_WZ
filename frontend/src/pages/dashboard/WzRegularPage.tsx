function WzRegularPage() {
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
}

export default WzRegularPage;
