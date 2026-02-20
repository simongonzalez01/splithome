import React, { useState } from 'react';
import { Card, Pill, inputStyle, labelStyle } from './UI';
import { CURRENCIES, MEMBER_COLORS } from '../lib/constants';

export default function SetupWizard({ onComplete }) {
  const [step, setStep] = useState(0);
  const [names, setNames] = useState(['', '']);
  const [count, setCount] = useState(2);
  const [currency, setCurrency] = useState('USD');
  const [budget, setBudget] = useState('');

  const finish = () => {
    const members = names.slice(0, count).map((n, i) => ({
      id: `p${i + 1}`,
      name: n || `Persona ${i + 1}`,
      color: MEMBER_COLORS[i] || '#607D8B',
    }));
    onComplete({
      currency,
      members,
      monthlyBudget: parseFloat(budget) || 0,
      setupDone: true,
    });
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center', padding: '24px',
      background: 'linear-gradient(180deg, #f0f4f8 0%, #e8f0fe 100%)',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '32px',
            fontWeight: '800', color: '#1a1a2e', margin: '0 0 8px',
          }}>SplitHome</h1>
          <p style={{ color: '#64748b', fontSize: '15px' }}>Finanzas del hogar, simplificadas</p>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {[0, 1].map(i => (
            <div key={i} style={{
              width: step === i ? '24px' : '8px', height: '8px',
              borderRadius: '4px', transition: 'all 0.3s',
              background: step >= i ? '#6A8EAE' : 'rgba(0,0,0,0.08)',
            }} />
          ))}
        </div>

        {step === 0 && (
          <Card style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>
              ¿Cuántas personas comparten gastos?
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' }}>
              Pareja, familia, roommates...
            </p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
              {[2, 3, 4].map(n => (
                <Pill key={n} active={count === n} onClick={() => {
                  setCount(n);
                  setNames(prev => {
                    const a = [...prev];
                    while (a.length < n) a.push('');
                    return a;
                  });
                }}>
                  {n} personas
                </Pill>
              ))}
            </div>
            {Array.from({ length: count }).map((_, i) => (
              <div key={i} style={{ marginBottom: '12px' }}>
                <label style={labelStyle}>
                  <span style={{
                    display: 'inline-block', width: '18px', height: '18px',
                    borderRadius: '50%', background: MEMBER_COLORS[i],
                    marginRight: '8px', verticalAlign: 'middle',
                  }} />
                  Persona {i + 1}
                </label>
                <input
                  style={inputStyle}
                  placeholder={`Nombre (ej: ${['Juan', 'María', 'Carlos', 'Ana'][i]})`}
                  value={names[i] || ''}
                  onChange={e => {
                    const a = [...names];
                    a[i] = e.target.value;
                    setNames(a);
                  }}
                />
              </div>
            ))}
            <button onClick={() => setStep(1)} style={{
              width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
              background: 'linear-gradient(135deg, #6A8EAE, #81B29A)', color: '#fff',
              fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '8px',
              fontFamily: "'DM Sans', sans-serif",
            }}>
              Continuar →
            </button>
          </Card>
        )}

        {step === 1 && (
          <Card style={{ padding: '28px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#1a1a2e', margin: '0 0 4px' }}>
              Últimos detalles
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' }}>
              Puedes cambiar todo esto después en configuración
            </p>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>Moneda</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }} value={currency}
                onChange={e => setCurrency(e.target.value)}>
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={labelStyle}>Presupuesto mensual (opcional)</label>
              <input style={inputStyle} type="number" placeholder="0.00"
                value={budget} onChange={e => setBudget(e.target.value)} />
              <p style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                Te avisaremos cuando estés cerca del límite
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setStep(0)} style={{
                padding: '16px 24px', border: '1.5px solid rgba(0,0,0,0.08)',
                borderRadius: '14px', background: '#fff', color: '#64748b',
                cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: '600',
              }}>← Atrás</button>
              <button onClick={finish} style={{
                flex: 1, padding: '16px', border: 'none', borderRadius: '14px',
                background: 'linear-gradient(135deg, #6A8EAE, #81B29A)', color: '#fff',
                fontWeight: '700', fontSize: '16px', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}>¡Empezar! 🚀</button>
            </div>
          </Card>
        )}

        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '12px', marginTop: '20px' }}>
          🔒 Tus datos son privados y están encriptados
        </p>
      </div>
    </div>
  );
}
