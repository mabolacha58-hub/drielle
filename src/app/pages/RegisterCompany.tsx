import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Building2, MapPin, Globe, Phone, Mail,
  CheckCircle, ChevronRight, ChevronLeft, Users, Briefcase,
  BarChart2, Linkedin, Loader2, AlertCircle,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const STEPS = ["Informações", "Contacto", "Detalhes", "Confirmação"];

const SECTORS = [
  "Tecnologia", "Finanças & Banca", "Saúde", "Educação",
  "Construção & Engenharia", "Comércio & Retalho", "Consultoria",
  "Media & Comunicação", "Logística & Transporte", "Outro",
];
const SIZES = [
  "1–10 colaboradores", "11–50 colaboradores", "51–200 colaboradores",
  "201–500 colaboradores", "500+ colaboradores",
];
const PROVINCES = [
  "Maputo Cidade", "Maputo Província", "Gaza", "Inhambane", "Sofala",
  "Manica", "Tete", "Zambézia", "Nampula", "Cabo Delgado", "Niassa",
];

type FormState = {
  companyName: string; nuit: string; sector: string; size: string; founded: string;
  email: string; phone: string; website: string; province: string; city: string; address: string;
  description: string; linkedin: string; terms: boolean; newsletter: boolean;
};

const INIT: FormState = {
  companyName: "", nuit: "", sector: "", size: "", founded: "",
  email: "", phone: "", website: "", province: "", city: "", address: "",
  description: "", linkedin: "", terms: false, newsletter: false,
};

// ── Design tokens (azul profissional) ───────────────────────────────────────
const BLUE = "#1A56DB";
const BLUE_DARK = "#1E40AF";
const BLUE_LIGHT = "#EFF6FF";
const BLUE_BORDER = "#BFDBFE";
const BLUE_MID = "#60A5FA";
const BLUE_MUTED = "#93C5FD";

// ── Shared sub-components ───────────────────────────────────────────────────

const Label = ({ children, required }: { children: React.ReactNode; required?: boolean }) => (
  <label style={{ fontSize: 11, fontWeight: 500, color: "#374151", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
    {children}{required && <span style={{ color: "#E24B4A" }}> *</span>}
  </label>
);

const inputBase: React.CSSProperties = {
  width: "100%", height: 44, border: `1px solid ${BLUE_BORDER}`, borderRadius: 8,
  fontSize: 14, color: "#111827", background: "white", outline: "none",
  fontFamily: "inherit", padding: "0 14px", appearance: "none" as const,
};

function Input({ icon: Icon, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) {
  return (
    <div style={{ position: "relative" }}>
      {Icon && <Icon size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: BLUE_MUTED, pointerEvents: "none" }} />}
      <input {...props} style={{ ...inputBase, paddingLeft: Icon ? 38 : 14, ...props.style }}
        onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = `0 0 0 3px rgba(26,86,219,0.1)`; }}
        onBlur={e => { e.target.style.borderColor = BLUE_BORDER; e.target.style.boxShadow = "none"; }}
      />
    </div>
  );
}

function Select({ options, placeholder, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[]; placeholder: string }) {
  return (
    <select {...props} style={{
      ...inputBase, cursor: "pointer", paddingLeft: 14,
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2393C5FD' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
      backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
    }}>
      <option value="">{placeholder}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
    <Label required={required}>{label}</Label>
    {children}
  </div>
);

const grid2: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 };

// ── Steps ───────────────────────────────────────────────────────────────────

function Step0({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <StepHeader title="Informações básicas" sub="Dados principais da sua empresa para o perfil público." />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="Nome da empresa" required>
          <Input placeholder="Ex: TechMoz Lda." value={form.companyName} onChange={e => set("companyName", e.target.value)} />
        </Field>
        <Field label="NUIT" required>
          <Input placeholder="Ex: 400123456" value={form.nuit} onChange={e => set("nuit", e.target.value)} />
        </Field>
        <div style={grid2}>
          <Field label="Sector de actividade" required>
            <Select options={SECTORS} placeholder="Seleccione..." value={form.sector} onChange={e => set("sector", e.target.value)} />
          </Field>
          <Field label="Dimensão" required>
            <Select options={SIZES} placeholder="Seleccione..." value={form.size} onChange={e => set("size", e.target.value)} />
          </Field>
        </div>
        <Field label="Ano de fundação">
          <Input type="number" placeholder="Ex: 2018" min="1900" max="2026" value={form.founded} onChange={e => set("founded", e.target.value)} />
        </Field>
      </div>
    </>
  );
}

