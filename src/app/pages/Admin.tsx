import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import {
  Users, Briefcase, ShoppingBag, MessageCircle, TrendingUp,
  CheckCircle, XCircle, Eye, Trash2, Shield, AlertTriangle,
  BarChart2, Globe, ArrowLeft, Search, Filter, RefreshCw
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../context/AuthContext";

const B = "#1A6BB5", BD = "#0D3B6E", BDK = "#0A2540", BL = "#E8F3FC", GOLD = "#F5A623";

// ⚠️ Muda este email para o teu email de administrador
const ADMIN_EMAIL = "mabolacha58@gmail.com";

type Tab = "overview" | "usuarios" | "vagas" | "produtos" | "candidaturas";

export function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState({ users: 0, vagas: 0, produtos: 0, candidaturas: 0, mensagens: 0 });
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [vagas, setVagas] = useState<any[]>([]);
  const [produtos, setProdutos] = useState<any[]>([]);
  const [candidaturas, setCandidaturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Verificar se é admin
  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (user.email !== ADMIN_EMAIL) { navigate("/dashboard"); return; }
    loadAll();
  }, [user]);

  async function loadAll() {
    setLoading(true);
    try {
      const [
        { count: userCount },
        { count: vagaCount },
        { count: prodCount },
        { count: candCount },
        { count: msgCount },
        { data: usersData },
        { data: vagasData },
        { data: produtosData },
        { data: candData },
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact" }),
        supabase.from("vagas").select("id", { count: "exact" }),
        supabase.from("produtos").select("id", { count: "exact" }),
        supabase.from("candidaturas").select("id", { count: "exact" }),
        supabase.from("mensagens").select("id", { count: "exact" }),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(50),
        supabase.from("vagas").select("*, profiles(nome, email)").order("created_at", { ascending: false }).limit(50),
        supabase.from("produtos").select("*, profiles(nome, email)").order("created_at", { ascending: false }).limit(50),
        supabase.from("candidaturas").select("*, vagas(titulo, empresa_nome), profiles(nome, email)").order("created_at", { ascending: false }).limit(50),
      ]);

      setStats({ users: userCount || 0, vagas: vagaCount || 0, produtos: prodCount || 0, candidaturas: candCount || 0, mensagens: msgCount || 0 });
      setUsuarios(usersData || []);
      setVagas(vagasData || []);
      setProdutos(produtosData || []);
      setCandidaturas(candData || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  async function deleteVaga(id: string) {
    if (!confirm("Tens a certeza que queres apagar esta vaga?")) return;
    setActionLoading(id);
    await supabase.from("vagas").delete().eq("id", id);
    setVagas(v => v.filter(x => x.id !== id));
    setStats(s => ({ ...s, vagas: s.vagas - 1 }));
    setActionLoading(null);
  }

  async function deleteProduto(id: string) {
    if (!confirm("Tens a certeza que queres apagar este produto?")) return;
    setActionLoading(id);
    await supabase.from("produtos").delete().eq("id", id);
    setProdutos(p => p.filter(x => x.id !== id));
    setStats(s => ({ ...s, produtos: s.produtos - 1 }));
    setActionLoading(null);
  }

  async function deleteUsuario(id: string) {
    if (!confirm("Tens a certeza? Esta acção é irreversível.")) return;
    setActionLoading(id);
    await supabase.from("profiles").delete().eq("id", id);
    setUsuarios(u => u.filter(x => x.id !== id));
    setStats(s => ({ ...s, users: s.users - 1 }));
    setActionLoading(null);
  }

  async function updateCandidaturaStatus(id: string, status: string) {
    setActionLoading(id);
    await supabase.from("candidaturas").update({ status }).eq("id", id);
    setCandidaturas(c => c.map(x => x.id === id ? { ...x, status } : x));
    setActionLoading(null);
  }

  const TABS: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: "overview",      label: "Visão Geral",  icon: BarChart2 },
    { id: "usuarios",      label: "Utilizadores", icon: Users,       count: stats.users },
    { id: "vagas",         label: "Vagas",         icon: Briefcase,   count: stats.vagas },
    { id: "produtos",      label: "Marketplace",   icon: ShoppingBag, count: stats.produtos },
    { id: "candidaturas",  label: "Candidaturas",  icon: CheckCircle, count: stats.candidaturas },
  ];

  const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
    "Novo":       { bg: "#E1F5EE", color: "#065F46" },
    "Em análise": { bg: BL,        color: BD },
    "Entrevista": { bg: "#FEF3DC", color: "#92400E" },
    "Aceite":     { bg: "#E1F5EE", color: "#065F46" },
    "Rejeitado":  { bg: "#FCEBEB", color: "#A32D2D" },
  };

  if (!user || user.email !== ADMIN_EMAIL) return null;

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${BDK}, ${BD})`, padding: "20px 24px" }}>
        <div style={{ maxWidth: 1400, margin: "0 auto", display: "flex", alignItems: "center", gap: 16 }}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <button style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <ArrowLeft size={16} color="white" />
            </button>
          </Link>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Shield size={20} color={GOLD} />
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "white" }}>
                Painel de Administração
              </h1>
            </div>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginTop: 2 }}>
              Drielle · Controlo total da plataforma
            </p>
          </div>
          <button onClick={loadAll} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 99, color: "white", fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <RefreshCw size={14} /> Actualizar
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "20px 16px" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 20, paddingBottom: 4 }}>
          {TABS.map(({ id, label, icon: Icon, count }) => (
            <button key={id} onClick={() => setTab(id)} style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "9px 16px", borderRadius: 10, border: "none",
              background: tab === id ? B : "white",
              color: tab === id ? "white" : "#495057",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: "nowrap", flexShrink: 0,
              boxShadow: tab === id ? `0 4px 12px rgba(26,107,181,0.3)` : "0 1px 3px rgba(0,0,0,0.06)",
              transition: "all 0.15s",
            }}>
              <Icon size={15} />
              {label}
              {count !== undefined && (
                <span style={{ padding: "1px 7px", borderRadius: 99, background: tab === id ? "rgba(255,255,255,0.25)" : BL, color: tab === id ? "white" : B, fontSize: 11, fontWeight: 700 }}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px 0", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${BL}`, borderTop: `3px solid ${B}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#6C757D" }}>A carregar dados...</p>
          </div>
        ) : (
          <>
            {/* ── Overview ── */}
            {tab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* KPI cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
                  {[
                    { icon: Users,         label: "Utilizadores",  value: stats.users,        color: B,        bg: BL },
                    { icon: Briefcase,     label: "Vagas",          value: stats.vagas,        color: "#059669", bg: "#E1F5EE" },
                    { icon: ShoppingBag,   label: "Produtos",       value: stats.produtos,     color: "#D97706", bg: "#FEF3DC" },
                    { icon: CheckCircle,   label: "Candidaturas",   value: stats.candidaturas, color: "#7C3AED", bg: "#EDE9FE" },
                    { icon: MessageCircle, label: "Mensagens",      value: stats.mensagens,    color: "#DB2777", bg: "#FCE7F3" },
                  ].map(({ icon: Icon, label, value, color, bg }) => (
                    <div key={label} style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                        <Icon size={22} color={color} />
                      </div>
                      <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 32, fontWeight: 800, color: BDK, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: 13, color: "#6C757D", marginTop: 6 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent activity */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {/* Recent users */}
                  <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: BDK, marginBottom: 14 }}>Últimos Utilizadores</h3>
                    {usuarios.slice(0, 5).map(u => (
                      <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F1F3F5" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "50%", background: B, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontSize: 11, fontWeight: 800, color: "white", flexShrink: 0 }}>
                          {(u.nome || "U").slice(0, 2).toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: BDK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.nome || "Sem nome"}</div>
                          <div style={{ fontSize: 11, color: "#6C757D" }}>{u.role} · {u.email}</div>
                        </div>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: u.role === "empresa" ? "#FEF3DC" : BL, color: u.role === "empresa" ? "#92400E" : BD, fontWeight: 600 }}>
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Recent vagas */}
                  <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                    <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 15, fontWeight: 700, color: BDK, marginBottom: 14 }}>Últimas Vagas</h3>
                    {vagas.slice(0, 5).map(v => (
                      <div key={v.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #F1F3F5" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: BDK, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.titulo}</div>
                          <div style={{ fontSize: 11, color: "#6C757D" }}>{v.empresa_nome} · {v.localizacao}</div>
                        </div>
                        <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: BL, color: B, fontWeight: 600, whiteSpace: "nowrap" }}>
                          {v.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Utilizadores ── */}
            {tab === "usuarios" && (
              <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F3F5", display: "flex", gap: 10, alignItems: "center" }}>
                  <Search size={15} color="#ADB5BD" />
                  <input style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'DM Sans', sans-serif", color: "#212529" }}
                    placeholder="Buscar utilizadores..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8F9FA" }}>
                        {["Nome", "Email", "Tipo", "Localização", "Registado em", "Acções"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6C757D", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.filter(u => !search || u.nome?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase())).map(u => (
                        <tr key={u.id} style={{ borderTop: "1px solid #F1F3F5" }}
                          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                          onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", background: B, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "white", fontFamily: "'Sora', sans-serif", flexShrink: 0 }}>
                                {(u.nome || "U").slice(0, 2).toUpperCase()}
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 600, color: BDK }}>{u.nome || "Sem nome"}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6C757D" }}>{u.email}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: u.role === "empresa" ? "#FEF3DC" : BL, color: u.role === "empresa" ? "#92400E" : BD, fontWeight: 700 }}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6C757D" }}>{u.localizacao || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#ADB5BD" }}>{new Date(u.created_at).toLocaleDateString("pt-PT")}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <Link to={`/perfil/${u.id}`} style={{ textDecoration: "none" }}>
                                <button style={{ width: 30, height: 30, borderRadius: 7, background: BL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Eye size={14} color={B} />
                                </button>
                              </Link>
                              <button onClick={() => deleteUsuario(u.id)} disabled={actionLoading === u.id} style={{ width: 30, height: 30, borderRadius: 7, background: "#FCEBEB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Trash2 size={14} color="#E24B4A" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Vagas ── */}
            {tab === "vagas" && (
              <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F3F5", display: "flex", gap: 10, alignItems: "center" }}>
                  <Search size={15} color="#ADB5BD" />
                  <input style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                    placeholder="Buscar vagas..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8F9FA" }}>
                        {["Título", "Empresa", "Localização", "Tipo", "Publicado por", "Data", "Acções"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6C757D", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {vagas.filter(v => !search || v.titulo?.toLowerCase().includes(search.toLowerCase()) || v.empresa_nome?.toLowerCase().includes(search.toLowerCase())).map(v => (
                        <tr key={v.id} style={{ borderTop: "1px solid #F1F3F5" }}
                          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                          onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 600, color: BDK }}>{v.titulo}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: B, fontWeight: 500 }}>{v.empresa_nome}</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6C757D" }}>{v.localizacao}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: BL, color: B, fontWeight: 600 }}>{v.tipo}</span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#6C757D" }}>{v.profiles?.nome || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#ADB5BD" }}>{new Date(v.created_at).toLocaleDateString("pt-PT")}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <Link to={`/vagas/${v.id}`} style={{ textDecoration: "none" }}>
                                <button style={{ width: 30, height: 30, borderRadius: 7, background: BL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Eye size={14} color={B} />
                                </button>
                              </Link>
                              <button onClick={() => deleteVaga(v.id)} disabled={actionLoading === v.id} style={{ width: 30, height: 30, borderRadius: 7, background: "#FCEBEB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {actionLoading === v.id ? <div style={{ width: 12, height: 12, border: "2px solid #E24B4A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <Trash2 size={14} color="#E24B4A" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Marketplace ── */}
            {tab === "produtos" && (
              <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F3F5", display: "flex", gap: 10, alignItems: "center" }}>
                  <Search size={15} color="#ADB5BD" />
                  <input style={{ flex: 1, border: "none", outline: "none", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}
                    placeholder="Buscar produtos..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8F9FA" }}>
                        {["Produto", "Categoria", "Preço", "Vendedor", "Data", "Acções"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6C757D", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {produtos.filter(p => !search || p.titulo?.toLowerCase().includes(search.toLowerCase())).map(p => (
                        <tr key={p.id} style={{ borderTop: "1px solid #F1F3F5" }}
                          onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                          onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              {p.imagem_url ? (
                                <img src={p.imagem_url} alt={p.titulo} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                              ) : (
                                <div style={{ width: 36, height: 36, borderRadius: 8, background: BL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <ShoppingBag size={16} color={B} />
                                </div>
                              )}
                              <span style={{ fontSize: 13, fontWeight: 600, color: BDK }}>{p.titulo}</span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px" }}>
                            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 99, background: "#FEF3DC", color: "#92400E", fontWeight: 600 }}>{p.categoria}</span>
                          </td>
                          <td style={{ padding: "12px 16px", fontSize: 13, fontWeight: 700, color: B }}>{p.preco?.toLocaleString("pt-MZ")} MZN</td>
                          <td style={{ padding: "12px 16px", fontSize: 13, color: "#6C757D" }}>{p.profiles?.nome || "—"}</td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#ADB5BD" }}>{new Date(p.created_at).toLocaleDateString("pt-PT")}</td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <Link to={`/marketplace/${p.id}`} style={{ textDecoration: "none" }}>
                                <button style={{ width: 30, height: 30, borderRadius: 7, background: BL, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <Eye size={14} color={B} />
                                </button>
                              </Link>
                              <button onClick={() => deleteProduto(p.id)} disabled={actionLoading === p.id} style={{ width: 30, height: 30, borderRadius: 7, background: "#FCEBEB", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {actionLoading === p.id ? <div style={{ width: 12, height: 12, border: "2px solid #E24B4A", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> : <Trash2 size={14} color="#E24B4A" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ── Candidaturas ── */}
            {tab === "candidaturas" && (
              <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#F8F9FA" }}>
                        {["Candidato", "Vaga", "Empresa", "Status", "Data", "Acções"].map(h => (
                          <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6C757D", textTransform: "uppercase", letterSpacing: "0.5px", whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {candidaturas.map(c => {
                        const sc = STATUS_COLORS[c.status] || { bg: BL, color: B };
                        return (
                          <tr key={c.id} style={{ borderTop: "1px solid #F1F3F5" }}
                            onMouseOver={e => (e.currentTarget as HTMLElement).style.background = "#FAFAFA"}
                            onMouseOut={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                          >
                            <td style={{ padding: "12px 16px" }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: BDK }}>{c.nome}</div>
                              <div style={{ fontSize: 11, color: "#6C757D" }}>{c.email}</div>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: "#495057" }}>{c.vagas?.titulo || "—"}</td>
                            <td style={{ padding: "12px 16px", fontSize: 13, color: B, fontWeight: 500 }}>{c.vagas?.empresa_nome || "—"}</td>
                            <td style={{ padding: "12px 16px" }}>
                              <select
                                value={c.status || "Novo"}
                                onChange={e => updateCandidaturaStatus(c.id, e.target.value)}
                                style={{ fontSize: 11, padding: "4px 10px", borderRadius: 99, fontWeight: 700, border: "none", cursor: "pointer", background: sc.bg, color: sc.color, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                              >
                                {["Novo", "Em análise", "Entrevista", "Aceite", "Rejeitado"].map(s => (
                                  <option key={s} value={s}>{s}</option>
                                ))}
                              </select>
                            </td>
                            <td style={{ padding: "12px 16px", fontSize: 12, color: "#ADB5BD" }}>{new Date(c.created_at).toLocaleDateString("pt-PT")}</td>
                            <td style={{ padding: "12px 16px" }}>
                              {c.carta && (
                                <button onClick={() => alert(c.carta)} style={{ fontSize: 12, padding: "5px 12px", background: BL, color: B, border: "none", borderRadius: 7, cursor: "pointer", fontWeight: 600 }}>
                                  Ver carta
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}