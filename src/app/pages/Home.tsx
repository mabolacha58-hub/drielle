import { Link } from "react-router-dom";
import { Briefcase, MapPin, Clock, TrendingUp, Users, Building2, Star, ArrowRight, Zap, Shield, Globe, CheckCircle } from "lucide-react";

const B = "#1A6BB5", BD = "#0D3B6E", BDK = "#0A2540", BL = "#E8F3FC", GOLD = "#F5A623";

const JOBS = [
  { id: 1, title: "Desenvolvedor Full Stack", company: "TechMoz", location: "Maputo", salary: "60.000 – 90.000 MZN", posted: "2 dias atrás", color: B, initials: "TM" },
  { id: 2, title: "Gestor de Marketing Digital", company: "Vodacom Moçambique", location: "Maputo", salary: "50.000 – 75.000 MZN", posted: "3 dias atrás", color: "#E24B4A", initials: "VM" },
  { id: 3, title: "Contabilista Sénior", company: "Deloitte Moçambique", location: "Beira", salary: "55.000 – 80.000 MZN", posted: "1 semana atrás", color: BD, initials: "DL" },
];

const PRODUCTS = [
  { id: 1, title: "Consultoria Empresarial", seller: "MozConsulting", price: "15.000 MZN", category: "Serviços", rating: 4.9, color: B },
  { id: 2, title: "Software de Gestão", seller: "TechSolutions Moz", price: "25.000 MZN", category: "Software", rating: 4.7, color: "#059669" },
  { id: 3, title: "Formação em Excel Avançado", seller: "EduMoz", price: "5.000 MZN", category: "Formação", rating: 4.8, color: "#D97706" },
];

const STATS = [
  { icon: Briefcase, label: "Vagas Activas", value: "2.450+" },
  { icon: Users, label: "Profissionais", value: "15.000+" },
  { icon: Building2, label: "Empresas", value: "850+" },
  { icon: TrendingUp, label: "Contratações/mês", value: "500+" },
];

const FEATURES = [
  { icon: Zap, title: "Matching Inteligente", desc: "Algoritmo que liga profissionais às vagas certas com base nas suas competências." },
  { icon: Shield, title: "Empresas Verificadas", desc: "Todas as empresas são verificadas pela nossa equipa antes de publicar." },
  { icon: Globe, title: "Cobertura Nacional", desc: "Presença em Maputo, Beira, Nampula, Tete e mais cidades." },
];

