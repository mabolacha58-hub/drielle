import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, CheckCircle, Plus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";

const B = "#1A6BB5";
const BD = "#0D3B6E";
const BL = "#E8F3FC";
const CATEGORIAS = ["Serviços", "Software", "Formação", "Design", "Finanças", "Fotografia", "Marketing", "Tradução", "Consultoria", "Outro"];

export function PublishService() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    preco: "",
    categoria: "",
    dias_entrega: "7",
    revisoes: "3",
    tags: [] as string[],
  });

  const setField = (key: string, value: any) => {
    setError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024;

      if (!isImage && !isVideo) {
        setError("Apenas imagens e vídeos são permitidos.");
        return false;
      }

      if (!isValidSize) {
        setError("Cada ficheiro deve ter menos de 50MB.");
        return false;
      }

      return true;
    });

    setImageFiles((current) => [...current, ...validFiles]);
    setImagePreviews((current) => [...current, ...validFiles.map((file) => URL.createObjectURL(file))]);
    event.target.value = "";
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((current) => ({ ...current, tags: [...current.tags, tag] }));
    }
    setTagInput("");
  }

  function removeTag(tagToRemove: string) {
    setForm((current) => ({ ...current, tags: current.tags.filter((tag) => tag !== tagToRemove) }));
  }

  function removeFile(index: number) {
    setImageFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
    setImagePreviews((current) => {
      URL.revokeObjectURL(current[index]);
      return current.filter((_, fileIndex) => fileIndex !== index);
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!user?.id) {
      setError("Precisas de estar autenticado.");
      return;
    }

    if (!form.titulo || !form.categoria || !form.preco) {
      setError("Preenche todos os campos obrigatórios.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const imagens_urls: string[] = [];

      if (imageFiles.length > 0) {
        setUploadingImages(true);

        for (const file of imageFiles) {
          const ext = file.name.split(".").pop();
          const path = `${user.id}/${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`;
          const { error: uploadError } = await supabase.storage.from("produtos").upload(path, file, { upsert: true });

          if (uploadError) {
            throw uploadError;
          }

          const { data } = supabase.storage.from("produtos").getPublicUrl(path);
          imagens_urls.push(data.publicUrl);
        }
      }

      const { error: insertError } = await supabase.from("produtos").insert({
        vendedor_id: user.id,
        titulo: form.titulo,
        descricao: form.descricao,
        preco: parseInt(form.preco, 10),
        categoria: form.categoria,
        tags: form.tags,
        dias_entrega: parseInt(form.dias_entrega, 10),
        revisoes: parseInt(form.revisoes, 10),
        imagens_urls: imagens_urls.length > 0 ? imagens_urls : null,
        imagem_url: imagens_urls[0] || null,
        activo: true,
      });

      if (insertError) {
        throw insertError;
      }

      // Notify marketplace to refresh
      localStorage.setItem('productPublished', 'true');
      window.dispatchEvent(new StorageEvent('storage', { key: 'productPublished', newValue: 'true' }));

      setSuccess(true);
    } catch (submitError: any) {
      setError(submitError.message || "Erro ao publicar serviço.");
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #DEE2E6",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    color: "#212529",
    outline: "none",
    transition: "border-color 0.15s",
  };

  const imagePreview = imagePreviews[0] || "";

  if (success) {
    return (
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
              <button style={{ padding: "11px 24px", background: `linear-gradient(135deg, ${B}, ${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                Ver marketplace
              </button>
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ titulo: "", descricao: "", preco: "", categoria: "", dias_entrega: "7", revisoes: "3", tags: [] });
                imagePreviews.forEach((preview) => URL.revokeObjectURL(preview));
                setImageFiles([]);
                setImagePreviews([]);
              }}
              style={{ padding: "11px 24px", background: "white", color: B, border: `1.5px solid ${B}`, borderRadius: 99, fontSize: 14, fontWeight: 600, cursor: "pointer" }}
            >
              Publicar outro
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh" }}>
      <div style={{ background: `linear-gradient(135deg, ${BD}, ${B})`, padding: "32px 24px 40px" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Link to="/dashboard" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13, marginBottom: 16 }}>
            <ArrowLeft size={15} />
            Voltar ao dashboard
          </Link>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 26, fontWeight: 800, color: "white", marginBottom: 6 }}>Publicar produto ou serviço</h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>Ofereça os seus serviços a empresas e profissionais em Moçambique.</p>
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

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 8 }}>
                Imagens e vídeos do serviço / produto
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
                {imagePreviews.map((preview, index) => (
                  <div key={preview} style={{ position: "relative", width: 100, height: 100, borderRadius: 12, overflow: "hidden", border: "2px solid #DEE2E6" }}>
                    {imageFiles[index]?.type.startsWith("video/") ? (
                      <video src={preview} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <img src={preview} alt={`preview ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
                  onMouseOver={(event) => {
                    event.currentTarget.style.borderColor = B;
                  }}
                  onMouseOut={(event) => {
                    event.currentTarget.style.borderColor = imagePreviews.length > 0 ? B : "#DEE2E6";
                  }}
                  style={{
                    width: 100,
                    height: 100,
                    borderRadius: 12,
                    border: `2px dashed ${imagePreviews.length > 0 ? B : "#DEE2E6"}`,
                    background: "#F8F9FA",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <Plus size={20} color={B} />
                </div>
              </div>
              <input ref={imageRef} type="file" accept="image/*,video/*" multiple style={{ display: "none" }} onChange={handleImageChange} />
              <div style={{ fontSize: 12, color: "#ADB5BD" }}>Imagens JPG, PNG, WebP ou vídeos MP4, até 50MB cada.</div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                Título do serviço <span style={{ color: "#E24B4A" }}>*</span>
              </label>
              <input
                style={inputStyle}
                placeholder="Ex: Design de Identidade Visual Completa"
                value={form.titulo}
                onChange={(event) => setField("titulo", event.target.value)}
                required
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = B;
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "#DEE2E6";
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Categoria <span style={{ color: "#E24B4A" }}>*</span>
                </label>
                <select
                  style={{ ...inputStyle, appearance: "none", cursor: "pointer", background: "white" }}
                  value={form.categoria}
                  onChange={(event) => setField("categoria", event.target.value)}
                  required
                >
                  <option value="">Seleccione...</option>
                  {CATEGORIAS.map((categoria) => (
                    <option key={categoria} value={categoria}>
                      {categoria}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
                  Preço (MZN) <span style={{ color: "#E24B4A" }}>*</span>
                </label>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="Ex: 15000"
                  value={form.preco}
                  onChange={(event) => setField("preco", event.target.value.replace(/[^\d]/g, ''))}
                  required
                  min="1"
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = B;
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "#DEE2E6";
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Descrição do serviço</label>
              <textarea
                rows={5}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                placeholder="Descreva o que inclui o seu serviço, o processo de trabalho e os resultados esperados..."
                value={form.descricao}
                onChange={(event) => setField("descricao", event.target.value)}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = B;
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = "#DEE2E6";
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Dias de entrega</label>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="7"
                  value={form.dias_entrega}
                  onChange={(event) => setField("dias_entrega", event.target.value)}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = B;
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "#DEE2E6";
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Número de revisões</label>
                <input
                  type="number"
                  style={inputStyle}
                  placeholder="3"
                  value={form.revisoes}
                  onChange={(event) => setField("revisoes", event.target.value)}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = B;
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "#DEE2E6";
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Tags / palavras-chave</label>
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <input
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Ex: Branding, Logo..."
                  value={tagInput}
                  onChange={(event) => setTagInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addTag();
                    }
                  }}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = B;
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "#DEE2E6";
                  }}
                />
                <button type="button" onClick={addTag} style={{ padding: "9px 16px", background: BL, color: B, border: `1px solid ${B}30`, borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  <Plus size={13} />
                </button>
              </div>

              {form.tags.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {form.tags.map((tag) => (
                    <span key={tag} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, padding: "4px 10px", borderRadius: 99, background: BL, color: B, fontWeight: 500 }}>
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} style={{ background: "none", border: "none", cursor: "pointer", color: B, padding: 0, display: "flex" }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {form.titulo && form.preco && (
              <div style={{ padding: 16, background: "#F8F9FA", borderRadius: 12, border: "1px solid #E9ECEF" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6C757D", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.5px" }}>Pré-visualização</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 10, overflow: "hidden", background: B, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontFamily: "'Sora', sans-serif", fontSize: 16, fontWeight: 800, color: "white" }}>{form.titulo.slice(0, 2).toUpperCase()}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 14, fontWeight: 700, color: "#0A2540" }}>{form.titulo}</div>
                    <div style={{ fontSize: 12, color: "#6C757D" }}>{form.categoria || "Sem categoria"} · {form.dias_entrega} dias</div>
                  </div>
                  <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 17, fontWeight: 800, color: B }}>{parseInt(form.preco || "0", 10).toLocaleString("pt-MZ")} MZN</div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "13px",
                background: loading ? "#ADB5BD" : `linear-gradient(135deg, ${B}, ${BD})`,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(26,107,181,0.35)",
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  {uploadingImages ? "A fazer upload da imagem..." : "A publicar..."}
                </>
              ) : (
                "Publicar serviço"
              )}
            </button>
          </div>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
