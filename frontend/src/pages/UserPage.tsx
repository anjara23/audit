import { useEffect, useState, useCallback } from "react";
import "../index.css";


type Produit = { id_produit: number; design: string; stock: number };
type Fournisseur = { id_frs: number; nom: string };
type Approvisionnement = { id: number; id_produit: number; id_frs: number; qteentree: number };
type Section = "approvisionnements" | "produits" | "fournisseurs";
type ToastType = "success" | "error";

interface Toast { id: number; message: string; type: ToastType }


function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  return (
    <div className="up-toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`up-toast up-toast--${t.type}`}>
          <span className="up-toast-icon">{t.type === "success" ? "✓" : "✕"}</span>
          <span>{t.message}</span>
          <button className="up-toast-close" onClick={() => onRemove(t.id)}>×</button>
        </div>
      ))}
    </div>
  );
}


function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="up-modal-overlay" onClick={onClose}>
      <div className="up-modal" onClick={(e) => e.stopPropagation()}>
        <div className="up-modal-header">
          <h3 className="up-modal-title">{title}</h3>
          <button className="up-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="up-modal-body">{children}</div>
      </div>
    </div>
  );
}


function ConfirmDialog({ message, onConfirm, onCancel }: { message: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="up-modal-overlay" onClick={onCancel}>
      <div className="up-modal up-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="up-modal-header">
          <h3 className="up-modal-title">Confirmation</h3>
          <button className="up-modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="up-modal-body">
          <p style={{ color: "#344054", marginBottom: 20 }}>{message}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button className="up-btn-secondary" onClick={onCancel}>Annuler</button>
            <button className="up-btn-danger" onClick={onConfirm}>Supprimer</button>
          </div>
        </div>
      </div>
    </div>
  );
}


