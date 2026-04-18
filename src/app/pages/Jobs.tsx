import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, MapPin, Briefcase, Clock, ChevronDown, ArrowRight, SlidersHorizontal, X } from "lucide-react";
import { getVagas } from "../../lib/api";

const B = "#1A6BB5", BD = "#0D3B6E", BL = "#E8F3FC", GOLD = "#F5A623";
const COLORS = ["#1A6BB5","#E24B4A","#0D3B6E","#D97706","#7C3AED","#059669","#DB2777","#0F766E"];
const CATEGORIES = ["Todas","TI & Tecnologia","Marketing","Finanças","Engenharia","Design","Saúde","Direito"];
const LOCATIONS = ["Todas","Maputo","Beira","Nampula","Tete","Remoto"];
const TYPES = ["Todos","Tempo Inteiro","Meio Período","Remoto","Híbrido","Estágio"];

function fmt(n: number) { return n?.toLocaleString("pt-MZ") || "0"; }
function getColor(s: string) { let h=0; for(let i=0;i<s.length;i++) h=s.charCodeAt(i)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }
function getInitials(n: string) { return n.split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase(); }

export function Jobs() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [location, setLocation] = useState("Todas");
  const [type, setType] = useState("Todos");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    getVagas({ search: debouncedSearch, category, location, type })
      .then(setJobs).catch(console.error).finally(() => setLoading(false));
  }, [debouncedSearch, category, location, type]);

  const hasFilters = category !== "Todas" || location !== "Todas" || type !== "Todos";

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh" }}>

      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg,${BD},${B})`, padding: "clamp(24px, 5vw, 40px) clamp(16px, 4vw, 24px) clamp(32px, 6vw, 48px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(22px, 5vw, 32px)", fontWeight: 800, color: "white", marginBottom: 6 }}>
            Vagas de Emprego
          </h1>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginBottom: 20 }}>
            {loading ? "A carregar..." : `${jobs.length} oportunidades em Moçambique`}
          </p>

          {/* Search */}
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1, position: "relative" }}>
              <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#ADB5BD", pointerEvents: "none" }} />
              <input
                style={{ width: "100%", padding: "12px 14px 12px 40px", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans',sans-serif", background: "rgba(255,255,255,0.12)", color: "white", outline: "none" }}
                placeholder="Cargo, empresa..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </div>
            <button onClick={() => setShowFilters(!showFilters)} style={{ padding: "12px 14px", background: showFilters ? GOLD : "rgba(255,255,255,0.15)", color: showFilters ? "#0A2540" : "white", border: "2px solid rgba(255,255,255,0.2)", borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, flexShrink: 0, transition: "all 0.15s" }}>
              <SlidersHorizontal size={15} />
              <span className="hide-mobile">Filtros</span>
              {hasFilters && <span style={{ width: 7, height: 7, borderRadius: "50%", background: showFilters ? "#0A2540" : GOLD, flexShrink: 0 }} />}
            </button>
          </div>

          {/* Filters panel */}
          {showFilters && (
            <div style={{ marginTop: 12, padding: "14px", background: "rgba(255,255,255,0.1)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(8px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
                {[
                  { label: "Localização", value: location, setter: setLocation, options: LOCATIONS },
                  { label: "Tipo", value: type, setter: setType, options: TYPES },
                ].map(({ label, value, setter, options }) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 5, textTransform: "uppercase" as const, letterSpacing: "0.5px" }}>{label}</div>
                    <select style={{ width: "100%", padding: "9px 12px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 13, color: "white", outline: "none", cursor: "pointer", appearance: "none" }}
                      value={value} onChange={e => setter(e.target.value)}>
                      {options.map(o => <option key={o} style={{ color: "#212529" }}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              {hasFilters && (
                <button onClick={() => { setCategory("Todas"); setLocation("Todas"); setType("Todos"); }} style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: GOLD, background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  <X size={13} /> Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "20px clamp(12px, 4vw, 24px)" }}>

        {/* Category pills — horizontal scroll on mobile */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 20, scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <style>{`.cat-pills::-webkit-scrollbar{display:none}`}</style>
          <div className="cat-pills" style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" as any }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} style={{ padding: "7px 14px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: category===c ? B : "#DEE2E6", background: category===c ? B : "white", color: category===c ? "white" : "#495057", fontFamily: "'DM Sans',sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" as const, flexShrink: 0 }}>{c}</button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "48px 0", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, border: `3px solid ${BL}`, borderTop: `3px solid ${B}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ fontSize: 14, color: "#6C757D" }}>A carregar vagas...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && jobs.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 16px" }}>
            <div style={{ width: 70, height: 70, borderRadius: "50%", background: BL, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Briefcase size={32} color={B} />
            </div>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 700, color: "#0A2540", marginBottom: 8 }}>Nenhuma vaga encontrada</h3>
            <p style={{ fontSize: 13, color: "#6C757D", marginBottom: 20 }}>Tente outros filtros</p>
            <button onClick={() => { setCategory("Todas"); setLocation("Todas"); setType("Todos"); setSearch(""); }} style={{ padding: "9px 20px", background: `linear-gradient(135deg,${B},${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
              Limpar filtros
            </button>
          </div>
        )}

        {/* Jobs list */}
        {!loading && jobs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {jobs.map(job => {
              const color = getColor(job.empresa_nome || "");
              const initials = getInitials(job.empresa_nome || "EM");
              return (
                <Link key={job.id} to={`/vagas/${job.id}`} style={{ textDecoration: "none" }}>
                  <div className="job-card" style={{ background: "white", border: `1px solid ${job.destaque ? B : "#E9ECEF"}`, borderLeft: job.destaque ? `4px solid ${B}` : "1px solid #E9ECEF", borderRadius: 12, padding: "clamp(14px, 3vw, 20px) clamp(14px, 3vw, 22px)", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                    onMouseOver={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow=`0 6px 20px rgba(26,107,181,0.12)`; el.style.transform="translateY(-1px)"; }}
                    onMouseOut={e => { const el=e.currentTarget as HTMLElement; el.style.boxShadow="0 1px 4px rgba(0,0,0,0.04)"; el.style.transform=""; }}
                  >
                    <div className="job-card-inner" style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <div style={{ width: 46, height: 46, borderRadius: 11, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "white", flexShrink: 0, boxShadow: `0 4px 10px ${color}40` }}>
                        {initials}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", marginBottom: 3 }}>
                          <span style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(14px, 3vw, 16px)", fontWeight: 700, color: "#0A2540" }}>{job.titulo}</span>
                          {job.destaque && <span style={{ fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: BL, color: B, flexShrink: 0 }}>DESTAQUE</span>}
                        </div>
                        <div style={{ fontSize: 13, color: B, fontWeight: 600, marginBottom: 8 }}>{job.empresa_nome}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6C757D" }}><MapPin size={11} />{job.localizacao}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#6C757D" }}><Clock size={11} />{new Date(job.created_at).toLocaleDateString("pt-PT")}</span>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: job.tipo==="Remoto"?"#E1F5EE":job.tipo==="Híbrido"?"#FEF3DC":"#F1F3F5", color: job.tipo==="Remoto"?"#065F46":job.tipo==="Híbrido"?"#92400E":"#495057" }}>
                            {job.tipo}
                          </span>
                        </div>
                      </div>
                      <div className="job-card-right" style={{ textAlign: "right", flexShrink: 0 }}>
                        {(job.salario_min||job.salario_max) && (
                          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(12px, 2.5vw, 14px)", fontWeight: 800, color: B, whiteSpace: "nowrap" as const }}>
                            {fmt(job.salario_min)}–{fmt(job.salario_max)}
                            <span style={{ fontSize: 10, fontWeight: 400, color: "#ADB5BD" }}> MZN</span>
                          </div>
                        )}
                        <div style={{ fontSize: 12, color: B, fontWeight: 600, marginTop: 6, display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end" }}>
                          Ver <ArrowRight size={12} />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media (max-width: 640px){
          .job-card-inner{flex-wrap:wrap}
          .job-card-right{width:100%;display:flex;justify-content:space-between;align-items:center;text-align:left}
        }
      `}</style>
    </div>
  );
}
