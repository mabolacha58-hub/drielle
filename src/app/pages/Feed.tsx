import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { Send, ThumbsUp, MessageCircle, Share2, MoreHorizontal, Bookmark, Briefcase, ShoppingBag, Globe, TrendingUp, UserPlus, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { getSuggestedProfiles, getVagas, getProdutos, getPosts } from "../../lib/api";

const B = "#1A6BB5", BD = "#0D3B6E", BDK = "#0A2540", BL = "#E8F3FC", GOLD = "#F5A623";
const COLORS = ["#1A6BB5","#E24B4A","#0D3B6E","#D97706","#7C3AED","#059669","#DB2777","#0F766E"];
function getColor(s: string) { let h=0; for(let i=0;i<s.length;i++) h=s.charCodeAt(i)+((h<<5)-h); return COLORS[Math.abs(h)%COLORS.length]; }
function getInitials(n: string) { return (n||"U").split(" ").map(x=>x[0]).slice(0,2).join("").toUpperCase(); }
function timeAgo(d: string) {
  const diff = (Date.now()-new Date(d).getTime())/1000;
  if(diff<60) return "agora";
  if(diff<3600) return `${Math.floor(diff/60)}m`;
  if(diff<86400) return `${Math.floor(diff/3600)}h`;
  return new Date(d).toLocaleDateString("pt-PT");
}

const TIPO_CONFIG: Record<string,{label:string;bg:string;color:string}> = {
  vaga:    { label:"Vaga",    bg:BL,       color:BD },
  produto: { label:"Serviço", bg:"#FEF3DC", color:"#92400E" },
  post:    { label:"Post",    bg:"#E1F5EE", color:"#065F46" },
};

export function Feed() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [postText, setPostText] = useState("");
  const [postType, setPostType] = useState<"post"|"vaga"|"produto">("post");
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"todos"|"vagas"|"servicos"|"posts">("todos");
  const [expandedPost, setExpandedPost] = useState<string|null>(null);
  const [commentText, setCommentText] = useState<Record<string,string>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPosts();
      const withMeta = await Promise.all((data||[]).map(async p => {
        const [{ count: likes }, { count: comments }, likedRow] = await Promise.all([
          supabase.from("post_likes").select("id",{count:"exact"}).eq("post_id",p.id),
          supabase.from("post_comentarios").select("id",{count:"exact"}).eq("post_id",p.id),
          user?.id ? supabase.from("post_likes").select("id").eq("post_id",p.id).eq("user_id",user.id).maybeSingle() : Promise.resolve({data:null}),
        ]);
        return { ...p, likes:likes||0, comments:comments||0, liked:!!likedRow.data };
      }));
      setPosts(withMeta);
    } catch(e){ console.error(e); }
    finally{ setLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    loadFeed();
    if(user?.id) getSuggestedProfiles(user.id).then(d=>setSuggested(d.slice(0,4))).catch(console.error);
    getVagas().then(d=>setRecentJobs(d.slice(0,3))).catch(console.error);
    getProdutos().then(d=>setRecentProducts(d.slice(0,2))).catch(console.error);
  }, [user?.id, loadFeed]);

  async function handlePost() {
    if(!user?.id||!postText.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from("posts").insert({ autor_id:user.id, texto:postText.trim(), tipo:postType });
      setPostText("");
      await loadFeed();
    } catch(e){ console.error(e); }
    finally{ setSubmitting(false); }
  }

  async function handleLike(postId: string) {
    if(!user?.id) return;
    const post = posts.find(p=>p.id===postId);
    if(!post) return;
    const wasLiked = post.liked;
    setPosts(ps=>ps.map(p=>p.id===postId?{...p,liked:!wasLiked,likes:wasLiked?p.likes-1:p.likes+1}:p));
    if(wasLiked) await supabase.from("post_likes").delete().eq("post_id",postId).eq("user_id",user.id);
    else await supabase.from("post_likes").insert({ post_id:postId, user_id:user.id });
  }

  async function handleComment(postId: string) {
    if(!user?.id||!commentText[postId]?.trim()) return;
    await supabase.from("post_comentarios").insert({ post_id:postId, autor_id:user.id, texto:commentText[postId].trim() });
    setCommentText(c=>({...c,[postId]:""}));
    setPosts(ps=>ps.map(p=>p.id===postId?{...p,comments:p.comments+1}:p));
  }

  const filtered = posts.filter(p => activeTab==="todos" || (activeTab==="vagas"&&p.tipo==="vaga") || (activeTab==="servicos"&&p.tipo==="produto") || (activeTab==="posts"&&p.tipo==="post"));

  return (
    <div style={{ background:"#F4F6F9", minHeight:"100vh", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"clamp(12px,3vw,24px) clamp(12px,3vw,20px)" }}>
        <div className="feed-layout" style={{ display:"grid", gridTemplateColumns:"260px 1fr 260px", gap:16, alignItems:"start" }}>

          {/* ── Left sidebar — hidden mobile ── */}
          <div className="feed-sidebar-left" style={{ display:"flex", flexDirection:"column", gap:14, position:"sticky", top:72 }}>
            <div style={{ background:"white", border:"1px solid #E9ECEF", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ height:60, background:`linear-gradient(135deg,${BD},${B})` }}/>
              <div style={{ padding:"0 16px 18px" }}>
                <div style={{ marginTop:-26, marginBottom:10 }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:profile?getColor(profile.nome||""):B, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:16, fontWeight:800, color:"white", border:"3px solid white" }}>
                    {getInitials(profile?.nome||"U")}
                  </div>
                </div>
                <div style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:BDK, marginBottom:2 }}>{profile?.nome||"Utilizador"}</div>
                <div style={{ fontSize:12, color:"#6C757D", marginBottom:12 }}>{profile?.titulo||"Membro Drielle"}</div>
                <div style={{ borderTop:"1px solid #F1F3F5", paddingTop:10, display:"flex", flexDirection:"column", gap:8 }}>
                  {[["Visualizações","136"],["Conexões","142"]].map(([l,v])=>(
                    <div key={l} style={{ display:"flex", justifyContent:"space-between", fontSize:12 }}>
                      <span style={{ color:"#6C757D" }}>{l}</span>
                      <span style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, color:B }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background:"white", border:"1px solid #E9ECEF", borderRadius:14, padding:14, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:700, color:BDK, marginBottom:10, textTransform:"uppercase" as const, letterSpacing:"0.5px" }}>Acesso Rápido</div>
              {[
                { icon:Briefcase, label:"Publicar Vaga", to:"/publicar-vaga", color:B },
                { icon:ShoppingBag, label:"Publicar Serviço", to:"/publicar-servico", color:"#D97706" },
                { icon:TrendingUp, label:"Dashboard", to:"/dashboard", color:"#059669" },
              ].map(({ icon:Icon, label, to, color })=>(
                <Link key={to} to={to} style={{ textDecoration:"none" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 8px", borderRadius:8, cursor:"pointer", marginBottom:2, transition:"all 0.12s" }}
                    onMouseOver={e=>(e.currentTarget as HTMLElement).style.background="#F8F9FA"}
                    onMouseOut={e=>(e.currentTarget as HTMLElement).style.background="transparent"}
                  >
                    <div style={{ width:30, height:30, borderRadius:7, background:`${color}15`, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon size={14} color={color}/></div>
                    <span style={{ fontSize:13, fontWeight:500, color:"#495057" }}>{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Feed central ── */}
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>

            {/* Compose */}
            {user && (
              <div style={{ background:"white", border:"1px solid #E9ECEF", borderRadius:14, padding:"clamp(14px,3vw,18px)", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", gap:10, marginBottom:12 }}>
                  <div style={{ width:38, height:38, borderRadius:"50%", background:getColor(profile?.nome||""), display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:12, fontWeight:800, color:"white", flexShrink:0 }}>
                    {getInitials(profile?.nome||"U")}
                  </div>
                  <textarea ref={textareaRef}
                    style={{ flex:1, padding:"9px 13px", border:"1.5px solid #DEE2E6", borderRadius:10, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#212529", outline:"none", resize:"none", lineHeight:1.6, minHeight:42, transition:"all 0.15s" }}
                    placeholder={postType==="vaga"?"Descreve a vaga...":postType==="produto"?"Descreve o teu serviço...":"Partilha algo com a tua rede..."}
                    value={postText} onChange={e=>setPostText(e.target.value)}
                    onFocus={e=>{ e.currentTarget.style.borderColor=B; e.currentTarget.style.minHeight="90px"; }}
                    onBlur={e=>{ if(!postText) e.currentTarget.style.minHeight="42px"; }}
                  />
                </div>
                <div className="feed-compose-actions" style={{ display:"flex", gap:6, flexWrap:"wrap", alignItems:"center" }}>
                  {([{v:"post",l:"Post",icon:Globe,c:"#059669"},{v:"vaga",l:"Vaga",icon:Briefcase,c:B},{v:"produto",l:"Serviço",icon:ShoppingBag,c:"#D97706"}] as const).map(({v,l,icon:Icon,c})=>(
                    <button key={v} onClick={()=>setPostType(v)} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 11px", borderRadius:99, fontSize:12, fontWeight:500, cursor:"pointer", border:"1.5px solid", borderColor:postType===v?c:"#DEE2E6", background:postType===v?`${c}12`:"transparent", color:postType===v?c:"#6C757D", fontFamily:"'DM Sans',sans-serif", transition:"all 0.15s" }}>
                      <Icon size={12}/>{l}
                    </button>
                  ))}
                  <button className="feed-publish-button" onClick={handlePost} disabled={!postText.trim()||submitting} style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6, padding:"7px 16px", borderRadius:99, fontSize:13, fontWeight:700, cursor:postText.trim()?"pointer":"not-allowed", background:postText.trim()?`linear-gradient(135deg,${B},${BD})`:"#E9ECEF", color:postText.trim()?"white":"#ADB5BD", border:"none", boxShadow:postText.trim()?`0 4px 12px rgba(26,107,181,0.3)`:"none", transition:"all 0.15s" }}>
                    <Send size={13}/>{submitting?"...":"Publicar"}
                  </button>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div style={{ display:"flex", background:"white", border:"1px solid #E9ECEF", borderRadius:14, padding:4, gap:4, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              {([{v:"todos",l:"Tudo"},{v:"vagas",l:"Vagas"},{v:"servicos",l:"Serviços"},{v:"posts",l:"Posts"}] as const).map(({v,l})=>(
                <button key={v} onClick={()=>setActiveTab(v)} style={{ flex:1, padding:"8px 0", border:"none", borderRadius:10, cursor:"pointer", fontSize:"clamp(11px,2.5vw,13px)", fontWeight:500, fontFamily:"'DM Sans',sans-serif", background:activeTab===v?B:"transparent", color:activeTab===v?"white":"#6C757D", transition:"all 0.15s", boxShadow:activeTab===v?`0 4px 12px rgba(26,107,181,0.25)`:"none" }}>{l}</button>
              ))}
            </div>

            {/* Loading */}
            {loading&&<div style={{ display:"flex", justifyContent:"center", padding:"48px 0", flexDirection:"column", alignItems:"center", gap:12 }}><div style={{ width:36, height:36, border:`3px solid ${BL}`, borderTop:`3px solid ${B}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/><p style={{ fontSize:14, color:"#6C757D" }}>A carregar feed...</p></div>}

            {/* Empty */}
            {!loading&&filtered.length===0&&(
              <div style={{ background:"white", border:"1px solid #E9ECEF", borderRadius:14, padding:"clamp(32px,5vw,48px) clamp(16px,4vw,24px)", textAlign:"center", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize:36, marginBottom:14 }}>📭</div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontSize:17, fontWeight:700, color:BDK, marginBottom:8 }}>{user?"Ainda não há publicações":"Entra para ver o feed"}</h3>
                <p style={{ fontSize:13, color:"#6C757D", marginBottom:18, lineHeight:1.6 }}>
                  {user?"Sê o primeiro a partilhar algo!":"Cria uma conta para ver as publicações."}
                </p>
                {user?(
                  <button onClick={()=>textareaRef.current?.focus()} style={{ padding:"10px 22px", background:`linear-gradient(135deg,${B},${BD})`, color:"white", border:"none", borderRadius:99, fontSize:13, fontWeight:700, cursor:"pointer" }}>Criar publicação</button>
                ):(
                  <Link to="/login" style={{ textDecoration:"none" }}>
                    <button style={{ padding:"10px 22px", background:`linear-gradient(135deg,${B},${BD})`, color:"white", border:"none", borderRadius:99, fontSize:13, fontWeight:700, cursor:"pointer" }}>Entrar na plataforma</button>
                  </Link>
                )}
              </div>
            )}

            {/* Posts */}
            {!loading&&filtered.map(post=>{
              const autor = post.profiles;
              const cfg = TIPO_CONFIG[post.tipo]||TIPO_CONFIG.post;
              const isExpanded = expandedPost===post.id;
              const authorColor = getColor(autor?.nome||"");

              return (
                <div key={post.id} style={{ background:"white", border:"1px solid #E9ECEF", borderRadius:14, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)", transition:"box-shadow 0.15s" }}>
                  <div style={{ padding:"clamp(12px,3vw,16px) clamp(14px,3vw,18px) 12px", display:"flex", alignItems:"flex-start", gap:10 }}>
                    <div style={{ width:42, height:42, borderRadius:"50%", background:authorColor, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:800, color:"white", flexShrink:0 }}>{getInitials(autor?.nome||"U")}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap" }}>
                        <span style={{ fontFamily:"'Sora',sans-serif", fontSize:14, fontWeight:700, color:BDK }}>{autor?.nome||"Utilizador"}</span>
                        <span style={{ fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:99, background:cfg.bg, color:cfg.color }}>{cfg.label}</span>
                      </div>
                      <div style={{ fontSize:11, color:"#6C757D", marginTop:2 }}>
                        {autor?.titulo&&<span>{autor.titulo} · </span>}{timeAgo(post.created_at)}
                      </div>
                    </div>
                    <button style={{ background:"none", border:"none", cursor:"pointer", color:"#ADB5BD", padding:4, flexShrink:0 }}><MoreHorizontal size={16}/></button>
                  </div>

                  <div style={{ padding:"0 clamp(14px,3vw,18px) 12px" }}>
                    <p style={{ fontSize:14, color:"#212529", lineHeight:1.7, whiteSpace:"pre-wrap" }}>
                      {post.texto.length>280&&!isExpanded
                        ? <>{post.texto.slice(0,280)}<span style={{ color:"#ADB5BD" }}>...</span><button onClick={()=>setExpandedPost(post.id)} style={{ background:"none", border:"none", color:B, cursor:"pointer", fontSize:13, fontWeight:600, padding:"0 4px" }}>ver mais</button></>
                        : post.texto
                      }
                    </p>
                  </div>

                  {(post.likes>0||post.comments>0)&&(
                    <div style={{ padding:"0 clamp(14px,3vw,18px) 8px", display:"flex", gap:10, fontSize:12, color:"#6C757D" }}>
                      {post.likes>0&&<span style={{ display:"flex", alignItems:"center", gap:4 }}><span style={{ width:16, height:16, borderRadius:"50%", background:B, display:"inline-flex", alignItems:"center", justifyContent:"center" }}><ThumbsUp size={9} color="white" fill="white"/></span>{post.likes}</span>}
                      {post.comments>0&&<span style={{ marginLeft:"auto" }}>{post.comments} comentário{post.comments!==1?"s":""}</span>}
                    </div>
                  )}

                  <div style={{ borderTop:"1px solid #F1F3F5", display:"flex" }}>
                    {[
                      { icon:ThumbsUp, label:post.liked?"Gosto":"Gosto", action:()=>handleLike(post.id), active:post.liked },
                      { icon:MessageCircle, label:"Comentar", action:()=>setExpandedPost(isExpanded?null:post.id), active:false },
                      { icon:Share2, label:"Partilhar", action:()=>{}, active:false },
                    ].map(({icon:Icon,label,action,active})=>(
                      <button key={label} onClick={action} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:"clamp(3px,1vw,6px)", padding:"10px 0", background:"transparent", border:"none", cursor:"pointer", fontSize:"clamp(11px,2.5vw,13px)", fontWeight:500, color:active?B:"#6C757D", fontFamily:"'DM Sans',sans-serif", transition:"all 0.12s" }}
                        onMouseOver={e=>{(e.currentTarget as HTMLElement).style.background="#F8F9FA";(e.currentTarget as HTMLElement).style.color=B;}}
                        onMouseOut={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color=active?B:"#6C757D";}}
                      >
                        <Icon size={15} fill={active&&label==="Gosto"?B:"none"}/>{label}
                      </button>
                    ))}
                  </div>

                  {isExpanded&&user&&(
                    <div style={{ padding:"10px clamp(14px,3vw,18px)", borderTop:"1px solid #F1F3F5", display:"flex", gap:8, alignItems:"center" }}>
                      <div style={{ width:30, height:30, borderRadius:"50%", background:getColor(profile?.nome||""), display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:800, color:"white", fontFamily:"'Sora',sans-serif", flexShrink:0 }}>{getInitials(profile?.nome||"U")}</div>
                      <input style={{ flex:1, padding:"8px 13px", border:"1.5px solid #DEE2E6", borderRadius:99, fontSize:14, fontFamily:"'DM Sans',sans-serif", color:"#212529", outline:"none" }}
                        placeholder="Escreve um comentário..." value={commentText[post.id]||""} onChange={e=>setCommentText(c=>({...c,[post.id]:e.target.value}))}
                        onKeyDown={e=>{if(e.key==="Enter")handleComment(post.id);}}
                        onFocus={e=>e.currentTarget.style.borderColor=B} onBlur={e=>e.currentTarget.style.borderColor="#DEE2E6"}/>
                      <button onClick={()=>handleComment(post.id)} style={{ width:34, height:34, borderRadius:"50%", background:commentText[post.id]?.trim()?B:"#E9ECEF", border:"none", cursor:commentText[post.id]?.trim()?"pointer":"default", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.15s", flexShrink:0 }}>
                        <Send size={14} color={commentText[post.id]?.trim()?"white":"#ADB5BD"}/>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Right sidebar — hidden mobile ── */}
          <div className="feed-sidebar-right" style={{ display:"flex", flexDirection:"column", gap:14, position:"sticky", top:72 }}>
            {suggested.length>0&&(
              <div style={{ background:"white", border:"1px solid #E9ECEF", borderRadius:14, padding:16, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:BDK }}>Pessoas a conhecer</div>
                  <Link to="/vagas" style={{ textDecoration:"none", fontSize:11, color:B, fontWeight:500 }}>Ver mais</Link>
                </div>
                {suggested.map(p=>(
                  <div key={p.id} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                    <div style={{ width:36, height:36, borderRadius:"50%", background:getColor(p.nome||""), display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Sora',sans-serif", fontSize:11, fontWeight:800, color:"white", flexShrink:0 }}>{getInitials(p.nome||"U")}</div>
                    <div style={{ flex:1, overflow:"hidden" }}>
                      <div style={{ fontSize:13, fontWeight:600, color:BDK, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{p.nome}</div>
                      <div style={{ fontSize:11, color:"#6C757D", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>{p.titulo||p.role}</div>
                    </div>
                    <button style={{ width:28, height:28, borderRadius:"50%", background:BL, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}
                      onMouseOver={e=>(e.currentTarget as HTMLElement).style.background=B}
                      onMouseOut={e=>(e.currentTarget as HTMLElement).style.background=BL}
                    ><UserPlus size={13} color={B}/></button>
                  </div>
                ))}
              </div>
            )}

            {recentJobs.length>0&&(
              <div style={{ background:"white", border:"1px solid #E9ECEF", borderRadius:14, padding:16, boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
                  <div style={{ fontFamily:"'Sora',sans-serif", fontSize:13, fontWeight:700, color:BDK }}>Vagas recentes</div>
                  <Link to="/vagas" style={{ textDecoration:"none", fontSize:11, color:B, fontWeight:500 }}>Ver todas</Link>
                </div>
                {recentJobs.map(job=>(
                  <Link key={job.id} to={`/vagas/${job.id}`} style={{ textDecoration:"none" }}>
                    <div style={{ padding:"9px 10px", background:"#F8F9FA", borderRadius:9, cursor:"pointer", marginBottom:8, transition:"all 0.12s" }}
                      onMouseOver={e=>(e.currentTarget as HTMLElement).style.background=BL}
                      onMouseOut={e=>(e.currentTarget as HTMLElement).style.background="#F8F9FA"}
                    >
                      <div style={{ fontSize:12, fontWeight:600, color:BDK, marginBottom:2 }}>{job.titulo}</div>
                      <div style={{ fontSize:11, color:"#6C757D" }}>{job.empresa_nome}</div>
                      {(job.salario_min||job.salario_max)&&<div style={{ fontSize:11, color:B, fontWeight:600, marginTop:3 }}>{job.salario_min?.toLocaleString("pt-MZ")}–{job.salario_max?.toLocaleString("pt-MZ")} MZN</div>}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <div style={{ padding:"4px", fontSize:11, color:"#ADB5BD", lineHeight:1.8 }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"2px 8px" }}>
                {["Sobre","Ajuda","Privacidade","Termos"].map(l=><a key={l} href="#" style={{ color:"#ADB5BD", textDecoration:"none" }}>{l}</a>)}
              </div>
              <div style={{ marginTop:4 }}>Drielle © 2026 · Moçambique</div>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:640px){
          .feed-layout{grid-template-columns:1fr!important}
          .feed-sidebar-left,.feed-sidebar-right{display:none!important}
          .feed-compose-actions{align-items:stretch}
          .feed-publish-button{margin-left:0!important;width:100%;justify-content:center}
        }
      `}</style>
    </div>
  );
}
