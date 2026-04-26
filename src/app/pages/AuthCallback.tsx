import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, LoaderCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const B = '#1A6BB5'
const BD = '#0D3B6E'

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function handleCallback() {
      const { error } = await supabase.auth.getSession()

      if (!active) return

      if (error) {
        setError('Não foi possível concluir o login social. Tente novamente.')
        return
      }

      navigate('/dashboard', { replace: true })
    }

    handleCallback()

    return () => {
      active = false
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-white">
      <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-[28px] border border-white/10 bg-white/10 p-6 text-center shadow-[0_30px_80px_rgba(3,10,20,0.35)] backdrop-blur">
          {error ? (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/15 text-red-200">
                <AlertCircle size={26} />
              </div>
              <h1 className="font-['Sora'] text-2xl font-extrabold">Falha no login</h1>
              <p className="mt-3 text-sm leading-6 text-white/75">{error}</p>
              <Link
                to="/login"
                className="mt-6 inline-flex rounded-2xl px-5 py-3 font-semibold text-white no-underline"
                style={{ background: `linear-gradient(135deg, ${B}, ${BD})` }}
              >
                Voltar ao login
              </Link>
            </>
          ) : (
            <>
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1A6BB5]/15 text-[#8EC5FF]">
                <LoaderCircle size={26} className="animate-spin" />
              </div>
              <h1 className="font-['Sora'] text-2xl font-extrabold">A concluir o login</h1>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Estamos a validar a tua sessão e a abrir o dashboard.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
