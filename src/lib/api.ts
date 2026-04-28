import { supabase } from './supabase'

const DEMO_PROFILE = {
  id: 'demo-profile',
  nome: 'Conta Demo',
  avatar_url: null,
  localizacao: 'Maputo',
}

const DEMO_PRODUCTS = [
  {
    id: 'demo-product-1',
    vendedor_id: 'demo-seller-1',
    titulo: 'Lap Top em Promoção',
    descricao: 'Notebook empresarial em promoção, ideal para escritório, estudo e operações comerciais.',
    categoria: 'Software',
    preco: 28500,
    dias_entrega: 2,
    revisoes: 1,
    rating: 4.8,
    tags: ['Laptop', 'Promoção', 'Escritório'],
    imagem_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900',
    imagens_urls: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=900'],
    created_at: '2026-04-20T10:00:00.000Z',
    activo: true,
    profiles: { id: 'demo-seller-1', nome: 'Tech Store Maputo', avatar_url: null, localizacao: 'Maputo' },
  },
  {
    id: 'demo-product-2',
    vendedor_id: 'demo-seller-2',
    titulo: 'Consultoria Fiscal para PME',
    descricao: 'Sessão prática para organização tributária e calendário fiscal para pequenas e médias empresas.',
    categoria: 'Finanças',
    preco: 9500,
    dias_entrega: 3,
    revisoes: 2,
    rating: 4.7,
    tags: ['Fiscal', 'PME', 'Consultoria'],
    imagem_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900',
    imagens_urls: ['https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=900'],
    created_at: '2026-04-18T08:30:00.000Z',
    activo: true,
    profiles: { id: 'demo-seller-2', nome: 'Moz Finance Advisory', avatar_url: null, localizacao: 'Beira' },
  },
  {
    id: 'demo-product-3',
    vendedor_id: 'demo-seller-3',
    titulo: 'Branding Completo para Novos Negócios',
    descricao: 'Pacote com logo, paleta visual, templates de redes sociais e mini guia de marca.',
    categoria: 'Design',
    preco: 12000,
    dias_entrega: 5,
    revisoes: 4,
    rating: 4.9,
    tags: ['Branding', 'Logo', 'Social Media'],
    imagem_url: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=900',
    imagens_urls: ['https://images.unsplash.com/photo-1545239351-1141bd82e8a6?w=900'],
    created_at: '2026-04-16T14:45:00.000Z',
    activo: true,
    profiles: { id: 'demo-seller-3', nome: 'Studio Criativo 258', avatar_url: null, localizacao: 'Nampula' },
  },
]

const DEMO_JOBS = [
  {
    id: 'demo-job-1',
    empresa_id: 'demo-company-1',
    titulo: 'Assistente Administrativo',
    empresa_nome: 'Grupo Horizonte',
    localizacao: 'Maputo',
    tipo: 'Tempo Inteiro',
    categoria: 'Administracao',
    salario_min: 18000,
    salario_max: 24000,
    descricao: 'Estamos a reforçar a equipa administrativa com um perfil organizado e proactivo.',
    responsabilidades: ['Organizar documentos e expedientes', 'Acompanhar pagamentos e fornecedores'],
    requisitos: ['Experiência prévia em funções administrativas', 'Boa utilização de Excel'],
    beneficios: ['Subsídio de transporte', 'Formação interna'],
    skills: ['Excel', 'Organização', 'Comunicação'],
    prazo: '2026-05-20',
    created_at: '2026-04-21T09:00:00.000Z',
    activa: true,
    destaque: true,
    profiles: { ...DEMO_PROFILE, nome: 'Grupo Horizonte' },
  },
  {
    id: 'demo-job-2',
    empresa_id: 'demo-company-2',
    titulo: 'Técnico de Suporte Informático',
    empresa_nome: 'Inova Tech',
    localizacao: 'Beira',
    tipo: 'Hibrido',
    categoria: 'TI & Tecnologia',
    salario_min: 25000,
    salario_max: 35000,
    descricao: 'Responsável por suporte aos utilizadores e manutenção de equipamentos.',
    responsabilidades: ['Prestar suporte de primeiro nível', 'Instalar software e equipamentos'],
    requisitos: ['Conhecimentos de redes e hardware', 'Boa postura de atendimento'],
    beneficios: ['Seguro básico', 'Plano de carreira'],
    skills: ['Helpdesk', 'Redes', 'Windows'],
    prazo: '2026-05-18',
    created_at: '2026-04-19T12:15:00.000Z',
    activa: true,
    destaque: false,
    profiles: { ...DEMO_PROFILE, nome: 'Inova Tech', localizacao: 'Beira' },
  },
  {
    id: 'demo-job-3',
    empresa_id: 'demo-company-3',
    titulo: 'Gestor de Marketing Digital',
    empresa_nome: 'Mercado Central Media',
    localizacao: 'Remoto',
    tipo: 'Remoto',
    categoria: 'Marketing',
    salario_min: 30000,
    salario_max: 42000,
    descricao: 'Perfil estratégico para campanhas digitais, conteúdo comercial e análise de resultados.',
    responsabilidades: ['Planear campanhas de captação', 'Gerir redes sociais e anúncios'],
    requisitos: ['Experiência com Meta Ads e Google Ads', 'Boa escrita comercial'],
    beneficios: ['Modelo remoto', 'Bónus por metas'],
    skills: ['Meta Ads', 'Google Ads', 'Copywriting'],
    prazo: '2026-05-25',
    created_at: '2026-04-17T16:00:00.000Z',
    activa: true,
    destaque: true,
    profiles: { ...DEMO_PROFILE, nome: 'Mercado Central Media', localizacao: 'Remoto' },
  },
]

