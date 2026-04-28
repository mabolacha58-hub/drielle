import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  CheckCircle,
  Clock,
  Filter,
  Grid2X2,
  Heart,
  LayoutList,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Store,
  TrendingUp,
  X,
  Zap,
} from "lucide-react";
import { getProdutos } from "../../lib/api";

/* ─── Paleta ─────────────────────────────────────────────── */
const B    = "#1A6BB5";
const BD   = "#0D3B6E";
const BL   = "#E8F3FC";
const GOLD = "#F5A623";
const COLORS = [
  "#1A6BB5","#E24B4A","#0D3B6E","#D97706",
  "#059669","#DB2777","#0F766E",
];

/* ─── Dados estáticos ────────────────────────────────────── */
const CATEGORIES = [
  { label: "Todos",      icon: Store      },
  { label: "Serviços",   icon: Briefcase  },
  { label: "Software",   icon: Sparkles   },
  { label: "Formação",   icon: TrendingUp },
  { label: "Design",     icon: Sparkles   },
  { label: "Finanças",   icon: TrendingUp },
  { label: "Fotografia", icon: Sparkles   },
];

const SORT_OPTIONS = [
  "Relevância","Menor preço","Maior preço","Melhor avaliação","Mais recente",
];

const PRICE_RANGES = [
  { label: "Todos os preços",      min: 0,     max: Infinity },
  { label: "Até 5.000 MZN",        min: 0,     max: 5_000   },
  { label: "5.000 – 20.000 MZN",   min: 5_000, max: 20_000  },
  { label: "Acima de 20.000 MZN",  min: 20_000,max: Infinity },
];

/* ─── Tipos ──────────────────────────────────────────────── */
type Product = {
  id: string;
  titulo?: string;
  descricao?: string;
  categoria?: string;
  preco?: number;
  dias_entrega?: number;
  revisoes?: number;
  rating?: number;
  created_at?: string;
  tags?: string[];
  imagens_urls?: string[];
  verificado?: boolean;
  profiles?: {
    nome?: string;
    avatar_url?: string;
    localizacao?: string;
  };
};

/* ─── Helpers ────────────────────────────────────────────── */
function getColor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return COLORS[Math.abs(hash) % COLORS.length];
}

function formatCurrency(value?: number) {
  return (value || 0).toLocaleString("pt-MZ");
}

function normalizeText(text: string) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function isNew(createdAt?: string) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
}

