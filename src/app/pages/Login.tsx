import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Building2,
  Loader2,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

type Role = "profissional" | "empresa";
type Tab = "login" | "register";

const MESSAGES = {
  invalidCredentials: "Email ou senha incorrectos. Verifique e tente novamente.",
  emailAlreadyRegistered: "Este email já está registado. Faça login.",
  signUpError: "Erro ao criar conta. Tente novamente.",
  googleError: "Erro ao iniciar sessão com Google.",
  forgotEmailRequired: "Insira o email primeiro.",
  forgotError: "Não foi possível enviar o email.",
  forgotSuccess: "Email de recuperação enviado! Verifique a sua caixa de entrada.",
  accountCreated: "Conta criada! A redirecionar...",
};

export function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("login");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    role: "profissional" as Role,
  });

  const updateForm = (key: keyof typeof form, value: string) => {
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });
    if (error) {
      setError(MESSAGES.invalidCredentials);
      setLoading(false);
      return;
    }
    navigate("/dashboard");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { nome: form.nome, role: form.role },
      },
    });
    if (error) {
      setError(
        error.message.includes("already registered")
          ? MESSAGES.emailAlreadyRegistered
          : MESSAGES.signUpError
      );
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert(
        {
          id: data.user.id,
          nome: form.nome,
          email: form.email,
          role: form.role,
        },
        { onConflict: "id" }
      );
    }
    setSuccess(MESSAGES.accountCreated);
    // Aguardar um pouco para o utilizador ver a mensagem de sucesso
    setTimeout(() => navigate("/dashboard"), 800);
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(MESSAGES.googleError);
  };

  const handleForgot = async () => {
    if (!form.email) {
      setError(MESSAGES.forgotEmailRequired);
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(MESSAGES.forgotError);
    } else {
      setSuccess(MESSAGES.forgotSuccess);
    }
  };

  const switchTab = (value: string) => {
    setTab(value as Tab);
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left panel – brand */}
      <aside className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#0A2540] via-[#0D3B6E] to-[#1A6BB5] text-white p-12">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#F5A623]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#1A6BB5]/40 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#0A2540] font-bold text-xl shadow-lg">
            D
          </div>
          <span className="text-xl font-semibold tracking-tight">Drielle.</span>
        </div>

        <div className="relative space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold leading-[1.05] tracking-tight">
              A plataforma de
              <br />
              talento de
              <span className="text-[#F5A623]"> Moçambique</span>.
            </h1>
            <p className="text-lg text-white/70 max-w-md">
              Conectamos profissionais e empresas que constroem o futuro do
              país.
            </p>
          </div>

          <div className="flex gap-8 pt-4">
            <Stat value="15.000+" label="Profissionais" />
            <Stat value="2.400+" label="Empresas" />
            <Stat value="98%" label="Satisfação" />
          </div>

          <figure className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm max-w-md">
            <blockquote className="text-sm text-white/90 leading-relaxed">
              "Em duas semanas contratei três engenheiros via Drielle. Nunca foi
              tão simples encontrar talento qualificado em Maputo."
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-[#F5A623] to-[#E8941A] grid place-items-center text-sm font-semibold">
                AM
              </div>
              <div className="text-xs">
                <div className="font-semibold">Aida Macuácua</div>
                <div className="text-white/60">CEO, TechMoz</div>
              </div>
            </figcaption>
          </figure>
        </div>

        <div className="relative flex items-center justify-between text-xs text-white/50">
          <span>© {new Date().getFullYear()} Drielle</span>
          <div className="flex gap-5">
            <a href="/termos" className="hover:text-white transition">
              Termos
            </a>
            <a href="/privacidade" className="hover:text-white transition">
              Privacidade
            </a>
          </div>
        </div>
      </aside>

      {/* Right panel – form */}
      <main className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#0A2540] text-white font-bold">
              D
            </div>
            <span className="text-lg font-semibold">Drielle.</span>
          </div>

          <div className="mb-8 space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              {tab === "login" ? "Bem-vindo de volta" : "Criar a sua conta"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {tab === "login"
                ? "Entre para aceder a milhares de oportunidades."
                : "Junte-se gratuitamente e comece em menos de 1 minuto."}
            </p>
          </div>

          <Tabs value={tab} onValueChange={switchTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Criar conta</TabsTrigger>
            </TabsList>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            {success && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2.5 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <TabsContent value="login" className="mt-0">
              <form onSubmit={handleLogin} className="space-y-4">
                <Field
                  id="login-email"
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                >
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="voce@email.com"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    required
                    className="pl-10 h-11"
                  />
                </Field>

                <Field
                  id="login-pw"
                  label="Senha"
                  icon={<Lock className="h-4 w-4" />}
                  trailing={
                    <button
                      type="button"
                      onClick={handleForgot}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      Esqueceu?
                    </button>
                  }
                >
                  <Input
                    id="login-pw"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    required
                    className="pl-10 pr-10 h-11"
                  />
                  <PwToggle show={showPw} onClick={() => setShowPw(!showPw)} />
                </Field>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> A entrar...
                    </>
                  ) : (
                    <>
                      Entrar na conta <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register" className="mt-0">
              <form onSubmit={handleRegister} className="space-y-4">
                <Field
                  id="reg-nome"
                  label="Nome completo"
                  icon={<UserIcon className="h-4 w-4" />}
                >
                  <Input
                    id="reg-nome"
                    placeholder="O seu nome"
                    value={form.nome}
                    onChange={(e) => updateForm("nome", e.target.value)}
                    required
                    className="pl-10 h-11"
                  />
                </Field>

                <div className="space-y-2">
                  <Label>Tipo de conta</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <RoleCard
                      active={form.role === "profissional"}
                      onClick={() => updateForm("role", "profissional")}
                      icon={<Briefcase className="h-5 w-5" />}
                      title="Profissional"
                      sub="Procuro emprego"
                    />
                    <RoleCard
                      active={form.role === "empresa"}
                      onClick={() => updateForm("role", "empresa")}
                      icon={<Building2 className="h-5 w-5" />}
                      title="Empresa"
                      sub="Quero contratar"
                    />
                  </div>
                </div>

                <Field
                  id="reg-email"
                  label="Email"
                  icon={<Mail className="h-4 w-4" />}
                >
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="voce@email.com"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    required
                    className="pl-10 h-11"
                  />
                </Field>

                <Field
                  id="reg-pw"
                  label="Senha"
                  icon={<Lock className="h-4 w-4" />}
                  hint="Mínimo 6 caracteres"
                >
                  <Input
                    id="reg-pw"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    required
                    minLength={6}
                    className="pl-10 pr-10 h-11"
                  />
                  <PwToggle show={showPw} onClick={() => setShowPw(!showPw)} />
                </Field>

                <p className="text-xs text-muted-foreground">
                  Ao criar conta concorda com os{" "}
                  <Link to="/termos" className="text-primary hover:underline">
                    Termos
                  </Link>{" "}
                  e a{" "}
                  <Link
                    to="/privacidade"
                    className="text-primary hover:underline"
                  >
                    Política de Privacidade
                  </Link>
                  .
                </p>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 text-sm font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> A criar...
                    </>
                  ) : (
                    <>
                      Criar conta gratuitamente{" "}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="my-6 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-xs uppercase tracking-wider text-muted-foreground">
              ou
            </span>
            <Separator className="flex-1" />
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            className="w-full h-11 text-sm font-medium"
          >
            <GoogleIcon /> Continuar com Google
          </Button>
        </div>
      </main>
    </div>
  );
}

/* ---------- Subcomponentes ---------- */

const Stat = ({ value, label }: { value: string; label: string }) => (
  <div>
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-white/60 uppercase tracking-wider mt-1">
      {label}
    </div>
  </div>
);

const Field = ({
  id,
  label,
  icon,
  hint,
  trailing,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
      </Label>
      {trailing}
    </div>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {icon}
      </span>
      {children}
    </div>
    {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

const PwToggle = ({ show, onClick }: { show: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
    aria-label={show ? "Ocultar senha" : "Mostrar senha"}
  >
    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
);

const RoleCard = ({
  active,
  onClick,
  icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  sub: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex flex-col items-start gap-2 rounded-xl border-2 p-3 text-left transition ${
      active
        ? "border-primary bg-primary/5"
        : "border-border bg-card hover:border-primary/40"
    }`}
  >
    <span
      className={`grid h-8 w-8 place-items-center rounded-lg ${
        active
          ? "bg-primary text-primary-foreground"
          : "bg-muted text-muted-foreground"
      }`}
    >
      {icon}
    </span>
    <div>
      <div className="text-sm font-semibold">{title}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </div>
  </button>
);

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
    />
  </svg>
);