function Step1({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <StepHeader title="Contacto & localização" sub="Como as pessoas e candidatos podem encontrar a sua empresa." />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div style={grid2}>
          <Field label="Email institucional" required>
            <Input icon={Mail} type="email" placeholder="geral@empresa.co.mz" value={form.email} onChange={e => set("email", e.target.value)} />
          </Field>
          <Field label="Telefone" required>
            <Input icon={Phone} placeholder="+258 21 000 000" value={form.phone} onChange={e => set("phone", e.target.value)} />
          </Field>
        </div>
        <Field label="Website">
          <Input icon={Globe} placeholder="www.suaempresa.co.mz" value={form.website} onChange={e => set("website", e.target.value)} />
        </Field>
        <div style={grid2}>
          <Field label="Província" required>
            <Select options={PROVINCES} placeholder="Seleccione..." value={form.province} onChange={e => set("province", e.target.value)} />
          </Field>
          <Field label="Cidade" required>
            <Input icon={MapPin} placeholder="Ex: Maputo" value={form.city} onChange={e => set("city", e.target.value)} />
          </Field>
        </div>
        <Field label="Endereço">
          <Input placeholder="Av. 25 de Setembro, nº 123" value={form.address} onChange={e => set("address", e.target.value)} />
        </Field>
      </div>
    </>
  );
}