/** Converte rating numérico (0–5) em estrelas Unicode */
function renderStars(rating: number) {
  const full  = Math.floor(rating);
  const half  = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

/** Largura da barra de entrega (vermelho→verde conforme velocidade) */
function deliveryBar(dias?: number) {
  const d = dias ?? 30;
  const pct = Math.max(10, Math.round(100 - (d / 30) * 100));
  const color = d <= 3 ? "#059669" : d <= 7 ? "#F5A623" : "#E24B4A";
  return { pct, color };
}

/* ─── Skeleton ───────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 18, overflow: "hidden" }}>
      <div style={{ height: 150, background: "#F1F3F5", animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
        {[90, "80%", "58%"].map((w, i) => (
          <div key={i} style={{ width: w, height: i === 0 ? 12 : 16, borderRadius: 8, background: "#F1F3F5", animation: "pulse 1.4s ease-in-out infinite" }} />
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          <div style={{ width: 110, height: 24, borderRadius: 8, background: "#F1F3F5", animation: "pulse 1.4s ease-in-out infinite" }} />
          <div style={{ width: 90,  height: 34, borderRadius: 99,background: "#F1F3F5", animation: "pulse 1.4s ease-in-out infinite" }} />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
════════════════════════════════════════════════════════════ */
export function Marketplace() {
  const [search,         setSearch        ] = useState("");
  const [debouncedSearch,setDebouncedSearch] = useState("");
  const [category,       setCategory      ] = useState("Todos");
  const [sort,           setSort          ] = useState("Relevância");
  const [priceRange,     setPriceRange    ] = useState(0);
  const [liked,          setLiked         ] = useState<string[]>([]);
  const [products,       setProducts      ] = useState<Product[]>([]);
  const [loading,        setLoading       ] = useState(true);
  const [showFilters,    setShowFilters   ] = useState(false);
  const [viewMode,       setViewMode      ] = useState<"grid"|"list">("grid");
  const [refreshKey,     setRefreshKey    ] = useState(0);

  /* debounce */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  /* carregar produtos */
  useEffect(() => {
    async function load() {
      setLoading(true);
      try { setProducts(await getProdutos({ category })); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [category, refreshKey]);

  /* auto-refresh quando produto é publicado */
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === "productPublished" && e.newValue === "true") {
        setRefreshKey(k => k + 1);
        localStorage.removeItem("productPublished");
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  /* filtro + ordenação */
  const filtered = useMemo(() => {
    const term  = normalizeText(debouncedSearch.trim());
    const range = PRICE_RANGES[priceRange];

    const items = products.filter(p => {
      const haystack = normalizeText(
        [p.titulo, p.descricao, p.categoria, p.profiles?.nome, p.profiles?.localizacao, ...(p.tags || [])]
          .filter(Boolean).join(" ")
      );
      return (!term || haystack.includes(term))
          && (p.preco || 0) >= range.min
          && (p.preco || 0) <= range.max;
    });

    return [...items].sort((a, b) => {
      if (sort === "Menor preço")      return (a.preco  || 0) - (b.preco  || 0);
      if (sort === "Maior preço")      return (b.preco  || 0) - (a.preco  || 0);
      if (sort === "Melhor avaliação") return (b.rating || 0) - (a.rating || 0);
      if (sort === "Mais recente")
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();

      const score = (p: Product) =>
        (p.rating  || 0) * 100 +
        (p.revisoes|| 0) * 5   +
        Math.max(0, 30 - (p.dias_entrega || 30)) +
        (normalizeText(p.titulo || "").includes(term) ? 60 : 0);
      return score(b) - score(a);
    });
  }, [debouncedSearch, priceRange, products, sort]);

  /* estatísticas do painel */
  const summary = useMemo(() => {
    const avgPrice    = filtered.length
      ? Math.round(filtered.reduce((s, p) => s + (p.preco || 0), 0) / filtered.length)
      : 0;
    const fastDelivery = filtered.filter(p => (p.dias_entrega || 99) <= 3).length;
    const topRated     = filtered.filter(p => (p.rating       || 0 ) >= 4.5).length;
    return { avgPrice, fastDelivery, topRated };
  }, [filtered]);

  /* produto em destaque (melhor pontuação) */
  const featured = useMemo(() => filtered[0] ?? null, [filtered]);

  const activeCategoryLabel = category === "Todos" ? "todas as categorias" : category;
  const hasActiveFilters    = !!(search.trim() || category !== "Todos" || sort !== "Relevância" || priceRange !== 0);

  function clearFilters() {
    setSearch(""); setCategory("Todos"); setSort("Relevância"); setPriceRange(0);
  }

  /* ── Render ── */
  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <div style={{
        background: `radial-gradient(circle at top left, rgba(245,166,35,.20), transparent 28%),
                     linear-gradient(135deg, ${BD} 0%, ${B} 100%)`,
        padding: "40px 24px 56px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* título + stats */}
          <div style={{ display: "flex", justifyContent: "space-between", gap: 20, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ maxWidth: 620 }}>
              <div style={badgeStyle}>
                <Sparkles size={14} />
                Mercado profissional em Moçambique
              </div>
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 34, fontWeight: 800, color: "white", margin: 0, lineHeight: 1.08 }}>
                Encontre serviços prontos para fechar negócio com mais rapidez.
              </h1>
              <p style={{ color: "rgba(255,255,255,.78)", fontSize: 15, lineHeight: 1.7, margin: "14px 0 0" }}>
                Pesquise por especialidade, compare preço, entrega e reputação, e fale com o vendedor certo sem sair da plataforma.
              </p>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignSelf: "flex-start" }}>
              {[
                { icon: Store, label: `${filtered.length} resultados`, helper: activeCategoryLabel },
                { icon: Zap,   label: `${summary.fastDelivery} rápidos`, helper: "até 3 dias"  },
                { icon: Star,  label: `${summary.topRated} destaque`,    helper: "4.5 estrelas+" },
              ].map(({ icon: Icon, label, helper }) => (
                <div key={label} style={heroStatBox}>
                  <Icon size={16} style={{ marginBottom: 10 }} />
                  <div style={{ fontSize: 16, fontWeight: 800 }}>{label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.7)" }}>{helper}</div>
                </div>
              ))}
            </div>
          </div>

          {/* barra de busca */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "min(280px,100%)", position: "relative" }}>
              <Search size={16} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,.6)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por serviço, vendedor, tag ou localização"
                style={searchInput}
              />
              {search && (
                <button onClick={() => setSearch("")} style={clearBtn}>
                  <X size={14} />
                </button>
              )}
            </div>

            <select value={sort} onChange={e => setSort(e.target.value)} style={sortSelect}>
              {SORT_OPTIONS.map(o => (
                <option key={o} value={o} style={{ color: "#212529" }}>Ordenar: {o}</option>
              ))}
            </select>

            <Link to="/publicar-servico" style={{ textDecoration: "none" }}>
              <button style={publishBtn}>Publicar serviço</button>
            </Link>
          </div>

          {/* atalhos rápidos */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <button onClick={() => setShowFilters(v => !v)} style={quickBtn(showFilters)}>
              <Filter size={14} /> Filtros
            </button>
            <button onClick={() => setRefreshKey(k => k + 1)} style={quickBtn(false)}>
              <RefreshCw size={14} /> Atualizar
            </button>
            {["Entrega rápida","Melhor avaliação","Preço equilibrado"].map(label => (
              <button
                key={label}
                onClick={() => {
                  if (label === "Melhor avaliação") setSort("Melhor avaliação");
                  if (label === "Preço equilibrado") setPriceRange(1);
                }}
                style={tagBtn}
              >
                {label}
              </button>
            ))}
          </div>

          {/* painel de filtros */}
          {showFilters && (
            <div style={{ marginTop: 16, padding: 18, borderRadius: 18, background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {PRICE_RANGES.map((r, i) => (
                    <button
                      key={r.label}
                      onClick={() => setPriceRange(i)}
                      style={{ padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,.25)", background: priceRange === i ? "white" : "transparent", color: priceRange === i ? BD : "white", cursor: "pointer", fontSize: 12, fontWeight: 700 }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, border: "1px solid rgba(255,255,255,.25)", background: "transparent", color: "white", cursor: "pointer", fontWeight: 700 }}>
                    <X size={14} /> Limpar
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Conteúdo ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 24px 36px" }}>

        {/* cards de resumo */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 14, marginBottom: 24 }}>
          <SummaryCard label="Preço médio"      value={`${formatCurrency(summary.avgPrice)} MZN`} helper="Ticket médio desta pesquisa" />
          <SummaryCard label="Entrega curta"    value={`${summary.fastDelivery}`}                 helper="Projetos até 3 dias"         />
          <SummaryCard label="Top avaliados"    value={`${summary.topRated}`}                     helper="Serviços com mais confiança" />
          <SummaryCard label="Categoria ativa"  value={activeCategoryLabel}                       helper="Foco atual da vitrine"       />
        </div>

        {/* ── DESTAQUE ── */}
        {!loading && featured && (
          <FeaturedBanner product={featured} />
        )}

        {/* barra categorias + toggle de visualização */}
        <div className="marketplace-toolbar" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
          <div className="marketplace-category-pills" style={{ display: "flex", gap: 8, flexWrap: "wrap", flex: 1 }}>
            {CATEGORIES.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => setCategory(label)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "9px 16px", borderRadius: 999, border: `1.5px solid ${category === label ? B : "#DEE2E6"}`, background: category === label ? B : "white", color: category === label ? "white" : "#495057", cursor: "pointer", fontSize: 13, fontWeight: 700, boxShadow: category === label ? "0 8px 16px rgba(26,107,181,.18)" : "none" }}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <div className="marketplace-view-toggle" style={{ display: "flex", background: "white", border: "1px solid #DEE2E6", borderRadius: 12, overflow: "hidden" }}>
            {(["grid","list"] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", border: "none", background: viewMode === mode ? B : "transparent", color: viewMode === mode ? "white" : "#6C757D", cursor: "pointer", fontWeight: 700 }}
              >
                {mode === "grid" ? <Grid2X2 size={14} /> : <LayoutList size={14} />}
                {mode === "grid" ? "Grelha" : "Lista"}
              </button>
            ))}
          </div>
        </div>

        {/* chips de filtros ativos */}
        {hasActiveFilters && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
            {search          && <FilterChip label={`Pesquisa: ${search}`}              onRemove={() => setSearch("")}           />}
            {category !== "Todos"       && <FilterChip label={`Categoria: ${category}`}           onRemove={() => setCategory("Todos")}    />}
            {sort !== "Relevância"      && <FilterChip label={`Ordem: ${sort}`}                    onRemove={() => setSort("Relevância")}   />}
            {priceRange !== 0           && <FilterChip label={PRICE_RANGES[priceRange].label}      onRemove={() => setPriceRange(0)}        />}
          </div>
        )}

        {/* skeleton */}
        {loading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* estado vazio */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "84px 0" }}>
            <div style={{ width: 84, height: 84, borderRadius: "50%", background: BL, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Store size={34} color={B} />
            </div>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 800, color: "#0A2540", marginBottom: 8 }}>Nenhum serviço encontrado</h3>
            <p style={{ fontSize: 14, color: "#6C757D", marginBottom: 24 }}>Ajuste os filtros ou publique uma nova oferta para movimentar este mercado.</p>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, flexWrap: "wrap" }}>
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{ padding: "11px 18px", borderRadius: 999, border: `1.5px solid ${B}`, background: "white", color: B, cursor: "pointer", fontWeight: 700 }}>
                  Limpar filtros
                </button>
              )}
              <Link to="/publicar-servico" style={{ textDecoration: "none" }}>
                <button style={{ padding: "11px 18px", borderRadius: 999, border: "none", background: `linear-gradient(135deg,${B},${BD})`, color: "white", cursor: "pointer", fontWeight: 700 }}>
                  Publicar serviço
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* grelha */}
        {!loading && filtered.length > 0 && viewMode === "grid" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
            {filtered.map(p => <ProductCard key={p.id} product={p} liked={liked} setLiked={setLiked} />)}
          </div>
        )}

        {/* lista */}
        {!loading && filtered.length > 0 && viewMode === "list" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map(p => <ProductListItem key={p.id} product={p} liked={liked} setLiked={setLiked} />)}
          </div>
        )}
      </div>

      {/* ── CSS global ── */}
      <style>{`
        @keyframes pulse {
          0%,100%{opacity:1} 50%{opacity:.45}
        }
        @keyframes heartPop {
          0%  { transform: scale(1)   }
          40% { transform: scale(1.35)}
          70% { transform: scale(.9)  }
          100%{ transform: scale(1)   }
        }
        .heart-pop { animation: heartPop .35s ease forwards; }

        @media (max-width:640px){
          .marketplace-toolbar        { align-items: stretch !important; }
          .marketplace-category-pills { overflow-x: auto; flex-wrap: nowrap !important; padding-bottom: 4px; }
          .marketplace-view-toggle    { width: 100%; }
          .marketplace-view-toggle button { flex: 1; justify-content: center; }
          .marketplace-list-item      { flex-wrap: wrap; align-items: flex-start !important; }
          .marketplace-list-copy,
          .marketplace-list-actions   { width: 100%; }
          .marketplace-list-actions   { display: flex; justify-content: space-between; align-items: center; }
        }
      `}</style>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   BANNER DESTAQUE
