import { Link, useLocation } from "react-router";
import { Home, Briefcase, MessageCircle, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const B = "#1A6BB5";

export function MobileNav() {
  const location = useLocation();
  const { user, profile } = useAuth();

  const active = (p: string) =>
    p === "/" ? location.pathname === "/" : location.pathname.startsWith(p);

  const initials = profile?.nome
    ? profile.nome.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : user?.email?.[0]?.toUpperCase() || "U";

  const profilePath = user ? "/perfil/1" : "/login";
  const profileActive = location.pathname.startsWith("/perfil") || location.pathname === "/login";

  const items = [
    { to: "/",          icon: Home,          label: "Início" },
    { to: "/vagas",     icon: Briefcase,     label: "Vagas" },
    { to: "/mensagens", icon: MessageCircle, label: "Chat" },
  ];

  return (
    <>
      <nav style={{
        display: "none",
        position: "fixed",
        bottom: 0, left: 0, right: 0,
        height: 60,
        background: "white",
        borderTop: "1.5px solid #E9ECEF",
        zIndex: 300,
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
      }} className="mobile-bottom-nav">

        {/* Inner container — perfectly centred */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-around",
          height: "100%",
          paddingBottom: "env(safe-area-inset-bottom)",
          maxWidth: 500,
          margin: "0 auto",
          width: "100%",
        }}>

          {items.map(({ to, icon: Icon, label }) => {
            const isActive = active(to);
            return (
              <Link key={to} to={to} style={{ textDecoration: "none", flex: 1 }}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 3,
                  padding: "6px 0",
                }}>
                  <div style={{
                    width: 44,
                    height: 28,
                    borderRadius: 14,
                    background: isActive ? "#E8F3FC" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background 0.15s",
                  }}>
                    <Icon
                      size={21}
                      color={isActive ? B : "#ADB5BD"}
                      strokeWidth={isActive ? 2.5 : 1.8}
                    />
                  </div>
                  <span style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? B : "#ADB5BD",
                    fontFamily: "'DM Sans', sans-serif",
                    lineHeight: 1,
                  }}>{label}</span>
                </div>
              </Link>
            );
          })}

          {/* Perfil */}
          <Link to={profilePath} style={{ textDecoration: "none", flex: 1 }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              padding: "6px 0",
            }}>
              <div style={{
                width: 44,
                height: 28,
                borderRadius: 14,
                background: profileActive ? "#E8F3FC" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s",
              }}>
                {user ? (
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: profileActive ? B : "#DEE2E6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 9,
                    fontWeight: 800,
                    color: "white",
                    fontFamily: "'Sora', sans-serif",
                  }}>
                    {initials}
                  </div>
                ) : (
                  <User
                    size={21}
                    color={profileActive ? B : "#ADB5BD"}
                    strokeWidth={profileActive ? 2.5 : 1.8}
                  />
                )}
              </div>
              <span style={{
                fontSize: 10,
                fontWeight: profileActive ? 700 : 500,
                color: profileActive ? B : "#ADB5BD",
                fontFamily: "'DM Sans', sans-serif",
                lineHeight: 1,
              }}>Perfil</span>
            </div>
          </Link>

        </div>
      </nav>

      <style>{`
        @media (max-width: 640px) {
          .mobile-bottom-nav {
            display: flex !important;
          }
        }
        @media (min-width: 641px) {
          .mobile-bottom-nav {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
