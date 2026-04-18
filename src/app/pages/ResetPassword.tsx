import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, CheckCircle2, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const B = '#1A6BB5'
const BD = '#0D3B6E'

export function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas nao coincidem.')
      return
    }

    setSaving(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError('Nao foi possivel actualizar a senha. Tente abrir o link do email novamente.')
      setSaving(false)
      return
    }

    setSuccess('Senha actualizada com sucesso. Vamos abrir o login.')
    setSaving(false)
    setTimeout(() => navigate('/login', { replace: true }), 1200)
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/10 p-6 shadow-[0_30px_80px_rgba(3,10,20,0.35)] backdrop-blur">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8EC5FF]">recuperar acesso</p>
            <h1 className="mt-2 font-['Sora'] text-3xl font-extrabold">Definir nova senha</h1>
            <p className="mt-3 text-sm leading-6 text-white/75">
              Escolhe uma senha nova para voltares a entrar na tua conta.
            </p>
          </div>

          {error ? (
            <div className="mb-4 flex gap-3 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          {success ? (
            <div className="mb-4 flex gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
              <span>{success}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/70">
                Nova senha
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4">
                <Lock size={18} className="text-white/55" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-14 w-full bg-transparent text-[15px] text-white outline-none"
                  placeholder="Minimo de 6 caracteres"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-white/70">
                Confirmar senha
              </span>
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4">
                <Lock size={18} className="text-white/55" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="h-14 w-full bg-transparent text-[15px] text-white outline-none"
                  placeholder="Repete a nova senha"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold text-white"
              style={{ background: `linear-gradient(135deg, ${B}, ${BD})` }}
            >
              {saving ? 'A actualizar...' : 'Guardar nova senha'}
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/70">
            <Link to="/login" className="font-semibold text-[#8EC5FF] no-underline">
              Voltar ao login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
