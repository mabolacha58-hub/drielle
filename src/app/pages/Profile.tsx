import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Mail, Phone, Globe, Edit2, UserPlus, MessageCircle, Star, Briefcase, Award, Plus, X, Check, Camera, Save, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile, getAvaliacoes } from "../../lib/api";
import { supabase } from "../../lib/supabase";

const B = "#1A6BB5", BD = "#0D3B6E", BDK = "#0A2540", BL = "#E8F3FC", GOLD = "#F5A623";
const COLORS = ["#1A6BB5","#E24B4A","#0D3B6E","#D97706","#7C3AED","#059669","#DB2777","#0F766E"];
function getColor(s: string) { let h=0; for(let i=0;i<s.length;i++) h=s.charCodeAt(i)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }
function getInitials(n: string) { return (n||"U").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase(); }
function Stars({ n }: { n: number }) {
  return <div style={{ display:"flex",gap:2 }}>{Array.from({length:5},(_,i)=><Star key={i} size={13} fill={i<n?GOLD:"none"} color={i<n?GOLD:"#DEE2E6"}/>)}</div>;
}

const SKILLS_SUGERIDAS = ["React","Node.js","TypeScript","Python","Django","PostgreSQL","MongoDB","AWS","Git","Figma","Excel","Power BI","Marketing Digital","Gestão de Projectos","Contabilidade","Direito","Inglês","Francês"];

const inputSt: React.CSSProperties = { width:"100%",padding:"9px 14px",border:"1.5px solid #DEE2E6",borderRadius:10,fontSize:14,fontFamily:"'DM Sans',sans-serif",color:"#212529",background:"white",outline:"none",transition:"border-color 0.15s" };
const labelSt: React.CSSProperties = { display:"block",fontSize:12,fontWeight:600,color:"#495057",marginBottom:6 };

