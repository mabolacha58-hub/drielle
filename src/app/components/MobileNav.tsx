import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Briefcase,
  ShoppingBag,
  MessageCircle,
  User,
  Rss,
  Menu,
  LayoutDashboard,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const B = "#1A6BB5";
const BL = "#E8F3FC";

const PRIMARY_NAV = [
  { to: "/", icon: Home, label: "Inicio" },
  { to: "/vagas", icon: Briefcase, label: "Vagas" },
  { to: "/feed", icon: Rss, label: "Feed" },
];

const MORE_NAV = [
  { to: "/marketplace", icon: ShoppingBag, label: "Mercado" },
  { to: "/mensagens", icon: MessageCircle, label: "Chat" },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
];

export function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const active = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  useEffect(() => {
    setMoreOpen(false);
  }, [location.pathname]);

  const profileActive = location.pathname.startsWith("/perfil") || location.pathname === "/login";
  const moreActive = MORE_NAV.some(({ to }) => active(to)) || profileActive;
  const profilePath = user ? `/perfil/${user.id}` : "/login";

  const handleNavigate = (to: string) => {
    setMoreOpen(false);
    navigate(to);
  };

  return (
    <>
      {moreOpen && (
        <button
          type="button"
          className="mobile-nav-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMoreOpen(false)}
        />
      )}

      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-inner">
          {PRIMARY_NAV.map(({ to, icon: Icon, label }) => (
            <Link key={to} to={to} className={`mobile-nav-item ${active(to) ? "active" : ""}`}>
              <div className="mobile-nav-icon-wrap">
                <Icon size={20} strokeWidth={active(to) ? 2.4 : 1.9} />
              </div>
              <span>{label}</span>
            </Link>
          ))}

          <button
            type="button"
            className={`mobile-nav-item mobile-nav-trigger ${moreOpen || moreActive ? "active" : ""}`}
            onClick={() => setMoreOpen((open) => !open)}
            aria-label={moreOpen ? "Fechar mais opcoes" : "Abrir mais opcoes"}
            aria-expanded={moreOpen}
          >
            <div className="mobile-nav-icon-wrap">
              {moreOpen ? <X size={20} strokeWidth={2.2} /> : <Menu size={20} strokeWidth={2} />}
            </div>
            <span>Mais</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="mobile-more-sheet">
          <div className="mobile-more-handle" />

          <div className="mobile-more-header">
            <div>
              <div className="mobile-more-title">Mais opcoes</div>
              <div className="mobile-more-subtitle">Navegacao organizada para o celular</div>
            </div>
            <button
              type="button"
              className="mobile-more-close"
              onClick={() => setMoreOpen(false)}
              aria-label="Fechar"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mobile-more-grid">
            {MORE_NAV.map(({ to, icon: Icon, label }) => (
              <button
                key={to}
                type="button"
                className={`mobile-more-item ${active(to) ? "active" : ""}`}
                onClick={() => handleNavigate(to)}
              >
                <div className="mobile-more-icon">
                  <Icon size={18} />
                </div>
                <span>{label}</span>
              </button>
            ))}

            <button
              type="button"
              className={`mobile-more-item ${profileActive ? "active" : ""}`}
              onClick={() => handleNavigate(profilePath)}
            >
              <div
                className="mobile-more-icon"
                style={user ? { background: BL, color: B, fontSize: 12, fontWeight: 800 } : undefined}
              >
                {user ? (user.email || "U")[0].toUpperCase() : <User size={18} />}
              </div>
              <span>{user ? "Perfil" : "Entrar"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
