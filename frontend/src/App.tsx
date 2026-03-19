import { Routes, Route} from "react-router-dom";
import UserPage from "./pages/UserPage";
import AdminPage from "./pages/AdminPage";


function HomePage() {
  return (
    <div className="home-root">  
      <div className="home-content">
        <h1 className="home-title">
          Sujet 19
          <span className="home-title-accent"> Approvisionnement</span>
          <br />de stock
        </h1>

        <div className="home-actions">
          <button
            className="home-btn home-btn--user"
            onClick={() => window.open("/user", "_blank")}
          >
            <span className="home-btn-icon">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M3 17c0-3.314 3.134-6 7-6s7 2.686 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </span>
            Interface User
            <span className="home-btn-arrow">↗</span>
          </button>

          <button
            className="home-btn home-btn--admin"
            onClick={() => window.open("/admin", "_blank")}
          >
            <span className="home-btn-icon">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <rect x="3" y="2" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                <path d="M7 7h6M7 11h6M7 15h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </span>
            Interface Admin
            <span className="home-btn-arrow">↗</span>
          </button>
        </div>

      </div>
    </div>
  );
}

function App() {
  return (
      <Routes>
        <Route path="/"      element={<HomePage />} />
        <Route path="/user"  element={<UserPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
   
  );
}

export default App;
