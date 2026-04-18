import { supabase } from './supabase'

function normalizeImageUrls(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.length > 0)
  }

  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim()

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
        }
      } catch {
        // Fallback to treating the value as a single URL string.
      }
    }

    return [trimmed]
  }

  return []
}

function normalizeProduto<T extends Record<string, any>>(produto: T): T & { imagens_urls: string[]; imagem_url: string | null } {
  const imagens = normalizeImageUrls(produto.imagens_urls ?? produto.imagem_url)
  return {
    ...produto,
    imagens_urls: imagens,
    imagem_url: imagens[0] || null,
  }
}

// ─────────────────────────────────────────
// VAGAS
// ─────────────────────────────────────────

export async function getVagas(filters?: {
  search?: string
  category?: string
  location?: string
  type?: string
}) {
  let query = supabase
    .from('vagas')
    .select(`*, profiles(nome, avatar_url)`)
    .eq('activa', true)
    .order('created_at', { ascending: false })

  if (filters?.search) {
    query = query.or(`titulo.ilike.%${filters.search}%,empresa_nome.ilike.%${filters.search}%`)
  }
  if (filters?.category && filters.category !== 'Todas') {
    query = query.eq('categoria', filters.category)
  }
  if (filters?.location && filters.location !== 'Todas') {
    query = query.eq('localizacao', filters.location)
  }
  if (filters?.type && filters.type !== 'Todos') {
    query = query.eq('tipo', filters.type)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getVagaById(id: string) {
  const { data, error } = await supabase
    .from('vagas')
    .select(`*, profiles(id, nome, avatar_url, website, telefone, localizacao)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createVaga(vaga: {
  empresa_id: string
  titulo: string
  empresa_nome: string
  localizacao: string
  tipo: string
  categoria: string
  salario_min?: number
  salario_max?: number
  descricao?: string
  responsabilidades?: string[]
  requisitos?: string[]
  beneficios?: string[]
  skills?: string[]
  prazo?: string
}) {
  const { data, error } = await supabase.from('vagas').insert(vaga).select().single()
  if (error) throw error
  return data
}

export async function updateVaga(id: string, updates: {
  titulo?: string
  empresa_nome?: string
  localizacao?: string
  tipo?: string
  categoria?: string
  salario_min?: number
  salario_max?: number
  descricao?: string
  responsabilidades?: string[]
  requisitos?: string[]
  beneficios?: string[]
  skills?: string[]
  prazo?: string
}) {
  const { data, error } = await supabase.from('vagas').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteVaga(id: string) {
  const { error } = await supabase.from('vagas').delete().eq('id', id)
  if (error) throw error
}

// ─────────────────────────────────────────
// CANDIDATURAS
// ─────────────────────────────────────────

export async function createCandidatura(candidatura: {
  vaga_id: string
  candidato_id: string
  nome: string
  email: string
  telefone?: string
  carta?: string
}) {
  const { data, error } = await supabase
    .from('candidaturas')
    .insert(candidatura)
    .select()
    .single()
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
  const { error } = await supabase
    .from('candidaturas')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function checkJaCandidatou(vaga_id: string, candidato_id: string) {
  const { data } = await supabase
    .from('candidaturas')
    .select('id')
    .eq('vaga_id', vaga_id)
    .eq('candidato_id', candidato_id)
    .maybeSingle()
  return !!data
}

// ─────────────────────────────────────────
// PRODUTOS
// ─────────────────────────────────────────

export async function getProdutos(filters?: {
  search?: string
  category?: string
  sort?: string
}) {
  let query = supabase
    .from('produtos')
    .select(`*, profiles(nome, avatar_url, localizacao)`)
    .eq('activo', true)

  if (filters?.search) {
    query = query.or(`titulo.ilike.%${filters.search}%`)
  }
  if (filters?.category && filters.category !== 'Todos') {
    query = query.eq('categoria', filters.category)
  }

  if (filters?.sort === 'Menor preço') {
    query = query.order('preco', { ascending: true })
  } else if (filters?.sort === 'Maior preço') {
    query = query.order('preco', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(normalizeProduto)
}

export async function getProdutoById(id: string) {
  const { data, error } = await supabase
    .from('produtos')
    .select(`*, profiles(id, nome, avatar_url, localizacao, created_at)`)
    .eq('id', id)
    .single()
  if (error) throw error
  return normalizeProduto(data)
}

export async function createProduto(produto: {
  vendedor_id: string
  titulo: string
  descricao?: string
  preco: number
  categoria: string
  tags?: string[]
  dias_entrega?: number
  revisoes?: number
  imagens_urls?: string[]
}) {
  const { data, error } = await supabase.from('produtos').insert({ ...produto, activo: true }).select().single()
  if (error) throw error
  return data
}

// ─────────────────────────────────────────
// PERFIS
// ─────────────────────────────────────────

export async function getProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getSuggestedProfiles(user_id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nome, titulo, avatar_url, localizacao')
    .neq('id', user_id)
    .limit(10)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function updateProfile(id: string, updates: {
  nome?: string
  titulo?: string
  localizacao?: string
  bio?: string
  website?: string
  telefone?: string
  avatar_url?: string
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ─────────────────────────────────────────
// MENSAGENS
// ─────────────────────────────────────────

export async function getConversations(user_id: string) {
  const { data, error } = await supabase
    .from('mensagens')
    .select(`
      *,
      de: de_id(id, nome, avatar_url, titulo),
      para: para_id(id, nome, avatar_url, titulo)
    `)
    .or(`de_id.eq.${user_id},para_id.eq.${user_id}`)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getMensagens(user_id: string, other_id: string) {
  const { data, error } = await supabase
    .from('mensagens')
    .select('*')
    .or(
      `and(de_id.eq.${user_id},para_id.eq.${other_id}),and(de_id.eq.${other_id},para_id.eq.${user_id})`
    )
    .order('created_at', { ascending: true })
  if (error) throw error
  return data || []
}

export async function sendMensagem(de_id: string, para_id: string, texto: string) {
  const { data, error } = await supabase
    .from('mensagens')
    .insert({ de_id, para_id, texto })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function marcarLida(id: string) {
  const { error } = await supabase
    .from('mensagens')
    .update({ lida: true })
    .eq('id', id)
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
  avaliado_id: string
  avaliador_id: string
  rating: number
  comentario?: string
}) {
  const { data, error } = await supabase
    .from('avaliacoes')
    .insert(avaliacao)
    .select()
    .single()
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