export function Home() {
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Hero ── */}
      <section className="hero-section" style={{ background: `linear-gradient(135deg,${BDK} 0%,${BD} 50%,${B} 100%)`, padding: "60px 24px 80px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative" }}>
          <div className="hero-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 99, padding: "5px 14px", fontSize: 11, fontWeight: 700, color: GOLD, marginBottom: 20, textTransform: "uppercase" as const, letterSpacing: "0.8px" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: GOLD, display: "inline-block" }} />
                Plataforma Nº 1 em Moçambique
              </div>
              <h1 className="hero-title" style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "white", lineHeight: 1.1, marginBottom: 18, letterSpacing: "-1px" }}>
                Conecte-se com as<br />
                <span style={{ color: GOLD }}>Melhores Oportunidades</span><br />
                em Moçambique
              </h1>
              <p style={{ fontSize: "clamp(14px, 2vw, 16px)", color: "rgba(255,255,255,0.75)", lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                Vagas de emprego, marketplace e rede profissional criados para o mercado moçambicano.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <Link to="/vagas" style={{ textDecoration: "none" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: GOLD, color: BDK, border: "none", borderRadius: 10, fontSize: 14, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 20px rgba(245,166,35,0.4)` }}>
                    <Briefcase size={16} /> Explorar Vagas
                  </button>
                </Link>
                <Link to="/registar-empresa" style={{ textDecoration: "none" }}>
                  <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "rgba(255,255,255,0.12)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    Para Empresas <ArrowRight size={14} />
                  </button>
                </Link>
              </div>
              <div style={{ display: "flex", gap: 16, marginTop: 28, flexWrap: "wrap" }}>
                {["Registo gratuito", "Sem comissões", "Suporte em Português"].map(f => (
                  <div key={f} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.65)" }}>
                    <CheckCircle size={13} color={GOLD} /> {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Hero cards — hidden on mobile */}
            <div className="hero-cards" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {JOBS.map(job => (
                <Link key={job.id} to={`/vagas/${job.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "rgba(255,255,255,0.95)", borderRadius: 12, padding: "14px 16px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 4px 16px rgba(0,0,0,0.12)", cursor: "pointer", transition: "all 0.15s" }}
                    onMouseOver={e => (e.currentTarget as HTMLElement).style.transform = "translateX(4px)"}
                    onMouseOut={e => (e.currentTarget as HTMLElement).style.transform = ""}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 10, background: job.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 800, color: "white", flexShrink: 0 }}>{job.initials}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 700, color: BDK }}>{job.title}</div>
                      <div style={{ fontSize: 12, color: "#6C757D" }}>{job.company} · {job.location}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 12, fontWeight: 800, color: B }}>{job.salary}</div>
                      <div style={{ fontSize: 11, color: "#ADB5BD" }}>{job.posted}</div>
                    </div>
                  </div>
                </Link>
              ))}
              <div style={{ background: "rgba(245,166,35,0.15)", border: "1px solid rgba(245,166,35,0.3)", borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 500 }}>+ 2.447 vagas disponíveis</span>
                <Link to="/vagas" style={{ textDecoration: "none", fontSize: 13, color: GOLD, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
                  Ver todas <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ background: "white", borderBottom: "1px solid #E9ECEF", padding: "24px 16px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 0 }} className="stats-grid">
          {STATS.map(({ icon: Icon, label, value }, i) => (
            <div key={label} style={{ textAlign: "center", padding: "14px 12px", borderRight: i % 2 === 0 ? "1px solid #E9ECEF" : "none", borderBottom: i < 2 ? "1px solid #E9ECEF" : "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: BL, margin: "0 auto 10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={18} color={B} />
              </div>
              <div style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: BDK, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: "#6C757D", marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Jobs ── */}
      <section style={{ padding: "48px 16px", background: "#F4F6F9" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: B, textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 6 }}>OPORTUNIDADES</div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: BDK }}>Vagas em Destaque</h2>
            </div>
            <Link to="/vagas" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "white", color: B, border: `1.5px solid ${B}`, borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                Ver todas <ArrowRight size={13} />
              </button>
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))", gap: 14 }}>
            {JOBS.map(job => (
              <Link key={job.id} to={`/vagas/${job.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 12, padding: 18, cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 8px 24px rgba(26,107,181,0.12)`; el.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; el.style.transform = ""; }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: job.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: "white", boxShadow: `0 4px 10px ${job.color}40` }}>{job.initials}</div>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: "#FEF3DC", color: "#92400E" }}>DESTAQUE</span>
                  </div>
                  <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 700, color: BDK, marginBottom: 4 }}>{job.title}</div>
                  <div style={{ fontSize: 13, color: B, fontWeight: 600, marginBottom: 12 }}>{job.company}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[[MapPin, job.location], [Clock, job.posted]].map(([Icon, val], i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6C757D" }}>
                        <Icon size={12} color="#ADB5BD" /> {val as string}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #F1F3F5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: B }}>{job.salary}</span>
                    <span style={{ fontSize: 12, color: B, fontWeight: 600 }}>Candidatar →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Marketplace ── */}
      <section style={{ padding: "48px 16px", background: "white" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: B, textTransform: "uppercase" as const, letterSpacing: "1px", marginBottom: 6 }}>MARKETPLACE</div>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: BDK }}>Produtos & Serviços</h2>
            </div>
            <Link to="/marketplace" style={{ textDecoration: "none" }}>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", background: "white", color: B, border: `1.5px solid ${B}`, borderRadius: 99, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" as const }}>
                Ver todos <ArrowRight size={13} />
              </button>
            </Link>
          </div>
          <div className="marketplace-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 260px), 1fr))", gap: 14 }}>
            {PRODUCTS.map(p => (
              <Link key={p.id} to={`/marketplace/${p.id}`} style={{ textDecoration: "none" }}>
                <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 12, overflow: "hidden", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
                  onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 8px 24px rgba(26,107,181,0.12)`; el.style.transform = "translateY(-2px)"; }}
                  onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; el.style.transform = ""; }}
                >
                  <div style={{ height: 100, background: `linear-gradient(135deg,${p.color}15,${p.color}30)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 50, height: 50, borderRadius: 13, background: p.color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: "white", boxShadow: `0 6px 14px ${p.color}50` }}>
                      {p.seller.slice(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 99, background: BL, color: B, display: "inline-block", marginBottom: 8, textTransform: "uppercase" as const }}>{p.category}</span>
                    <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: BDK, marginBottom: 4 }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: "#6C757D", marginBottom: 12 }}>{p.seller}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: B }}>{p.price}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
                          <Star size={11} fill={GOLD} color={GOLD} />
                          <span style={{ fontSize: 11, fontWeight: 600 }}>{p.rating}</span>
                        </div>
                      </div>
                      <button style={{ padding: "7px 14px", background: `linear-gradient(135deg,${B},${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                        Ver →
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: "48px 16px", background: BL }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 800, color: BDK, marginBottom: 8 }}>Feita para Moçambique</h2>
            <p style={{ color: "#6C757D", fontSize: 14, maxWidth: 400, margin: "0 auto" }}>Entendemos os desafios únicos do mercado local</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))", gap: 16 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{ background: "white", borderRadius: 14, padding: 24, boxShadow: "0 2px 10px rgba(26,107,181,0.07)" }}>
                <div style={{ width: 48, height: 48, borderRadius: 13, background: `linear-gradient(135deg,${B},${BD})`, margin: "0 0 16px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 14px rgba(26,107,181,0.25)` }}>
                  <Icon size={22} color="white" />
                </div>
                <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: BDK, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "#6C757D", lineHeight: 1.7 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "60px 16px", background: `linear-gradient(135deg,${BDK},${BD})`, position: "relative", overflow: "hidden" }}>
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: "clamp(24px, 4vw, 34px)", fontWeight: 800, color: "white", marginBottom: 14, letterSpacing: "-0.5px" }}>
            Pronto para dar o próximo passo?
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", marginBottom: 32, lineHeight: 1.7 }}>
            Junte-se a 15.000+ profissionais e 850 empresas em Moçambique.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/login" style={{ textDecoration: "none" }}>
              <button style={{ padding: "13px 28px", background: GOLD, color: BDK, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 8px 20px rgba(245,166,35,0.4)` }}>
                Criar Conta Gratuita →
              </button>
            </Link>
            <Link to="/registar-empresa" style={{ textDecoration: "none" }}>
              <button style={{ padding: "13px 24px", background: "rgba(255,255,255,0.1)", color: "white", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                Registar Empresa
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