════════════════════════════════════════════════════════════ */
function FeaturedBanner({ product }: { product: Product }) {
  const color    = getColor(product.profiles?.nome || product.titulo || "P");
  const initials = (product.profiles?.nome || product.titulo || "PR").split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();

  return (
    <div style={{ marginBottom: 24, borderRadius: 18, overflow: "hidden", border: `1.5px solid ${GOLD}44`, background: `linear-gradient(135deg,${GOLD}12,${GOLD}06)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", flexWrap: "wrap" }}>
        {/* miniatura */}
        <div style={{ width: 72, height: 72, borderRadius: 16, overflow: "hidden", background: `linear-gradient(135deg,${color}33,${color}88)`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {product.imagens_urls?.[0]
            ? <img src={product.imagens_urls[0]} alt={product.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20, color: color }}>{initials}</span>
          }
        </div>

        {/* info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 99, background: GOLD, color: BD, fontSize: 11, fontWeight: 800 }}>
              ⚡ Destaque da pesquisa
            </span>
            {product.categoria && (
              <span style={{ padding: "3px 10px", borderRadius: 99, background: BL, color: B, fontSize: 11, fontWeight: 700 }}>
                {product.categoria}
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: "#0A2540", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {product.titulo}
          </div>
          <div style={{ fontSize: 13, color: "#6C757D" }}>
            {product.profiles?.nome} · {product.profiles?.localizacao || "Moçambique"}
            {typeof product.rating === "number" && (
              <span style={{ marginLeft: 10, color: GOLD, fontWeight: 700 }}>
                {renderStars(product.rating)} {product.rating}
              </span>
            )}
          </div>
        </div>

        {/* preço + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: B }}>{formatCurrency(product.preco)} MZN</div>
            <div style={{ fontSize: 11, color: "#ADB5BD" }}>melhor avaliado</div>
          </div>
          <Link to={`/marketplace/${product.id}`} style={{ textDecoration: "none" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "11px 18px", borderRadius: 999, border: "none", background: `linear-gradient(135deg,${GOLD},#E58A00)`, color: BD, cursor: "pointer", fontWeight: 800, fontSize: 14 }}>
              Ver oferta <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   CARD (GRELHA)
════════════════════════════════════════════════════════════ */
function ProductCard({
  product, liked, setLiked,
}: { product: Product; liked: string[]; setLiked: React.Dispatch<React.SetStateAction<string[]>> }) {
  const color    = getColor(product.profiles?.nome || product.titulo || "P");
  const initials = (product.profiles?.nome || product.titulo || "PR").split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();
  const isLiked  = liked.includes(product.id);
  const bar      = deliveryBar(product.dias_entrega);
  const novo     = isNew(product.created_at);

  function toggleLike(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;
    btn.classList.add("heart-pop");
    btn.addEventListener("animationend", () => btn.classList.remove("heart-pop"), { once: true });
    setLiked(cur => cur.includes(product.id) ? cur.filter(i => i !== product.id) : [...cur, product.id]);
  }

  return (
    <div
      style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 18, overflow: "hidden", position: "relative", display: "flex", flexDirection: "column", boxShadow: "0 3px 12px rgba(13,59,110,.04)", transition: "transform .2s ease, box-shadow .2s ease" }}
      onMouseOver={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 30px rgba(26,107,181,.12)"; }}
      onMouseOut ={e => { e.currentTarget.style.transform = "translateY(0)";     e.currentTarget.style.boxShadow = "0 3px 12px rgba(13,59,110,.04)"; }}
    >
      {/* botão like */}
      <button onClick={toggleLike} style={{ position: "absolute", top: 12, right: 12, width: 34, height: 34, borderRadius: "50%", border: "1px solid #E9ECEF", background: "rgba(255,255,255,.96)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", zIndex: 2 }}>
        <Heart size={14} fill={isLiked ? "#E24B4A" : "none"} color={isLiked ? "#E24B4A" : "#ADB5BD"} />
      </button>

      {/* imagem / placeholder */}
      <div style={{ height: 164, position: "relative", background: `linear-gradient(135deg,${color}22,${color}50)` }}>
        {product.imagens_urls?.[0]
          ? <img src={product.imagens_urls[0]} alt={product.titulo} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }} />
          : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 68, height: 68, borderRadius: 18, background: color, display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 22, boxShadow: `0 14px 32px ${color}55` }}>
                {initials}
              </div>
            </div>
          )
        }

        {/* múltiplas imagens */}
        {(product.imagens_urls?.length ?? 0) > 1 && (
          <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,.7)", color: "white", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 99 }}>
            📷 {product.imagens_urls!.length}
          </div>
        )}

        {/* badges sobre a imagem */}
        <div style={{ position: "absolute", left: 12, bottom: 12, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {novo && (
            <span style={{ padding: "4px 9px", borderRadius: 999, background: B, color: "white", fontSize: 11, fontWeight: 700 }}>Novo</span>
          )}
          {typeof product.rating === "number" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 999, background: "rgba(255,255,255,.92)", fontSize: 11, fontWeight: 700, color: "#0A2540" }}>
              <Star size={11} fill={GOLD} color={GOLD} />
              {product.rating}
            </span>
          )}
          {(product.dias_entrega ?? 0) > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 9px", borderRadius: 999, background: "rgba(13,59,110,.82)", color: "white", fontSize: 11, fontWeight: 700 }}>
              <Clock size={11} />
              {product.dias_entrega} dias
            </span>
          )}
        </div>
      </div>

      {/* corpo */}
      <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div>
          <div style={{ display: "inline-flex", padding: "4px 9px", borderRadius: 999, background: BL, color: B, fontSize: 11, fontWeight: 800, marginBottom: 7 }}>
            {product.categoria || "Serviço"}
          </div>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: "#0A2540", lineHeight: 1.35, marginBottom: 5 }}>
            {product.titulo || "Serviço sem título"}
          </div>
          <div style={{ fontSize: 12, color: "#6C757D", lineHeight: 1.6 }}>
            {product.descricao ? `${product.descricao.slice(0, 92)}${product.descricao.length > 92 ? "…" : ""}` : "Sem descrição adicional."}
          </div>
        </div>

        {/* ── NOVO: estrelas + barra de entrega ── */}
        {typeof product.rating === "number" && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: GOLD, fontSize: 13, letterSpacing: 1 }}>{renderStars(product.rating)}</span>
            <span style={{ fontSize: 11, color: "#6C757D" }}>{product.rating} · {product.revisoes || 0} avaliações</span>
          </div>
        )}

        {(product.dias_entrega ?? 0) > 0 && (
          <div>
            <div style={{ fontSize: 11, color: "#6C757D", marginBottom: 4 }}>
              Entrega em {product.dias_entrega} dia{product.dias_entrega !== 1 ? "s" : ""}
            </div>
            <div style={{ height: 4, background: "#F1F3F5", borderRadius: 99, overflow: "hidden" }}>
              <div style={{ width: `${bar.pct}%`, height: "100%", background: bar.color, borderRadius: 99, transition: "width .4s ease" }} />
            </div>
          </div>
        )}

        {/* vendedor */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid #F1F3F5", borderBottom: "1px solid #F1F3F5" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: product.profiles?.avatar_url ? "transparent" : color, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontSize: 12, fontWeight: 800, color: "white", flexShrink: 0 }}>
            {product.profiles?.avatar_url
              ? <img src={product.profiles.avatar_url} alt={product.profiles.nome || "Vendedor"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : initials
            }
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 700, color: "#0A2540" }}>
              {product.profiles?.nome || "Vendedor"}
              {/* ── NOVO: badge verificado ── */}
              {product.verificado && (
                <CheckCircle size={13} color={B} fill={BL} style={{ flexShrink: 0 }} />
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6C757D" }}>
              <MapPin size={11} />
              {product.profiles?.localizacao || "Moçambique"}
            </div>
          </div>
        </div>

        {/* tags */}
        {(product.tags?.length ?? 0) > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {product.tags!.slice(0, 3).map(tag => (
              <span key={tag} style={{ padding: "4px 8px", borderRadius: 999, background: "#F1F3F5", color: "#495057", fontSize: 11, fontWeight: 600 }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* preço + CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
          <div>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: B }}>
              {formatCurrency(product.preco)} MZN
            </div>
            <div style={{ fontSize: 11, color: "#ADB5BD" }}>
              {(product.revisoes ?? 0) > 0
                ? `${product.revisoes} revisões incluídas`
                : "Negociável com o vendedor"
              }
            </div>
          </div>
          <Link to={`/marketplace/${product.id}`} style={{ textDecoration: "none" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 14px", borderRadius: 999, border: "none", background: `linear-gradient(135deg,${B},${BD})`, color: "white", cursor: "pointer", fontWeight: 800 }}>
              Ver <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   ITEM (LISTA)
════════════════════════════════════════════════════════════ */
function ProductListItem({
  product, liked, setLiked,
}: { product: Product; liked: string[]; setLiked: React.Dispatch<React.SetStateAction<string[]>> }) {
  const color    = getColor(product.profiles?.nome || product.titulo || "P");
  const initials = (product.profiles?.nome || product.titulo || "PR").split(" ").map(p=>p[0]).slice(0,2).join("").toUpperCase();
  const isLiked  = liked.includes(product.id);
  const novo     = isNew(product.created_at);

  function toggleLike(e: React.MouseEvent<HTMLButtonElement>) {
    const btn = e.currentTarget;
    btn.classList.add("heart-pop");
    btn.addEventListener("animationend", () => btn.classList.remove("heart-pop"), { once: true });
    setLiked(cur => cur.includes(product.id) ? cur.filter(i => i !== product.id) : [...cur, product.id]);
  }

  return (
    <div className="marketplace-list-item" style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 18, padding: 16, display: "flex", gap: 16, boxShadow: "0 3px 10px rgba(13,59,110,.04)" }}>
      {/* thumbnail */}
      <div style={{ width: 92, height: 92, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: `linear-gradient(135deg,${color}22,${color}50)`, position: "relative" }}>
        {product.imagens_urls?.[0]
          ? <img src={product.imagens_urls[0]} alt={product.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: color, fontFamily: "'Sora',sans-serif", fontWeight: 800, fontSize: 20 }}>{initials}</div>
        }
        {novo && (
          <div style={{ position: "absolute", top: 4, left: 4, background: B, color: "white", fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 99 }}>Novo</div>
        )}
      </div>

      {/* copy */}
      <div className="marketplace-list-copy" style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
          <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: "#0A2540" }}>
            {product.titulo || "Serviço sem título"}
          </div>
          <span style={{ padding: "3px 9px", borderRadius: 999, background: BL, color: B, fontSize: 11, fontWeight: 800 }}>
            {product.categoria || "Serviço"}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, color: "#6C757D", marginBottom: 6 }}>
          {product.profiles?.nome || "Vendedor"}
          {product.verificado && <CheckCircle size={12} color={B} fill={BL} />}
          · {product.profiles?.localizacao || "Moçambique"}
        </div>

        <div style={{ fontSize: 13, color: "#495057", lineHeight: 1.6, marginBottom: 8 }}>
          {product.descricao ? `${product.descricao.slice(0, 140)}${product.descricao.length > 140 ? "…" : ""}` : "Sem descrição adicional."}
        </div>

        {/* métricas */}
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {(product.dias_entrega ?? 0) > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6C757D" }}>
              <Clock size={12} color="#ADB5BD" /> {product.dias_entrega} dias
            </span>
          )}
          {(product.revisoes ?? 0) > 0 && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#6C757D" }}>
              <RefreshCw size={12} color="#ADB5BD" /> {product.revisoes} revisões
            </span>
          )}
          {typeof product.rating === "number" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: GOLD, fontWeight: 700 }}>
              {renderStars(product.rating)} {product.rating}
            </span>
          )}
        </div>
      </div>

      {/* preço + acções */}
      <div className="marketplace-list-actions" style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: B, marginBottom: 4 }}>
          {formatCurrency(product.preco)} MZN
        </div>
        <div style={{ fontSize: 11, color: "#ADB5BD", marginBottom: 10 }}>
          {(product.revisoes ?? 0) > 0 ? `${product.revisoes} revisões` : "Negociável"}
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={toggleLike} style={{ width: 34, height: 34, borderRadius: "50%", border: "1px solid #E9ECEF", background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <Heart size={14} fill={isLiked ? "#E24B4A" : "none"} color={isLiked ? "#E24B4A" : "#ADB5BD"} />
          </button>
          <Link to={`/marketplace/${product.id}`} style={{ textDecoration: "none" }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 999, border: "none", background: `linear-gradient(135deg,${B},${BD})`, color: "white", cursor: "pointer", fontWeight: 800 }}>
              Ver <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════
   COMPONENTES PEQUENOS
════════════════════════════════════════════════════════════ */
function SummaryCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 18, padding: "18px 18px 16px", boxShadow: "0 2px 8px rgba(13,59,110,.04)" }}>
      <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: .5, color: "#6C757D", fontWeight: 700, marginBottom: 10 }}>{label}</div>
      <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: "#0A2540", marginBottom: 6, lineHeight: 1.15 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6C757D" }}>{helper}</div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 999, background: BL, border: "1px solid #B8D7F3", color: B, fontSize: 12, fontWeight: 700 }}>
      {label}
      <button onClick={onRemove} style={{ border: "none", background: "none", color: B, cursor: "pointer", display: "flex", padding: 0 }}>
        <X size={12} />
      </button>
    </span>
  );
}