function Step2({ form, set }: { form: FormState; set: (k: keyof FormState, v: string) => void }) {
  return (
    <>
      <StepHeader title="Detalhes da empresa" sub="Conte a sua história — apareça nos resultados de busca de candidatos." />
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <Field label="Descrição" required>
          <textarea
            rows={5} placeholder="Descreva a missão, produtos/serviços e cultura da sua empresa..."
            value={form.description} onChange={e => set("description", e.target.value)}
            style={{ ...inputBase, height: "auto", padding: "12px 14px", resize: "vertical", lineHeight: 1.6 }}
          />
          <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right", marginTop: 4 }}>{form.description.length}/500</div>
        </Field>
        <Field label="LinkedIn da empresa">
          <Input icon={Linkedin} placeholder="linkedin.com/company/suaempresa" value={form.linkedin} onChange={e => set("linkedin", e.target.value)} />
        </Field>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 24 }}>
        {[
          { Icon: Briefcase, title: "Vagas ilimitadas", sub: "Publique todas as oportunidades sem custo" },
          { Icon: Users, title: "15K+ talentos", sub: "Base de profissionais qualificados em Moçambique" },
          { Icon: BarChart2, title: "Dashboard", sub: "Estatísticas detalhadas de candidaturas" },
        ].map(({ Icon, title, sub }) => (
          <div key={title} style={{ background: BLUE_LIGHT, border: `1px solid ${BLUE_BORDER}`, borderRadius: 10, padding: 14 }}>
            <div style={{ width: 28, height: 28, background: BLUE, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
              <Icon size={14} color="white" />
            </div>
            <div style={{ fontSize: 12, fontWeight: 500, color: BLUE_DARK, marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 11, color: BLUE_MID, lineHeight: 1.4, fontWeight: 300 }}>{sub}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function Step3({ form, set }: { form: FormState; set: (k: keyof FormState, v: boolean) => void }) {
  const rows: [string, string][] = [
    ["Empresa", form.companyName], ["NUIT", form.nuit], ["Sector", form.sector],
    ["Dimensão", form.size], ["Email", form.email], ["Telefone", form.phone],
    ["Localização", [form.city, form.province].filter(Boolean).join(", ")],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <StepHeader title="Confirmação" sub="Reveja os dados antes de concluir o registo." />
      <div style={{ background: "#F0F5FF", border: `1px solid ${BLUE_BORDER}`, borderRadius: 10, padding: "4px 16px", marginBottom: 24 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${BLUE_BORDER}`, fontSize: 13 }}>
            <span style={{ color: "#6B7280" }}>{k}</span>
            <span style={{ color: "#111827", fontWeight: 500, textAlign: "right", maxWidth: "60%" }}>{v}</span>
          </div>
        ))}
      </div>
      {[
        { id: "terms", field: "terms" as const, label: <>Concordo com os <a href="#" style={{ color: BLUE }}>Termos de Uso</a> e confirmo que os dados fornecidos são verdadeiros.</>, required: true },
        { id: "newsletter", field: "newsletter" as const, label: "Quero receber dicas e novidades da Drielle por email." },
      ].map(({ id, field, label, required }) => (
        <label key={id} style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginBottom: 12 }}>
          <input type="checkbox" id={id} checked={form[field] as boolean} onChange={e => set(field, e.target.checked)}
            style={{ marginTop: 2, accentColor: BLUE, cursor: "pointer" }} />
          <span style={{ fontSize: 13, color: "#4B5563", lineHeight: 1.6, fontWeight: 300 }}>
            {label}{required && <span style={{ color: "#E24B4A" }}> *</span>}
          </span>
        </label>
      ))}
    </>
  );
}

function StepHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ fontFamily: "var(--d-font-h)", fontSize: 20, color: "#111827", fontWeight: 400, marginBottom: 4 }}>{title}</h2>
      <p style={{ fontSize: 14, color: "#6B7280", fontWeight: 300, lineHeight: 1.5 }}>{sub}</p>
    </div>
  );
}

// ── Success screen ───────────────────────────────────────────────────────────

function SuccessScreen({ companyName, onDashboard, onVaga }: { companyName: string; onDashboard: () => void; onVaga: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 20px", textAlign: "center" }}>
      <div style={{ width: 72, height: 72, borderRadius: "50%", background: BLUE_LIGHT, border: `2px solid ${BLUE_BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
        <CheckCircle size={32} color={BLUE} />
      </div>
      <h1 style={{ fontFamily: "var(--d-font-h)", fontSize: 26, color: "#111827", fontWeight: 400, marginBottom: 10 }}>
        Empresa registada com sucesso!
      </h1>
      <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, maxWidth: 380, fontWeight: 300, marginBottom: 28 }}>
        A empresa <strong style={{ color: "#111827" }}>{companyName}</strong> foi registada na plataforma Drielle. A nossa equipa irá verificar os dados nas próximas 24–48 horas.
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button onClick={onDashboard} style={{ height: 44, padding: "0 24px", borderRadius: 8, border: "none", background: BLUE, color: "white", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          Ir ao Dashboard
        </button>
        <button onClick={onVaga} style={{ height: 44, padding: "0 24px", borderRadius: 8, border: `1px solid ${BLUE}`, background: "none", color: BLUE, fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
          Publicar Vaga
        </button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

export function RegisterCompany() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(INIT);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof FormState, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  async function handleSubmit() {
    if (!form.terms) return;
    setLoading(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setError("Sessão expirada. Por favor faça login novamente.");
      setLoading(false);
      return;
    }

    const { error: dbError } = await supabase.from("companies").insert({
      user_id: user.id,
      name: form.companyName,
      nuit: form.nuit,
      sector: form.sector,
      size: form.size,
      founded: form.founded ? parseInt(form.founded) : null,
      email: form.email,
      phone: form.phone,
      website: form.website || null,
      province: form.province,
      city: form.city,
      address: form.address || null,
      description: form.description,
      linkedin: form.linkedin || null,
      newsletter: form.newsletter,
      status: "pending",
    });

    if (dbError) {
      setError(
        dbError.message.includes("duplicate")
          ? "Esta empresa já está registada com este NUIT."
          : "Erro ao guardar os dados. Tente novamente."
      );
      setLoading(false);
      return;
    }

    // Actualizar o perfil do utilizador com role empresa
    await supabase.from("profiles").update({ role: "empresa", company_name: form.companyName }).eq("id", user.id);

    setDone(true);
    setLoading(false);
  }

  const stepContent = [
    <Step0 key={0} form={form} set={(k, v) => set(k, v)} />,
    <Step1 key={1} form={form} set={(k, v) => set(k, v)} />,
    <Step2 key={2} form={form} set={(k, v) => set(k, v)} />,
    <Step3 key={3} form={form} set={(k, v) => set(k, v as boolean)} />,
  ];

  const progressPct = [0, 33, 66, 100][step];

  if (done) return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px" }}>
      <div style={{ background: "white", border: "1px solid #E0E7F3", borderRadius: 16, padding: 32 }}>
        <SuccessScreen
          companyName={form.companyName}
          onDashboard={() => navigate("/dashboard")}
          onVaga={() => navigate("/publicar-vaga")}
        />
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 20px 60px", fontFamily: "var(--d-font-b)" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
        <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: BLUE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Building2 size={20} color="white" />
          </div>
          <span style={{ fontFamily: "var(--d-font-h)", fontSize: 20, color: "#111827" }}>
            Drielle<span style={{ color: "#FBBF24" }}>.</span>
          </span>
        </Link>
        <Link to="/" style={{ marginLeft: "auto", fontSize: 13, color: "#6B7280", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <ChevronLeft size={14} /> Voltar
        </Link>
      </div>

      {/* Stepper */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", position: "relative", marginBottom: 0 }}>
          {/* Track */}
          <div style={{ position: "absolute", top: 14, left: "12.5%", right: "12.5%", height: 1.5, background: BLUE_BORDER, zIndex: 0 }} />
          <div style={{ position: "absolute", top: 14, left: "12.5%", width: `${progressPct}%`, height: 1.5, background: BLUE, zIndex: 1, transition: "width 0.4s ease" }} />

          {STEPS.map((s, i) => (
            <div key={s} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, position: "relative", zIndex: 2 }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 500, transition: "all 0.2s",
                border: `2px solid ${i <= step ? BLUE : BLUE_BORDER}`,
                background: i <= step ? BLUE : "#F4F6FA",
                color: i <= step ? "white" : BLUE_MUTED,
              }}>
                {i < step ? <CheckCircle size={14} /> : i + 1}
              </div>
              <span style={{ fontSize: 11, color: i === step ? BLUE_DARK : BLUE_MUTED, fontWeight: i === step ? 500 : 400, textAlign: "center", lineHeight: 1.3 }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card */}
      <div style={{ background: "white", border: "1px solid #E0E7F3", borderRadius: 16, padding: 32 }}>
        {stepContent[step]}

        {/* Error banner */}
        {error && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, marginTop: 20, fontSize: 13, color: "#B91C1C" }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BLUE_BORDER}` }}>
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            style={{
              height: 40, padding: "0 18px", borderRadius: 8, border: `1px solid ${BLUE_BORDER}`,
              background: "none", color: "#6B7280", fontSize: 14, fontWeight: 500,
              cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit",
              visibility: step === 0 ? "hidden" : "visible",
            }}>
            <ChevronLeft size={14} /> Anterior
          </button>

          <span style={{ fontSize: 12, color: BLUE_MUTED }}>Passo {step + 1} de {STEPS.length}</span>

          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} style={{ height: 40, padding: "0 18px", borderRadius: 8, border: "none", background: BLUE, color: "white", fontSize: 14, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              Próximo <ChevronRight size={14} />
            </button>
          ) : (
            <button
              disabled={!form.terms || loading}
              onClick={handleSubmit}
              style={{ height: 40, padding: "0 18px", borderRadius: 8, border: "none", background: form.terms && !loading ? BLUE : BLUE_BORDER, color: "white", fontSize: 14, fontWeight: 500, cursor: form.terms && !loading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
              {loading
                ? <><Loader2 size={14} style={{ animation: "spin 0.7s linear infinite" }} /> A guardar...</>
                : <><CheckCircle size={14} /> Concluir Registo</>
              }
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
