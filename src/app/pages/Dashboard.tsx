import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, Briefcase, Eye, MessageCircle, Star, ArrowUpRight, Plus, ArrowRight } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats, getMyCandidaturas } from "../../lib/api";

const B = "#1A6BB5", BD = "#0D3B6E", BL = "#E8F3FC", GOLD = "#F5A623", GL = "#FEF3DC";

const VIEWS_DATA = [
  { mes: "Nov", views: 42 }, { mes: "Dez", views: 68 }, { mes: "Jan", views: 55 },
  { mes: "Fev", views: 104 }, { mes: "Mar", views: 92 }, { mes: "Abr", views: 136 },
];

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "Novo": { bg: BL, text: B }, "Em análise": { bg: "#E6F1FB", text: "#185FA5" },
  "Entrevista": { bg: GL, text: "#92400E" }, "Aceite": { bg: "#E1F5EE", text: "#065F46" },
  "Rejeitado": { bg: "#FCEBEB", text: "#A32D2D" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 8, padding: "8px 12px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <div style={{ color: "#6C757D", marginBottom: 3 }}>{label}</div>
      <div style={{ fontWeight: 700, color: "#0A2540" }}>{payload[0].value} visualizações</div>
    </div>
  );
};

export function Dashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({ vagasActivas: 0, totalCandidaturas: 0, mensagensNaoLidas: 0, candidaturasPorStatus: {} as Record<string, number> });
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    async function load() {
      try {
        const [s, c] = await Promise.all([getDashboardStats(user!.id), getMyCandidaturas(user!.id)]);
        setStats(s);
        setCandidaturas(c.slice(0, 5));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user?.id]);

  const KPIS = [
    { label: "Visualizações", value: "136", change: "+32%", icon: Eye, bg: BL, color: B },
    { label: "Candidaturas", value: String(stats.totalCandidaturas), change: "+8%", icon: Briefcase, bg: "#E1F5EE", color: "#065F46" },
    { label: "Vagas Activas", value: String(stats.vagasActivas), change: "hoje", icon: TrendingUp, bg: GL, color: "#92400E" },
    { label: "Mensagens novas", value: String(stats.mensagensNaoLidas), change: "não lidas", icon: MessageCircle, bg: "#EEEDFE", color: "#534AB7" },
  ];

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg, ${BD}, ${B})`, padding: "32px 24px 40px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "white", marginBottom: 4 }}>
              Olá, {profile?.nome?.split(" ")[0] || "Utilizador"}! 👋
            </h1>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Resumo da sua actividade na Drielle</p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link to="/vagas" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 99, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                <Plus size={14} /> Publicar Vaga
              </button>
            </Link>
            <Link to="/publicar-servico" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", background: GOLD, color: "#0A2540", border: "none", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={14} /> Novo Serviço
              </button>
            </Link>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px" }}>
        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 14, marginBottom: 24 }}>
          {KPIS.map(({ label, value, change, icon: Icon, bg, color }) => (
            <div key={label} style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={20} color={color} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#065F46", background: "#E1F5EE", padding: "3px 8px", borderRadius: 99, display: "flex", alignItems: "center", gap: 3 }}>
                  <ArrowUpRight size={11} /> {change}
                </span>
              </div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: "#0A2540", lineHeight: 1 }}>{loading ? "—" : value}</div>
              <div style={{ fontSize: 12, color: "#6C757D", marginTop: 5 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Chart + Status */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540", marginBottom: 4 }}>Visualizações do Perfil</div>
            <div style={{ fontSize: 12, color: "#6C757D", marginBottom: 16 }}>Últimos 6 meses</div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={VIEWS_DATA}>
                <defs>
                  <linearGradient id="vg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={B} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={B} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#6C757D" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="views" stroke={B} strokeWidth={2.5} fill="url(#vg)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540", marginBottom: 16 }}>Candidaturas por Estado</div>
            {loading ? (
              <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", color: "#ADB5BD", fontSize: 13 }}>A carregar...</div>
            ) : Object.keys(stats.candidaturasPorStatus).length === 0 ? (
              <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
                <Briefcase size={32} color="#DEE2E6" />
                <p style={{ fontSize: 13, color: "#ADB5BD" }}>Sem candidaturas ainda</p>
                <Link to="/vagas" style={{ textDecoration: "none", fontSize: 13, color: B, fontWeight: 600 }}>Explorar vagas →</Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Object.entries(stats.candidaturasPorStatus).map(([status, count]) => {
                  const pct = Math.round(((count as number) / stats.totalCandidaturas) * 100);
                  return (
                    <div key={status}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                        <span style={{ color: "#495057", fontWeight: 500 }}>{status}</span>
                        <span style={{ fontWeight: 700, color: "#0A2540" }}>{count as number}</span>
                      </div>
                      <div style={{ height: 6, background: "#F1F3F5", borderRadius: 4 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: B, borderRadius: 4 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent candidaturas */}
        <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540" }}>As minhas Candidaturas</div>
            <Link to="/vagas" style={{ textDecoration: "none", fontSize: 12, color: B, fontWeight: 500, display: "flex", alignItems: "center", gap: 4 }}>
              Explorar vagas <ArrowRight size={13} />
            </Link>
          </div>
          {loading ? (
            <div style={{ padding: "20px 0", textAlign: "center", color: "#ADB5BD", fontSize: 13 }}>A carregar...</div>
          ) : candidaturas.length === 0 ? (
            <div style={{ padding: "32px 0", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>📋</div>
              <p style={{ fontSize: 14, color: "#6C757D", marginBottom: 16 }}>Ainda não te candidataste a nenhuma vaga.</p>
              <Link to="/vagas" style={{ textDecoration: "none" }}>
                <button style={{ padding: "9px 20px", background: `linear-gradient(135deg, ${B}, ${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  Ver vagas disponíveis
                </button>
              </Link>
            </div>
          ) : candidaturas.map((c, i) => {
            const cfg = STATUS_COLORS[c.status] || { bg: BL, text: B };
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < candidaturas.length - 1 ? "1px solid #F1F3F5" : "none" }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: BL, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Briefcase size={18} color={B} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0A2540" }}>{c.vagas?.titulo || "Vaga"}</div>
                  <div style={{ fontSize: 11, color: "#6C757D" }}>{c.vagas?.empresa_nome} · {c.vagas?.localizacao}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: cfg.bg, color: cfg.text }}>{c.status}</span>
                  <div style={{ fontSize: 10, color: "#ADB5BD", marginTop: 3 }}>{new Date(c.created_at).toLocaleDateString("pt-PT")}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Profile reminder */}
        <div style={{ padding: "16px 20px", background: BL, borderRadius: 14, border: `1px solid ${B}30`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Star size={20} fill={GOLD} color={GOLD} />
            <div>
              <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: BD }}>Complete o seu perfil para se destacar</div>
              <div style={{ fontSize: 12, color: B }}>Perfis completos recebem 3x mais visualizações</div>
            </div>
          </div>
          <Link to="/perfil/1" style={{ textDecoration: "none" }}>
            <button style={{ padding: "8px 18px", background: `linear-gradient(135deg, ${B}, ${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Completar perfil
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
