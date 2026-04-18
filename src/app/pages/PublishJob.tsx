import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Briefcase, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createVaga, getVagaById, updateVaga } from "../../lib/api";

// Constantes de design (cores da marca)
const B = "#1A6BB5";
const BD = "#0D3B6E";
const BL = "#E8F3FC";
const GOLD = "#F5A623";

// Listas fixas para selects
const CATEGORIAS = [
  "TI & Tecnologia", "Marketing", "Finanças", "Engenharia", "Design",
  "Saúde", "Direito", "Educação", "Logística", "Outro"
];
const TIPOS = [
  "Tempo Inteiro", "Meio Período", "Remoto", "Híbrido", "Estágio", "Freelance"
];
const PROVINCIAS = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala",
  "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa"
];

const STEPS = ["Informações Básicas", "Descrição", "Requisitos & Skills", "Revisão"];

export function PublishJob() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [rawText, setRawText] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [loadingJob, setLoadingJob] = useState(false);

  // Estado do formulário
  const [form, setForm] = useState({
    titulo: "",
    empresa_nome: profile?.nome || "",
    categoria: "",
    tipo: "",
    localizacao: "",
    salario_min: "",
    salario_max: "",
    descricao: "",
    prazo: "",
    responsabilidades: [""],
    requisitos: [""],
    beneficios: [""],
    skills: [""],
  });

  const setField = (key: string, value: any) => {
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Carregar vaga para edição (se houver ID na URL)
  useEffect(() => {
    if (!id) return;
    const loadJob = async () => {
      setLoadingJob(true);
      try {
        const job = await getVagaById(id);
        if (job) {
          // Verificar se o usuário logado é o proprietário
          if (job.empresa_id !== user?.id) {
            setError("Só o proprietário pode editar esta vaga.");
            return;
          }
          setForm({
            titulo: job.titulo || "",
            empresa_nome: job.empresa_nome || profile?.nome || "",
            categoria: job.categoria || "",
            tipo: job.tipo || "",
            localizacao: job.localizacao || "",
            salario_min: job.salario_min ? String(job.salario_min) : "",
            salario_max: job.salario_max ? String(job.salario_max) : "",
            descricao: job.descricao || "",
            prazo: job.prazo || "",
            responsabilidades: job.responsabilidades?.length ? job.responsabilidades : [""],
            requisitos: job.requisitos?.length ? job.requisitos : [""],
            beneficios: job.beneficios?.length ? job.beneficios : [""],
            skills: job.skills?.length ? job.skills : [""],
          });
        }
      } catch (err) {
        console.error("Erro ao carregar vaga:", err);
        setError("Não foi possível carregar a vaga para edição.");
      } finally {
        setLoadingJob(false);
      }
    };
    loadJob();
  }, [id, profile?.nome, user?.id]);

  // Helpers para listas dinâmicas
  const addItem = (field: "responsabilidades" | "requisitos" | "beneficios" | "skills") => {
    setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };
  const removeItem = (field: "responsabilidades" | "requisitos" | "beneficios" | "skills", index: number) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  };
  const updateItem = (field: "responsabilidades" | "requisitos" | "beneficios" | "skills", index: number, value: string) => {
    setForm((prev) => ({ ...prev, [field]: prev[field].map((item, i) => (i === index ? value : item)) }));
  };

  // Função auxiliar para extrair números de strings
  const normalizeNumber = (value: string) => value.replace(/[^0-9]/g, "");

  // Lógica de parsing do texto colado (importação automática)
  const parseSection = (lines: string[], headings: RegExp) => {
    const result: string[] = [];
    let capture = false;
    for (const line of lines) {
      if (headings.test(line)) {
        capture = true;
        continue;
      }
      if (capture) {
        if (/^(responsabilidades|requisitos|benef[ií]cios|skills?)\b/i.test(line)) break;
        if (/^[-•*]\s*/.test(line)) {
          result.push(line.replace(/^[-•*]\s*/, ""));
          continue;
        }
        if (line.trim() === "") break;
        result.push(line);
      }
    }
    return result;
  };

  const parseJobText = (text: string) => {
    const lines = text
      .replace(/\r/g, "")
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed = {
      titulo: "",
      empresa_nome: "",
      categoria: "",
      tipo: "",
      localizacao: "",
      salario_min: "",
      salario_max: "",
      descricao: text.trim(),
      responsabilidades: [""],
      requisitos: [""],
      beneficios: [""],
      skills: [""],
    };

    if (lines.length > 0) parsed.titulo = lines[0];

    const raw = text.toLowerCase();

    // Empresa
    const companyMatch = text.match(/(?:empresa|organiza[cç][ãa]o|institui[cç][ãa]o)[:\-]?\s*(.+)/i);
    if (companyMatch) parsed.empresa_nome = companyMatch[1].trim().split(/\s{2,}|\n/)[0];

    // Localização
    const locationMatch = text.match(/localiza[cç][ãa]o[:\-]?\s*([^\n]+)/i);
    if (locationMatch) {
      parsed.localizacao = locationMatch[1].trim();
    } else {
      const foundLocation = PROVINCIAS.find((p) => raw.includes(p.toLowerCase()));
      if (foundLocation) parsed.localizacao = foundLocation;
    }

    // Tipo de contrato
    const typeKeywords = ["tempo inteiro", "meio período", "meio periodo", "remoto", "híbrido", "hibrido", "estágio", "estagio", "freelance"];
    for (const keyword of typeKeywords) {
      if (raw.includes(keyword)) {
        parsed.tipo =
          keyword === "meio periodo"
            ? "Meio Período"
            : keyword === "hibrido"
            ? "Híbrido"
            : keyword === "estagio"
            ? "Estágio"
            : keyword === "tempo inteiro"
            ? "Tempo Inteiro"
            : keyword === "freelance"
            ? "Freelance"
            : keyword.charAt(0).toUpperCase() + keyword.slice(1);
        break;
      }
    }

    // Categoria
    const categoriesMatch = CATEGORIAS.find((cat) => raw.includes(cat.toLowerCase()));
    if (categoriesMatch) parsed.categoria = categoriesMatch;

    // Salário
    const salaryMatch = text.match(/(\d[\d\.\s]*)\s*(?:MZN|MT|mz|mt)/i);
    if (salaryMatch) {
      const number = normalizeNumber(salaryMatch[1]);
      if (number) parsed.salario_min = number;
    }

    // Secções
    const responsibilities = parseSection(lines, /^responsabilidades?[:\-]?$/i);
    if (responsibilities.length > 0) parsed.responsabilidades = responsibilities;

    const requirements = parseSection(lines, /^requisitos?[:\-]?$/i);
    if (requirements.length > 0) parsed.requisitos = requirements;

    const benefits = parseSection(lines, /^benef[ií]cios?[:\-]?$/i);
    if (benefits.length > 0) parsed.beneficios = benefits;

    const skills = parseSection(lines, /^skills?[:\-]?$/i);
    if (skills.length > 0) parsed.skills = skills;

    return parsed;
  };

  const importFromText = () => {
    if (!rawText.trim()) {
      setImportMessage("Cole o texto da vaga antes de importar.");
      return;
    }
    const parsed = parseJobText(rawText);
    setForm({
      titulo: parsed.titulo || form.titulo,
      empresa_nome: parsed.empresa_nome || form.empresa_nome,
      categoria: parsed.categoria || form.categoria,
      tipo: parsed.tipo || form.tipo,
      localizacao: parsed.localizacao || form.localizacao,
      salario_min: parsed.salario_min || form.salario_min,
      salario_max: parsed.salario_max || form.salario_max,
      descricao: parsed.descricao || form.descricao,
      prazo: form.prazo,
      responsabilidades: parsed.responsabilidades.length > 0 ? parsed.responsabilidades : form.responsabilidades,
      requisitos: parsed.requisitos.length > 0 ? parsed.requisitos : form.requisitos,
      beneficios: parsed.beneficios.length > 0 ? parsed.beneficios : form.beneficios,
      skills: parsed.skills.length > 0 ? parsed.skills : form.skills,
    });
    setImportMessage("Dados importados com sucesso. Verifique e ajuste se necessário.");
  };

  // Submissão do formulário (criar ou atualizar)
  const handleSubmit = async () => {
    // Obter ID da empresa (prioridade para user.id, fallback para profile.id)
    const empresaId = user?.id || profile?.id;
    if (!empresaId) {
      setError("ID da empresa não encontrado. Verifique sua autenticação.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Preparar payload
      const payload = {
        titulo: form.titulo,
        empresa_nome: form.empresa_nome,
        categoria: form.categoria,
        tipo: form.tipo,
        localizacao: form.localizacao,
        salario_min: form.salario_min ? parseInt(form.salario_min) : null,
        salario_max: form.salario_max ? parseInt(form.salario_max) : null,
        descricao: form.descricao,
        responsabilidades: form.responsabilidades.filter((r) => r.trim()),
        requisitos: form.requisitos.filter((r) => r.trim()),
        beneficios: form.beneficios.filter((r) => r.trim()),
        skills: form.skills.filter((s) => s.trim()),
        prazo: form.prazo || undefined,
      };

      if (id) {
        // Modo edição
        await updateVaga(id, payload);
      } else {
        // Modo criação
        await createVaga({
          ...payload,
          empresa_id: empresaId,
        });
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Erro na submissão:", err);
      // Tentar extrair mensagem de erro da resposta da API
      let errorMsg = err.message;
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.error_description) {
        errorMsg = err.error_description;
      } else if (err.details) {
        errorMsg = err.details;
      }
      setError(errorMsg || "Erro desconhecido ao contactar o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // Componentes reutilizáveis de UI (estilizados inline)
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>
      {children}
    </label>
  );

  const Input = ({ field, placeholder, type = "text" }: { field: string; placeholder: string; type?: string }) => (
    <input
      type={type}
      style={{
        width: "100%",
        padding: "10px 14px",
        border: "1.5px solid #DEE2E6",
        borderRadius: 10,
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        color: "#212529",
        background: "white",
        outline: "none",
        transition: "border-color 0.15s",
      }}
      placeholder={placeholder}
      value={(form as any)[field]}
      onChange={(e) => setField(field, e.target.value)}
      onFocus={(e) => (e.currentTarget.style.borderColor = B)}
      onBlur={(e) => (e.currentTarget.style.borderColor = "#DEE2E6")}
    />
  );

  const Select = ({ field, options, placeholder }: { field: string; options: string[]; placeholder: string }) => (
    <select
      style={{
        width: "100%",
        padding: "10px 14px",
        border: "1.5px solid #DEE2E6",
        borderRadius: 10,
        fontSize: 14,
        fontFamily: "'DM Sans', sans-serif",
        color: (form as any)[field] ? "#212529" : "#ADB5BD",
        background: "white",
        outline: "none",
        cursor: "pointer",
        appearance: "none",
      }}
      value={(form as any)[field]}
      onChange={(e) => setField(field, e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );

  const ListInput = ({
    field,
    label,
    placeholder,
  }: {
    field: "responsabilidades" | "requisitos" | "beneficios" | "skills";
    label: string;
    placeholder: string;
  }) => (
    <div>
      <Label>{label}</Label>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {form[field].map((item, idx) => (
          <div key={idx} style={{ display: "flex", gap: 8 }}>
            <input
              style={{
                flex: 1,
                padding: "9px 14px",
                border: "1.5px solid #DEE2E6",
                borderRadius: 10,
                fontSize: 13,
                fontFamily: "'DM Sans', sans-serif",
                color: "#212529",
                outline: "none",
              }}
              placeholder={placeholder}
              value={item}
              onChange={(e) => updateItem(field, idx, e.target.value)}
              onFocus={(e) => (e.currentTarget.style.borderColor = B)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#DEE2E6")}
            />
            {form[field].length > 1 && (
              <button
                onClick={() => removeItem(field, idx)}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 8,
                  background: "#FCEBEB",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <X size={14} color="#E24B4A" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={() => addItem(field)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: BL,
            color: B,
            border: `1px dashed ${B}`,
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif",
            width: "fit-content",
          }}
        >
          <Plus size={13} /> Adicionar
        </button>
      </div>
    </div>
  );

  // Tela de sucesso após publicação/edição
  if (success) {
    return (
      <div
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          background: "#F4F6F9",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 460 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: "#E1F5EE",
              margin: "0 auto 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckCircle size={40} color="#065F46" />
          </div>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 24,
              fontWeight: 800,
              color: "#0A2540",
              marginBottom: 12,
            }}
          >
            {id ? "Vaga atualizada com sucesso!" : "Vaga publicada com sucesso!"}
          </h1>
          <p style={{ fontSize: 14, color: "#6C757D", lineHeight: 1.7, marginBottom: 32 }}>
            A vaga <strong>"{form.titulo}"</strong> está agora {id ? "atualizada" : "visível"} para todos os
            profissionais na plataforma Drielle.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/vagas" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "11px 24px",
                  background: `linear-gradient(135deg, ${B}, ${BD})`,
                  color: "white",
                  border: "none",
                  borderRadius: 99,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Ver Vagas →
              </button>
            </Link>
            <button
              onClick={() => {
                setSuccess(false);
                setStep(0);
                setForm({
                  titulo: "",
                  empresa_nome: profile?.nome || "",
                  categoria: "",
                  tipo: "",
                  localizacao: "",
                  salario_min: "",
                  salario_max: "",
                  descricao: "",
                  prazo: "",
                  responsabilidades: [""],
                  requisitos: [""],
                  beneficios: [""],
                  skills: [""],
                });
              }}
              style={{
                padding: "11px 24px",
                background: "white",
                color: B,
                border: `1.5px solid ${B}`,
                borderRadius: 99,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Publicar outra vaga
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Interface principal do formulário
  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh" }}>
      {/* Cabeçalho */}
      <div style={{ background: `linear-gradient(135deg, ${BD}, ${B})`, padding: "32px 24px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link
            to="/dashboard"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "rgba(255,255,255,0.7)",
              fontSize: 13,
              marginBottom: 16,
            }}
          >
            <ArrowLeft size={15} /> Voltar ao Dashboard
          </Link>
          <h1
            style={{
              fontFamily: "'Sora', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              color: "white",
              marginBottom: 6,
            }}
          >
            {id ? "Editar vaga de emprego" : "Publicar vaga de emprego"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
            {id
              ? "Ajuste os detalhes da vaga e atualize a sua publicação."
              : "Preencha os detalhes para atrair os melhores candidatos"}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 24px" }}>
        {/* Passos (stepper) */}
        <div
          style={{
            background: "white",
            border: "1px solid #E9ECEF",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {STEPS.map((s, i) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  alignItems: "center",
                  flex: i < STEPS.length - 1 ? 1 : undefined,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      background: i < step ? B : i === step ? B : "#F1F3F5",
                      color: i <= step ? "white" : "#ADB5BD",
                      transition: "all 0.2s",
                    }}
                  >
                    {i < step ? <CheckCircle size={16} /> : i + 1}
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: i === step ? 600 : 400,
                      color: i === step ? B : "#6C757D",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {s}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    style={{
                      flex: 1,
                      height: 2,
                      background: i < step ? B : "#F1F3F5",
                      margin: "0 8px",
                      marginBottom: 18,
                      transition: "background 0.2s",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Área de importação de texto */}
        <div
          style={{
            background: "white",
            border: "1px solid #E9ECEF",
            borderRadius: 14,
            padding: "20px 24px",
            marginBottom: 20,
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0A2540", marginBottom: 6 }}>
                Importar texto da vaga
              </div>
              <div style={{ fontSize: 13, color: "#6C757D", maxWidth: 640 }}>
                Cole aqui o anúncio da vaga encontrado e tente preencher automaticamente os campos do formulário.
              </div>
            </div>
            <button
              onClick={importFromText}
              style={{
                padding: "10px 20px",
                background: `linear-gradient(135deg, ${B}, ${BD})`,
                color: "white",
                border: "none",
                borderRadius: 99,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Importar automaticamente
            </button>
          </div>
          <textarea
            style={{
              width: "100%",
              minHeight: 140,
              padding: "14px 16px",
              marginTop: 18,
              border: "1.5px solid #DEE2E6",
              borderRadius: 14,
              resize: "vertical",
              fontSize: 13,
              fontFamily: "'DM Sans', sans-serif",
              color: "#212529",
            }}
            placeholder="Cole aqui o texto completo do anúncio de vaga..."
            value={rawText}
            onChange={(e) => {
              setRawText(e.target.value);
              setImportMessage("");
            }}
          />
          {importMessage && (
            <div
              style={{
                marginTop: 12,
                fontSize: 13,
                color: importMessage.includes("sucesso") ? "#0B6E4F" : "#A32D2D",
              }}
            >
              {importMessage}
            </div>
          )}
        </div>

        {/* Card do formulário */}
        <div
          style={{
            background: "white",
            border: "1px solid #E9ECEF",
            borderRadius: 14,
            padding: "28px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {error && (
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                padding: "10px 14px",
                background: "#FCEBEB",
                borderRadius: 10,
                marginBottom: 20,
                border: "1px solid #F09595",
              }}
            >
              <AlertCircle size={15} color="#A32D2D" style={{ flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 13, color: "#A32D2D" }}>{error}</span>
            </div>
          )}

          {/* Step 0 - Informações Básicas */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <Label>Título da Vaga *</Label>
                <Input field="titulo" placeholder="Ex: Desenvolvedor Full Stack React" />
              </div>
              <div>
                <Label>Nome da Empresa *</Label>
                <Input field="empresa_nome" placeholder="Ex: TechMoz Lda." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <Label>Categoria *</Label>
                  <Select field="categoria" options={CATEGORIAS} placeholder="Seleccione..." />
                </div>
                <div>
                  <Label>Tipo de Contrato *</Label>
                  <Select field="tipo" options={TIPOS} placeholder="Seleccione..." />
                </div>
              </div>
              <div>
                <Label>Localização *</Label>
                <Select field="localizacao" options={PROVINCIAS} placeholder="Seleccione a província..." />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <Label>Salário Mínimo (MZN)</Label>
                  <Input field="salario_min" placeholder="Ex: 40000" type="number" />
                </div>
                <div>
                  <Label>Salário Máximo (MZN)</Label>
                  <Input field="salario_max" placeholder="Ex: 80000" type="number" />
                </div>
              </div>
              <div>
                <Label>Prazo de Candidatura</Label>
                <Input field="prazo" placeholder="" type="date" />
              </div>
            </div>
          )}

          {/* Step 1 - Descrição */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <Label>Descrição da Vaga *</Label>
                <textarea
                  rows={6}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1.5px solid #DEE2E6",
                    borderRadius: 10,
                    fontSize: 14,
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#212529",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                  placeholder="Descreva a vaga, o ambiente de trabalho, missão da empresa e o que torna esta oportunidade especial..."
                  value={form.descricao}
                  onChange={(e) => setField("descricao", e.target.value)}
                  onFocus={(e) => (e.currentTarget.style.borderColor = B)}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#DEE2E6")}
                />
                <div style={{ fontSize: 11, color: "#ADB5BD", marginTop: 4 }}>
                  {form.descricao.length} caracteres
                </div>
              </div>
              <ListInput field="responsabilidades" label="Responsabilidades" placeholder="Ex: Desenvolver e manter aplicações web..." />
              <ListInput field="beneficios" label="Benefícios" placeholder="Ex: Seguro de saúde, 14 dias de férias..." />
            </div>
          )}

          {/* Step 2 - Requisitos e Skills */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <ListInput field="requisitos" label="Requisitos" placeholder="Ex: 3+ anos de experiência em React..." />
              <ListInput field="skills" label="Skills / Tecnologias" placeholder="Ex: React, Node.js, PostgreSQL..." />
              <div
                style={{
                  padding: 16,
                  background: BL,
                  borderRadius: 12,
                  border: `1px solid ${B}30`,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: BD,
                    marginBottom: 8,
                    fontFamily: "'Sora', sans-serif",
                  }}
                >
                  💡 Dica para atrair mais candidatos
                </div>
                <div style={{ fontSize: 13, color: B, lineHeight: 1.6 }}>
                  Vagas com skills específicas recebem <strong>47% mais candidaturas</strong>. Adicione pelo menos 3-5
                  skills relevantes.
                </div>
              </div>
            </div>
          )}

          {/* Step 3 - Revisão */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div
                style={{
                  fontFamily: "'Sora', sans-serif",
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#0A2540",
                  marginBottom: 4,
                }}
              >
                Revisão final
              </div>

              <div
                style={{
                  background: "#F8F9FA",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                <div style={{ fontFamily: "'Sora', sans-serif", fontSize: 18, fontWeight: 800, color: "#0A2540" }}>
                  {form.titulo || "—"}
                </div>
                <div style={{ fontSize: 14, color: B, fontWeight: 600 }}>{form.empresa_nome}</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {[form.localizacao, form.tipo, form.categoria].filter(Boolean).map((v) => (
                    <span
                      key={v}
                      style={{
                        fontSize: 11,
                        padding: "3px 10px",
                        borderRadius: 99,
                        background: BL,
                        color: B,
                        fontWeight: 600,
                      }}
                    >
                      {v}
                    </span>
                  ))}
                </div>
                {(form.salario_min || form.salario_max) && (
                  <div style={{ fontSize: 15, fontWeight: 800, color: B, fontFamily: "'Sora', sans-serif" }}>
                    {form.salario_min && parseInt(form.salario_min).toLocaleString("pt-MZ")} –{" "}
                    {form.salario_max && parseInt(form.salario_max).toLocaleString("pt-MZ")} MZN
                  </div>
                )}
              </div>

              {form.descricao && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 6 }}>Descrição</div>
                  <div style={{ fontSize: 13, color: "#6C757D", lineHeight: 1.7 }}>
                    {form.descricao.slice(0, 200)}
                    {form.descricao.length > 200 ? "..." : ""}
                  </div>
                </div>
              )}

              {form.skills.filter((s) => s.trim()).length > 0 && (
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#495057", marginBottom: 8 }}>Skills</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {form.skills
                      .filter((s) => s.trim())
                      .map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 12,
                            padding: "4px 10px",
                            borderRadius: 99,
                            background: BL,
                            color: B,
                            fontWeight: 500,
                          }}
                        >
                          {s}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              <div
                style={{
                  padding: 14,
                  background: "#E1F5EE",
                  borderRadius: 10,
                  border: "1px solid #065F46" + "30",
                  fontSize: 13,
                  color: "#065F46",
                  lineHeight: 1.6,
                }}
              >
                ✓ Ao publicar, a vaga ficará imediatamente visível para todos os profissionais registados na Drielle.
              </div>
            </div>
          )}

          {/* Navegação entre passos */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 28,
              paddingTop: 20,
              borderTop: "1px solid #F1F3F5",
            }}
          >
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              style={{
                visibility: step === 0 ? "hidden" : "visible",
                padding: "10px 20px",
                background: "white",
                color: "#495057",
                border: "1.5px solid #DEE2E6",
                borderRadius: 99,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              ← Anterior
            </button>
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => {
                  if (step === 0 && (!form.titulo || !form.empresa_nome || !form.categoria || !form.tipo || !form.localizacao)) {
                    setError("Preencha todos os campos obrigatórios (*)");
                    return;
                  }
                  setError("");
                  setStep((s) => s + 1);
                }}
                style={{
                  padding: "10px 24px",
                  background: `linear-gradient(135deg, ${B}, ${BD})`,
                  color: "white",
                  border: "none",
                  borderRadius: 99,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: `0 4px 12px rgba(26,107,181,0.3)`,
                }}
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  padding: "10px 28px",
                  background: loading ? "#ADB5BD" : `linear-gradient(135deg, ${B}, ${BD})`,
                  color: "white",
                  border: "none",
                  borderRadius: 99,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid white",
                        borderTopColor: "transparent",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                      }}
                    />
                    A publicar...
                  </>
                ) : (
                  "Publicar Vaga ✓"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
