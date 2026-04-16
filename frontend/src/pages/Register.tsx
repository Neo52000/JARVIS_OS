import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    setLoading(true);
    try {
      const autoLoggedIn = await register(email, password, fullName);
      if (autoLoggedIn) {
        navigate('/dashboard');
      } else {
        setSuccess('Compte cree ! Verifiez votre e-mail pour confirmer, puis connectez-vous.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Echec de l\'inscription';
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
          <p className="text-[#7a8ba0] mt-2 uppercase tracking-wider text-sm">Creez votre compte</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-orbitron font-bold text-[#00f0ff] text-center uppercase tracking-wider">Inscription</h2>
          {error && (
            <div className="p-3 rounded-sm text-sm" style={{ background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.3)', color: '#ff3860' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 rounded-sm text-sm" style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676' }}>
              {success}
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">Nom et prenom</label>
            <input type="text" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">E-mail</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">Mot de passe</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">Confirmez le mot de passe</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creation du compte...' : 'S\'inscrire'}
          </button>
          <p className="text-center text-sm text-[#7a8ba0]">
            Vous avez deja un compte ?{' '}
            <Link to="/login" className="text-[#00f0ff] hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
