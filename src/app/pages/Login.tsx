import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

type Role = "profissional" | "empresa";

// ========== DESIGN TOKENS ==========
const tokens = {
  colors: {
    primary: "#1A6BB5",
    primaryDark: "#0D3B6E",
    primaryDarker: "#0A2540",
    accent: "#F5A623",
    accentLight: "#FEF3C7",
    success: "#10B981",
    error: "#EF4444",
    gray: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    glow: "0 0 0 4px rgba(26, 107, 181, 0.1)",
  },
  borderRadius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    full: "9999px",
  },
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  animation: {
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

export function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    nome: "",
    email: "",
    password: "",
    role: "profissional" as Role,
  });
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Previne scroll quando o modal está aberto (não aplicável aqui, mas útil)
  useEffect(() => {
    document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const updateForm = (field: keyof typeof form, value: string) => {
    setError("");
    setForm((prev) => ({ ...prev, [field]: value }));
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
      setError("Email ou senha incorrectos.");
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
          ? "Este email já está registado."
          : "Erro ao criar conta."
      );
      setLoading(false);
      return;
    }
    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        nome: form.nome,
        email: form.email,
        role: form.role,
      });
    }
    setSuccess("Conta criada com sucesso! Redirecionando...");
    setTimeout(() => navigate("/dashboard"), 800);
  };

  const handleGoogle = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError("Erro ao entrar com Google.");
  };

  const handleForgot = async () => {
    if (!form.email) {
      setError("Insira o email primeiro.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(form.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) setError("Erro ao enviar email.");
    else setSuccess("Email de recuperação enviado! Verifique a sua caixa de entrada.");
  };

  return (
    <div style={styles.container}>
      {/* Injeção da fonte Inter */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap');
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: ${tokens.colors.gray[50]};
          }
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
        `}
      </style>

      {/* LEFT PANEL - HERO PREMIUM */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          {/* Logo */}
          <div style={styles.logoArea}>
            <div style={styles.logoIcon}>D</div>
            <span style={styles.logoText}>Drielle</span>
          </div>

          {/* Hero heading */}
          <h1 style={styles.heroTitle}>
            A plataforma de talento de <span style={styles.gold}>Moçambique</span>
          </h1>
          <p style={styles.heroSubtext}>
            Conectamos profissionais e empresas que constroem o futuro do país.
          </p>

          {/* Stats com animação */}
          <div style={styles.stats}>
            <div style={styles.statItem}>
              <div style={styles.statValue}>15k+</div>
              <div style={styles.statLabel}>Profissionais</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <div style={styles.statValue}>2.4k+</div>
              <div style={styles.statLabel}>Empresas</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <div style={styles.statValue}>98%</div>
              <div style={styles.statLabel}>Satisfação</div>
            </div>
          </div>

          {/* Testimonial com efeito glass */}
          <div style={styles.testimonial}>
            <div style={styles.quoteIcon}>“</div>
            <p style={styles.testimonialText}>
              Em duas semanas contratei três engenheiros. Nunca foi tão simples encontrar talento qualificado em Maputo.
            </p>
            <div style={styles.testimonialAuthor}>
              <div style={styles.avatar}>AM</div>
              <div>
                <div style={styles.authorName}>Aida Macuácua</div>
                <div style={styles.authorTitle}>CEO, TechMoz</div>
              </div>
            </div>
          </div>

          {/* Decorative illustration */}
          <div style={styles.illustration}>
            <svg width="280" height="120" viewBox="0 0 280 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 60 L80 40 L120 60 L160 30 L200 50 L240 35" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4"/>
              <circle cx="80" cy="40" r="6" fill={tokens.colors.accent} fillOpacity="0.8"/>
              <circle cx="160" cy="30" r="6" fill={tokens.colors.accent} fillOpacity="0.8"/>
              <circle cx="240" cy="35" r="6" fill={tokens.colors.accent} fillOpacity="0.8"/>
              <rect x="30" y="80" width="220" height="2" rx="1" fill="rgba(255,255,255,0.1)"/>
            </svg>
          </div>
        </div>

        {/* Footer links */}
        <div style={styles.footerLinks}>
          <a href="/termos" style={styles.footerLink}>Termos</a>
          <span style={styles.footerSeparator}>•</span>
          <a href="/privacidade" style={styles.footerLink}>Privacidade</a>
          <span style={styles.footerSeparator}>•</span>
          <span style={styles.copyright}>© {new Date().getFullYear()}</span>
        </div>
      </div>

      {/* RIGHT PANEL - FORM PREMIUM */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          {/* Tabs */}
          <div style={styles.tabsContainer}>
            <button
              onClick={() => setTab("login")}
              style={{
                ...styles.tab,
                ...(tab === "login" ? styles.tabActive : {}),
              }}
            >
              Entrar
            </button>
            <button
              onClick={() => setTab("register")}
              style={{
                ...styles.tab,
                ...(tab === "register" ? styles.tabActive : {}),
              }}
            >
              Criar conta
            </button>
          </div>

          {/* Alertas animados */}
          {error && (
            <div style={{ ...styles.alert, ...styles.alertError }}>
              <span style={styles.alertIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div style={{ ...styles.alert, ...styles.alertSuccess }}>
              <span style={styles.alertIcon}>✓</span>
              <span>{success}</span>
            </div>
          )}

          {/* Login Form */}
          {tab === "login" && (
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{
                      ...styles.input,
                      ...(focusedField === "email" ? styles.inputFocused : {}),
                    }}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <div style={styles.passwordHeader}>
                  <label style={styles.label}>Senha</label>
                  <button type="button" onClick={handleForgot} style={styles.forgotButton}>
                    Esqueceu a senha?
                  </button>
                </div>
                <div style={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{
                      ...styles.input,
                      ...(focusedField === "password" ? styles.inputFocused : {}),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? (
                  <span style={styles.loader} />
                ) : (
                  "Entrar na conta →"
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <form onSubmit={handleRegister} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nome completo</label>
                <div style={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={form.nome}
                    onChange={(e) => updateForm("nome", e.target.value)}
                    onFocus={() => setFocusedField("nome")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{
                      ...styles.input,
                      ...(focusedField === "nome" ? styles.inputFocused : {}),
                    }}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Tipo de conta</label>
                <div style={styles.roleContainer}>
                  <button
                    type="button"
                    onClick={() => updateForm("role", "profissional")}
                    style={{
                      ...styles.roleButton,
                      ...(form.role === "profissional" ? styles.roleActive : {}),
                    }}
                  >
                    <div style={styles.roleEmoji}>👤</div>
                    <div style={styles.roleTitle}>Profissional</div>
                    <div style={styles.roleSub}>Procuro emprego</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm("role", "empresa")}
                    style={{
                      ...styles.roleButton,
                      ...(form.role === "empresa" ? styles.roleActive : {}),
                    }}
                  >
                    <div style={styles.roleEmoji}>🏢</div>
                    <div style={styles.roleTitle}>Empresa</div>
                    <div style={styles.roleSub}>Quero contratar</div>
                  </button>
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <input
                    type="email"
                    placeholder="voce@email.com"
                    value={form.email}
                    onChange={(e) => updateForm("email", e.target.value)}
                    onFocus={() => setFocusedField("reg-email")}
                    onBlur={() => setFocusedField(null)}
                    required
                    style={{
                      ...styles.input,
                      ...(focusedField === "reg-email" ? styles.inputFocused : {}),
                    }}
                  />
                </div>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Senha</label>
                <div style={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    onFocus={() => setFocusedField("reg-password")}
                    onBlur={() => setFocusedField(null)}
                    required
                    minLength={6}
                    style={{
                      ...styles.input,
                      ...(focusedField === "reg-password" ? styles.inputFocused : {}),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    {showPassword ? "👁️" : "👁️‍🗨️"}
                  </button>
                </div>
                <div style={styles.hint}>Mínimo 6 caracteres</div>
              </div>

              <p style={styles.termsText}>
                Ao criar conta, concorda com os{" "}
                <Link to="/termos" style={styles.link}>Termos</Link> e{" "}
                <Link to="/privacidade" style={styles.link}>Política de Privacidade</Link>.
              </p>

              <button type="submit" disabled={loading} style={styles.submitButton}>
                {loading ? (
                  <span style={styles.loader} />
                ) : (
                  "Criar conta gratuitamente →"
                )}
              </button>
            </form>
          )}

          {/* Separator */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>ou</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Google Button */}
          <button onClick={handleGoogle} style={styles.googleButton}>
            <svg viewBox="0 0 24 24" width="18" height="18" style={{ marginRight: 12 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.11c-.22-.66-.35-1.36-.35-2.11s.13-1.45.35-2.11V7.05H2.18A11 11 0 0 0 2.18 16.9l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Continuar com Google
          </button>

          {/* Switch between login/register */}
          <div style={styles.switchText}>
            {tab === "login" ? (
              <>
                Não tem conta?{" "}
                <button onClick={() => setTab("register")} style={styles.switchLink}>
                  Criar agora
                </button>
              </>
            ) : (
              <>
                Já tem conta?{" "}
                <button onClick={() => setTab("login")} style={styles.switchLink}>
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ========== ESTILOS PREMIUM ==========

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    fontFamily: tokens.fontFamily.sans,
    backgroundColor: tokens.colors.gray[50],
  },
  // LEFT PANEL
  leftPanel: {
    flex: 1,
    background: `linear-gradient(145deg, ${tokens.colors.primaryDarker} 0%, ${tokens.colors.primaryDark} 50%, ${tokens.colors.primary} 100%)`,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    padding: "48px",
    position: "relative",
    overflow: "hidden",
    boxShadow: tokens.shadows.xl,
  },
  leftContent: {
    maxWidth: "500px",
    margin: "0 auto",
    width: "100%",
    animation: "fadeInUp 0.6s ease-out",
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "64px",
  },
  logoIcon: {
    width: "48px",
    height: "48px",
    backgroundColor: "white",
    borderRadius: tokens.borderRadius.lg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "26px",
    fontWeight: "800",
    color: tokens.colors.primaryDarker,
    boxShadow: tokens.shadows.md,
  },
  logoText: {
    fontSize: "26px",
    fontWeight: "700",
    letterSpacing: "-0.5px",
    color: "white",
  },
  heroTitle: {
    fontSize: "48px",
    fontWeight: "800",
    lineHeight: 1.2,
    marginBottom: "20px",
    letterSpacing: "-0.02em",
    color: "white",
  },
  gold: {
    color: tokens.colors.accent,
  },
  heroSubtext: {
    fontSize: "16px",
    opacity: 0.85,
    marginBottom: "48px",
    lineHeight: 1.6,
    color: "rgba(255,255,255,0.9)",
  },
  stats: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
    marginBottom: "48px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: tokens.borderRadius.lg,
    padding: "20px 24px",
    backdropFilter: "blur(4px)",
  },
  statItem: {
    textAlign: "center",
  },
  statDivider: {
    width: "1px",
    height: "30px",
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  statValue: {
    fontSize: "28px",
    fontWeight: "700",
    color: "white",
  },
  statLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    letterSpacing: "1px",
    opacity: 0.7,
    color: "white",
  },
  testimonial: {
    background: "rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
    borderRadius: tokens.borderRadius.xl,
    padding: "24px",
    border: "1px solid rgba(255,255,255,0.15)",
    marginBottom: "48px",
    position: "relative",
  },
  quoteIcon: {
    fontSize: "48px",
    fontFamily: "Georgia, serif",
    color: tokens.colors.accent,
    opacity: 0.5,
    position: "absolute",
    top: "16px",
    left: "20px",
  },
  testimonialText: {
    fontSize: "14px",
    lineHeight: 1.6,
    marginBottom: "16px",
    color: "rgba(255,255,255,0.9)",
    fontStyle: "italic",
    paddingLeft: "24px",
  },
  testimonialAuthor: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: tokens.borderRadius.full,
    background: `linear-gradient(135deg, ${tokens.colors.accent}, #E8941A)`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "bold",
    fontSize: "14px",
    color: tokens.colors.primaryDarker,
  },
  authorName: {
    fontSize: "14px",
    fontWeight: "600",
    color: "white",
  },
  authorTitle: {
    fontSize: "12px",
    opacity: 0.7,
    color: "white",
  },
  illustration: {
    textAlign: "center",
    marginTop: "auto",
  },
  footerLinks: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    fontSize: "12px",
    marginTop: "40px",
  },
  footerLink: {
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    transition: tokens.animation.transition,
    cursor: "pointer",
  },
  footerSeparator: {
    color: "rgba(255,255,255,0.3)",
  },
  copyright: {
    color: "rgba(255,255,255,0.5)",
  },
  // RIGHT PANEL
  rightPanel: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
    background: tokens.colors.gray[50],
  },
  formCard: {
    width: "100%",
    maxWidth: "480px",
    background: "white",
    borderRadius: tokens.borderRadius.xl,
    padding: "40px 32px",
    boxShadow: tokens.shadows.xl,
    animation: "scaleIn 0.5s ease-out",
  },
  tabsContainer: {
    display: "flex",
    gap: "8px",
    backgroundColor: tokens.colors.gray[100],
    borderRadius: tokens.borderRadius.lg,
    padding: "4px",
    marginBottom: "32px",
  },
  tab: {
    flex: 1,
    padding: "12px",
    border: "none",
    background: "transparent",
    borderRadius: tokens.borderRadius.md,
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    color: tokens.colors.gray[600],
    transition: tokens.animation.transition,
  },
  tabActive: {
    backgroundColor: "white",
    color: tokens.colors.primary,
    boxShadow: tokens.shadows.sm,
  },
  alert: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderRadius: tokens.borderRadius.md,
    marginBottom: "24px",
    fontSize: "13px",
    animation: "fadeInUp 0.3s ease-out",
  },
  alertError: {
    backgroundColor: "#FEF2F2",
    borderLeft: `4px solid ${tokens.colors.error}`,
    color: tokens.colors.error,
  },
  alertSuccess: {
    backgroundColor: "#ECFDF5",
    borderLeft: `4px solid ${tokens.colors.success}`,
    color: tokens.colors.success,
  },
  alertIcon: {
    fontSize: "14px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: tokens.colors.gray[700],
  },
  inputWrapper: {
    position: "relative",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: `1.5px solid ${tokens.colors.gray[200]}`,
    borderRadius: tokens.borderRadius.md,
    fontSize: "14px",
    fontFamily: "inherit",
    transition: tokens.animation.transition,
    outline: "none",
    backgroundColor: "white",
  },
  inputFocused: {
    borderColor: tokens.colors.primary,
    boxShadow: tokens.shadows.glow,
  },
  passwordHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  forgotButton: {
    background: "none",
    border: "none",
    fontSize: "12px",
    fontWeight: "600",
    color: tokens.colors.primary,
    cursor: "pointer",
    transition: tokens.animation.transition,
  },
  eyeButton: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "16px",
    opacity: 0.6,
    transition: tokens.animation.transition,
  },
  submitButton: {
    backgroundColor: tokens.colors.primary,
    color: "white",
    border: "none",
    borderRadius: tokens.borderRadius.md,
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    transition: tokens.animation.transition,
    marginTop: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  loader: {
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  divider: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    margin: "24px 0",
  },
  dividerLine: {
    flex: 1,
    height: "1px",
    backgroundColor: tokens.colors.gray[200],
  },
  dividerText: {
    fontSize: "12px",
    color: tokens.colors.gray[400],
    textTransform: "uppercase",
  },
  googleButton: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    border: `1.5px solid ${tokens.colors.gray[200]}`,
    borderRadius: tokens.borderRadius.md,
    backgroundColor: "white",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: tokens.animation.transition,
    marginBottom: "20px",
  },
  switchText: {
    textAlign: "center",
    fontSize: "13px",
    color: tokens.colors.gray[600],
  },
  switchLink: {
    background: "none",
    border: "none",
    color: tokens.colors.primary,
    fontWeight: "600",
    cursor: "pointer",
    transition: tokens.animation.transition,
  },
  roleContainer: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  roleButton: {
    padding: "14px",
    border: `2px solid ${tokens.colors.gray[200]}`,
    borderRadius: tokens.borderRadius.md,
    background: "white",
    cursor: "pointer",
    transition: tokens.animation.transition,
    textAlign: "center",
  },
  roleActive: {
    borderColor: tokens.colors.primary,
    backgroundColor: tokens.colors.accentLight,
  },
  roleEmoji: {
    fontSize: "24px",
    marginBottom: "8px",
  },
  roleTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: tokens.colors.gray[800],
  },
  roleSub: {
    fontSize: "10px",
    color: tokens.colors.gray[500],
    marginTop: "4px",
  },
  hint: {
    fontSize: "11px",
    color: tokens.colors.gray[500],
    marginTop: "4px",
  },
  link: {
    color: tokens.colors.primary,
    textDecoration: "none",
    fontWeight: "500",
    transition: tokens.animation.transition,
  },
  termsText: {
    fontSize: "11px",
    color: tokens.colors.gray[500],
    marginTop: "-8px",
    lineHeight: 1.5,
  },
};

// Adiciona keyframe spin (não incluso no CSS inline, mas será injetado via style global)
const styleSheet = document.createElement("style");
styleSheet.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

