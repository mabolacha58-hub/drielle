import { Home, Briefcase, MessageCircle, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";

const B = "#1A6BB5";

export function MobileNav() {
  const { user, profile } = useAuth();
  const [isMobile, setIsMobile] = useState(false);
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // Update path on navigation
    const handleNav = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handleNav);
    // Also poll for SPA navigation
    const interval = setInterval(() => {
      if (window.location.pathname !== path) {
        setPath(window.location.pathname);
      }
    }, 100);
    return () => {
      window.removeEventListener("popstate", handleNav);
      clearInterval(interval);
    };
  }, [path]);

  if (!isMobile) return null;

  const active = (p: string) =>
    p === "/" ? path === "/" : path.startsWith(p);

  const initials = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const profilePath = user ? "/perfil/1" : "/login";
  const profileActive = path.startsWith("/perfil") || path === "/login";

  const items = [
    { to: "/",          icon: Home,          label: "Início" },
    { to: "/vagas",     icon: Briefcase,     label: "Vagas" },
    { to: "/mensagens", icon: MessageCircle, label: "Chat" },
  ];

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
    setPath(to);
  };

  return (
    <nav style={{
      position: "fixed",
      bottom: 0, left: 0, right: 0,
      height: 64,
      background: "white",
      borderTop: "1.5px solid #E9ECEF",
      zIndex: 9999,
      boxShadow: "0 -4px 20px rgba(0,0,0,0.10)",
      display: "flex",
      alignItems: "stretch",
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        width: "100%",
      }}>
        {items.map(({ to, icon: Icon, label }) => {
          const isActive = active(to);
          return (
            <button key={to} onClick={() => navigate(to)} style={{
              flex: 1, background: "none", border: "none",
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
              }}>{label}</span>
            </button>
          );
        })}

        {/* Perfil */}
        <button onClick={() => navigate(profilePath)} style={{
          flex: 1, background: "none", border: "none",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 4, padding: "6px 0", cursor: "pointer",
        }}>
          <div style={{
            width: 40, height: 26, borderRadius: 13,
            background: profileActive ? "#E8F3FC" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {user ? (
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: profileActive ? B : "#DEE2E6",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, fontWeight: 800, color: "white",
                fontFamily: "'Sora', sans-serif",
              }}>{initials}</div>
            ) : (
              <User size={20} color={profileActive ? B : "#9CA3AF"} strokeWidth={profileActive ? 2.5 : 1.8} />
            )}
          </div>
          <span style={{
            fontSize: 10, fontWeight: profileActive ? 700 : 400,
            color: profileActive ? B : "#9CA3AF",
            fontFamily: "'DM Sans', sans-serif",
          }}>Perfil</span>
        </button>
      </div>
    </nav>
  );
}