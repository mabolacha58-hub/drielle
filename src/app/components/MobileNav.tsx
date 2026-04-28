import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, MessageCircle, User, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const B = "#1A6BB5";

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

export function MobileNav() {
  const location = useLocation();
  const { user, profile, signOut } = useAuth();
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [showLogout, setShowLogout] = useState(false);

  if (!isMobile) return null;

  const active = (p: string) =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p);

  const initials = profile?.nome
    ? profile.nome.split(" ").slice(0, 2).map((n: string) => n[0]).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  // Usa o ID real do utilizador autenticado
  const profilePath = user ? `/perfil/${user.id}` : "/login";
  const profileActive = location.pathname.startsWith("/perfil") || location.pathname === "/login";

  const items = [
    { to: "/",          icon: Home,          label: "Início" },
    { to: "/vagas",     icon: Briefcase,     label: "Vagas"  },
    { to: "/mensagens", icon: MessageCircle, label: "Chat"   },
  ];

  async function handleLogout() {
    setShowLogout(false);
    try {
      await signOut();
    } catch (e) {
      console.error("Erro ao fazer logout:", e);
    }
  }

  return (
    <>
      {/* ── Popup de logout ── */}
      {showLogout && (
        <>
          {/* overlay */}
          <div
            onClick={() => setShowLogout(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 9998,
              background: "rgba(0,0,0,0.35)",
            }}
          />

          {/* card */}
          <div style={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            width: "calc(100% - 48px)",
            maxWidth: 340,
            background: "white",
            borderRadius: 20,
            boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
            zIndex: 9999,
            overflow: "hidden",
          }}>
            {/* cabeçalho com info do utilizador */}
            <div style={{
              padding: "20px 20px 16px",
              borderBottom: "1px solid #F1F3F5",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%",
                background: B, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 15, fontWeight: 800,
                color: "white", fontFamily: "'Sora', sans-serif", flexShrink: 0,
              }}>
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.nome}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }}
                  />
                ) : initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{
                  fontSize: 14, fontWeight: 700, color: "#0A2540",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {profile?.nome || "Utilizador"}
                </div>
                <div style={{
                  fontSize: 12, color: "#6C757D",
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>
                  {user?.email}
                </div>
              </div>
            </div>

            {/* acções */}
            <div style={{ padding: "8px 0" }}>
              <Link
                to={profilePath}
                onClick={() => setShowLogout(false)}
                style={{ textDecoration: "none" }}
              >
                <div style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 20px", cursor: "pointer",
                }}
                  onMouseOver={e => (e.currentTarget.style.background = "#F8F9FA")}
                  onMouseOut={e => (e.currentTarget.style.background = "transparent")}
                >
                  <User size={18} color={B} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0A2540" }}>
                    Ver perfil
                  </span>
                </div>
              </Link>

              <div
                onClick={handleLogout}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "13px 20px", cursor: "pointer",
                }}
                onMouseOver={e => (e.currentTarget.style.background = "#FFF5F5")}
                onMouseOut={e => (e.currentTarget.style.background = "transparent")}
              >
                <LogOut size={18} color="#E24B4A" />
                <span style={{ fontSize: 14, fontWeight: 600, color: "#E24B4A" }}>
                  Terminar sessão
                </span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Barra de navegação ── */}
      <nav style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: 64,
        background: "white", borderTop: "1.5px solid #E9ECEF",
        zIndex: 9997, boxShadow: "0 -4px 20px rgba(0,0,0,0.10)",
        display: "flex", alignItems: "stretch",
      }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-around", width: "100%",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
          {items.map(({ to, icon: Icon, label }) => {
            const isActive = active(to);
            return (
              <Link key={to} to={to} style={{
                textDecoration: "none", flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 4, padding: "6px 0", cursor: "pointer",
              }}>
                <div style={{
                  width: 40, height: 26, borderRadius: 13,
                  background: isActive ? "#E8F3FC" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Icon size={20} color={isActive ? B : "#9CA3AF"} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span style={{
                  fontSize: 10, fontWeight: isActive ? 700 : 400,
                  color: isActive ? B : "#9CA3AF",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  {label}
                </span>
              </Link>
            );
          })}

          {/* Botão Perfil / Login */}
          {user ? (
            // Utilizador autenticado — abre popup com logout
            <button
              onClick={() => setShowLogout(v => !v)}
              style={{
                background: "none", border: "none", flex: 1,
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 4, padding: "6px 0", cursor: "pointer",
              }}
            >
              <div style={{
                width: 40, height: 26, borderRadius: 13,
                background: (profileActive || showLogout) ? "#E8F3FC" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={initials}
                    style={{ width: 22, height: 22, borderRadius: "50%", objectFit: "cover" }}
                  />
                ) : (
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%",
                    background: (profileActive || showLogout) ? B : "#DEE2E6",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 8, fontWeight: 800, color: "white",
                    fontFamily: "'Sora', sans-serif",
                  }}>
                    {initials}
                  </div>
                )}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: (profileActive || showLogout) ? 700 : 400,
                color: (profileActive || showLogout) ? B : "#9CA3AF",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Perfil
              </span>
            </button>
          ) : (
            // Não autenticado — vai para login
            <Link to="/login" style={{
              textDecoration: "none", flex: 1,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: 4, padding: "6px 0",
            }}>
              <div style={{
                width: 40, height: 26, borderRadius: 13,
                background: profileActive ? "#E8F3FC" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <User size={20} color={profileActive ? B : "#9CA3AF"} strokeWidth={profileActive ? 2.5 : 1.8} />
              </div>
              <span style={{
                fontSize: 10, fontWeight: profileActive ? 700 : 400,
                color: profileActive ? B : "#9CA3AF",
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Entrar
              </span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}