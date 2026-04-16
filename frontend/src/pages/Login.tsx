import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e17' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-orbitron font-black text-[#00f0ff] tracking-[4px]"
            style={{ textShadow: '0 0 30px rgba(0,240,255,0.5)' }}
          >
            JARVIS
          </h1>
          <p className="text-[#7a8ba0] mt-2 uppercase tracking-wider text-sm">Systeme d'exploitation d'entreprise</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-orbitron font-bold text-[#00f0ff] text-center uppercase tracking-wider">Se connecter</h2>
          {error && (
            <div className="p-3 rounded-sm text-sm" style={{ background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.3)', color: '#ff3860' }}>
              {error}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">E-mail</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">Mot de passe</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-[#00f0ff] hover:underline">
              Mot de passe oublie ?
            </Link>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
          <p className="text-center text-sm text-[#7a8ba0]">
            Vous n'avez pas de compte ?{' '}
            <Link to="/register" className="text-[#00f0ff] hover:underline">Inscrivez-vous</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
