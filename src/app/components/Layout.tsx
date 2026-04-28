import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { Search, Menu, X, Home, Briefcase, ShoppingBag, MessageCircle, LayoutDashboard, User, ChevronDown, LogOut, Settings, Rss } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Notifications } from "./Notifications";
import { MobileNav } from "./MobileNav";
import { useAuth } from "../context/AuthContext";

const B = "#1A6BB5", BD = "#0D3B6E", BL = "#E8F3FC", GOLD = "#F5A623";

const NAV = [
  { to: "/",            label: "Início",    icon: Home },
  { to: "/feed",        label: "Feed",      icon: Rss },
  { to: "/vagas",       label: "Vagas",     icon: Briefcase },
  { to: "/marketplace", label: "Mercado",   icon: ShoppingBag },
  { to: "/mensagens",   label: "Mensagens", icon: MessageCircle },
  { to: "/dashboard",   label: "Dashboard", icon: LayoutDashboard },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const active = (p: string) =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Fechar menu mobile ao navegar
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const initials = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : (user?.email || "U")[0].toUpperCase();

  return (
    <div style={{ minHeight: "100vh", background: "#F4F6F9", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Announcement bar — hidden on mobile ── */}
      <div className="announcement-bar" style={{ background: BD, color: "white", textAlign: "center", padding: "7px 20px", fontSize: 12, fontWeight: 500 }}>
        🇲🇿 A plataforma nº 1 de emprego e negócios em Moçambique &nbsp;·&nbsp;
        <Link to="/registar-empresa" style={{ color: GOLD, textDecoration: "none" }}>Registar empresa gratuitamente →</Link>
      </div>

      {/* ── Main Navbar ── */}
      <header style={{ background: "white", borderBottom: `3px solid ${B}`, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(26,107,181,0.10)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 56, gap: 12 }}>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${B},${BD})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 10px rgba(26,107,181,0.3)` }}>
              <span style={{ color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18 }}>D</span>
            </div>
            <div className="hide-mobile">
              <div style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: BD, letterSpacing: "-0.5px", lineHeight: 1 }}>
                Drielle<span style={{ color: GOLD }}>.</span>
              </div>
              <div style={{ fontSize: 9, color: B, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase" as const, lineHeight: 1 }}>Conexão Profissional</div>
            </div>
            {/* Logo text on mobile */}
            <span className="show-mobile" style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19, color: BD }}>
              Drielle<span style={{ color: GOLD }}>.</span>
            </span>
          </Link>

          {/* Search — desktop */}
          <div style={{ flex: 1, maxWidth: 360, position: "relative" }} className="hide-mobile">
            <Search size={14} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#ADB5BD", pointerEvents: "none" }} />
            <input style={{ width: "100%", padding: "9px 14px 9px 36px", border: "1.5px solid #DEE2E6", borderRadius: 99, fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: "#212529", background: "#F8F9FA", outline: "none", transition: "all 0.15s" }}
              placeholder="Buscar vagas, produtos, empresas..."
              onFocus={e => { e.currentTarget.style.border = `1.5px solid ${B}`; e.currentTarget.style.background = "white"; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(26,107,181,0.1)`; }}
              onBlur={e => { e.currentTarget.style.border = "1.5px solid #DEE2E6"; e.currentTarget.style.background = "#F8F9FA"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>

          {/* Desktop Nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: 1, marginLeft: "auto" }} className="hide-mobile">
            {NAV.map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "7px 11px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 500, background: active(to) ? BL : "transparent", color: active(to) ? B : "#495057", borderBottom: active(to) ? `2px solid ${B}` : "2px solid transparent", transition: "all 0.15s" }}
                  onMouseOver={e => { if (!active(to)) (e.currentTarget as HTMLElement).style.background = "#F8F9FA"; }}
                  onMouseOut={e => { if (!active(to)) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <Icon size={14} /> {label}
                </div>
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {/* Search icon on mobile */}
            <button className="show-mobile" style={{ width: 36, height: 36, borderRadius: "50%", background: "#F8F9FA", border: "1px solid #E9ECEF", display: "none", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <Search size={16} color="#495057" />
            </button>

            <div className="hide-mobile"><Notifications /></div>

            {/* User menu desktop */}
            <div ref={userMenuRef} style={{ position: "relative" }} className="hide-mobile">
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: "flex", alignItems: "center", gap: 7, padding: "4px 10px 4px 4px", borderRadius: 99, border: `1.5px solid ${userMenuOpen ? B : "#DEE2E6"}`, background: userMenuOpen ? BL : "white", cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: `linear-gradient(135deg,${B},${BD})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "white", fontFamily: "'Sora',sans-serif" }}>
                  {initials}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, color: "#212529", maxWidth: 80, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {profile?.nome?.split(" ")[0] || "Conta"}
                </span>
                <ChevronDown size={13} color="#6C757D" />
              </button>

              {userMenuOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "white", border: "1px solid #DEE2E6", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,0.12)", minWidth: 200, zIndex: 200, overflow: "hidden" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid #F1F3F5", background: BL }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: BD }}>{profile?.nome || "Utilizador"}</div>
                    <div style={{ fontSize: 11, color: B }}>{profile?.email || user?.email || ""}</div>
                  </div>
                  {[
                    { icon: User, label: "O meu perfil", to: "/perfil/1" },
                    { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
                    { icon: Settings, label: "Configurações", to: "#" },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link key={label} to={to} onClick={() => setUserMenuOpen(false)} style={{ textDecoration: "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", fontSize: 13, color: "#212529", cursor: "pointer" }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#F8F9FA"}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                      >
                        <Icon size={15} color="#6C757D" /> {label}
                      </div>
                    </Link>
                  ))}
                  <div style={{ borderTop: "1px solid #F1F3F5" }}>
                    <div onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 16px", fontSize: 13, color: "#E24B4A", cursor: "pointer" }}
                      onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#FFF5F5"}
                      onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                    >
                      <LogOut size={15} /> Terminar sessão
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Login button when not logged in */}
            {!user && (
              <Link to="/login" style={{ textDecoration: "none" }} className="hide-mobile">
                <button style={{ padding: "7px 16px", borderRadius: 99, border: "none", background: `linear-gradient(135deg,${B},${BD})`, color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: `0 4px 10px rgba(26,107,181,0.3)` }}>
                  Entrar
                </button>
              </Link>
            )}

            {/* Hamburger mobile */}
            <button onClick={() => setMobileOpen(!mobileOpen)} className="show-mobile" style={{ width: 36, height: 36, borderRadius: 9, background: "transparent", border: "1.5px solid #DEE2E6", display: "none", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile search bar below navbar */}
        <div className="show-mobile" style={{ display: "none", padding: "0 16px 10px", background: "white" }}>
          <div style={{ position: "relative" }}>
            <Search size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#ADB5BD", pointerEvents: "none" }} />
            <input style={{ width: "100%", padding: "9px 14px 9px 34px", border: "1.5px solid #E9ECEF", borderRadius: 99, fontSize: 14, fontFamily: "'DM Sans',sans-serif", color: "#212529", background: "#F8F9FA", outline: "none" }}
              placeholder="Buscar vagas, produtos..." />
          </div>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div style={{ borderTop: "1px solid #E9ECEF", background: "white", padding: "12px 16px 20px" }}>
            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: BL, borderRadius: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${B},${BD})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "white", fontFamily: "'Sora',sans-serif" }}>{initials}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: BD }}>{profile?.nome || "Utilizador"}</div>
                  <div style={{ fontSize: 11, color: B }}>{profile?.titulo || user?.email}</div>
                </div>
              </div>
            )}
            {[...NAV, ...(user ? [{ to: "/perfil/1", label: "Perfil", icon: User }] : [{ to: "/login", label: "Entrar", icon: User }])].map(({ to, label, icon: Icon }) => (
              <Link key={to} to={to} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 9, marginBottom: 2, fontSize: 14, fontWeight: 500, background: active(to) ? BL : "transparent", color: active(to) ? B : "#495057" }}>
                  <Icon size={18} /> {label}
                </div>
              </Link>
            ))}
            {user && (
              <div onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 9, marginTop: 6, fontSize: 14, fontWeight: 500, color: "#E24B4A", cursor: "pointer", borderTop: "1px solid #F1F3F5", paddingTop: 14 }}>
                <LogOut size={18} /> Terminar sessão
              </div>
            )}
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="has-bottom-nav" style={{ minHeight: "calc(100vh - 56px)" }}>
        <Outlet />
      </main>

      {/* Footer — hidden on mobile (replaced by bottom nav) */}
      <footer className="hide-mobile" style={{ background: BD, color: "white", marginTop: 64 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 24px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40, marginBottom: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: B, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 18 }}>D</span>
                </div>
                <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 19 }}>Drielle<span style={{ color: GOLD }}>.</span></span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>
                A plataforma líder de conexão profissional em Moçambique.
              </p>
            </div>
            {[
              { title: "Plataforma", links: [["Vagas", "/vagas"], ["Marketplace", "/marketplace"], ["Feed", "/feed"], ["Dashboard", "/dashboard"]] },
              { title: "Empresa", links: [["Sobre Nós", "#"], ["Carreiras", "#"], ["Contacto", "#"]] },
              { title: "Legal", links: [["Privacidade", "#"], ["Termos", "#"], ["Cookies", "#"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 700, marginBottom: 14, color: "white", textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>{title}</h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {links.map(([label, href]) => (
                    <li key={label} style={{ marginBottom: 8 }}>
                      <Link to={href} style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, textDecoration: "none" }}
                        onMouseOver={e => (e.currentTarget as HTMLElement).style.color = "white"}
                        onMouseOut={e => (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"}
                      >{label}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>© 2026 Drielle. Todos os direitos reservados.</p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Feito com 💙 em Moçambique</p>
          </div>
        </div>
      </footer>

      {/* Mobile bottom navigation */}
      <MobileNav />

      <style>{`
        @media (max-width: 640px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}
