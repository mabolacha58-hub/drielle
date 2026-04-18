import { useState, useRef, useEffect } from "react";
import { Bell, Briefcase, MessageCircle, Star, UserPlus, ShoppingBag, X, Check } from "lucide-react";

type Notif = {
  id: number;
  type: "vaga" | "mensagem" | "avaliacao" | "conexao" | "produto";
  title: string;
  desc: string;
  time: string;
  read: boolean;
};

const INITIAL: Notif[] = [
  { id: 1, type: "vaga", title: "Nova vaga recomendada", desc: "Desenvolvedor React na TechMoz — Maputo", time: "há 5 min", read: false },
  { id: 2, type: "mensagem", title: "Nova mensagem", desc: "Millenium Challenge: Podemos marcar uma entrevista?", time: "há 22 min", read: false },
  { id: 3, type: "conexao", title: "Pedido de conexão", desc: "Beatriz Machel quer ligar-se a si", time: "há 1 hora", read: false },
  { id: 4, type: "avaliacao", title: "Nova avaliação", desc: "BCI Banco avaliou o seu perfil com 5 estrelas ⭐", time: "há 3 horas", read: true },
  { id: 5, type: "produto", title: "Produto em destaque", desc: "O seu serviço de Design foi destacado", time: "ontem", read: true },
  { id: 6, type: "vaga", title: "A sua candidatura foi vista", desc: "Deloitte Moçambique viu a sua candidatura", time: "ontem", read: true },
];

const TYPE_CONFIG = {
  vaga:     { icon: Briefcase,      color: "var(--d-green)",     bg: "var(--d-green-light)" },
  mensagem: { icon: MessageCircle,  color: "#185FA5",            bg: "var(--d-blue-light)" },
  avaliacao:{ icon: Star,           color: "var(--d-amber-dark)",bg: "var(--d-amber-light)" },
  conexao:  { icon: UserPlus,       color: "#9E3AB5",            bg: "#F3E8FF" },
  produto:  { icon: ShoppingBag,    color: "#D85A30",            bg: "#FAECE7" },
};

export function Notifications() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>(INITIAL);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifs.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })));
  const markOne = (id: number) => setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const remove = (id: number) => setNotifs(n => n.filter(x => x.id !== id));

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: 36, height: 36, borderRadius: "50%",
          background: open ? "var(--d-green-light)" : "var(--d-gray-100)",
          border: `1px solid ${open ? "var(--d-green)" : "var(--d-gray-200)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", position: "relative", transition: "all 0.15s",
        }}
      >
        <Bell size={16} color={open ? "var(--d-green)" : "var(--d-gray-600)"} />
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -2, right: -2,
            minWidth: 16, height: 16, borderRadius: 99,
            background: "var(--d-amber)", border: "2px solid white",
            fontSize: 9, fontWeight: 700, color: "#412402",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
          }}>{unread}</span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 10px)", right: 0,
          width: 360, background: "white",
          border: "1px solid var(--d-gray-200)", borderRadius: "var(--d-radius-lg)",
          boxShadow: "var(--d-shadow-lg)", zIndex: 200, overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{
            padding: "14px 16px", borderBottom: "1px solid var(--d-gray-100)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "var(--d-font-h)", fontSize: 15, fontWeight: 600, color: "var(--d-gray-900)" }}>
                Notificações
              </span>
              {unread > 0 && (
                <span style={{
                  background: "var(--d-green-light)", color: "var(--d-green-dark)",
                  fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 99,
                }}>{unread} novas</span>
              )}
            </div>
            {unread > 0 && (
              <button onClick={markAll} style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 12, color: "var(--d-green)", fontWeight: 500, fontFamily: "var(--d-font-b)",
                display: "flex", alignItems: "center", gap: 4,
              }}>
                <Check size={13} /> Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: "auto" }}>
            {notifs.length === 0 && (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--d-gray-500)", fontSize: 14 }}>
                <Bell size={32} style={{ margin: "0 auto 10px", opacity: 0.3, display: "block" }} />
                Sem notificações
              </div>
            )}
            {notifs.map(n => {
              const cfg = TYPE_CONFIG[n.type];
              const Icon = cfg.icon;
              return (
                <div key={n.id} style={{
                  display: "flex", alignItems: "flex-start", gap: 12,
                  padding: "12px 16px",
                  background: n.read ? "white" : "var(--d-green-light)",
                  borderBottom: "1px solid var(--d-gray-100)",
                  transition: "background 0.15s", cursor: "pointer",
                }}
                  onClick={() => markOne(n.id)}
                  onMouseOver={e => { if (n.read) (e.currentTarget as HTMLElement).style.background = "var(--d-gray-50)"; }}
                  onMouseOut={e => { if (n.read) (e.currentTarget as HTMLElement).style.background = "white"; }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon size={16} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 13, fontWeight: n.read ? 400 : 600, color: "var(--d-gray-900)", marginBottom: 2 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--d-gray-600)", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {n.desc}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--d-gray-400)", marginTop: 4 }}>{n.time}</div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); remove(n.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--d-gray-400)", padding: 2, flexShrink: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div style={{ padding: "10px 16px", borderTop: "1px solid var(--d-gray-100)", textAlign: "center" }}>
            <button style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 13, color: "var(--d-green)", fontWeight: 500, fontFamily: "var(--d-font-b)",
            }}>Ver todas as notificações</button>
          </div>
        </div>
      )}
    </div>
  );
}