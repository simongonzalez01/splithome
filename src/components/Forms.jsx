import React, { useState } from 'react';
import { inputStyle, labelStyle, Pill } from './UI';
import { CATEGORIES, uid } from '../lib/constants';

// ===== EXPENSE FORM =====
export function ExpenseForm({ settings, onSubmit, onCancel, initial }) {
  const today = new Date().toISOString().split('T')[0];
  const me = settings.members;
  const [form, setForm] = useState(initial || {
    description: '', amount: '', category: 'groceries', date: today,
    paidBy: me[0]?.id, splitType: 'equal', soloOwner: me[0]?.id,
    customSplits: Object.fromEntries(me.map(m => [m.id, Math.round(100 / me.length)])),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onSubmit({ ...form, id: initial?.id || uid(), amount: parseFloat(form.amount) });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Descripción</label>
          <input style={inputStyle} placeholder="¿En qué gastaste?" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Monto</label>
            <input style={inputStyle} type="number" step="0.01" placeholder="0.00" value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input style={inputStyle} type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>Categoría</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {CATEGORIES.map(c => (
              <button type="button" key={c.id} onClick={() => setForm({ ...form, category: c.id })}
                style={{
                  padding: '8px 4px',
                  border: form.category === c.id ? `2px solid ${c.color}` : '2px solid transparent',
                  borderRadius: '10px',
                  background: form.category === c.id ? `${c.color}12` : '#f8f9fa',
                  color: form.category === c.id ? c.color : '#64748b',
                  cursor: 'pointer', fontSize: '11px',
                  fontWeight: form.category === c.id ? '700' : '500',
                  fontFamily: "'DM Sans', sans-serif", textAlign: 'center',
                }}>
                <span style={{ display: 'block', fontSize: '16px' }}>{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>¿Quién pagó?</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {me.map(m => (
              <Pill key={m.id} active={form.paidBy === m.id}
                onClick={() => setForm({ ...form, paidBy: m.id })} color={m.color}>
                {m.name}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>¿Cómo se divide?</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Pill active={form.splitType === 'equal'} onClick={() => setForm({ ...form, splitType: 'equal' })}>
              Partes iguales
            </Pill>
            <Pill active={form.splitType === 'solo'} onClick={() => setForm({ ...form, splitType: 'solo' })}>
              Solo uno
            </Pill>
            <Pill active={form.splitType === 'custom'} onClick={() => setForm({ ...form, splitType: 'custom' })}>
              Personalizado
            </Pill>
          </div>
        </div>
        {form.splitType === 'solo' && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {me.map(m => (
              <Pill key={m.id} active={form.soloOwner === m.id}
                onClick={() => setForm({ ...form, soloOwner: m.id })} color={m.color}>
                Solo {m.name}
              </Pill>
            ))}
          </div>
        )}
        {form.splitType === 'custom' && (
          <div style={{ display: 'grid', gap: '8px' }}>
            {me.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: m.color, width: '80px' }}>{m.name}</span>
                <input type="range" min="0" max="100" value={form.customSplits?.[m.id] || 0}
                  onChange={e => setForm({
                    ...form,
                    customSplits: { ...form.customSplits, [m.id]: parseInt(e.target.value) }
                  })}
                  style={{ flex: 1, accentColor: m.color }} />
                <span style={{ fontSize: '13px', fontWeight: '700', width: '36px', textAlign: 'right' }}>
                  {form.customSplits?.[m.id] || 0}%
                </span>
              </div>
            ))}
          </div>
        )}
        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
          <button type="submit" style={{
            flex: 1, padding: '16px', border: 'none', borderRadius: '14px',
            background: 'linear-gradient(135deg, #6A8EAE, #81B29A)', color: '#fff',
            fontWeight: '700', fontSize: '15px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>✓ Guardar</button>
          {onCancel && (
            <button type="button" onClick={onCancel} style={{
              padding: '16px 20px', border: '1.5px solid rgba(0,0,0,0.08)',
              borderRadius: '14px', background: '#fff', color: '#94a3b8',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: '600',
            }}>✕</button>
          )}
        </div>
      </div>
    </form>
  );
}

// ===== FIXED EXPENSE FORM =====
export function FixedForm({ settings, onSubmit }) {
  const me = settings.members;
  const [form, setForm] = useState({
    description: '', amount: '', category: 'housing', dueDay: 1,
    splitType: 'equal', paidBy: me[0]?.id, soloOwner: me[0]?.id,
    customSplits: Object.fromEntries(me.map(m => [m.id, Math.round(100 / me.length)])),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onSubmit({ ...form, id: uid(), amount: parseFloat(form.amount), dueDay: parseInt(form.dueDay) });
    setForm({ ...form, description: '', amount: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Descripción</label>
          <input style={inputStyle} placeholder="Ej: Alquiler, Carro, Internet..."
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Monto</label>
            <input style={inputStyle} type="number" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Día vence</label>
            <input style={inputStyle} type="number" min="1" max="31"
              value={form.dueDay} onChange={e => setForm({ ...form, dueDay: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Categoría</label>
            <select style={{ ...inputStyle, cursor: 'pointer', padding: '14px 8px' }}
              value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label style={labelStyle}>¿Quién lo paga?</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {me.map(m => (
              <Pill key={m.id} active={form.paidBy === m.id}
                onClick={() => setForm({ ...form, paidBy: m.id })} color={m.color}>
                {m.name}
              </Pill>
            ))}
          </div>
        </div>
        <div>
          <label style={labelStyle}>División</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Pill active={form.splitType === 'equal'} onClick={() => setForm({ ...form, splitType: 'equal' })}>Partes iguales</Pill>
            <Pill active={form.splitType === 'solo'} onClick={() => setForm({ ...form, splitType: 'solo' })}>Solo uno</Pill>
            <Pill active={form.splitType === 'custom'} onClick={() => setForm({ ...form, splitType: 'custom' })}>Personalizado</Pill>
          </div>
        </div>
        {form.splitType === 'solo' && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {me.map(m => (
              <Pill key={m.id} active={form.soloOwner === m.id}
                onClick={() => setForm({ ...form, soloOwner: m.id })} color={m.color}>{m.name}</Pill>
            ))}
          </div>
        )}
        <button type="submit" style={{
          width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
          background: 'linear-gradient(135deg, #E07A5F, #F2CC8F)', color: '#fff',
          fontWeight: '700', fontSize: '15px', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>+ Agregar Gasto Fijo</button>
      </div>
    </form>
  );
}

// ===== INCOME FORM =====
export function IncomeForm({ settings, onSubmit }) {
  const today = new Date().toISOString().split('T')[0];
  const me = settings.members;
  const [form, setForm] = useState({
    description: '', amount: '', person: me[0]?.id, date: today,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.amount) return;
    onSubmit({ ...form, id: uid(), amount: parseFloat(form.amount) });
    setForm({ ...form, description: '', amount: '' });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: 'grid', gap: '14px' }}>
        <div>
          <label style={labelStyle}>Descripción</label>
          <input style={inputStyle} placeholder="Ej: Salario, freelance, ventas..."
            value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <label style={labelStyle}>Monto</label>
            <input style={inputStyle} type="number" step="0.01" placeholder="0.00"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          </div>
          <div>
            <label style={labelStyle}>Fecha</label>
            <input style={inputStyle} type="date" value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>¿De quién?</label>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {me.map(m => (
              <Pill key={m.id} active={form.person === m.id}
                onClick={() => setForm({ ...form, person: m.id })} color={m.color}>
                {m.name}
              </Pill>
            ))}
          </div>
        </div>
        <button type="submit" style={{
          width: '100%', padding: '16px', border: 'none', borderRadius: '14px',
          background: 'linear-gradient(135deg, #81B29A, #4ECDC4)', color: '#fff',
          fontWeight: '700', fontSize: '15px', cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif",
        }}>+ Agregar Ingreso</button>
      </div>
    </form>
  );
}