export function Profile() {
  const { id } = useParams();
  const { user, profile: myProfile } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [avaliacoes, setAvaliacoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skillInput, setSkillInput] = useState("");
  const avatarRef = useRef<HTMLInputElement>(null);

  const isOwner = !!user?.id && (user.id === id || id === "1");
  const profileId = isOwner ? user?.id : id;

  const [form, setForm] = useState({
    nome:"", titulo:"", localizacao:"", bio:"", website:"", telefone:"",
    skills:[] as string[],
    experiencia:[] as {empresa:string;cargo:string;periodo:string;desc:string}[],
    educacao:[] as {escola:string;grau:string;ano:string}[],
  });

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    Promise.all([getProfile(profileId!), getAvaliacoes(profileId!)])
      .then(([p, av]) => {
        setProfile(p);
        setAvaliacoes(av);
        setForm({ nome:p.nome||"", titulo:p.titulo||"", localizacao:p.localizacao||"", bio:p.bio||"", website:p.website||"", telefone:p.telefone||"", skills:p.skills||[], experiencia:p.experiencia||[], educacao:p.educacao||[] });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [profileId]);

  async function handleSave() {
    if (!user?.id) return;
    setSaving(true); setError(""); setSuccess("");
    try {
      await supabase.from("profiles").update({
        nome:form.nome, titulo:form.titulo, localizacao:form.localizacao,
        bio:form.bio, website:form.website, telefone:form.telefone,
        skills:form.skills, experiencia:form.experiencia, educacao:form.educacao,
      }).eq("id", user.id);
      setProfile((p: any) => ({ ...p, ...form }));
      setSuccess("Perfil actualizado com sucesso!");
      setEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (e: any) {
      setError(e.message || "Erro ao guardar.");
    } finally { setSaving(false); }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `avatars/${user.id}.${ext}`;
      await supabase.storage.from("avatars").upload(path, file, { upsert:true });
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      await supabase.from("profiles").update({ avatar_url:data.publicUrl }).eq("id", user.id);
      setProfile((p: any) => ({ ...p, avatar_url:data.publicUrl }));
    } catch (e) { console.error(e); }
    finally { setUploadingAvatar(false); }
  }

  const addSkill = (s: string) => { const t=s.trim(); if(t&&!form.skills.includes(t)) setForm(f=>({...f,skills:[...f.skills,t]})); setSkillInput(""); };
  const removeSkill = (s: string) => setForm(f=>({...f,skills:f.skills.filter(x=>x!==s)}));
  const addExp = () => setForm(f=>({...f,experiencia:[...f.experiencia,{empresa:"",cargo:"",periodo:"",desc:""}]}));
  const updExp = (i:number,k:string,v:string) => setForm(f=>({...f,experiencia:f.experiencia.map((e,idx)=>idx===i?{...e,[k]:v}:e)}));
  const rmExp = (i:number) => setForm(f=>({...f,experiencia:f.experiencia.filter((_,idx)=>idx!==i)}));
  const addEdu = () => setForm(f=>({...f,educacao:[...f.educacao,{escola:"",grau:"",ano:""}]}));
  const updEdu = (i:number,k:string,v:string) => setForm(f=>({...f,educacao:f.educacao.map((e,idx)=>idx===i?{...e,[k]:v}:e)}));
  const rmEdu = (i:number) => setForm(f=>({...f,educacao:f.educacao.filter((_,idx)=>idx!==i)}));

  if (loading) return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}>
      <div style={{width:36,height:36,border:`3px solid ${BL}`,borderTop:`3px solid ${B}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <p style={{fontSize:14,color:"#6C757D"}}>A carregar perfil...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!profile) return (
    <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16,padding:24}}>
      <div style={{fontSize:48}}>😕</div>
      <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:20,fontWeight:700,color:BDK}}>Perfil não encontrado</h2>
      <Link to="/" style={{textDecoration:"none"}}>
        <button style={{padding:"10px 24px",background:`linear-gradient(135deg,${B},${BD})`,color:"white",border:"none",borderRadius:99,fontSize:14,fontWeight:700,cursor:"pointer"}}>← Voltar</button>
      </Link>
    </div>
  );

  const avgRating = avaliacoes.length > 0 ? (avaliacoes.reduce((s,a)=>s+a.rating,0)/avaliacoes.length).toFixed(1) : null;
  const color = getColor(profile.nome||"");
  const initials = getInitials(profile.nome||"U");
  const completeness = [!!profile.avatar_url,!!profile.titulo,!!profile.bio,!!profile.localizacao,(profile.skills||[]).length>0,(profile.experiencia||[]).length>0,(profile.educacao||[]).length>0].filter(Boolean).length;

  return (
    <div style={{background:"#F4F6F9",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{maxWidth:900,margin:"0 auto",padding:"28px 20px"}}>

        {success && <div style={{display:"flex",gap:8,alignItems:"center",padding:"12px 16px",background:"#E1F5EE",border:"1px solid #06564630",borderRadius:12,marginBottom:16,fontSize:14,color:"#065F46",fontWeight:500}}><Check size={16}/>{success}</div>}
        {error && <div style={{display:"flex",gap:8,alignItems:"center",padding:"12px 16px",background:"#FCEBEB",border:"1px solid #F09595",borderRadius:12,marginBottom:16,fontSize:14,color:"#A32D2D"}}><AlertCircle size={16}/>{error}</div>}

        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20,alignItems:"start"}}>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>

            {/* Header */}
            <div style={{background:"white",border:"1px solid #E9ECEF",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{height:80,background:`linear-gradient(135deg,${BD},${B})`}}/>
              <div style={{padding:"0 24px 24px"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:16}}>
                  <div style={{position:"relative",marginTop:-40}}>
                    <div style={{width:80,height:80,borderRadius:"50%",background:profile.avatar_url?"transparent":color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Sora',sans-serif",fontSize:26,fontWeight:800,color:"white",border:"4px solid white",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.12)"}}>
                      {profile.avatar_url ? <img src={profile.avatar_url} alt={profile.nome} style={{width:"100%",height:"100%",objectFit:"cover"}}/> : initials}
                    </div>
                    {isOwner && (
                      <>
                        <button onClick={()=>avatarRef.current?.click()} disabled={uploadingAvatar} style={{position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:B,border:"2px solid white",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                          <Camera size={12} color="white"/>
                        </button>
                        <input ref={avatarRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleAvatarUpload}/>
                      </>
                    )}
                  </div>
                  <div style={{display:"flex",gap:8,paddingTop:8}}>
                    {isOwner ? (
                      editing ? (
                        <>
                          <button onClick={()=>{setEditing(false);setError("");}} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:"white",color:"#495057",border:"1.5px solid #DEE2E6",borderRadius:99,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                            <X size={14}/>Cancelar
                          </button>
                          <button onClick={handleSave} disabled={saving} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 18px",background:`linear-gradient(135deg,${B},${BD})`,color:"white",border:"none",borderRadius:99,fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 12px rgba(26,107,181,0.3)`}}>
                            {saving?<><div style={{width:14,height:14,border:"2px solid white",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.7s linear infinite"}}/>A guardar...</>:<><Save size={14}/>Guardar</>}
                          </button>
                        </>
                      ) : (
                        <button onClick={()=>setEditing(true)} style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:BL,color:B,border:"none",borderRadius:99,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                          <Edit2 size={14}/>Editar Perfil
                        </button>
                      )
                    ) : (
                      <>
                        <button style={{display:"flex",alignItems:"center",gap:6,padding:"8px 14px",background:"white",color:"#495057",border:"1.5px solid #DEE2E6",borderRadius:99,fontSize:13,fontWeight:600,cursor:"pointer"}}><MessageCircle size={14}/>Mensagem</button>
                        <button style={{display:"flex",alignItems:"center",gap:6,padding:"8px 16px",background:`linear-gradient(135deg,${B},${BD})`,color:"white",border:"none",borderRadius:99,fontSize:13,fontWeight:700,cursor:"pointer"}}><UserPlus size={14}/>Ligar</button>
                      </>
                    )}
                  </div>
                </div>

                {editing ? (
                  <div style={{display:"flex",flexDirection:"column",gap:14}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div><label style={labelSt}>Nome Completo</label><input style={inputSt} value={form.nome} onChange={e=>setForm(f=>({...f,nome:e.target.value}))} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                      <div><label style={labelSt}>Título / Cargo</label><input style={inputSt} placeholder="Ex: Engenheira de Software" value={form.titulo} onChange={e=>setForm(f=>({...f,titulo:e.target.value}))} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                      <div><label style={labelSt}>Localização</label><input style={inputSt} placeholder="Ex: Maputo" value={form.localizacao} onChange={e=>setForm(f=>({...f,localizacao:e.target.value}))} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                      <div><label style={labelSt}>Telefone</label><input style={inputSt} placeholder="+258 84 000 0000" value={form.telefone} onChange={e=>setForm(f=>({...f,telefone:e.target.value}))} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                    </div>
                    <div><label style={labelSt}>Website</label><input style={inputSt} placeholder="www.seusite.com" value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                    <div>
                      <label style={labelSt}>Biografia</label>
                      <textarea rows={4} style={{...inputSt,resize:"vertical",lineHeight:1.6}} placeholder="Apresente-se..." value={form.bio} onChange={e=>setForm(f=>({...f,bio:e.target.value}))} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/>
                      <div style={{fontSize:11,color:"#ADB5BD",marginTop:4}}>{form.bio.length}/500</div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:22,fontWeight:800,color:BDK,marginBottom:4}}>{profile.nome}</h1>
                    <div style={{fontSize:15,color:B,fontWeight:600,marginBottom:12}}>{profile.titulo||<span style={{color:"#ADB5BD",fontStyle:"italic",fontWeight:400}}>Sem título</span>}</div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:14,marginBottom:profile.bio?14:0}}>
                      {profile.localizacao&&<span style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:"#6C757D"}}><MapPin size={13} color="#ADB5BD"/>{profile.localizacao}</span>}
                      {profile.email&&<span style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:"#6C757D"}}><Mail size={13} color="#ADB5BD"/>{profile.email}</span>}
                      {profile.telefone&&<span style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:"#6C757D"}}><Phone size={13} color="#ADB5BD"/>{profile.telefone}</span>}
                      {profile.website&&<span style={{display:"flex",alignItems:"center",gap:5,fontSize:13,color:B}}><Globe size={13} color={B}/>{profile.website}</span>}
                    </div>
                    {profile.bio&&<p style={{fontSize:14,color:"#495057",lineHeight:1.8}}>{profile.bio}</p>}
                  </>
                )}
              </div>
            </div>

            {/* Skills */}
            <div style={{background:"white",border:"1px solid #E9ECEF",borderRadius:14,padding:22,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:BDK,marginBottom:14}}>Competências</h2>
              {editing ? (
                <div>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <input style={{...inputSt,flex:1}} placeholder="Adicionar competência..." value={skillInput} onChange={e=>setSkillInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addSkill(skillInput);}}}
                      onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/>
                    <button onClick={()=>addSkill(skillInput)} style={{padding:"9px 16px",background:BL,color:B,border:"none",borderRadius:10,fontSize:13,fontWeight:600,cursor:"pointer"}}>Adicionar</button>
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                    {SKILLS_SUGERIDAS.filter(s=>!form.skills.includes(s)).slice(0,8).map(s=>(
                      <button key={s} onClick={()=>addSkill(s)} style={{padding:"4px 10px",borderRadius:99,fontSize:11,border:"1.5px dashed #DEE2E6",background:"transparent",color:"#6C757D",cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>+ {s}</button>
                    ))}
                  </div>
                  <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                    {form.skills.map(s=>(
                      <span key={s} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 12px",borderRadius:99,background:BL,color:B,fontSize:13,fontWeight:500}}>
                        {s}<button onClick={()=>removeSkill(s)} style={{background:"none",border:"none",cursor:"pointer",color:B,padding:0,display:"flex"}}><X size={13}/></button>
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                  {(profile.skills||[]).map((s:string)=>(
                    <span key={s} style={{padding:"5px 14px",borderRadius:99,background:BL,color:B,fontSize:13,fontWeight:500}}>{s}</span>
                  ))}
                  {(!profile.skills||profile.skills.length===0)&&<span style={{fontSize:13,color:"#ADB5BD",fontStyle:"italic"}}>{isOwner?"Clica em 'Editar Perfil' para adicionar competências":"Sem competências listadas"}</span>}
                </div>
              )}
            </div>

            {/* Experiência */}
            <div style={{background:"white",border:"1px solid #E9ECEF",borderRadius:14,padding:22,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:BDK}}>Experiência Profissional</h2>
                {isOwner&&editing&&<button onClick={addExp} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:BL,color:B,border:"none",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer"}}><Plus size={13}/>Adicionar</button>}
              </div>
              {editing ? (
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {form.experiencia.map((exp,i)=>(
                    <div key={i} style={{padding:16,background:"#F8F9FA",borderRadius:12,position:"relative"}}>
                      <button onClick={()=>rmExp(i)} style={{position:"absolute",top:10,right:10,background:"#FCEBEB",border:"none",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={13} color="#E24B4A"/></button>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                        <div><label style={labelSt}>Cargo</label><input style={inputSt} placeholder="Ex: Dev Sénior" value={exp.cargo} onChange={e=>updExp(i,"cargo",e.target.value)} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                        <div><label style={labelSt}>Empresa</label><input style={inputSt} placeholder="Ex: TechMoz" value={exp.empresa} onChange={e=>updExp(i,"empresa",e.target.value)} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                      </div>
                      <div style={{marginBottom:10}}><label style={labelSt}>Período</label><input style={inputSt} placeholder="Ex: Jan 2022 – Presente" value={exp.periodo} onChange={e=>updExp(i,"periodo",e.target.value)} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                      <div><label style={labelSt}>Descrição</label><textarea rows={2} style={{...inputSt,resize:"vertical"}} placeholder="Responsabilidades..." value={exp.desc} onChange={e=>updExp(i,"desc",e.target.value)} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                    </div>
                  ))}
                  {form.experiencia.length===0&&<button onClick={addExp} style={{padding:14,border:"2px dashed #DEE2E6",borderRadius:12,background:"transparent",color:"#6C757D",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Plus size={16}/>Adicionar experiência</button>}
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:18}}>
                  {(profile.experiencia||[]).map((exp:any,i:number)=>(
                    <div key={i} style={{display:"flex",gap:14}}>
                      <div style={{width:42,height:42,borderRadius:11,background:BL,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Briefcase size={18} color={B}/></div>
                      <div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:700,color:BDK}}>{exp.cargo}</div>
                        <div style={{fontSize:13,color:B,fontWeight:600,marginBottom:2}}>{exp.empresa}</div>
                        <div style={{fontSize:12,color:"#ADB5BD",marginBottom:6}}>{exp.periodo}</div>
                        {exp.desc&&<div style={{fontSize:13,color:"#6C757D",lineHeight:1.6}}>{exp.desc}</div>}
                      </div>
                    </div>
                  ))}
                  {(!profile.experiencia||profile.experiencia.length===0)&&<span style={{fontSize:13,color:"#ADB5BD",fontStyle:"italic"}}>{isOwner?"Clica em 'Editar Perfil' para adicionar experiência":"Sem experiência listada"}</span>}
                </div>
              )}
            </div>

            {/* Educação */}
            <div style={{background:"white",border:"1px solid #E9ECEF",borderRadius:14,padding:22,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:BDK}}>Educação</h2>
                {isOwner&&editing&&<button onClick={addEdu} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:BL,color:B,border:"none",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer"}}><Plus size={13}/>Adicionar</button>}
              </div>
              {editing ? (
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {form.educacao.map((edu,i)=>(
                    <div key={i} style={{padding:14,background:"#F8F9FA",borderRadius:12,position:"relative"}}>
                      <button onClick={()=>rmEdu(i)} style={{position:"absolute",top:10,right:10,background:"#FCEBEB",border:"none",borderRadius:"50%",width:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}><X size={13} color="#E24B4A"/></button>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                        <div><label style={labelSt}>Grau / Curso</label><input style={inputSt} placeholder="Ex: Licenciatura" value={edu.grau} onChange={e=>updEdu(i,"grau",e.target.value)} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                        <div><label style={labelSt}>Escola / Universidade</label><input style={inputSt} placeholder="Ex: UEM" value={edu.escola} onChange={e=>updEdu(i,"escola",e.target.value)} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                      </div>
                      <div><label style={labelSt}>Ano</label><input style={inputSt} placeholder="Ex: 2018 – 2022" value={edu.ano} onChange={e=>updEdu(i,"ano",e.target.value)} onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/></div>
                    </div>
                  ))}
                  {form.educacao.length===0&&<button onClick={addEdu} style={{padding:14,border:"2px dashed #DEE2E6",borderRadius:12,background:"transparent",color:"#6C757D",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}><Plus size={16}/>Adicionar educação</button>}
                </div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {(profile.educacao||[]).map((edu:any,i:number)=>(
                    <div key={i} style={{display:"flex",gap:12}}>
                      <div style={{width:40,height:40,borderRadius:10,background:"#FEF3DC",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><Award size={18} color="#D97706"/></div>
                      <div>
                        <div style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:BDK}}>{edu.grau}</div>
                        <div style={{fontSize:13,color:"#6C757D"}}>{edu.escola}</div>
                        <div style={{fontSize:12,color:"#ADB5BD",marginTop:2}}>{edu.ano}</div>
                      </div>
                    </div>
                  ))}
                  {(!profile.educacao||profile.educacao.length===0)&&<span style={{fontSize:13,color:"#ADB5BD",fontStyle:"italic"}}>{isOwner?"Clica em 'Editar Perfil' para adicionar educação":"Sem educação listada"}</span>}
                </div>
              )}
            </div>

            {/* Avaliações */}
            {avaliacoes.length>0&&(
              <div style={{background:"white",border:"1px solid #E9ECEF",borderRadius:14,padding:22,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:700,color:BDK,marginBottom:16}}>Avaliações ({avaliacoes.length})</h2>
                <div style={{display:"flex",flexDirection:"column",gap:14}}>
                  {avaliacoes.map((av,i)=>(
                    <div key={i} style={{padding:14,background:"#F8F9FA",borderRadius:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                        <div style={{display:"flex",gap:10,alignItems:"center"}}>
                          <div style={{width:34,height:34,borderRadius:"50%",background:getColor(av.profiles?.nome||""),display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"white",fontFamily:"'Sora',sans-serif"}}>{getInitials(av.profiles?.nome||"U")}</div>
                          <div>
                            <div style={{fontSize:13,fontWeight:600,color:BDK}}>{av.profiles?.nome||"Utilizador"}</div>
                            <div style={{fontSize:11,color:"#ADB5BD"}}>{new Date(av.created_at).toLocaleDateString("pt-PT")}</div>
                          </div>
                        </div>
                        <Stars n={av.rating}/>
                      </div>
                      {av.comentario&&<p style={{fontSize:13,color:"#6C757D",lineHeight:1.6,margin:0}}>{av.comentario}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:"white",border:"1px solid #E9ECEF",borderRadius:14,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:BDK,marginBottom:14}}>Estatísticas</h3>
              {[["Visualizações","136",B],["Conexões","142",BD],["Avaliação",avgRating?`${avgRating} ★`:"—",GOLD]].map(([label,val,color])=>(
                <div key={label as string} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #F1F3F5"}}>
                  <span style={{fontSize:13,color:"#6C757D"}}>{label}</span>
                  <span style={{fontFamily:"'Sora',sans-serif",fontSize:17,fontWeight:800,color:color as string}}>{val}</span>
                </div>
              ))}
            </div>

            {isOwner&&(
              <div style={{background:"white",border:"1px solid #E9ECEF",borderRadius:14,padding:18,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:BDK,marginBottom:14}}>Completude do Perfil</h3>
                {[
                  {label:"Foto de perfil",done:!!profile.avatar_url},
                  {label:"Nome e título",done:!!profile.nome&&!!profile.titulo},
                  {label:"Biografia",done:!!profile.bio},
                  {label:"Localização",done:!!profile.localizacao},
                  {label:"Competências",done:(profile.skills||[]).length>0},
                  {label:"Experiência",done:(profile.experiencia||[]).length>0},
                  {label:"Educação",done:(profile.educacao||[]).length>0},
                ].map(({label,done})=>(
                  <div key={label} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <div style={{width:20,height:20,borderRadius:"50%",background:done?"#E1F5EE":"#F1F3F5",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {done?<Check size={12} color="#065F46"/>:<X size={12} color="#ADB5BD"/>}
                    </div>
                    <span style={{fontSize:13,color:done?"#212529":"#ADB5BD",textDecoration:done?"none":"line-through"}}>{label}</span>
                  </div>
                ))}
                <div style={{marginTop:14,padding:"10px 14px",background:BL,borderRadius:10}}>
                  <div style={{fontSize:12,fontWeight:600,color:B,marginBottom:6}}>{completeness}/7 concluídos</div>
                  <div style={{height:6,background:"rgba(26,107,181,0.15)",borderRadius:4}}>
                    <div style={{height:"100%",background:B,borderRadius:4,width:`${(completeness/7)*100}%`,transition:"width 0.4s"}}/>
                  </div>
                </div>
                {!editing&&(
                  <button onClick={()=>setEditing(true)} style={{width:"100%",marginTop:12,padding:"10px",background:`linear-gradient(135deg,${B},${BD})`,color:"white",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                    <Edit2 size={14}/>Editar Perfil
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
