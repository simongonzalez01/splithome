import React, { useState } from 'react';
import { Card, inputStyle, labelStyle } from './UI';
import { signIn, signUp } from '../lib/storage';

export default function AuthScreen({ onSkip }) {
  const [mode, setMode] = useState('login'); // login | signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      const { error: err } = await signUp(email, password);
      if (err) setError(err.message);
      else setSuccess('¡Cuenta creada! Revisa tu email para confirmar.');
    } else {
      const { error: err } = await signIn(email, password);
      if (err) setError(err.message === 'Invalid login credentials' ? 'Email o contraseña incorrectos' : err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '24px',
      background: 'linear-gradient(180deg, #f0f4f8 0%, #e8f0fe 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '32px',
            fontWeight: '800', color: '#1a1a2e', margin: '0 0 8px',
          }}>SplitHome</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {mode === 'login' ? 'Inicia sesión para sincronizar tus datos' : 'Crea tu cuenta gratis'}
          </p>
        </div>

        <Card style={{ padding: '28px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} type="email" placeholder="tu@email.com"
                  value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Contraseña</label>
                <input style={inputStyle} type="password" placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF3F2', borderRadius: '10px', color: '#E07A5F', fontSize: '13px' }}>
                  {error}
                </div>
              )}
              {success && (
                <div style={{ padding: '10px 14px', background: '#f0faf4', borderRadius: '10px', color: '#2d6a4f', fontSize: '13px' }}>
                  {success}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                padding: '16px', border: 'none', borderRadius: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6A8EAE, #81B29A)',
                color: '#fff', fontWeight: '700', fontSize: '16px', cursor: loading ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {loading ? '...' : mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
              style={{
                background: 'none', border: 'none', color: '#6A8EAE',
                cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                fontFamily: "'DM Sans', sans-serif",
              }}>
              {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </Card>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button onClick={onSkip} style={{
            background: 'none', border: 'none', color: '#94a3b8',
            cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
          }}>
            Continuar sin cuenta (datos solo en este dispositivo)
          </button>
        </div>
      </div>
    </div>
  );
}
