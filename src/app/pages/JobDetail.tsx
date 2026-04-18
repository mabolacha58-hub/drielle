import { useParams, Link, useNavigate } from "react-router-dom";
import { MapPin, Briefcase, Clock, ArrowLeft, Share2, Bookmark, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getVagaById, createCandidatura, checkJaCandidatou, deleteVaga } from "../../lib/api";
import { useAuth } from "../context/AuthContext";

const B = "#1A6BB5", BD = "#0D3B6E", BL = "#E8F3FC", GOLD = "#F5A623";

export function JobDetail() {
  const { id } = useParams();
  const { user, profile, isAdmin } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [applied, setApplied] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    description: true,
    responsibilities: true,
    requirements: true,
    benefits: true
  });
  const [form, setForm] = useState({ nome: "", email: "", telefone: "", carta: "" });

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const data = await getVagaById(id!);
        setJob(data);
        if (user?.id) {
          const ja = await checkJaCandidatou(id!, user.id);
          setApplied(ja);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [id, user?.id]);

  const navigate = useNavigate();

  useEffect(() => {
    if (profile) setForm(f => ({ ...f, nome: profile.nome || "", email: profile.email || "", telefone: profile.telefone || "" }));
  }, [profile]);

  async function handleApply(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) { setError("Precisas de fazer login."); return; }
    setSubmitting(true); setError("");
    try {
      await createCandidatura({ vaga_id: id!, candidato_id: user.id, nome: form.nome, email: form.email, telefone: form.telefone, carta: form.carta });
      setApplied(true); setShowForm(false);
    } catch (e: any) {
      setError(e.message?.includes("unique") ? "Já te candidataste a esta vaga." : "Erro ao enviar. Tenta novamente.");
    } finally { setSubmitting(false); }
  }

  async function handleDelete() {
    if (!id) return;
    if (!window.confirm("Tens a certeza que queres apagar esta vaga? Esta ação não pode ser desfeita.")) return;
    try {
      await deleteVaga(id);
      navigate('/vagas');
    } catch (e: any) {
      setError("Não foi possível apagar a vaga. Tenta novamente.");
      console.error(e);
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (loading) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 40, height: 40, border: `3px solid ${BL}`, borderTop: `3px solid ${B}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 14, color: "#6C757D" }}>A carregar...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!job) return (
    <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16, padding: 24 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <h2 style={{ fontFamily: "'Sora', sans-serif", fontSize: 20, fontWeight: 700, color: "#0A2540" }}>Vaga não encontrada</h2>
      <Link to="/vagas" style={{ textDecoration: "none" }}>
        <button style={{ padding: "10px 24px", background: `linear-gradient(135deg,${B},${BD})`, color: "white", border: "none", borderRadius: 99, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>← Ver vagas</button>
      </Link>
    </div>
  );

  const COLORS = ["#1A6BB5","#E24B4A","#0D3B6E","#D97706","#7C3AED"];
  const color = COLORS[(job.empresa_nome || "").charCodeAt(0) % COLORS.length] || B;
  const initials = (job.empresa_nome || "EM").split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
  const isOwner = user?.id === job.empresa_id || profile?.id === job.empresa_id;
  const canDelete = isOwner || isAdmin;

  return (
    <div style={{ background: "#F4F6F9", minHeight: "100vh" }}>
      <div style={{ background: `linear-gradient(135deg,${BD},${B})`, padding: "20px 24px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <Link to="/vagas" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.7)", fontSize: 13 }}>
            <ArrowLeft size={15} /> Voltar às vagas
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 320px", gap: 24, alignItems: "start" }}>
        <style>{`
          @media (max-width: 768px) {
            div[style*="grid-template-columns"] {
              grid-template-columns: 1fr !important;
              gap: 20px !important;
            }
            div[style*="position: sticky"] {
              position: static !important;
            }
          }
        `}</style>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Header */}
          <div style={{ background: "white", border: "1px solid #E9ECEF", borderRadius: 16, padding: 28, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
              <div style={{ width: 72, height: 72, borderRadius: 16, background: color, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: "white", flexShrink: 0, boxShadow: `0 8px 20px ${color}40` }}>{initials}</div>
              <div style={{ flex: 1 }}>
                <h1 style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 800, color: "#0A2540", marginBottom: 6, lineHeight: 1.2 }}>{job.titulo}</h1>
                <div style={{ fontSize: 16, color: B, fontWeight: 600, marginBottom: 16 }}>{job.empresa_nome}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
                  {[[MapPin,job.localizacao],[Briefcase,job.tipo],[Clock,new Date(job.created_at).toLocaleDateString("pt-PT")]].map(([Icon,val],i)=>(
                    <span key={i} style={{ display:"flex",alignItems:"center",gap:6,fontSize:14,color:"#6C757D" }}><Icon size={14} color="#ADB5BD"/>{val as string}</span>
                  ))}
                </div>
              </div>
              <div style={{ display:"flex",gap:8, flexShrink: 0, flexDirection: "column", alignItems: "flex-end" }}>
                {canDelete && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {isOwner && (
                      <Link to={`/editar-vaga/${job.id}`} style={{ textDecoration: "none" }}>
                        <button style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #E9ECEF", background: "white", color: B, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                          <Edit2 size={14} /> Editar
                        </button>
                      </Link>
                    )}
                    <button onClick={handleDelete} style={{ padding: "10px 14px", borderRadius: 12, border: "1px solid #E9ECEF", background: "#FFE8E8", color: "#C92A2A", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                      <Trash2 size={14} /> Apagar
                    </button>
                  </div>
                )}
                <div style={{ display:"flex",gap:8 }}>
                  <button onClick={()=>setSaved(!saved)} style={{ width:40,height:40,borderRadius:"50%",border:"1px solid #E9ECEF",background:saved?"#FEF3DC":"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center", transition: "all 0.15s" }}>
                    <Bookmark size={16} fill={saved?GOLD:"none"} color={saved?GOLD:"#ADB5BD"}/>
                  </button>
                  <button style={{ width:40,height:40,borderRadius:"50%",border:"1px solid #E9ECEF",background:"white",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center", transition: "all 0.15s" }}>
                    <Share2 size={16} color="#ADB5BD"/>
                  </button>
                </div>
              </div>
            </div>
            {job.skills?.length>0&&(
              <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
                {job.skills.map((s:string)=><span key={s} style={{ fontSize:13,padding:"6px 14px",borderRadius:99,background:BL,color:B,fontWeight:500 }}>{s}</span>)}
              </div>
            )}
          </div>

          {/* Description */}
          {job.descricao&&(
            <div style={{ background:"white",border:"1px solid #E9ECEF",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              <button
                onClick={() => toggleSection('description')}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0A2540"
                }}
              >
                Sobre a Vaga
                {expandedSections.description ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.description && (
                <div style={{ padding: "0 24px 24px", borderTop: "1px solid #F1F3F5" }}>
                  <div style={{ fontSize: 15, color: "#495057", lineHeight: 1.7 }}>
                    {job.descricao.split("\n").map((p:string,i:number)=>p&&<p key={i} style={{ marginBottom: 12 }}>{p}</p>)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lists */}
          {[
            {title:"Responsabilidades",items:job.responsabilidades,key:"responsibilities",icon:<CheckCircle size={16} color={B} style={{flexShrink:0,marginTop:2}}/>},
            {title:"Requisitos",items:job.requisitos,key:"requirements",icon:<div style={{width:6,height:6,borderRadius:"50%",background:GOLD,flexShrink:0,marginTop:7}}/>},
          ].map(({title,items,key,icon})=>items?.length>0&&(
            <div key={title} style={{ background:"white",border:"1px solid #E9ECEF",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              <button
                onClick={() => toggleSection(key)}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0A2540"
                }}
              >
                {title}
                {expandedSections[key] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections[key] && (
                <div style={{ padding: "0 24px 24px", borderTop: "1px solid #F1F3F5" }}>
                  <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
                    {items.map((r:string,i:number)=>(
                      <div key={i} style={{ display:"flex",gap:12,fontSize:15,color:"#495057",lineHeight:1.6, alignItems: "flex-start" }}>{icon}<span>{r}</span></div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Benefits */}
          {job.beneficios?.length>0&&(
            <div style={{ background:"white",border:"1px solid #E9ECEF",borderRadius:16,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              <button
                onClick={() => toggleSection('benefits')}
                style={{
                  width: "100%",
                  padding: "20px 24px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontFamily: "'Sora',sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#0A2540"
                }}
              >
                Benefícios
                {expandedSections.benefits ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {expandedSections.benefits && (
                <div style={{ padding: "0 24px 24px", borderTop: "1px solid #F1F3F5" }}>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))",gap:12 }}>
                    {job.beneficios.map((b:string,i:number)=>(
                      <div key={i} style={{ display:"flex",gap:10,alignItems:"flex-start",padding:16,background:BL,borderRadius:12 }}>
                        <CheckCircle size={16} color={B} style={{flexShrink:0,marginTop:1}}/><span style={{ fontSize:14,color:BD,lineHeight:1.5 }}>{b}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form */}
          {showForm&&!applied&&(
            <div style={{ background:"white",border:"1px solid #E9ECEF",borderRadius:16,padding:28,boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
              <h2 style={{ fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:"#0A2540",marginBottom:20 }}>Formulário de Candidatura</h2>
              {error&&<div style={{ display:"flex",gap:8,padding:"12px 16px",background:"#FCEBEB",borderRadius:10,marginBottom:20,border:"1px solid #F09595" }}><AlertCircle size={16} color="#A32D2D"/><span style={{ fontSize:14,color:"#A32D2D" }}>{error}</span></div>}
              <form onSubmit={handleApply} style={{ display:"flex",flexDirection:"column",gap:16 }}>
                {[{label:"Nome",key:"nome",type:"text",ph:"João Silva"},{label:"Email",key:"email",type:"email",ph:"seu@email.com"},{label:"Telefone",key:"telefone",type:"tel",ph:"+258 84 000 0000"}].map(({label,key,type,ph})=>(
                  <div key={key}>
                    <label style={{ display:"block",fontSize:14,fontWeight:600,color:"#495057",marginBottom:8 }}>{label}</label>
                    <input style={{ width:"100%",padding:"12px 16px",border:"1.5px solid #DEE2E6",borderRadius:12,fontSize:15,fontFamily:"'DM Sans',sans-serif",color:"#212529",outline:"none" }}
                      type={type} placeholder={ph} value={(form as any)[key]} onChange={e=>setForm({...form,[key]:e.target.value})} required
                      onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/>
                  </div>
                ))}
                <div>
                  <label style={{ display:"block",fontSize:14,fontWeight:600,color:"#495057",marginBottom:8 }}>Carta de Apresentação</label>
                  <textarea style={{ width:"100%",padding:"12px 16px",border:"1.5px solid #DEE2E6",borderRadius:12,fontSize:15,fontFamily:"'DM Sans',sans-serif",color:"#212529",outline:"none",resize:"vertical",lineHeight:1.6 }}
                    rows={5} placeholder="Apresente-se e explique por que é o candidato ideal..." value={form.carta} onChange={e=>setForm({...form,carta:e.target.value})}
                    onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/>
                </div>
                <div style={{ display:"flex",gap:12, marginTop: 8 }}>
                  <button type="submit" disabled={submitting} style={{ flex:1,padding:"14px",background:submitting?"#ADB5BD":`linear-gradient(135deg,${B},${BD})`,color:"white",border:"none",borderRadius:99,fontSize:15,fontWeight:700,cursor:submitting?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    {submitting?<><div style={{width:18,height:18,border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>A enviar...</>:"Enviar Candidatura →"}
                  </button>
                  <button type="button" onClick={()=>setShowForm(false)} style={{ padding:"14px 20px",background:"white",color:"#495057",border:"1.5px solid #DEE2E6",borderRadius:99,fontSize:15,cursor:"pointer" }}>Cancelar</button>
                </div>
              </form>
            </div>
          )}

          {applied&&(
            <div style={{ padding:24,background:"#E1F5EE",borderRadius:16,border:"1px solid #06564630",display:"flex",gap:16,alignItems:"flex-start" }}>
              <CheckCircle size={28} color="#065F46" style={{flexShrink:0}}/>
              <div>
                <div style={{ fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:700,color:"#065F46",marginBottom:6 }}>Candidatura enviada!</div>
                <div style={{ fontSize:15,color:"#065F46",opacity:0.85 }}>A empresa irá analisar o seu perfil e entrará em contacto em breve.</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display:"flex",flexDirection:"column",gap:16, position: "sticky", top: 24 }}>
          <div style={{ background:"white",border:"1px solid #E9ECEF",borderRadius:16,padding:24,boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            {(job.salario_min||job.salario_max)&&(
              <>
                <div style={{ fontFamily:"'Sora',sans-serif",fontSize:24,fontWeight:800,color:B,marginBottom:4 }}>{job.salario_min?.toLocaleString("pt-MZ")} – {job.salario_max?.toLocaleString("pt-MZ")} MZN</div>
                <div style={{ fontSize:14,color:"#ADB5BD",marginBottom:20 }}>por mês · {job.localizacao}</div>
              </>
            )}
            {job.prazo&&<div style={{ fontSize:13,padding:"10px 14px",background:"#FEF3DC",borderRadius:10,color:"#92400E",marginBottom:20,fontWeight:500 }}>⏰ Prazo: {new Date(job.prazo).toLocaleDateString("pt-PT")}</div>}

            {!applied?(
              !user?(
                <Link to="/login" style={{ textDecoration:"none" }}>
                  <button style={{ width:"100%",padding:"14px",background:`linear-gradient(135deg,${B},${BD})`,color:"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10 }}>Entrar para Candidatar</button>
                </Link>
              ):(
                <button onClick={()=>setShowForm(!showForm)} style={{ width:"100%",padding:"14px",background:showForm?"#F1F3F5":`linear-gradient(135deg,${B},${BD})`,color:showForm?"#495057":"white",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"pointer",marginBottom:10,transition:"all 0.15s" }}>
                  {showForm?"Cancelar":"Candidatar-se Agora →"}
                </button>
              )
            ):(
              <button style={{ width:"100%",padding:"14px",background:"#E1F5EE",color:"#065F46",border:"none",borderRadius:12,fontSize:15,fontWeight:700,cursor:"default",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                <CheckCircle size={18}/>Candidatura Enviada
              </button>
            )}

            <button onClick={()=>setSaved(!saved)} style={{ width:"100%",padding:"12px",background:"white",color:saved?GOLD:"#495057",border:`1.5px solid ${saved?GOLD:"#DEE2E6"}`,borderRadius:12,fontSize:14,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              <Bookmark size={15} fill={saved?GOLD:"none"}/>{saved?"Guardado":"Guardar Vaga"}
            </button>
          </div>

          <div style={{ background:"white",border:"1px solid #E9ECEF",borderRadius:16,padding:24,boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:"#0A2540",marginBottom:16 }}>Sobre a Empresa</h3>
            <div style={{ display:"flex",gap:12,marginBottom:14 }}>
              <div style={{ width:48,height:48,borderRadius:12,background:color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:"white" }}>{initials}</div>
              <div><div style={{ fontSize:15,fontWeight:600,color:"#0A2540" }}>{job.empresa_nome}</div><div style={{ fontSize:13,color:"#6C757D" }}>{job.categoria}</div></div>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {[[MapPin,job.localizacao],[Briefcase,job.categoria]].map(([Icon,val],i)=>val&&(
                <div key={i} style={{ display:"flex",gap:10,alignItems:"center",fontSize:14,color:"#6C757D" }}><Icon size={14} color="#ADB5BD"/>{val as string}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
