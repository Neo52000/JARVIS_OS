import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const updatePassword = useAuthStore((s) => s.updatePassword);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur lors de la mise a jour';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0e17' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-orbitron font-black text-[#00f0ff] tracking-[4px]" style={{ textShadow: '0 0 30px rgba(0,240,255,0.5)' }}>JARVIS</h1>
          <p className="text-[#7a8ba0] mt-2 uppercase tracking-wider text-sm">Nouveau mot de passe</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-lg font-orbitron font-bold text-[#00f0ff] text-center uppercase tracking-wider">Reinitialiser le mot de passe</h2>
          {error && (
            <div className="p-3 rounded-sm text-sm" style={{ background: 'rgba(255,56,96,0.1)', border: '1px solid rgba(255,56,96,0.3)', color: '#ff3860' }}>{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-sm text-sm" style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.3)', color: '#00e676' }}>
              Mot de passe mis a jour avec succes ! Redirection...
            </div>
          )}
          {!success && (
            <>
              <div>
                <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">Nouveau mot de passe</label>
                <input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#7a8ba0] mb-1 uppercase tracking-wider">Confirmez le mot de passe</label>
                <input type="password" className="input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
              </div>
              <button type="submit" className="btn-primary w-full" disabled={loading}>
                {loading ? 'Mise a jour...' : 'Mettre a jour le mot de passe'}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
