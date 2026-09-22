import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { RiPulseLine } from 'react-icons/ri';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(100),
  email: z.string().email('E-mail inválido'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Deve ter ao menos uma maiúscula')
    .regex(/[a-z]/, 'Deve ter ao menos uma minúscula')
    .regex(/[0-9]/, 'Deve ter ao menos um número'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Senhas não conferem',
  path: ['confirmPassword'],
});

const RegisterPage = () => {
  const { register: registerUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });
    AOS.refresh();
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const result = await registerUser({
      name: data.name,
      email: data.email,
      password: data.password,
    });
    if (result.success) {
      toast.success('Conta criada com sucesso! 🎉');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(139,92,246,0.12), transparent), var(--color-bg-primary)'
    }}>
      <div style={{ width: '100%', maxWidth: '460px' }}>
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)' }}>
            <RiPulseLine className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold">
            Finanças<span style={{ color: 'var(--color-accent-primary)' }}>PRO</span>
          </h1>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-bold mb-6">Criar sua conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {[
              { id: 'name',    label: 'Nome completo', type: 'text',     placeholder: 'João Silva',        key: 'name' },
              { id: 'email',   label: 'E-mail',        type: 'email',    placeholder: 'joao@email.com',    key: 'email' },
              { id: 'password', label: 'Senha',        type: 'password', placeholder: '••••••••',          key: 'password' },
              { id: 'confirmPassword', label: 'Confirmar Senha', type: 'password', placeholder: '••••••••', key: 'confirmPassword' },
            ].map(({ id, label, type, placeholder, key }) => (
              <div className="mb-4" key={key}>
                <label htmlFor={id} className="form-label">{label}</label>
                <input
                  id={id}
                  type={type}
                  className="form-input"
                  placeholder={placeholder}
                  {...register(key)}
                />
                {errors[key] && <p className="form-error">{errors[key].message}</p>}
              </div>
            ))}

            <button
              type="submit"
              id="btn-register"
              className="btn btn-primary mt-2"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isSubmitting ? (
                <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Criando conta...</>
              ) : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
            Já tem conta?{' '}
            <Link to="/login" className="font-semibold" style={{ color: 'var(--color-accent-primary)' }}>
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
