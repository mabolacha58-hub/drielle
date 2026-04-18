import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  type LucideIcon,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { TabSwitcher } from '../components/ui/TabSwitcher';
import { RoleSelector } from '../components/ui/RoleSelector';
import { SocialButtons } from '../components/ui/SocialButtons';
import { useAuthForm } from '../hooks/useAuthForm';

const GOLD = '#F5A623';

const loginHighlights = [
  {
    icon: BriefcaseBusiness,
    title: 'Vagas e servicos num so lugar',
    description: 'Encontre oportunidades, projetos e parceiros sem sair da plataforma.',
  },
  {
    icon: ShieldCheck,
    title: 'Acesso rapido e seguro',
    description: 'Entre, retome as conversas e acompanhe candidaturas em poucos segundos.',
  },
  {
    icon: Sparkles,
    title: 'Perfil pensado para converter',
    description: 'Mostre experiencia, portfolio e disponibilidade de forma mais convincente.',
  },
];

function FieldShell({
  label,
  error,
  icon: Icon,
  rightElement,
  children,
  action,
}: {
  label: string;
  error?: string;
  icon: LucideIcon;
  rightElement?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <label className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-600">
          {label}
        </label>
        {action}
      </div>

      <div
        className={[
          'group flex items-center gap-3 rounded-2xl border bg-slate-50/80 px-4 transition-all',
          error
            ? 'border-red-300 bg-red-50/70 focus-within:border-red-400 focus-within:ring-4 focus-within:ring-red-100'
            : 'border-slate-200 focus-within:border-[#1A6BB5] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#1A6BB5]/10',
        ].join(' ')}
      >
        <Icon size={18} className={error ? 'text-red-400' : 'text-slate-400'} />
        <div className="min-w-0 flex-1">{children}</div>
        {rightElement}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}

export function Login() {
  const {
    tab,
    loading,
    error,
    success,
    loginForm,
    registerForm,
    handleLogin,
    handleRegister,
    resetPassword,
    switchTab,
    setError,
  } = useAuthForm();

  const [showPassword, setShowPassword] = useState(false);

  const loginPassword = loginForm.register('password');
  const registerPassword = registerForm.register('password');

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111F] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,163,224,0.18),transparent_28%),radial-gradient(circle_at_80%_20%,rgba(245,166,35,0.14),transparent_24%),linear-gradient(135deg,#08111d_0%,#0a2540_45%,#0e2c4f_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute left-[-8rem] top-24 h-72 w-72 rounded-full bg-[#1A6BB5]/20 blur-3xl" />
      <div className="absolute bottom-[-6rem] right-[-3rem] h-80 w-80 rounded-full bg-[#F5A623]/15 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <div className="grid w-full max-w-xl gap-6 mx-auto lg:max-w-none lg:grid-cols-[1.15fr_0.85fr]">
          <section className="relative hidden overflow-hidden rounded-[32px] border border-white/10 bg-white/8 p-6 text-white shadow-[0_30px_100px_rgba(3,10,20,0.45)] backdrop-blur lg:block xl:p-8">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent" />

            <Link to="/" className="inline-flex items-center gap-3 no-underline">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.15)]">
                <span className="font-['Sora'] text-xl font-extrabold text-white">D</span>
              </div>
              <div>
                <p className="font-['Sora'] text-xl font-extrabold tracking-tight text-white">
                  Drielle<span style={{ color: GOLD }}>.</span>
                </p>
                <p className="text-sm text-white/60">Conexao profissional para Mozambique</p>
              </div>
            </Link>

            <div className="mt-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                <Sparkles size={14} />
                rede com foco em resultado
              </div>

              <h1 className="mt-5 font-['Sora'] text-[clamp(2.4rem,5vw,4.7rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-white">
                {tab === 'login' ? 'Entre e volte ao fluxo de oportunidades.' : 'Crie a sua conta e comece com presenca forte.'}
              </h1>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
                {tab === 'login'
                  ? 'Acompanhe vagas, mensagens e propostas com uma interface mais clara, segura e focada em conversao.'
                  : 'Cadastre-se em minutos, escolha o tipo de conta e publique o seu perfil com uma aparencia mais profissional.'}
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {loginHighlights.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-3xl border border-white/10 bg-white/10 p-4 shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5A623]/18 text-[#FFD48A]">
                    <Icon size={20} />
                  </div>
                  <h2 className="text-base font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-white/68">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4 rounded-[28px] border border-white/10 bg-slate-950/20 p-5 md:grid-cols-3">
              <div>
                <p className="text-3xl font-black text-white">15k+</p>
                <p className="mt-1 text-sm text-white/65">profissionais e empresas em movimento</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">24h</p>
                <p className="mt-1 text-sm text-white/65">para retomar candidaturas e conversas pendentes</p>
              </div>
              <div>
                <p className="text-3xl font-black text-white">1 lugar</p>
                <p className="mt-1 text-sm text-white/65">para reputacao, oportunidades e vendas</p>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-4 shadow-[0_30px_80px_rgba(8,17,31,0.18)] backdrop-blur sm:rounded-[32px] sm:p-7">
            <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#1A6BB5]/50 to-transparent" />

            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#1A6BB5]/70">
                  {tab === 'login' ? 'Acesso rapido' : 'Novo cadastro'}
                </p>
                <h2 className="mt-2 font-['Sora'] text-[1.6rem] font-extrabold tracking-[-0.04em] text-slate-900 sm:text-[1.9rem]">
                  {tab === 'login' ? 'Entrar na conta' : 'Abrir conta gratuita'}
                </h2>
                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {tab === 'login'
                    ? 'Use o seu email para voltar ao dashboard, mensagens e oportunidades guardadas.'
                    : 'Escolha o seu perfil e prepare-se para candidatar-se ou vender servicos com mais credibilidade.'}
                </p>
              </div>

              <div className="hidden rounded-2xl border border-[#1A6BB5]/15 bg-[#E8F3FC] px-3 py-2 text-right sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#1A6BB5]/70">seguro</p>
                <p className="mt-1 text-sm font-semibold text-[#0D3B6E]">Supabase Auth</p>
              </div>
            </div>

            <TabSwitcher
              tabs={[
                { id: 'login', label: 'Entrar' },
                { id: 'register', label: 'Criar conta' },
              ]}
              activeTab={tab}
              onChange={switchTab}
            />

            {error ? (
              <div className="mb-5 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : null}

            {success ? (
              <div className="mb-5 rounded-2xl border border-[#1A6BB5]/20 bg-[#E8F3FC] px-4 py-3 text-sm font-medium text-[#0D3B6E]">
                {success}
              </div>
            ) : null}

            {tab === 'login' ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
                <FieldShell
                  label="Email"
                  icon={Mail}
                  error={loginForm.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="h-14 border-0 bg-transparent px-0 text-[15px] shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0"
                    {...loginForm.register('email')}
                  />
                </FieldShell>

                <FieldShell
                  label="Senha"
                  icon={Lock}
                  error={loginForm.formState.errors.password?.message}
                  action={
                    <button
                      type="button"
                      onClick={() => resetPassword(loginForm.getValues('email'))}
                      className="text-xs font-semibold text-[#1A6BB5] transition hover:text-[#0D3B6E]"
                    >
                      Recuperar acesso
                    </button>
                  }
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                >
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Digite a sua senha"
                    className="h-14 border-0 bg-transparent px-0 text-[15px] shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0"
                    {...loginPassword}
                  />
                </FieldShell>

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full rounded-2xl bg-[#1A6BB5] text-base font-semibold shadow-[0_18px_45px_rgba(26,107,181,0.32)] hover:bg-[#155892]"
                  disabled={loading}
                >
                  {loading ? 'A entrar...' : 'Entrar na plataforma'}
                  <ArrowRight size={18} />
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
                <FieldShell
                  label="Nome completo"
                  icon={User}
                  error={registerForm.formState.errors.nome?.message}
                >
                  <Input
                    type="text"
                    placeholder="Ex: Joao Silva"
                    className="h-14 border-0 bg-transparent px-0 text-[15px] shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0"
                    {...registerForm.register('nome')}
                  />
                </FieldShell>

                <RoleSelector
                  value={registerForm.watch('role')}
                  onChange={(role) => registerForm.setValue('role', role, { shouldValidate: true })}
                />

                <FieldShell
                  label="Email"
                  icon={Mail}
                  error={registerForm.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="seu@email.com"
                    className="h-14 border-0 bg-transparent px-0 text-[15px] shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0"
                    {...registerForm.register('email')}
                  />
                </FieldShell>

                <FieldShell
                  label="Senha"
                  icon={Lock}
                  error={registerForm.formState.errors.password?.message}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="text-slate-400 transition hover:text-slate-600"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                >
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimo de 6 caracteres"
                    className="h-14 border-0 bg-transparent px-0 text-[15px] shadow-none ring-0 focus-visible:border-0 focus-visible:ring-0"
                    {...registerPassword}
                  />
                </FieldShell>

                <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-slate-300 accent-[#1A6BB5]"
                    {...registerForm.register('terms')}
                  />
                  <span>
                    Concordo com os{' '}
                    <a href="/terms" className="font-semibold text-[#1A6BB5] no-underline hover:underline">
                      Termos de Uso
                    </a>{' '}
                    e com a{' '}
                    <a href="/privacy" className="font-semibold text-[#1A6BB5] no-underline hover:underline">
                      Politica de Privacidade
                    </a>
                    .
                  </span>
                </label>

                {registerForm.formState.errors.terms ? (
                  <p className="text-sm text-red-600">{registerForm.formState.errors.terms.message}</p>
                ) : null}

                <Button
                  type="submit"
                  size="lg"
                  className="h-14 w-full rounded-2xl bg-[#1A6BB5] text-base font-semibold shadow-[0_18px_45px_rgba(26,107,181,0.32)] hover:bg-[#155892]"
                  disabled={loading}
                >
                  {loading ? 'A criar conta...' : 'Criar conta gratuitamente'}
                  <ArrowRight size={18} />
                </Button>
              </form>
            )}

            <div className="mt-7">
              <SocialButtons onError={setError} />
            </div>

            <p className="mt-6 text-center text-sm leading-6 text-slate-500">
              {tab === 'login' ? 'Nao tens conta?' : 'Ja tens conta?'}{' '}
              <button
                type="button"
                onClick={() => switchTab(tab === 'login' ? 'register' : 'login')}
                className="font-semibold text-[#1A6BB5] transition hover:text-[#0D3B6E]"
              >
                {tab === 'login' ? 'Criar agora' : 'Entrar'}
              </button>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
