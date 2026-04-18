import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, CheckCircle, AlertCircle, Camera, Image } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";

const B = "#1A6BB5", BD = "#0D3B6E", BL = "#E8F3FC", GOLD = "#F5A623";
const CATEGORIAS = ["Serviços","Software","Formação","Design","Finanças","Fotografia","Marketing","Tradução","Consultoria","Outro"];

export function PublishService() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)
  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: "", descricao: "", preco: "",
    categoria: "", dias_entrega: "7", revisoes: "3", tags: [] as string[],
  });

  const set = (k: string, v: any) => { setError(""); setForm(f => ({ ...f, [k]: v })); };

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/')
      const isVideo = file.type.startsWith('video/')
      const isValidSize = file.size <= 50 * 1024 * 1024 // 50MB for videos
      if (!isImage && !isVideo) {
        setError("Apenas imagens e vídeos são permitidos.")
        return false
      }
      if (!isValidSize) {
        setError("Cada ficheiro deve ter menos de 50MB.")
        return false
      }
      return true
    })
    setImageFiles(prev => [...prev, ...validFiles])
    const newPreviews = validFiles.map(file => URL.createObjectURL(file))
    setImagePreviews(prev => [...prev, ...newPreviews])
  }

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) setForm(f => ({ ...f, tags: [...f.tags, t] }));
    setTagInput("");
  };
  const removeFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) { setError("Precisas de estar autenticado."); return; }
    if (!form.titulo || !form.categoria || !form.preco) { setError("Preenche todos os campos obrigatórios."); return; }

    setLoading(true); setError("");

    try {
      let imagens_urls: string[] = []

      // Upload das imagens se existirem
      if (imageFiles.length > 0) {
        setUploadingImages(true)
        for (const file of imageFiles) {
          const ext = file.name.split(".").pop()
          const path = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${ext}`
          const { error: uploadError } = await supabase.storage
            .from("produtos")
            .upload(path, file, { upsert: true })

          if (uploadError) throw uploadError

          const { data } = supabase.storage.from("produtos").getPublicUrl(path)
          imagens_urls.push(data.publicUrl)
        }
        setUploadingImages(false)
      }

      // Inserir produto na BD
      const { error: insertError } = await supabase.from("produtos").insert({
        vendedor_id: user.id,
        titulo: form.titulo,
        descricao: form.descricao,
        preco: parseInt(form.preco),
        categoria: form.categoria,
        tags: form.tags,
        dias_entrega: parseInt(form.dias_entrega),
        revisoes: parseInt(form.revisoes),
        imagens_urls,
        activo: true,
      });

      if (insertError) throw insertError
      setSuccess(true)
    } catch (e: any) {
      setError(e.message || "Erro ao publicar serviço.")
    } finally {
      setLoading(false)
      setUploadingImages(false)
    }
  }

  const inputSt: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1.5px solid #DEE2E6",
    borderRadius: 10, fontSize: 14, fontFamily: "'DM Sans', sans-serif",
    color: "#212529", outline: "none", transition: "border-color 0.15s",
  };

  if (success) return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#F4F6F9" }}>
      <div style={{ textAlign: "center", maxWidth: 460 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#E1F5EE", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={40} color="#065F46" />
        </div>
        <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 24, fontWeight: 800, color: "#0A2540", marginBottom: 12 }}>Serviço publicado!</h1>
        <p style={{ fontSize: 14, color: "#6C757D", lineHeight: 1.7, marginBottom: 32 }}>
          O seu serviço <strong>"{form.titulo}"</strong> já está disponível no Marketplace da Drielle.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/marketplace" style={{ textDecoration: "none" }}>
            <button style={{ padding: "11px 24px", background: `linear-gradient(135deg,${B},${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Ver Marketplace →
            </button>
          </Link>
          <button onClick={() => { setSuccess(false); setForm({ titulo:"",descricao:"",preco:"",categoria:"",dias_entrega:"7",revisoes:"3",tags:[] }); setImageFiles([]); setImagePreviews([]); }} style={{ padding: "11px 24px", background: "white", color: B, border: `1.5px solid ${B}`, borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            Publicar outro
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh" }}>
      <div style={{ background: `linear-gradient(135deg,${BD},${B})`, padding: "32px 24px 40px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Link to="/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 16 }}>
            <ArrowLeft size={15} /> Voltar ao Dashboard
          </Link>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "white", marginBottom: 6 }}>Publicar Produto ou Serviço</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Ofereça os seus serviços a empresas e profissionais em Moçambique</p>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "28px 24px" }}>
        <form onSubmit={handleSubmit}>
          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 14, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 20 }}>

            {error && (
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 14px", background: "#FCEBEB", borderRadius: 10, border: "1px solid #F09595" }}>
                <AlertCircle size={15} color="#A32D2D" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13, color: "#A32D2D" }}>{error}</span>
              </div>
            )}

            {/* ── Imagens e Vídeos ── */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 8 }}>
                Imagens e Vídeos do Serviço / Produto
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: "relative", width: 100, height: 100, borderRadius: 12, overflow: "hidden", border: "2px solid #DEE2E6" }}>
                    {imageFiles[index]?.type.startsWith('video/') ? (
                      <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} controls={false} />
                    ) : (
                      <img src={preview} alt={`preview ${index}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    )}
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(0,0,0,0.6)", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                    >
                      <X size={12} color="white" />
                    </button>
                  </div>
                ))}
                <div
                  onClick={() => imageRef.current?.click()}
                  style={{
                    width: 100, height: 100, borderRadius: 12,
                    border: `2px dashed ${imagePreviews.length > 0 ? B : "#DEE2E6"}`,
                    background: "#F8F9FA",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = B; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = imagePreviews.length > 0 ? B : "#DEE2E6"; }}
                >
                  <div style={{ textAlign: "center" }}>
                    <Plus size={20} color={B} />
                  </div>
                </div>
              </div>
              <input ref={imageRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleImageChange} />
              <div style={{ fontSize: 12, color: "#ADB5BD" }}>Imagens JPG, PNG, WebP ou vídeos MP4, até 50MB cada</div>
            </div>

            {/* ── Título ── */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                Título do Serviço <span style={{ color: "#E24B4A" }}>*</span>
              </label>
              <input style={inputSt} placeholder="Ex: Design de Identidade Visual Completa"
                value={form.titulo} onChange={e => set("titulo", e.target.value)} required
                onFocus={e => e.currentTarget.style.borderColor = B}
                onBlur={e => e.currentTarget.style.borderColor = "#DEE2E6"} />
            </div>

            {/* ── Categoria + Preço ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Categoria <span style={{ color: "#E24B4A" }}>*</span>
                </label>
                <select style={{ ...inputSt, appearance: "none", cursor: "pointer", background: "white" }}
                  value={form.categoria} onChange={e => set("categoria", e.target.value)} required>
                  <option value="">Seleccione...</option>
                  {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Preço (MZN) <span style={{ color: "#E24B4A" }}>*</span>
                </label>
                <input type="number" style={inputSt} placeholder="Ex: 15000"
                  value={form.preco} onChange={e => set("preco", e.target.value)} required
                  onFocus={e => e.currentTarget.style.borderColor = B}
                  onBlur={e => e.currentTarget.style.borderColor = "#DEE2E6"} />
              </div>
            </div>

            {/* ── Descrição ── */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Descrição do Serviço</label>
              <textarea rows={5} style={{ ...inputSt, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Descreva o que inclui o seu serviço, o processo de trabalho e os resultados esperados..."
                value={form.descricao} onChange={e => set("descricao", e.target.value)}
                onFocus={e => e.currentTarget.style.borderColor = B}
                onBlur={e => e.currentTarget.style.borderColor = "#DEE2E6"} />
            </div>

            {/* ── Entrega + Revisões ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Dias de Entrega</label>
                <input type="number" style={inputSt} placeholder="7"
                  value={form.dias_entrega} onChange={e => set("dias_entrega", e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = B}
                  onBlur={e => e.currentTarget.style.borderColor = "#DEE2E6"} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Número de Revisões</label>
                <input type="number" style={inputSt} placeholder="3"
                  value={form.revisoes} onChange={e => set("revisoes", e.target.value)}
                  onFocus={e => e.currentTarget.style.borderColor = B}
                  onBlur={e => e.currentTarget.style.borderColor = "#DEE2E6"} />
              </div>
            </div>

            {/* ── Tags ── */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Tags / Palavras-chave</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input style={{ ...inputSt, flex: 1 }} placeholder="Ex: Branding, Logo..."
                  value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                  onFocus={e => e.currentTarget.style.borderColor = B}
                  onBlur={e => e.currentTarget.style.borderColor = "#DEE2E6"} />
                <button type="button" onClick={addTag} style={{ padding: "9px 16px", background: BL, color: B, border: `1px solid ${B}30`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Plus size={13} />
                </button>
              </div>
              {form.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {form.tags.map(t => (
                    <span key={t} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 99, background: BL, color: B, fontWeight: 500 }}>
                      {t}
                      <button type="button" onClick={() => removeTag(t)} style={{ background: "none", border: "none", cursor: "pointer", color: B, padding: 0, display: "flex" }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* ── Preview ── */}
            {form.titulo && form.preco && (
              <div style={{ padding: 16, background: "#F8F9FA", borderRadius: 12, border: "1px solid #E9ECEF" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6C757D", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pré-visualização</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: B, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {imagePreview
                      ? <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "white" }}>{form.titulo.slice(0, 2).toUpperCase()}</span>
                    }
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540" }}>{form.titulo}</div>
                    <div style={{ fontSize: 12, color: "#6C757D" }}>{form.categoria} · {form.dias_entrega} dias</div>
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: B }}>
                    {parseInt(form.preco||"0").toLocaleString("pt-MZ")} MZN
                  </div>
                </div>
              </div>
            )}

            {/* ── Submit ── */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", background: loading ? "#ADB5BD" : `linear-gradient(135deg,${B},${BD})`,
              color: "white", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: `0 4px 14px rgba(26,107,181,0.35)`,
            }}>
              {loading
                ? <><div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />{uploadingImage ? "A fazer upload da imagem..." : "A publicar..."}</>
                : "Publicar Serviço →"
              }
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
