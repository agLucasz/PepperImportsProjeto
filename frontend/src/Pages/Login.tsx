import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { login, saveSession } from '../Services/authService';
import logo from '../assets/logo-pepper.png';
import '../Styles/login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login({ email, senha });
      saveSession(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      {/* ---- left panel ---- */}
      <div className="login-panel">
        <div className="login-brand">
          <div className="login-brand-mark">
            <img src={logo} alt="Logo Pepper Imports" />
          </div>
        </div>

        <div className="login-form-wrap">
          <p className="login-eyebrow">Painel Administrativo · Acesso Restrito</p>

          <h1 className="login-title">
            Bem-Vindo<br />
            De <span className="red">Volta</span>
          </h1>

          <p className="login-desc">
            Acesse o painel para gerenciar produtos, vendas, estoque e
            categorias. Apenas administradores autorizados.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label>E-mail Corporativo</label>
              <div className={`login-input-wrap${error ? ' error' : ''}`}>
                <Mail size={16} strokeWidth={1.8} color="var(--fg-mute)" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label>Senha</label>
              <div className={`login-input-wrap${error ? ' error' : ''}`}>
                <Lock size={16} strokeWidth={1.8} color="var(--fg-mute)" />
                <input
                  type={showSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={e => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-eye-btn"
                  onClick={() => setShowSenha(v => !v)}
                  tabIndex={-1}
                >
                  {showSenha
                    ? <EyeOff size={16} strokeWidth={1.8} />
                    : <Eye size={16} strokeWidth={1.8} />
                  }
                </button>
              </div>
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-submit" disabled={loading}>
              {loading
                ? <span className="login-spinner" />
                : <> Entrar no Painel <ArrowRight size={16} strokeWidth={2} /> </>
              }
            </button>

            <button
              type="button"
              className="login-back-btn"
              onClick={() => navigate('/catalogo')}
            >
              Voltar ao Catálogo
            </button>
          </form>
        </div>

        <p className="login-footer">© {new Date().getFullYear()} Pepper Imports · Todos os direitos reservados</p>
      </div>

      {/* ---- right panel (stadium visual) ---- */}
      <div className="login-visual" aria-hidden="true">
        <div className="login-visual-sky" />
        <div className="login-visual-lights">
          {Array.from({ length: 9 }).map((_, i) => <i key={i} />)}
        </div>
        <div className="login-visual-pitch" />
        <div className="login-visual-haze" />
      </div>
    </div>
  );
};

export default Login;
