import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, Star, ChevronDown, SlidersHorizontal, Heart,
  ArrowRight, Clock, RefreshCw, X, TrendingUp, Zap, Award
} from "lucide-react";
import { getProdutos } from "../../lib/api";

const B = "#1A6BB5";
const BD = "#0D3B6E";
const BL = "#E8F3FC";
const GOLD = "#F5A623";
const COLORS = ["#1A6BB5","#E24B4A","#0D3B6E","#D97706","#7C3AED","#059669","#DB2777","#0F766E"];

const CATEGORIES = [
  { label: "Todos", icon: "🏪" },
  { label: "Serviços", icon: "🛠" },
  { label: "Software", icon: "💻" },
  { label: "Formação", icon: "📚" },
  { label: "Design", icon: "🎨" },
  { label: "Finanças", icon: "💰" },
  { label: "Fotografia", icon: "📷" },
];

const SORT_OPTIONS = ["Relevância", "Menor preço", "Maior preço", "Melhor avaliação", "Mais recente"];

const PRICE_RANGES = [
  { label: "Todos os preços", min: 0, max: Infinity },
  { label: "Até 5.000 MZN", min: 0, max: 5000 },
  { label: "5.000 – 20.000 MZN", min: 5000, max: 20000 },
  { label: "Acima de 20.000 MZN", min: 20000, max: Infinity },
];

function fmt(n: number) { return n?.toLocaleString("pt-MZ") || "0"; }
function getColor(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}

