import React, { useState } from 'react';
import { Card, inputStyle, labelStyle, Pill } from './UI';
import { createHousehold, joinHousehold } from '../lib/storage';

export default function HouseholdScreen({ user, onComplete }) {
  const [mode, setMode] = useState(null); // null | 'create' | 'join'
  const [name, setName] = useState('');
  const [houseName, setHouseName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    if (!name.trim()) { setError('Escribe tu nombre'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await createHousehold(user.id, name.trim(), houseName.trim() || 'Mi Hogar');
    if (err) { setError(err.message); setLoading(false); return; }
    onComplete(data);
  };

  const handleJoin = async () => {
    if (!name.trim()) { setError('Escribe tu nombre'); return; }
    if (!code.trim()) { setError('Escribe el código del hogar'); return; }
    setLoading(true); setError('');
    const { data, error: err } = await joinHousehold(user.id, code.trim(), name.trim());
    if (err) { setError(err.message); setLoading(false); return; }
    onComplete(data);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '24px',
      background: 'linear-gradient(180deg, #f0f4f8 0%, #e8f0fe 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏠</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '28px',
            fontWeight: '800', color: '#1a1a2e', margin: '0 0 8px',
          }}>Configura tu Hogar</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Conecta con tu pareja o roommates para compartir gastos
          </p>
        </div>

        {!mode && (
          <div style={{ display: 'grid', gap: '14px' }}>
            <Card onClick={() => setMode('create')} style={{
              cursor: 'pointer', padding: '24px',
              border: '2px solid transparent',
              transition: 'border 0.2s',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✨</div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: '#1a1a2e' }}>
                Crear nuevo hogar
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                Crea tu hogar y comparte el código con tu pareja/familia
              </p>
            </Card>

            <Card onClick={() => setMode('join')} style={{
              cursor: 'pointer', padding: '24px',
              border: '2px solid transparent',
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔗</div>
              <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: '700', color: '#1a1a2e' }}>
                Unirme a un hogar
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: 0 }}>
                Tengo un código de invitación (ej: CASA-A7K3)
              </p>
            </Card>
          </div>
        )}

        {mode === 'create' && (
          <Card style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>
              ✨ Crear Hogar
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' }}>
              Después de crear, recibirás un código para invitar a los demás
            </p>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Tu nombre</label>
                <input style={inputStyle} placeholder="Ej: Simon" value={name}
                  onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Nombre del hogar (opcional)</label>
                <input style={inputStyle} placeholder="Ej: Casa de los García" value={houseName}
                  onChange={e => setHouseName(e.target.value)} />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF3F2', borderRadius: '10px', color: '#E07A5F', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <button onClick={handleCreate} disabled={loading} style={{
                padding: '16px', border: 'none', borderRadius: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6A8EAE, #81B29A)',
                color: '#fff', fontWeight: '700', fontSize: '16px',
                cursor: loading ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {loading ? 'Creando...' : 'Crear Hogar 🏠'}
              </button>
              <button onClick={() => { setMode(null); setError(''); }} style={{
                padding: '12px', border: 'none', background: 'none',
                color: '#94a3b8', cursor: 'pointer', fontSize: '13px',
                fontFamily: "'DM Sans', sans-serif",
              }}>← Volver</button>
            </div>
          </Card>
        )}

        {mode === 'join' && (
          <Card style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>
              🔗 Unirme a un Hogar
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' }}>
              Pide el código a quien creó el hogar
            </p>
            <div style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={labelStyle}>Tu nombre</label>
                <input style={inputStyle} placeholder="Ej: Kamilia" value={name}
                  onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Código del hogar</label>
                <input style={{
                  ...inputStyle,
                  fontSize: '22px', fontWeight: '800', textAlign: 'center',
                  letterSpacing: '3px', textTransform: 'uppercase',
                }}
                  placeholder="CASA-XXXX" value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  maxLength={9}
                />
              </div>

              {error && (
                <div style={{ padding: '10px 14px', background: '#FEF3F2', borderRadius: '10px', color: '#E07A5F', fontSize: '13px' }}>
                  {error}
                </div>
              )}

              <button onClick={handleJoin} disabled={loading} style={{
                padding: '16px', border: 'none', borderRadius: '14px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #E07A5F, #F2CC8F)',
                color: '#fff', fontWeight: '700', fontSize: '16px',
                cursor: loading ? 'default' : 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>
                {loading ? 'Conectando...' : 'Unirme 🔗'}
              </button>
              <button onClick={() => { setMode(null); setError(''); }} style={{
                padding: '12px', border: 'none', background: 'none',
                color: '#94a3b8', cursor: 'pointer', fontSize: '13px',
                fontFamily: "'DM Sans', sans-serif",
              }}>← Volver</button>
            </div>
          </Card>
        )}

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '20px' }}>
          🔒 Cada miembro necesita su propia cuenta para unirse
        </p>
      </div>
    </div>
  );
}
