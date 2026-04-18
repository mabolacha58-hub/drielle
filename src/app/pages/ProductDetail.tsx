import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, MapPin, Clock, CheckCircle, MessageCircle, Share2, Heart, Shield, RefreshCw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { getProdutoById } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

const B = "#1A6BB5", BD = "#0D3B6E", BL = "#E8F3FC", GOLD = "#F5A623";
const COLORS = ["#1A6BB5","#E24B4A","#0D3B6E","#D97706","#7C3AED","#059669"];
function getColor(s: string) { let h=0; for(let i=0;i<s.length;i++) h=s.charCodeAt(i)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }
function getInitials(n: string) { return (n||"V").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase(); }

export function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [ordered, setOrdered] = useState(false);

  useEffect(() => {
    if (!id) return;
    getProdutoById(id).then(setProduct).catch(console.error).finally(() => setLoading(false));
  }, [id]);

  function handleContact() {
    if (!user) { navigate("/login"); return; }
    if (!product?.vendedor_id) return;
    navigate(`/mensagens?com=${product.vendedor_id}&sobre=${encodeURIComponent(product.titulo)}`);
  }

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 36, height: 36, border: `3px solid ${BL}`, borderTop: `3px solid ${B}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!product) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 700, color: "#0A2540" }}>Produto não encontrado</h2>
      <Link to="/marketplace" style={{ textDecoration: "none" }}>
        <button style={{ padding: "10px 24px", background: `linear-gradient(135deg,${B},${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>← Marketplace</button>
      </Link>
    </div>
  );

  const vendedor = product.profiles;
  const color = getColor(vendedor?.nome || product.titulo || "");
  const initials = getInitials(vendedor?.nome || "V");

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh", fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ background: `linear-gradient(135deg,${BD},${B})`, padding: "20px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Link to="/marketplace" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            <ArrowLeft size={15} /> Voltar ao Marketplace
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

        {/* Main */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Hero image */}
          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ height: 280, overflow: "hidden", position: "relative" }}>
              {product.imagem_url ? (
                <img src={product.imagem_url} alt={product.titulo} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg,${color}15,${color}35)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ width: 80, height: 80, borderRadius: 20, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "white", boxShadow: `0 8px 24px ${color}50` }}>
                    {initials}
                  </div>
                </div>
              )}
              <div style={{ position: "absolute", top: 14, right: 14, display: "flex", gap: 8 }}>
                <button onClick={() => setLiked(!liked)} style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Heart size={16} fill={liked ? "#E24B4A" : "none"} color={liked ? "#E24B4A" : "#6C757D"} />
                </button>
                <button style={{ width: 38, height: 38, borderRadius: "50%", background: "rgba(255,255,255,0.95)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                  <Share2 size={16} color="#6C757D" />
                </button>
              </div>
            </div>
            <div style={{ padding: 24 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: BL, color: B, textTransform: "uppercase" as const, letterSpacing: "0.3px" }}>{product.categoria}</span>
              <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: "#0A2540", margin: "12px 0 6px" }}>{product.titulo}</h1>
              <div style={{ fontSize: 14, color: "#6C757D", marginBottom: 16 }}>{vendedor?.nome}</div>
              {product.tags?.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {product.tags.map((t: string) => (
                    <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "#F1F3F5", color: "#495057" }}>{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {product.descricao && (
            <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0A2540", marginBottom: 14 }}>Sobre o Serviço</h2>
              {product.descricao.split("\n").map((p: string, i: number) => p && (
                <p key={i} style={{ fontSize: 14, color: "#495057", lineHeight: 1.8, marginBottom: 10 }}>{p}</p>
              ))}
            </div>
          )}

          {/* What's included */}
          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h2 style={{ fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 700, color: "#0A2540", marginBottom: 16 }}>O que está incluído</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { icon: Clock, label: `Entrega em ${product.dias_entrega || 7} dias` },
                { icon: RefreshCw, label: `${product.revisoes || 3} revisões incluídas` },
                { icon: Shield, label: "Pagamento seguro garantido" },
                { icon: CheckCircle, label: "Suporte pós-entrega" },
              ].map(({ icon: Icon, label }, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "12px 14px", background: BL, borderRadius: 10 }}>
                  <Icon size={16} color={B} style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: BD, fontWeight: 500 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Price + CTA */}
          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 800, color: B, marginBottom: 2 }}>
              {product.preco?.toLocaleString("pt-MZ")} MZN
            </div>
            <div style={{ fontSize: 13, color: "#ADB5BD", marginBottom: 18 }}>por projecto</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {[
                [Clock, `Entrega em ${product.dias_entrega || 7} dias`],
                [RefreshCw, `${product.revisoes || 3} revisões`],
                [Shield, "Pagamento seguro"],
              ].map(([Icon, val], i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#6C757D" }}>
                  <Icon size={14} color="#ADB5BD" /> {val as string}
                </div>
              ))}
            </div>

            {!ordered ? (
              <>
                <button
                  onClick={handleContact}
                  style={{ width: "100%", padding: "13px", background: `linear-gradient(135deg,${B},${BD})`, color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: `0 4px 14px rgba(26,107,181,0.35)` }}
                >
                  <MessageCircle size={17} /> Contactar Vendedor
                </button>
                <button onClick={() => setOrdered(true)} style={{ width: "100%", padding: "11px", background: "white", color: B, border: `1.5px solid ${B}`, borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                  Encomendar Agora
                </button>
              </>
            ) : (
              <div style={{ padding: 14, background: "#E1F5EE", borderRadius: 10, textAlign: "center" }}>
                <CheckCircle size={24} color="#065F46" style={{ margin: "0 auto 8px", display: "block" }} />
                <div style={{ fontWeight: 700, color: "#065F46", fontSize: 14 }}>Encomenda realizada!</div>
                <div style={{ fontSize: 12, color: "#065F46", opacity: 0.8, marginTop: 4 }}>O vendedor vai contactá-lo em breve.</div>
                <button onClick={handleContact} style={{ marginTop: 12, padding: "8px 18px", background: `linear-gradient(135deg,${B},${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, margin: "12px auto 0" }}>
                  <MessageCircle size={14} /> Abrir Chat
                </button>
              </div>
            )}
          </div>

          {/* Seller */}
          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <h3 style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540", marginBottom: 14 }}>Sobre o Vendedor</h3>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: vendedor?.avatar_url ? "transparent" : color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: "white", overflow: "hidden", flexShrink: 0 }}>
                {vendedor?.avatar_url ? <img src={vendedor.avatar_url} alt={vendedor.nome} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : initials}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0A2540" }}>{vendedor?.nome || "Vendedor"}</div>
                {vendedor?.titulo && <div style={{ fontSize: 12, color: "#6C757D" }}>{vendedor.titulo}</div>}
                {vendedor?.localizacao && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#ADB5BD", marginTop: 2 }}><MapPin size={11} />{vendedor.localizacao}</div>}
              </div>
            </div>
            <button onClick={handleContact} style={{ width: "100%", padding: "10px", background: BL, color: B, border: "none", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s" }}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.background = B; (e.currentTarget as HTMLElement).style.color = "white"; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.background = BL; (e.currentTarget as HTMLElement).style.color = B; }}
            >
              <MessageCircle size={15} /> Enviar Mensagem
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
