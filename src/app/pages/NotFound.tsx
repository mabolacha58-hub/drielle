import { Link } from "react-router-dom";
import { Home, Search, Briefcase, ShoppingBag } from "lucide-react";

export function NotFound() {
  return (
    <div style={{
      minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "40px 20px", fontFamily: "var(--d-font-b)",
    }}>
      <div style={{ textAlign: "center", maxWidth: 520 }}>
        {/* Illustration */}
        <div style={{ position: "relative", marginBottom: 32, display: "inline-block" }}>
          <div style={{
            width: 160, height: 160, borderRadius: "50%",
            background: "var(--d-green-light)", margin: "0 auto",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative",
          }}>
            <span style={{
              fontFamily: "var(--d-font-h)", fontSize: 72, fontWeight: 800,
              color: "var(--d-green)", lineHeight: 1, letterSpacing: "-4px",
            }}>404</span>
          </div>
          {/* Floating dots */}
          {[
            { size: 14, top: 10, left: 10, color: "var(--d-amber)" },
            { size: 10, top: 30, right: 0, color: "var(--d-green)" },
            { size: 8, bottom: 20, left: 0, color: "var(--d-blue)" },
            { size: 12, bottom: 5, right: 20, color: "var(--d-green-mid)" },
          ].map((d, i) => (
            <div key={i} style={{
              position: "absolute", width: d.size, height: d.size,
              borderRadius: "50%", background: d.color,
              top: d.top, left: d.left, right: d.right, bottom: d.bottom,
            }} />
          ))}
        </div>

        <h1 style={{
          fontFamily: "var(--d-font-h)", fontSize: 28, fontWeight: 700,
          color: "var(--d-gray-900)", marginBottom: 12,
        }}>
          Página não encontrada
        </h1>
        <p style={{ fontSize: 15, color: "var(--d-gray-600)", lineHeight: 1.7, marginBottom: 36 }}>
          A página que procura não existe ou foi removida.<br />
          Mas não se preocupe — ainda há muito para explorar na Drielle!
        </p>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
          {[
            { to: "/vagas", icon: Briefcase, label: "Explorar Vagas", color: "var(--d-green-light)", textColor: "var(--d-green-dark)" },
            { to: "/marketplace", icon: ShoppingBag, label: "Ver Marketplace", color: "var(--d-amber-light)", textColor: "var(--d-amber-dark)" },
          ].map(({ to, icon: Icon, label, color, textColor }) => (
            <Link key={to} to={to} style={{ textDecoration: "none" }}>
              <div style={{
                padding: "16px", borderRadius: "var(--d-radius-lg)", background: color,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                cursor: "pointer", transition: "all 0.15s",
                border: "1.5px solid transparent",
              }}
                onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
              >
                <Icon size={22} color={textColor} />
                <span style={{ fontSize: 13, fontWeight: 600, color: textColor }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>

        <Link to="/" style={{ textDecoration: "none" }}>
          <button className="d-btn d-btn-primary" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Home size={16} /> Voltar ao Início
          </button>
        </Link>
      </div>
    </div>
  );
}
