import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { RiPulseLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '../hooks/useAuth';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha obrigatória'),
});

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 600, once: true, easing: 'ease-out-cubic' });
    AOS.refresh();
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      toast.success('Bem-vindo de volta! 👋');
      navigate('/');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{
      background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(99,102,241,0.12), transparent), var(--color-bg-primary)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8" data-aos="fade-down">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)' }}>
            <RiPulseLine className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold">
            Finanças<span style={{ color: 'var(--color-accent-primary)' }}>PRO</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Gestão financeira pessoal inteligente
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8" data-aos="fade-up" data-aos-delay="100">
          <h2 className="text-xl font-bold mb-6">Entrar na conta</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="form-label">E-mail</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                autoComplete="email"
                {...register('email')}
              />
              {errors.email && <p className="form-error">{errors.email.message}</p>}
            </div>

            <div className="mb-6">
              <label htmlFor="password" className="form-label">Senha</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--color-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPass ? <RiEyeOffLine /> : <RiEyeLine />}
                </button>
              </div>
              {errors.password && <p className="form-error">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              id="btn-login"
              className="btn btn-primary w-full justify-center"
              disabled={isSubmitting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isSubmitting ? (
                <><div className="spinner" style={{ width: '16px', height: '16px' }} /> Entrando...</>
              ) : 'Entrar'}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
            Não tem conta?{' '}
            <Link to="/register" className="font-semibold" style={{ color: 'var(--color-accent-primary)' }}>
              Criar conta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