function mergeWithDemo<T extends { id: string }>(realItems: T[], demoItems: T[], minimum: number) {
  if (realItems.length >= minimum) return realItems
  const realIds = new Set(realItems.map((item) => item.id))
  const missing = demoItems.filter((item) => !realIds.has(item.id)).slice(0, minimum - realItems.length)
  return [...realItems, ...missing]
}

function normalizeSearchTerm(value?: string) {
  return (value || '').trim().toLowerCase()
}

function filterDemoJobs(filters?: { search?: string; category?: string; location?: string; type?: string }) {
  const term = normalizeSearchTerm(filters?.search)
  return DEMO_JOBS.filter((job) => {
    const matchesSearch = !term || [job.titulo, job.empresa_nome, job.descricao, ...(job.skills || [])].join(' ').toLowerCase().includes(term)
    const matchesCategory = !filters?.category || filters.category === 'Todas' || job.categoria === filters.category
    const matchesLocation = !filters?.location || filters.location === 'Todas' || job.localizacao === filters.location
    const matchesType = !filters?.type || filters.type === 'Todos' || job.tipo === filters.type
    return matchesSearch && matchesCategory && matchesLocation && matchesType
  })
}

function filterDemoProducts(filters?: { search?: string; category?: string; sort?: string }) {
  const term = normalizeSearchTerm(filters?.search)
  const filtered = DEMO_PRODUCTS.filter((product) => {
    const matchesSearch = !term || [product.titulo, product.descricao, product.categoria, product.profiles?.nome, ...(product.tags || [])].join(' ').toLowerCase().includes(term)
    const matchesCategory = !filters?.category || filters.category === 'Todos' || product.categoria === filters.category
    return matchesSearch && matchesCategory
  })
  return filtered.sort((a, b) => {
    if (filters?.sort === 'Menor preço') return (a.preco || 0) - (b.preco || 0)
    if (filters?.sort === 'Maior preço') return (b.preco || 0) - (a.preco || 0)
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  })
}

function normalizeImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim()
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) return parsed.filter((item): item is string => typeof item === 'string')
      } catch { /* fallback */ }
    }
    return [trimmed]
  }
  return []
}

function normalizeProduto<T extends Record<string, any>>(produto: T): T & { imagens_urls: string[]; imagem_url: string | null } {
  const imagens = normalizeImageUrls(produto.imagens_urls ?? produto.imagem_url)
  return { ...produto, imagens_urls: imagens, imagem_url: imagens[0] || null }
}

// ─────────────────────────────────────────
// VAGAS
// ─────────────────────────────────────────

export async function getVagas(filters?: { search?: string; category?: string; location?: string; type?: string }) {
  let query = supabase
    .from('vagas')
    .select(`*, profiles(nome, avatar_url)`)
    .eq('activa', true)
    .order('created_at', { ascending: false })

  if (filters?.search) query = query.or(`titulo.ilike.%${filters.search}%,empresa_nome.ilike.%${filters.search}%`)
  if (filters?.category && filters.category !== 'Todas') query = query.eq('categoria', filters.category)
  if (filters?.location && filters.location !== 'Todas') query = query.eq('localizacao', filters.location)
  if (filters?.type && filters.type !== 'Todos') query = query.eq('tipo', filters.type)

  const { data, error } = await query
  if (error) return filterDemoJobs(filters)

  return mergeWithDemo(data || [], filterDemoJobs(filters) as any[], 6)
}

