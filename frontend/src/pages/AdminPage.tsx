import { useEffect, useState } from "react";
import "../index.css";

type Audit = {
  id: number;
  action_type: string;
  date_action: string;
  nom: string;
  design: string;
  qteentree_ancien: number | null;
  qteentree_nouv: number | null;
  utilisateur: string;
};

type Stats = {
  insertions: number;
  modifications: number;
  suppressions: number;
};


const ACTION_META: Record<string, { label: string; cls: string; icon: string }> = {
  ajout:        { label: "Ajout",        cls: "ap-action--insert", icon: "+" },
  modification: { label: "Modification", cls: "ap-action--update", icon: "✎" },
  suppression:  { label: "Suppression",  cls: "ap-action--delete", icon: "×" },
};
const getMeta = (t: string) =>
  ACTION_META[t?.toLowerCase()] ?? { label: t, cls: "ap-action--default", icon: "•" };



function AdminPage() {
  const [audits, setAudits]     = useState<Audit[]>([]);
  const [stats, setStats]       = useState<Stats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

 
  const fetchData = (isFirstLoad = false) => {
    if (isFirstLoad) setLoading(true);
    Promise.all([
      fetch("http://127.0.0.1:8000/admin/audit").then((r) => r.json()),
      fetch("http://127.0.0.1:8000/admin/stats").then((r) => r.json()),
    ])
      .then(([auditData, statsData]) => {
        setAudits(auditData);
        setStats(statsData);
      })
      .finally(() => { if (isFirstLoad) setLoading(false); });
  };

  useEffect(() => {
    fetchData(true); 

    // Rafraîchissement automatique toutes les 10 secondes
    const interval = setInterval(() => fetchData(false), 10000);

    // Nettoyage quand le composant est démonté
    return () => clearInterval(interval);
  }, []);

  // ── Filters ───────────────
  const filtered = audits.filter((a) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      a.utilisateur?.toLowerCase().includes(q) ||
      a.nom?.toLowerCase().includes(q) ||
      a.design?.toLowerCase().includes(q) ||
      String(a.id).includes(q);
    const matchAction =
      filterAction === "all" || a.action_type?.toLowerCase() === filterAction;
    return matchSearch && matchAction;
  });

  const totalPages = Math.ceil(filtered.length / rowsPerPage);
  const paginated  = filtered.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // ── Stat cards ─────────
  const total = stats
    ? stats.insertions + stats.modifications + stats.suppressions
    : null;

  const statCards = [
    {
      label: "Total opérations",
      value: total,
      cls: "ap-stat--total",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Insertions",
      value: stats?.insertions ?? null,
      cls: "ap-stat--insert",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.8"/>
          <path d="M10 6.5v7M6.5 10h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      label: "Modifications",
      value: stats?.modifications ?? null,
      cls: "ap-stat--update",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M13.5 3.5a2 2 0 0 1 2.83 2.83L6.25 16.38l-3.75.94.94-3.75L13.5 3.5z"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
    {
      label: "Suppressions",
      value: stats?.suppressions ?? null,
      cls: "ap-stat--delete",
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 5.5h14M7.5 5.5V3.5h5v2M8 9v6M12 9v6M4.5 5.5l1 11h9l1-11"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

 
  return (
    <div className="up-root">

      {/* ── Sidebar ── */}
      <aside className={`up-sidebar ${sidebarOpen ? "up-sidebar--open" : "up-sidebar--closed"}`}>
        <div className="up-sidebar-brand">
          <span className="up-brand-dot" />
          {sidebarOpen && <span className="up-brand-name">StockFlow</span>}
        </div>

        <nav className="up-sidebar-nav">
          <button className="up-sidebar-item up-sidebar-item--active" title="Journal d'audit">
            <span className="up-sidebar-icon">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M7 7h6M7 11h6M7 15h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </span>
            {sidebarOpen && <span className="up-sidebar-label">Journal d'audit</span>}
          </button>
        </nav>

        <button
          className="up-sidebar-toggle"
          onClick={() => setSidebarOpen((v) => !v)}
          title="Ouvrir/Fermer"
        >
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.25s" }}
          >
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      
      <div className="up-content">

       
        <header className="up-topbar">
          <div>
            <h1 className="up-page-title">Journal d'audit</h1>
            <p className="up-page-subtitle">
              Supervision de toutes les opérations sur la base de données.
            </p>
          </div>

          {/* Filter buttons */}
          <div className="ap-filter-bar">
            {[
              { key: "all",          label: "Toutes",        extraCls: "" },
              { key: "ajout",        label: "Ajouts",        extraCls: "ap-filter-btn--insert" },
              { key: "modification", label: "Modifications", extraCls: "ap-filter-btn--update" },
              { key: "suppression",  label: "Suppressions",  extraCls: "ap-filter-btn--delete" },
            ].map((f) => (
              <button
                key={f.key}
                className={`ap-filter-btn ${f.extraCls} ${filterAction === f.key ? "ap-filter-btn--active" : ""}`}
                onClick={() => { setFilterAction(f.key); setCurrentPage(1); }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </header>

        {/* ── Audit table card ── */}
        <div className="up-table-card">

          {/* Toolbar */}
          <div className="up-table-toolbar">
            <div className="up-table-title-row">
              <span className="up-table-title">Historique des opérations</span>
              <span className="up-badge">{filtered.length} entrées</span>
            </div>
            <div className="up-search-box">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="#98A2B3" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                placeholder="Rechercher par utilisateur, produit, fournisseur…"
                className="up-search-input"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* Table */}
          <div className="up-table-wrap">
            {loading ? (
              <div className="ap-loading">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="ap-spinner">
                  <circle cx="12" cy="12" r="10" stroke="#E9D7FE" strokeWidth="3"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="#7F56D9" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                <span>Chargement des données…</span>
              </div>
            ) : (
              <table className="up-table">
                <thead>
                  <tr>
                    <th className="up-th">ID</th>
                    <th className="up-th">Action</th>
                    <th className="up-th">Date</th>
                    <th className="up-th">Fournisseur</th>
                    <th className="up-th">Produit</th>
                    <th className="up-th">Ancienne Qté</th>
                    <th className="up-th">Nouvelle Qté</th>
                    <th className="up-th">Utilisateur</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => {
                    const meta = getMeta(a.action_type);
                    return (
                      <tr key={a.id} className="up-tr">
                        <td className="up-td up-td--id">{a.id}</td>
                        <td className="up-td">
                          <span className={`ap-action-badge ${meta.cls}`}>
                            <span className="ap-action-icon">{meta.icon}</span>
                            {meta.label}
                          </span>
                        </td>
                        <td className="up-td">
                          <div className="ap-date-cell">
                            <span className="ap-date">
                              {new Date(a.date_action).toLocaleDateString("fr-FR")}
                            </span>
                            <span className="ap-time">
                              {new Date(a.date_action).toLocaleTimeString("fr-FR", {
                                hour: "2-digit", minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="up-td">{a.nom || <span className="ap-null">—</span>}</td>
                        <td className="up-td">
                          <span className="up-product-name">
                            {a.design || <span className="ap-null">—</span>}
                          </span>
                        </td>
                        <td className="up-td">
                          {a.qteentree_ancien != null
                            ? <span className="ap-qty ap-qty--old">{a.qteentree_ancien.toLocaleString()}</span>
                            : <span className="ap-null">—</span>}
                        </td>
                        <td className="up-td">
                          {a.qteentree_nouv != null
                            ? <span className="ap-qty ap-qty--new">{a.qteentree_nouv.toLocaleString()}</span>
                            : <span className="ap-null">—</span>}
                        </td>
                        <td className="up-td">
                          <div className="ap-user-cell">
                            <div className="ap-user-avatar">
                              {a.utilisateur?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                            <span>{a.utilisateur || "—"}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {paginated.length === 0 && !loading && (
                    <tr>
                      <td colSpan={8} className="up-empty">Aucune entrée trouvée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* ── Pagination ── */}
          <div className="up-pagination">
            <span className="up-pagination-info">
              Page {currentPage} sur {totalPages || 1}
            </span>
            <div className="up-pagination-btns">
              <button
                className="up-btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Précédent
              </button>
              <button
                className="up-btn-secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
              </button>
            </div>
          </div>

        </div>

        {/* ── Stat cards  */}
        <div className="ap-stats-grid">
          {statCards.map((card) => (
            <div key={card.label} className={`ap-stat-card ${card.cls}`}>
              <div className="ap-stat-icon">{card.icon}</div>
              <div className="ap-stat-body">
                <div className="ap-stat-value">
                  {loading ? <span className="ap-skeleton" /> : (card.value ?? "—")}
                </div>
                <div className="ap-stat-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

export default AdminPage;