function SkeletonCard() {
  return (
    <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 130, background: "#F1F3F5", animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ height: 14, width: "40%", background: "#F1F3F5", borderRadius: 99, animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ height: 16, width: "85%", background: "#F1F3F5", borderRadius: 6, animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ height: 13, width: "55%", background: "#F1F3F5", borderRadius: 6, animation: "pulse 1.4s ease-in-out infinite" }} />
        <div style={{ height: 1, background: "#F1F3F5", margin: "4px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ height: 22, width: "35%", background: "#F1F3F5", borderRadius: 6, animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ height: 32, width: "28%", background: "#F1F3F5", borderRadius: 99, animation: "pulse 1.4s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

export function Marketplace() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [sort, setSort] = useState("Relevância");
  const [priceRange, setPriceRange] = useState(0);
  const [liked, setLiked] = useState<string[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getProdutos({ search: debouncedSearch, category, sort });
        setProducts(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [debouncedSearch, category, sort]);

  useEffect(() => {
    const range = PRICE_RANGES[priceRange];
    setFiltered(products.filter(p => p.preco >= range.min && p.preco <= range.max));
  }, [products, priceRange]);

  const clearFilters = useCallback(() => {
    setSearch("");
    setCategory("Todos");
    setSort("Relevância");
    setPriceRange(0);
  }, []);

  const hasActiveFilters = search || category !== "Todos" || sort !== "Relevância" || priceRange !== 0;

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${BD} 0%, ${B} 100%)`, padding: "40px 24px 52px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 30, fontWeight: 800, color: "white", marginBottom: 6 }}>
                Marketplace
              </h1>
              <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
                {loading ? "A carregar..." : `${filtered.length} produto${filtered.length !== 1 ? "s" : ""} disponível${filtered.length !== 1 ? "eis" : ""}`}
              </p>
            </div>
            <div className="marketplace-hero-badges" style={{ display: "flex", gap: 8 }}>
              {[
                { icon: TrendingUp, label: "Em alta" },
                { icon: Zap, label: "Rápida entrega" },
                { icon: Award, label: "Top vendedores" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 99, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", fontSize: 12, color: "rgba(255,255,255,0.85)", cursor: "pointer" }}>
                  <Icon size={12} /> {label}
                </div>
              ))}
            </div>
          </div>

          {/* Search row */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "min(260px, 100%)", position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)", pointerEvents: "none" }} />
              <input
                style={{ width: "100%", padding: "13px 40px 13px 42px", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif", background: "rgba(255,255,255,0.12)", color: "white", outline: "none", boxSizing: "border-box" }}
                placeholder="Buscar produtos, serviços ou vendedores..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", padding: 2 }}>
                  <X size={14} />
                </button>
              )}
            </div>
            <div style={{ position: "relative", minWidth: "min(175px, 100%)" }}>
              <SlidersHorizontal size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.5)", pointerEvents: "none" }} />
              <select
                style={{ width: "100%", padding: "13px 32px 13px 34px", border: "1.5px solid rgba(255,255,255,0.25)", borderRadius: 10, fontSize: 13, fontFamily: "'DM Sans', sans-serif", background: "rgba(255,255,255,0.12)", color: "white", outline: "none", appearance: "none", cursor: "pointer" }}
                value={sort} onChange={e => setSort(e.target.value)}>
                {SORT_OPTIONS.map(s => <option key={s} style={{ color: "#212529", background: "white" }}>{s}</option>)}
              </select>
              <ChevronDown size={13} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)", pointerEvents: "none" }} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{ padding: "13px 18px", border: `1.5px solid ${showFilters ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.25)"}`, borderRadius: 10, background: showFilters ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.12)", color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
              <SlidersHorizontal size={14} /> Filtros {hasActiveFilters && <span style={{ width: 6, height: 6, borderRadius: "50%", background: GOLD, display: "inline-block" }} />}
            </button>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div style={{ marginTop: 14, padding: "16px 18px", background: "rgba(255,255,255,0.1)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.15)", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Faixa de preço</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {PRICE_RANGES.map((r, i) => (
                    <button key={i} onClick={() => setPriceRange(i)}
                      style={{ padding: "5px 12px", borderRadius: 99, fontSize: 12, border: "1px solid", borderColor: priceRange === i ? "white" : "rgba(255,255,255,0.3)", background: priceRange === i ? "white" : "transparent", color: priceRange === i ? BD : "rgba(255,255,255,0.8)", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: priceRange === i ? 700 : 400 }}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{ marginLeft: "auto", padding: "6px 14px", borderRadius: 99, fontSize: 12, border: "1px solid rgba(255,255,255,0.4)", background: "transparent", color: "rgba(255,255,255,0.8)", cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: "'DM Sans', sans-serif" }}>
                  <X size={12} /> Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 24px" }}>
        {/* Category pills */}
        <div className="marketplace-toolbar" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, alignItems: "center" }}>
          <div className="marketplace-category-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {CATEGORIES.map(c => (
              <button key={c.label} onClick={() => setCategory(c.label)}
                style={{ padding: "7px 16px", borderRadius: 99, fontSize: 13, fontWeight: 500, cursor: "pointer", border: "1.5px solid", borderColor: category === c.label ? B : "#DEE2E6", background: category === c.label ? B : "white", color: category === c.label ? "white" : "#495057", fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s", boxShadow: category === c.label ? `0 4px 12px rgba(26,107,181,0.25)` : "none", display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ fontSize: 13 }}>{c.icon}</span> {c.label}
              </button>
            ))}
          </div>
          {/* View toggle */}
          <div className="marketplace-view-toggle" style={{ display: "flex", background: "white", border: "1.5px solid #DEE2E6", borderRadius: 8, overflow: "hidden" }}>
            {(["grid", "list"] as const).map(v => (
              <button key={v} onClick={() => setViewMode(v)}
                style={{ padding: "6px 12px", border: "none", background: viewMode === v ? B : "transparent", color: viewMode === v ? "white" : "#6C757D", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", transition: "all 0.15s" }}>
                {v === "grid" ? "⊞ Grelha" : "☰ Lista"}
              </button>
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {search && <FilterChip label={`"${search}"`} onRemove={() => setSearch("")} />}
            {category !== "Todos" && <FilterChip label={category} onRemove={() => setCategory("Todos")} />}
            {sort !== "Relevância" && <FilterChip label={sort} onRemove={() => setSort("Relevância")} />}
            {priceRange !== 0 && <FilterChip label={PRICE_RANGES[priceRange].label} onRemove={() => setPriceRange(0)} />}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: BL, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🛍</div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 700, color: "#0A2540", marginBottom: 8 }}>Nenhum produto encontrado</h3>
            <p style={{ fontSize: 14, color: "#6C757D", marginBottom: 24 }}>
              {hasActiveFilters ? "Tenta ajustar os filtros ou " : "Seja o primeiro a publicar um serviço!"}
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{ padding: "10px 20px", background: "white", color: B, border: `1.5px solid ${B}`, borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Limpar filtros
                </button>
              )}
              <Link to="/dashboard" style={{ textDecoration: "none" }}>
                <button style={{ padding: "10px 24px", background: `linear-gradient(135deg, ${B}, ${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                  Publicar serviço
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Products grid */}
        {!loading && filtered.length > 0 && (
          viewMode === "grid" ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 20 }}>
              {filtered.map(p => <ProductCard key={p.id} p={p} liked={liked} setLiked={setLiked} />)}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(p => <ProductListItem key={p.id} p={p} liked={liked} setLiked={setLiked} />)}
            </div>
          )
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.45; } }
        @media (max-width: 640px) {
          .marketplace-hero-badges { display: none !important; }
          .marketplace-toolbar { align-items: stretch !important; }
          .marketplace-category-pills { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
          .marketplace-view-toggle { width: 100%; }
          .marketplace-view-toggle button { flex: 1; }
          .marketplace-list-item { flex-wrap: wrap; padding: 14px !important; }
          .marketplace-list-copy { width: 100%; }
          .marketplace-list-actions { width: 100%; text-align: left !important; display: flex; justify-content: space-between; align-items: center; }
        }
      `}</style>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", background: BL, border: `1px solid #B8D7F3`, borderRadius: 99, fontSize: 12, color: B, fontWeight: 500 }}>
      {label}
      <button onClick={onRemove} style={{ background: "none", border: "none", cursor: "pointer", color: B, display: "flex", padding: 0, lineHeight: 1 }}><X size={11} /></button>
    </span>
  );
}

const B2 = "#1A6BB5", BD2 = "#0D3B6E", BL2 = "#E8F3FC", GOLD2 = "#F5A623";
const COLORS2 = ["#1A6BB5","#E24B4A","#0D3B6E","#D97706","#7C3AED","#059669","#DB2777","#0F766E"];

function getColor2(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return COLORS2[Math.abs(h) % COLORS2.length];
}

function ProductCard({ p, liked, setLiked }: { p: any; liked: string[]; setLiked: React.Dispatch<React.SetStateAction<string[]>> }) {
  const color = getColor2(p.profiles?.nome || p.titulo || "");
  const initials = (p.profiles?.nome || "VE").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const isLiked = liked.includes(p.id);

  return (
    <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 16, overflow: "hidden", position: "relative", transition: "all 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}
      onMouseOver={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = `0 12px 32px rgba(26,107,181,0.13)`; el.style.transform = "translateY(-3px)"; }}
      onMouseOut={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; el.style.transform = ""; }}>

      <button onClick={() => setLiked(l => l.includes(p.id) ? l.filter((x: string) => x !== p.id) : [...l, p.id])}
        style={{ position: "absolute", top: 10, right: 10, width: 32, height: 32, borderRadius: "50%", background: "white", border: "1px solid #E9ECEF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
        <Heart size={13} fill={isLiked ? "#E24B4A" : "none"} color={isLiked ? "#E24B4A" : "#ADB5BD"} />
      </button>

      <div style={{ height: 130, background: `linear-gradient(135deg, ${color}18, ${color}35)`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        {p.imagens_urls && p.imagens_urls.length > 0 ? (
          <img src={p.imagens_urls[0]} alt={p.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: 56, height: 56, borderRadius: 14, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "white", boxShadow: `0 6px 20px ${color}50` }}>
            {initials}
          </div>
        )}
        {p.rating && (
          <div style={{ position: "absolute", bottom: 8, left: 10, display: "flex", alignItems: "center", gap: 4, background: "white", borderRadius: 99, padding: "3px 8px", boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <Star size={10} fill={GOLD2} color={GOLD2} />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#0A2540" }}>{p.rating}</span>
          </div>
        )}
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 99, background: BL2, color: B2, display: "inline-block", marginBottom: 7, textTransform: "uppercase", letterSpacing: 0.3 }}>
          {p.categoria}
        </span>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540", marginBottom: 4, lineHeight: 1.35, flex: 1 }}>{p.titulo}</div>
        <div style={{ fontSize: 12, color: "#6C757D", marginBottom: 10 }}>{p.profiles?.nome || "Vendedor"}</div>

        {p.tags && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
            {(p.tags as string[]).slice(0, 3).map((t: string) => (
              <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 99, background: "#F1F3F5", color: "#6C757D" }}>{t}</span>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          {p.dias_entrega && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6C757D" }}><Clock size={10} color="#ADB5BD" />{p.dias_entrega} dias</span>}
          {p.revisoes && <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6C757D" }}><RefreshCw size={10} color="#ADB5BD" />{p.revisoes} rev.</span>}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #F1F3F5" }}>
          <div>
            <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: B2 }}>{p.preco?.toLocaleString("pt-MZ")}</div>
            <div style={{ fontSize: 10, color: "#ADB5BD" }}>MZN / projecto</div>
          </div>
          <Link to={`/marketplace/${p.id}`} style={{ textDecoration: "none" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "8px 14px", background: `linear-gradient(135deg, ${B2}, ${BD2})`, color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", boxShadow: `0 4px 12px rgba(26,107,181,0.28)` }}>
              Ver <ArrowRight size={12} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function ProductListItem({ p, liked, setLiked }: { p: any; liked: string[]; setLiked: React.Dispatch<React.SetStateAction<string[]>> }) {
  const color = getColor2(p.profiles?.nome || p.titulo || "");
  const initials = (p.profiles?.nome || "VE").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const isLiked = liked.includes(p.id);

  return (
    <div className="marketplace-list-item" style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: "16px 20px", display: "flex", gap: 16, alignItems: "center", transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}
      onMouseOver={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(26,107,181,0.1)"; }}
      onMouseOut={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; }}>

      <div style={{ width: 52, height: 52, borderRadius: 12, overflow: "hidden", flexShrink: 0 }}>
        {p.imagens_urls && p.imagens_urls.length > 0 ? (
          <img src={p.imagens_urls[0]} alt={p.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "white" }}>
            {initials}
          </div>
        )}
      </div>

      <div className="marketplace-list-copy" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.titulo}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 99, background: BL2, color: B2, flexShrink: 0 }}>{p.categoria}</span>
        </div>
        <div style={{ fontSize: 12, color: "#6C757D", marginBottom: 6 }}>{p.profiles?.nome || "Vendedor"}</div>
        <div style={{ display: "flex", gap: 10 }}>
          {p.dias_entrega && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#6C757D" }}><Clock size={10} color="#ADB5BD" />{p.dias_entrega} dias</span>}
          {p.rating && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#6C757D" }}><Star size={10} fill={GOLD2} color={GOLD2} />{p.rating}</span>}
          {p.tags?.slice(0, 2).map((t: string) => (
            <span key={t} style={{ fontSize: 10, padding: "1px 6px", borderRadius: 99, background: "#F1F3F5", color: "#6C757D" }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="marketplace-list-actions" style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: B2, marginBottom: 2 }}>{p.preco?.toLocaleString("pt-MZ")} MZN</div>
        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
          <button onClick={() => setLiked(l => l.includes(p.id) ? l.filter((x: string) => x !== p.id) : [...l, p.id])}
            style={{ width: 30, height: 30, borderRadius: "50%", background: "white", border: "1px solid #E9ECEF", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Heart size={12} fill={isLiked ? "#E24B4A" : "none"} color={isLiked ? "#E24B4A" : "#ADB5BD"} />
          </button>
          <Link to={`/marketplace/${p.id}`} style={{ textDecoration: "none" }}>
            <button style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", background: `linear-gradient(135deg, ${B2}, ${BD2})`, color: "white", border: "none", borderRadius: 99, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Ver <ArrowRight size={11} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