function UserPage() {
  // Data
  const [produits, setProduits] = useState<Produit[]>([]);
  const [fournisseurs, setFournisseurs] = useState<Fournisseur[]>([]);
  const [approvs, setApprovs] = useState<Approvisionnement[]>([]);

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("approvisionnements");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  const removeToast = (id: number) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // Confirm dialog
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void } | null>(null);

  // ── Modal states ─────────────────────────────────────────────────
  // Approvisionnement
  const [modalApprov, setModalApprov] = useState<"add" | "edit" | null>(null);
  const [editingApprov, setEditingApprov] = useState<Approvisionnement | null>(null);
  const [formApprov, setFormApprov] = useState({ id_produit: 0, id_frs: 0, qteentree: 0 });

  // Produit
  const [modalProduit, setModalProduit] = useState<"add" | "edit" | null>(null);
  const [editingProduit, setEditingProduit] = useState<Produit | null>(null);
  const [formProduit, setFormProduit] = useState({ design: "", stock: 0 });

  // Fournisseur
  const [modalFournisseur, setModalFournisseur] = useState<"add" | "edit" | null>(null);
  const [editingFournisseur, setEditingFournisseur] = useState<Fournisseur | null>(null);
  const [formFournisseur, setFormFournisseur] = useState({ nom: "" });

  // ── Fetch ─────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const [pRes, fRes, aRes] = await Promise.all([
      //fetch("http://127.0.0.1:8000/user/produits").then((r) => r.json()),
      //fetch("http://127.0.0.1:8000/user/fournisseurs").then((r) => r.json()),
      //fetch("http://127.0.0.1:8000/user/approvisionnements").then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/user/produits`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/user/fournisseurs`).then((r) => r.json()),
      fetch(`${import.meta.env.VITE_API_URL}/user/approvisionnements`).then((r) => r.json()), 
    ]);
    setProduits(pRes);
    setFournisseurs(fRes);
    setApprovs(aRes);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Approvisionnement CRUD ────────────────────────────────────────
  const openAddApprov = () => {
    setFormApprov({ id_produit: 0, id_frs: 0, qteentree: 0 });
    setModalApprov("add");
  };

  const openEditApprov = (a: Approvisionnement) => {
    setEditingApprov(a);
    setFormApprov({ id_produit: a.id_produit, id_frs: a.id_frs, qteentree: a.qteentree });
    setModalApprov("edit");
  };

  const handleSaveApprov = async () => {
    if (!formApprov.id_produit || !formApprov.id_frs || !formApprov.qteentree) {
      addToast("Veuillez remplir tous les champs.", "error"); return;
    }
    if (modalApprov === "add") {
      //await fetch("http://127.0.0.1:8000/user/approvisionnement"
      await fetch(`${import.meta.env.VITE_API_URL}/user/approvisionnement`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formApprov), 
      });
      addToast("Approvisionnement ajouté avec succès !");
    } else if (modalApprov === "edit" && editingApprov) {
      await fetch(`${import.meta.env.VITE_API_URL}/user/approvisionnement/${editingApprov.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formApprov),
      });
      addToast("Approvisionnement modifié avec succès !");
    }
    setModalApprov(null);
    fetchData();
  };

  const handleDeleteApprov = (id: number) => {
    setConfirm({
      message: "Voulez-vous vraiment supprimer cet approvisionnement ?",
      onConfirm: async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/user/approvisionnement/${id}`, { method: "DELETE" });
        addToast("Approvisionnement supprimé.");
        setConfirm(null); fetchData();
      },
    });
  };

  // ── Produit CRUD ──────────────────────────────────────────────────
  const openAddProduit = () => {
    setFormProduit({ design: "", stock: 0 });
    setModalProduit("add");
  };

  const openEditProduit = (p: Produit) => {
    setEditingProduit(p);
    setFormProduit({ design: p.design, stock: p.stock });
    setModalProduit("edit");
  };

  const handleSaveProduit = async () => {
    if (!formProduit.design) { addToast("Le nom du produit est requis.", "error"); return; }
    if (modalProduit === "add") {
      await fetch(`${import.meta.env.VITE_API_URL}/user/produits`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formProduit),
      });
      addToast("Produit ajouté avec succès !");
    } else if (modalProduit === "edit" && editingProduit) {
      await fetch(`${import.meta.env.VITE_API_URL}/user/produits/${editingProduit.id_produit}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formProduit),
      });
      addToast("Produit modifié avec succès !");
    }
    setModalProduit(null); fetchData();
  };

  const handleDeleteProduit = (id: number) => {
    setConfirm({
      message: "Voulez-vous vraiment supprimer ce produit ?",
      onConfirm: async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/user/produits/${id}`, { method: "DELETE" });
        addToast("Produit supprimé.");
        setConfirm(null); fetchData();
      },
    });
  };

  // ── Fournisseur CRUD ──────────────────────────────────────────────
  const openAddFournisseur = () => {
    setFormFournisseur({ nom: "" });
    setModalFournisseur("add");
  };

  const openEditFournisseur = (f: Fournisseur) => {
    setEditingFournisseur(f);
    setFormFournisseur({ nom: f.nom });
    setModalFournisseur("edit");
  };

  const handleSaveFournisseur = async () => {
    if (!formFournisseur.nom) { addToast("Le nom du fournisseur est requis.", "error"); return; }
    if (modalFournisseur === "add") {
      await fetch(`${import.meta.env.VITE_API_URL}/user/fournisseurs`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formFournisseur),
      });
      addToast("Fournisseur ajouté avec succès !");
    } else if (modalFournisseur === "edit" && editingFournisseur) {
      await fetch(`${import.meta.env.VITE_API_URL}/user/fournisseurs/${editingFournisseur.id_frs}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formFournisseur),
      });
      addToast("Fournisseur modifié avec succès !");
    }
    setModalFournisseur(null); fetchData();
  };

  const handleDeleteFournisseur = (id: number) => {
    setConfirm({
      message: "Voulez-vous vraiment supprimer ce fournisseur ?",
      onConfirm: async () => {
        await fetch(`${import.meta.env.VITE_API_URL}/fournisseurs/${id}`, { method: "DELETE" });
        addToast("Fournisseur supprimé.");
        setConfirm(null); fetchData();
      },
    });
  };

  // ── Filters / pagination ──────────────────────────────────────────
  const filteredApprovs = approvs.filter((a) => {
    const produit = produits.find((p) => p.id_produit === a.id_produit);
    const frs = fournisseurs.find((f) => f.id_frs === a.id_frs);
    const q = searchQuery.toLowerCase();
    return !q || produit?.design.toLowerCase().includes(q) || frs?.nom.toLowerCase().includes(q) || String(a.id).includes(q);
  });

  const filteredProduits = produits.filter((p) =>
    !searchQuery || p.design.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFournisseurs = fournisseurs.filter((f) =>
    !searchQuery || f.nom.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getList = () => {
    if (activeSection === "approvisionnements") return filteredApprovs;
    if (activeSection === "produits") return filteredProduits;
    return filteredFournisseurs;
  };


  const paginated = <T,>(list: T[]) =>
    list.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const switchSection = (s: Section) => {
    setActiveSection(s);
    setSearchQuery("");
    setCurrentPage(1);
  };


  // ── Section metadata ──────────────────────────────────────────────
  const sections: { key: Section; label: string; icon: React.ReactNode }[] = [
    {
      key: "approvisionnements", label: "Approvisionnements",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <path d="M3 5h14M3 10h14M3 15h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
    {
      key: "produits", label: "Produits",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
          <rect x="11" y="3" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
          <rect x="3" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
          <rect x="11" y="11" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
      ),
    },
    {
      key: "fournisseurs", label: "Fournisseurs",
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      ),
    },
  ];

  const sectionTitles: Record<Section, string> = {
    approvisionnements: "Approvisionnements",
    produits: "Produits",
    fournisseurs: "Fournisseurs",
  };

  const sectionSubtitles: Record<Section, string> = {
    approvisionnements: "Gérez les entrées de stock et les fournisseurs.",
    produits: "Gérez le catalogue de produits et les stocks.",
    fournisseurs: "Gérez la liste des fournisseurs.",
  };


  return (
    <div className="up-root">
      {/* Toasts */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />

      {/* Confirm */}
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`up-sidebar ${sidebarOpen ? "up-sidebar--open" : "up-sidebar--closed"}`}>
        {/* Brand */}
        <div className="up-sidebar-brand">
          <span className="up-brand-dot" />
          {sidebarOpen && <span className="up-brand-name">USER PAGE</span>}
        </div>

        {/* Nav items */}
        <nav className="up-sidebar-nav">
          {sections.map((s) => (
            <button
              key={s.key}
              className={`up-sidebar-item ${activeSection === s.key ? "up-sidebar-item--active" : ""}`}
              onClick={() => switchSection(s.key)}
              title={s.label}
            >
              <span className="up-sidebar-icon">{s.icon}</span>
              {sidebarOpen && <span className="up-sidebar-label">{s.label}</span>}
            </button>
          ))}
        </nav>

        {/* Toggle button */}
        <button className="up-sidebar-toggle" onClick={() => setSidebarOpen((v) => !v)} title="Ouvrir/Fermer">
          <svg
            width="16" height="16" viewBox="0 0 16 16" fill="none"
            style={{ transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)", transition: "transform 0.25s" }}
          >
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </aside>

      {/* ── Main area ── */}
      <div className={`up-content ${sidebarOpen ? "up-content--wide" : "up-content--full"}`}>
        {/* Top bar */}
        <header className="up-topbar">
          <div>
            <h1 className="up-page-title">{sectionTitles[activeSection]}</h1>
            <p className="up-page-subtitle">{sectionSubtitles[activeSection]}</p>
          </div>
          <button
            className="up-btn-primary"
            onClick={() => {
              if (activeSection === "approvisionnements") openAddApprov();
              else if (activeSection === "produits") openAddProduit();
              else openAddFournisseur();
            }}
          >
            + Ajouter
          </button>
        </header>

        {/* Table card */}
        <div className="up-table-card">
          {/* Toolbar */}
          <div className="up-table-toolbar">
            <div className="up-table-title-row">
              <span className="up-table-title">{sectionTitles[activeSection]}</span>
              <span className="up-badge">{getList().length} entrées</span>
            </div>
            <div className="up-search-box">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="5" stroke="#98A2B3" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="#98A2B3" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                placeholder="Rechercher…"
                className="up-search-input"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>

          {/* ── Table: Approvisionnements ── */}
          {activeSection === "approvisionnements" && (
            <div className="up-table-wrap">
              <table className="up-table">
                <thead>
                  <tr>
                    <th className="up-th">ID</th>
                    <th className="up-th">Produit</th>
                    <th className="up-th">Fournisseur</th>
                    <th className="up-th">Qté entrée</th>
                    <th className="up-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated(filteredApprovs).map((a) => {
                    const produit = produits.find((p) => p.id_produit === a.id_produit);
                    const frs = fournisseurs.find((f) => f.id_frs === a.id_frs);
                    return (
                      <tr key={a.id} className="up-tr">
                        <td className="up-td up-td--id">{a.id}</td>
                        <td className="up-td">
                          <div className="up-product-cell">
                            <span className="up-product-name">{produit?.design || "—"}</span>
                          </div>
                        </td>
                        <td className="up-td">
                          <div className="up-supplier-cell">
                            <span className="up-supplier-name">{frs?.nom || "—"}</span>
                          </div>
                        </td>
                        <td className="up-td up-td--qty">{a.qteentree.toLocaleString()}</td>
                        <td className="up-td">
                          <div className="up-row-actions">
                            <button className="up-icon-btn" title="Modifier" onClick={() => openEditApprov(a)}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M11.5 2.5a1.5 1.5 0 0 1 2.12 2.12L5 13.25l-3 .75.75-3 8.75-8.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button className="up-icon-btn up-icon-btn--danger" title="Supprimer" onClick={() => handleDeleteApprov(a.id)}>
                              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredApprovs.length === 0 && (
                    <tr><td colSpan={5} className="up-empty">Aucun approvisionnement trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Table: Produits ── */}
          {activeSection === "produits" && (
            <div className="up-table-wrap">
              <table className="up-table">
                <thead>
                  <tr>
                    <th className="up-th">ID</th>
                    <th className="up-th">Désignation</th>
                    <th className="up-th">Stock</th>
                    <th className="up-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated(filteredProduits).map((p) => (
                    <tr key={p.id_produit} className="up-tr">
                      <td className="up-td up-td--id">{p.id_produit}</td>
                      <td className="up-td up-product-name">{p.design}</td>
                      <td className="up-td">
                        <span className={`up-status-badge ${p.stock > 100 ? "up-status--success" : p.stock > 20 ? "up-status--processing" : "up-status--low"}`}>
                          <span className="up-status-dot" />
                          {p.stock.toLocaleString()} 
                        </span>
                      </td>
                      <td className="up-td">
                        <div className="up-row-actions">
                          <button className="up-icon-btn" title="Modifier" onClick={() => openEditProduit(p)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M11.5 2.5a1.5 1.5 0 0 1 2.12 2.12L5 13.25l-3 .75.75-3 8.75-8.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="up-icon-btn up-icon-btn--danger" title="Supprimer" onClick={() => handleDeleteProduit(p.id_produit)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProduits.length === 0 && (
                    <tr><td colSpan={4} className="up-empty">Aucun produit trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Table: Fournisseurs ── */}
          {activeSection === "fournisseurs" && (
            <div className="up-table-wrap">
              <table className="up-table">
                <thead>
                  <tr>
                    <th className="up-th">ID</th>
                    <th className="up-th">Nom</th>
                    <th className="up-th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated(filteredFournisseurs).map((f) => (
                    <tr key={f.id_frs} className="up-tr">
                      <td className="up-td up-td--id">{f.id_frs}</td>
                      <td className="up-td">
                        <div className="up-supplier-cell">
                          <span className="up-supplier-name">{f.nom}</span>
                        </div>
                      </td>
                      <td className="up-td">
                        <div className="up-row-actions">
                          <button className="up-icon-btn" title="Modifier" onClick={() => openEditFournisseur(f)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M11.5 2.5a1.5 1.5 0 0 1 2.12 2.12L5 13.25l-3 .75.75-3 8.75-8.5z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          <button className="up-icon-btn up-icon-btn--danger" title="Supprimer" onClick={() => handleDeleteFournisseur(f.id_frs)}>
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                              <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredFournisseurs.length === 0 && (
                    <tr><td colSpan={3} className="up-empty">Aucun fournisseur trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>

      {/* ══════════════════ MODALS ══════════════════ */}

      {/* Modal: Approvisionnement */}
      {modalApprov && (
        <Modal
          title={modalApprov === "add" ? "Nouvel approvisionnement" : "Modifier l'approvisionnement"}
          onClose={() => setModalApprov(null)}
        >
          <div className="up-form-col">
            <div className="up-form-group">
              <label className="up-label">Produit</label>
              <select className="up-select" value={formApprov.id_produit} onChange={(e) => setFormApprov({ ...formApprov, id_produit: Number(e.target.value) })}>
                <option value={0}>-- Sélectionner un produit --</option>
                {produits.map((p) => <option key={p.id_produit} value={p.id_produit}>{p.design} (Stock: {p.stock})</option>)}
              </select>
            </div>
            <div className="up-form-group">
              <label className="up-label">Fournisseur</label>
              <select className="up-select" value={formApprov.id_frs} onChange={(e) => setFormApprov({ ...formApprov, id_frs: Number(e.target.value) })}>
                <option value={0}>-- Sélectionner un fournisseur --</option>
                {fournisseurs.map((f) => <option key={f.id_frs} value={f.id_frs}>{f.nom}</option>)}
              </select>
            </div>
            <div className="up-form-group">
              <label className="up-label">Quantité entrée</label>
              <input type="number" className="up-input" placeholder="Ex: 100" value={formApprov.qteentree || ""} onChange={(e) => setFormApprov({ ...formApprov, qteentree: Number(e.target.value) })} />
            </div>
            <div className="up-modal-footer">
              <button className="up-btn-secondary" onClick={() => setModalApprov(null)}>Annuler</button>
              <button className="up-btn-primary" onClick={handleSaveApprov}>{modalApprov === "add" ? "Ajouter" : "Enregistrer"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Produit */}
      {modalProduit && (
        <Modal
          title={modalProduit === "add" ? "Nouveau produit" : "Modifier le produit"}
          onClose={() => setModalProduit(null)}
        >
          <div className="up-form-col">
            <div className="up-form-group">
              <label className="up-label">Désignation</label>
              <input type="text" className="up-input" placeholder="Nom du produit" value={formProduit.design} onChange={(e) => setFormProduit({ ...formProduit, design: e.target.value })} />
            </div>
            <div className="up-form-group">
              <label className="up-label">Stock initial</label>
              <input type="number" className="up-input" placeholder="Ex: 50" value={formProduit.stock || ""} onChange={(e) => setFormProduit({ ...formProduit, stock: Number(e.target.value) })} />
            </div>
            <div className="up-modal-footer">
              <button className="up-btn-secondary" onClick={() => setModalProduit(null)}>Annuler</button>
              <button className="up-btn-primary" onClick={handleSaveProduit}>{modalProduit === "add" ? "Ajouter" : "Enregistrer"}</button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Fournisseur */}
      {modalFournisseur && (
        <Modal
          title={modalFournisseur === "add" ? "Nouveau fournisseur" : "Modifier le fournisseur"}
          onClose={() => setModalFournisseur(null)}
        >
          <div className="up-form-col">
            <div className="up-form-group">
              <label className="up-label">Nom du fournisseur</label>
              <input type="text" className="up-input" placeholder="Nom" value={formFournisseur.nom} onChange={(e) => setFormFournisseur({ nom: e.target.value })} />
            </div>
            <div className="up-modal-footer">
              <button className="up-btn-secondary" onClick={() => setModalFournisseur(null)}>Annuler</button>
              <button className="up-btn-primary" onClick={handleSaveFournisseur}>{modalFournisseur === "add" ? "Ajouter" : "Enregistrer"}</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default UserPage;
