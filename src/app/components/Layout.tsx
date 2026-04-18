import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Home,
  Briefcase,
  ShoppingBag,
  MessageCircle,
  LayoutDashboard,
  User,
  ChevronDown,
  LogOut,
  Settings,
  Rss,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Notifications } from "./Notifications";
import { MobileNav } from "./MobileNav";
import { useAuth } from "../context/AuthContext";

const B = "#1A6BB5";
const BD = "#0D3B6E";
const BL = "#E8F3FC";
const GOLD = "#F5A623";

const NAV = [
  { to: "/", label: "Inicio", icon: Home },
  { to: "/feed", label: "Feed", icon: Rss },
  { to: "/vagas", label: "Vagas", icon: Briefcase },
  { to: "/marketplace", label: "Mercado", icon: ShoppingBag },
  { to: "/mensagens", label: "Mensagens", icon: MessageCircle },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

function useOnClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) return;
      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(userMenuRef, () => setUserMenuOpen(false));

  const active = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email || "U")[0].toUpperCase();

  const styles = {
    header: {
      background: "white",
      borderBottom: `3px solid ${B}`,
      position: "sticky" as const,
      top: 0,
      zIndex: 100,
      boxShadow: "0 2px 12px rgba(26,107,181,0.10)",
    },
    container: {
      maxWidth: 1280,
      margin: "0 auto",
      padding: "0 16px",
      display: "flex",
      alignItems: "center",
      height: 56,
      gap: 12,
    },
    logoIcon: {
      width: 34,
      height: 34,
      borderRadius: 9,
      background: `linear-gradient(135deg,${B},${BD})`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: `0 4px 10px rgba(26,107,181,0.3)`,
    },
    navLink: (isActive: boolean) => ({
      display: "flex",
      alignItems: "center",
      gap: 5,
      padding: "7px 11px",
      borderRadius: 8,
      cursor: "pointer",
      fontSize: 13,
      fontWeight: 500,
      background: isActive ? BL : "transparent",
      color: isActive ? B : "#495057",
      borderBottom: isActive ? `2px solid ${B}` : "2px solid transparent",
      transition: "all 0.15s",
    }),
    userButton: (open: boolean) => ({
      display: "flex",
      alignItems: "center",
      gap: 7,
      padding: "4px 10px 4px 4px",
      borderRadius: 99,
      border: `1.5px solid ${open ? B : "#DEE2E6"}`,
      background: open ? BL : "white",
      cursor: "pointer",
      transition: "all 0.15s",
    }),
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'DM Sans', sans-serif" }}>
      {!isMobile && (
        <div style={{ background: BD, color: "white", textAlign: "center", padding: "7px 20px", fontSize: 12, fontWeight: 500 }}>
          A plataforma n 1 de emprego e negocios em Mocambique &nbsp;·&nbsp;
          <Link to="/registar-empresa" style={{ color: GOLD, textDecoration: "none" }}>
            Registar empresa gratuitamente →
          </Link>
        </div>
      )}

      <header style={styles.header}>
        <div style={styles.container}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={styles.logoIcon}>
              <span style={{ color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18 }}>D</span>
            </div>

            {!isMobile ? (
              <div>
                <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: BD, letterSpacing: "-0.5px", lineHeight: 1 }}>
                  Drielle<span style={{ color: GOLD }}>.</span>
                </div>
                <div style={{ fontSize: 9, color: B, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", lineHeight: 1 }}>
                  Conexao Profissional
                </div>
              </div>
            ) : (
              <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: BD }}>
                Drielle<span style={{ color: GOLD }}>.</span>
              </span>
            )}
          </Link>

          {!isMobile && (
            <div style={{ flex: 1, maxWidth: 360, position: "relative" }}>
              <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#ADB5BD", pointerEvents: "none" }} />
              <input
                style={{
                  width: "100%",
                  padding: "9px 14px 9px 36px",
                  border: "1.5px solid #DEE2E6",
                  borderRadius: 99,
                  fontSize: 13,
                  fontFamily: "'DM Sans',sans-serif",
                  color: "#212529",
                  background: "#F8F9FA",
                  outline: "none",
                  transition: "all 0.15s",
                }}
                placeholder="Buscar vagas, produtos, empresas..."
                onFocus={(e) => {
                  e.currentTarget.style.border = `1.5px solid ${B}`;
                  e.currentTarget.style.background = "white";
                  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(26,107,181,0.1)`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.border = "1.5px solid #DEE2E6";
                  e.currentTarget.style.background = "#F8F9FA";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>
          )}

          {!isMobile && (
            <nav style={{ display: "flex", alignItems: "center", gap: 1, marginLeft: "auto" }}>
              {NAV.map(({ to, label, icon: Icon }) => (
                <Link key={to} to={to} style={{ textDecoration: "none" }}>
                  <div
                    style={styles.navLink(active(to))}
                    onMouseOver={(e) => {
                      if (!active(to)) (e.currentTarget as HTMLElement).style.background = "#F8F9FA";
                    }}
                    onMouseOut={(e) => {
                      if (!active(to)) (e.currentTarget as HTMLElement).style.background = "transparent";
                    }}
                  >
                    <Icon size={14} /> {label}
                  </div>
                </Link>
              ))}
            </nav>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, marginLeft: isMobile ? "auto" : undefined }}>
            {!isMobile && <Notifications />}

            {!isMobile && user && (
              <div ref={userMenuRef} style={{ position: "relative" }}>
                <button
                  aria-label="Menu do utilizador"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  style={styles.userButton(userMenuOpen)}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg,${B},${BD})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "white",
                      fontFamily: "'Sora',sans-serif",
                    }}
                  >
                    {initials}
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#212529",
                      maxWidth: 80,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {profile?.nome?.split(" ")[0] || "Conta"}
                  </span>
                  <ChevronDown size={13} color="#6C757D" />
                </button>

                {userMenuOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      background: "white",
                      border: "1px solid #DEE2E6",
                      borderRadius: 12,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
                      minWidth: 200,
                      zIndex: 200,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F3F5", background: BL }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: BD }}>{profile?.nome || "Utilizador"}</div>
                      <div style={{ fontSize: 11, color: B }}>{profile?.email || user?.email || ""}</div>
                    </div>

                    {[
                      { icon: User, label: "O meu perfil", to: "/perfil/1" },
                      { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
                      { icon: Settings, label: "Configuracoes", to: "#" },
                    ].map(({ icon: Icon, label, to }) => (
                      <Link key={label} to={to} onClick={() => setUserMenuOpen(false)} style={{ textDecoration: "none" }}>
                        <div
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", fontSize: 13, color: "#212529", cursor: "pointer" }}
                          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.background = "#F8F9FA"}
                          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <Icon size={15} color="#6C757D" /> {label}
                        </div>
                      </Link>
                    ))}

                    <div style={{ borderTop: "1px solid #F1F3F5" }}>
                      <div
                        onClick={handleSignOut}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", fontSize: 13, color: "#E24B4A", cursor: "pointer" }}
                        onMouseOver={(e) => (e.currentTarget as HTMLElement).style.background = "#FFF5F5"}
                        onMouseOut={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <LogOut size={15} /> Terminar sessao
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user && !isMobile && (
              <Link to="/login" style={{ textDecoration: "none" }}>
                <button
                  style={{
                    padding: "7px 16px",
                    borderRadius: 99,
                    border: "none",
                    background: `linear-gradient(135deg,${B},${BD})`,
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: `0 4px 10px rgba(26,107,181,0.3)`,
                  }}
                >
                  Entrar
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main style={{ minHeight: "calc(100vh - 56px)", paddingBottom: isMobile ? 70 : 0 }}>
        <Outlet />
      </main>

      {!isMobile && (
        <footer style={{ background: BD, color: "white", marginTop: 64 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9, background: B, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18 }}>D</span>
                  </div>
                  <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19 }}>
                    Drielle<span style={{ color: GOLD }}>.</span>
                  </span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
                  A plataforma lider de conexao profissional em Mocambique.
                </p>
              </div>

              {[
                { title: "Plataforma", links: [["Vagas", "/vagas"], ["Marketplace", "/marketplace"], ["Feed", "/feed"], ["Dashboard", "/dashboard"]] },
                { title: "Empresa", links: [["Sobre Nos", "#"], ["Carreiras", "#"], ["Contacto", "#"]] },
                { title: "Legal", links: [["Privacidade", "#"], ["Termos", "#"], ["Cookies", "#"]] },
              ].map(({ title, links }) => (
                <div key={title}>
                  <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 14, color: "white", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    {title}
                  </h4>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {links.map(([label, href]) => (
                      <li key={label} style={{ marginBottom: 8 }}>
                        <Link
                          to={href}
                          style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}
                          onMouseOver={(e) => (e.currentTarget as HTMLElement).style.color = "white"}
                          onMouseOut={(e) => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"}
                        >
                          {label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>© 2026 Drielle. Todos os direitos reservados.</p>
              <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Feito com carinho em Mocambique</p>
            </div>
          </div>
        </footer>
      )}

      <MobileNav />
    </div>
  );
}
