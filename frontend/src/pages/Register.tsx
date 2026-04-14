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
        setSuccess('Compte créé ! Vérifiez votre e-mail pour confirmer, puis connectez-vous.');
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Échec de l\'inscription';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-jarvis-600">JARVIS OS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Créez votre compte</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-xl font-semibold text-center">Inscription</h2>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm">{error}</div>
          )}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 p-3 rounded-lg text-sm">{success}</div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Nom et prénom</label>
            <input type="text" className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirmez le mot de passe</label>
            <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Création du compte...' : 'S\'inscrire'}
          </button>
          <p className="text-center text-sm text-gray-500">
            Vous avez déjà un compte ?{' '}
            <Link to="/login" className="text-jarvis-600 hover:underline">Se connecter</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
