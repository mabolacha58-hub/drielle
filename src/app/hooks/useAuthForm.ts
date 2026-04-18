import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';

type Role = 'profissional' | 'empresa';
type Tab = 'login' | 'register';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

const registerSchema = z.object({
  nome: z.string().min(2, 'Nome completo obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['profissional', 'empresa']),
  terms: z.boolean().refine(val => val === true, 'Aceite os termos para continuar'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export function useAuthForm() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { nome: '', email: '', password: '', role: 'profissional', terms: false },
  });

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    
    if (error) {
      setError('Email ou senha incorrectos. Verifique e tente novamente.');
      setLoading(false);
      return;
    }
    
    navigate('/dashboard');
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');
    
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { nome: data.nome, role: data.role },
      },
    });
    
    if (error) {
      if (error.message.includes('already registered')) {
        setError('Este email já está registado. Faça login.');
      } else {
        setError('Erro ao criar conta. Tente novamente.');
      }
      setLoading(false);
      return;
    }
    
    if (authData.user) {
      await supabase.from('profiles').upsert({
        id: authData.user.id,
        nome: data.nome,
        email: data.email,
        role: data.role,
      });
    }
    
    navigate('/dashboard');
    setLoading(false);
  };

  const resetPassword = async (email: string) => {
    if (!email) {
      setError('Insira o email primeiro.');
      return false;
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      setError('Erro ao enviar email de recuperação.');
      return false;
    }
    
    setSuccess('Email de recuperação enviado! Verifique a sua caixa de entrada.');
    return true;
  };

  const switchTab = (newTab: Tab) => {
    setTab(newTab);
    setError('');
    setSuccess('');
    loginForm.reset();
    registerForm.reset();
  };

  return {
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
  };
}
