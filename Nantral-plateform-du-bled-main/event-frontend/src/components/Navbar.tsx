import { useNavigate } from "react-router-dom";
import "./Navbar.css";

export type NavSection = "members" | "sessions" | "films" | "profile";

type NavbarProps = {
  active: NavSection;
  onLogout: () => void;
  currentUserId?: string | null;
};

const Navbar = ({ active, onLogout, currentUserId }: NavbarProps) => {
  const navigate = useNavigate();

  const go = (path: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(path);
  };

  const profilePath = currentUserId ? `/profile/${currentUserId}` : "/profile/";

  return (
    <header className="navbar">
      <div className="navbar-content">
        <div className="navbar-left">
          <h1 className="site-title">Le bazar de Tommy</h1>
          <nav className="nav-links">
            <a
              href="#"
              className={`nav-link ${active === "members" ? "active" : ""}`}
              onClick={go("/events")}
            >
              Membres
            </a>
            <a
              href="#"
              className={`nav-link ${active === "sessions" ? "active" : ""}`}
              onClick={go("/calendar")}
            >
              Séances
            </a>
            <a
              href="#"
              className={`nav-link ${active === "films" ? "active" : ""}`}
              onClick={go("/films")}
            >
              Films
            </a>
            <a
              href="#"
              className={`nav-link ${active === "profile" ? "active" : ""}`}
              onClick={go(profilePath)}
            >
              Profil
            </a>
            <span> </span>
          </nav>
        </div>
        <div className="navbar-right">
          <span> </span>
          <button className="btn-logout" onClick={onLogout}>
            DÉCONNEXION
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