/* ════════════════════════════════════════════════════════════
   ESTILOS INLINE REUTILIZÁVEIS
════════════════════════════════════════════════════════════ */
const badgeStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 8,
  padding: "7px 12px", borderRadius: 99,
  background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
  color: "white", fontSize: 12, fontWeight: 600, marginBottom: 16,
};

const heroStatBox: React.CSSProperties = {
  minWidth: 150, padding: "14px 16px", borderRadius: 18,
  background: "rgba(255,255,255,.12)", border: "1px solid rgba(255,255,255,.18)",
  color: "white", backdropFilter: "blur(6px)",
};

const searchInput: React.CSSProperties = {
  width: "100%", padding: "14px 42px 14px 42px",
  borderRadius: 12, border: "1.5px solid rgba(255,255,255,.22)",
  background: "rgba(255,255,255,.12)", color: "white", fontSize: 14, outline: "none",
  boxSizing: "border-box",
};

const clearBtn: React.CSSProperties = {
  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", color: "rgba(255,255,255,.75)", cursor: "pointer",
  display: "flex", padding: 0,
};

const sortSelect: React.CSSProperties = {
  minWidth: 210, padding: "14px 16px", borderRadius: 12,
  border: "1.5px solid rgba(255,255,255,.22)", background: "rgba(255,255,255,.12)",
  color: "white", fontSize: 14, outline: "none",
};

const publishBtn: React.CSSProperties = {
  padding: "14px 20px", borderRadius: 12, border: "none",
  background: `linear-gradient(135deg,${GOLD},#E58A00)`, color: BD,
  fontSize: 14, fontWeight: 800, cursor: "pointer",
  boxShadow: "0 10px 24px rgba(245,166,35,.22)",
};

function quickBtn(active: boolean): React.CSSProperties {
  return {
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "10px 14px", borderRadius: 999,
    border: "1px solid rgba(255,255,255,.24)",
    background: active ? "rgba(255,255,255,.18)" : "rgba(255,255,255,.10)",
    color: "white", cursor: "pointer", fontWeight: 600,
  };
}

const tagBtn: React.CSSProperties = {
  padding: "10px 14px", borderRadius: 999,
  border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.08)",
  color: "rgba(255,255,255,.86)", cursor: "pointer", fontSize: 13,
};