export async function getVagaById(id: string) {
  const demoJob = DEMO_JOBS.find((job) => job.id === id)
  if (demoJob) return demoJob

  const { data, error } = await supabase
    .from('vagas')
    .select(`*, profiles(id, nome, avatar_url, website, telefone, localizacao)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createVaga(vaga: {
  empresa_id: string; titulo: string; empresa_nome: string; localizacao: string;
  tipo: string; categoria: string; salario_min?: number; salario_max?: number;
  descricao?: string; responsabilidades?: string[]; requisitos?: string[];
  beneficios?: string[]; skills?: string[]; prazo?: string;
}) {
  const { data, error } = await supabase.from('vagas').insert({ ...vaga, activa: true }).select().single()
  if (error) throw error
  return data
}

export async function deleteVaga(id: string) {
  const { error } = await supabase.from('vagas').delete().eq('id', id)
  if (error) throw error
}

export async function updateVaga(id: string, updates: {
  titulo?: string; empresa_nome?: string; localizacao?: string; tipo?: string;
  categoria?: string; salario_min?: number; salario_max?: number; descricao?: string;
  responsabilidades?: string[]; requisitos?: string[]; beneficios?: string[]; skills?: string[]; prazo?: string;
}) {
  const { data, error } = await supabase.from('vagas').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

// ─────────────────────────────────────────
// CANDIDATURAS
// ─────────────────────────────────────────

export async function createCandidatura(candidatura: {
  vaga_id: string; candidato_id: string; nome: string; email: string; telefone?: string; carta?: string;
}) {
  const { data, error } = await supabase.from('candidaturas').insert(candidatura).select().single()
  if (error) throw error
  return data
}

export async function getMyCandidaturas(candidato_id: string) {
  const { data, error } = await supabase
    .from('candidaturas')
    .select(`*, vagas(titulo, empresa_nome, localizacao, tipo)`)
    .eq('candidato_id', candidato_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getCandidaturasByVaga(vaga_id: string) {
  const { data, error } = await supabase
    .from('candidaturas')
    .select(`*, profiles(nome, avatar_url, titulo, localizacao)`)
    .eq('vaga_id', vaga_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateCandidaturaStatus(id: string, status: string) {
  const { error } = await supabase.from('candidaturas').update({ status }).eq('id', id)
  if (error) throw error
}

export async function checkJaCandidatou(vaga_id: string, candidato_id: string) {
  const { data } = await supabase
    .from('candidaturas').select('id').eq('vaga_id', vaga_id).eq('candidato_id', candidato_id).maybeSingle()
  return !!data
}

// ─────────────────────────────────────────
// PRODUTOS
// ─────────────────────────────────────────

export async function getProdutos(filters?: { search?: string; category?: string; sort?: string }) {
  let query = supabase
    .from('produtos')
    .select(`*, profiles(nome, avatar_url, localizacao)`)
    .or('activo.eq.true,activo.is.null')

  if (filters?.search) query = query.or(`titulo.ilike.%${filters.search}%`)
  if (filters?.category && filters.category !== 'Todos') query = query.eq('categoria', filters.category)

  if (filters?.sort === 'Menor preço') query = query.order('preco', { ascending: true })
  else if (filters?.sort === 'Maior preço') query = query.order('preco', { ascending: false })
  else query = query.order('created_at', { ascending: false })

  const { data, error } = await query
  if (error) return filterDemoProducts(filters).map(normalizeProduto)

  const real = (data || []).map(normalizeProduto)
  return mergeWithDemo(real, filterDemoProducts(filters).map(normalizeProduto) as any[], 6)
}

export async function getProdutoById(id: string) {
  const demoProduct = DEMO_PRODUCTS.find((p) => p.id === id)
  if (demoProduct) return normalizeProduto(demoProduct)

  const { data, error } = await supabase
    .from('produtos')
    .select(`*, profiles(id, nome, avatar_url, localizacao, created_at)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return normalizeProduto(data)
}

export async function createProduto(produto: {
  vendedor_id: string; titulo: string; descricao?: string; preco: number;
  categoria: string; tags?: string[]; dias_entrega?: number; revisoes?: number;
  imagem_url?: string; imagens_urls?: string[];
}) {
  const { data, error } = await supabase
    .from('produtos')
    .insert({ ...produto, activo: true })
    .select().single()
  if (error) throw error
  return data
}

export async function deleteProduto(id: string) {
  const { error } = await supabase.from('produtos').delete().eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────
// PERFIS
// ─────────────────────────────────────────

export async function getProfile(id: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function updateProfile(id: string, updates: {
  nome?: string; titulo?: string; localizacao?: string; bio?: string;
  website?: string; telefone?: string; avatar_url?: string;
}) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function getSuggestedProfiles(user_id: string) {
  const { data, error } = await supabase
    .from('profiles').select('id, nome, titulo, avatar_url, localizacao, role')
    .neq('id', user_id).limit(5).order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// ─────────────────────────────────────────
// MENSAGENS
// ─────────────────────────────────────────

export async function getConversations(user_id: string) {
  const { data, error } = await supabase
    .from('mensagens')
    .select(`*, de: de_id(id, nome, avatar_url, titulo), para: para_id(id, nome, avatar_url, titulo)`)
    .or(`de_id.eq.${user_id},para_id.eq.${user_id}`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getMensagens(user_id: string, other_id: string) {
  const { data, error } = await supabase
    .from('mensagens').select('*')
    .or(`and(de_id.eq.${user_id},para_id.eq.${other_id}),and(de_id.eq.${other_id},para_id.eq.${user_id})`)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function sendMensagem(de_id: string, para_id: string, texto: string) {
  const { data, error } = await supabase.from('mensagens').insert({ de_id, para_id, texto }).select().single()
  if (error) throw error
  return data
}

export async function marcarLida(id: string) {
  const { error } = await supabase.from('mensagens').update({ lida: true }).eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────
// AVALIAÇÕES
// ─────────────────────────────────────────

export async function getAvaliacoes(avaliado_id: string) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .select(`*, profiles!avaliador_id(nome, avatar_url, titulo)`)
    .eq('avaliado_id', avaliado_id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function createAvaliacao(avaliacao: {
  avaliado_id: string; avaliador_id: string; rating: number; comentario?: string;
}) {
  const { data, error } = await supabase.from('avaliacoes').insert(avaliacao).select().single()
  if (error) throw error
  return data
}

// ─────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────

export async function getDashboardStats(user_id: string) {
  const [vagas, candidaturas, mensagens] = await Promise.all([
    supabase.from('vagas').select('id', { count: 'exact' }).eq('empresa_id', user_id).eq('activa', true),
    supabase.from('candidaturas').select('id, status, created_at', { count: 'exact' }).eq('candidato_id', user_id),
    supabase.from('mensagens').select('id', { count: 'exact' }).eq('para_id', user_id).eq('lida', false),
  ])

  return {
    vagasActivas: vagas.count || 0,
    totalCandidaturas: candidaturas.count || 0,
    mensagensNaoLidas: mensagens.count || 0,
    candidaturasPorStatus: (candidaturas.data || []).reduce((acc: Record<string, number>, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1
      return acc
    }, {}),
  }
}

// ─────────────────────────────────────────
// FEED / POSTS
// ─────────────────────────────────────────

export async function getFeedPosts() {
  const { data, error } = await supabase
    .from('posts').select(`*, profiles(id, nome, avatar_url, titulo, localizacao)`)
    .order('created_at', { ascending: false }).limit(20)
  if (error) throw error
  return data || []
}

export async function getSuggestedProfilesFeed(user_id: string) {
  const { data, error } = await supabase
    .from('profiles').select('id, nome, avatar_url, titulo, localizacao, role')
    .neq('id', user_id).limit(5)
  if (error) throw error
  return data || []
}

// ─────────────────────────────────────────
// PLATFORM STATS (Admin)
// ─────────────────────────────────────────

export async function getPlatformStats() {
  const now = new Date()
  const last30Days = new Date(now)
  last30Days.setDate(now.getDate() - 30)
  const recentIso = last30Days.toISOString()

  const [profiles, newProfiles, activeJobs, activeProducts, posts, messages, candidaturas] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', recentIso),
    supabase.from('vagas').select('id', { count: 'exact', head: true }).eq('activa', true),
    supabase.from('produtos').select('id', { count: 'exact', head: true }).or('activo.eq.true,activo.is.null'),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('mensagens').select('id', { count: 'exact', head: true }),
    supabase.from('candidaturas').select('id', { count: 'exact', head: true }),
  ])

  return {
    totalUsers: profiles.count || 0,
    newUsersLast30Days: newProfiles.count || 0,
    activeJobs: activeJobs.count || 0,
    activeProducts: activeProducts.count || 0,
    totalPosts: posts.count || 0,
    totalMessages: messages.count || 0,
    totalCandidaturas: candidaturas.count || 0,
  }
}
