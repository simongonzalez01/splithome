import React from 'react';

export const inputStyle = {
  width: '100%', padding: '14px 16px',
  border: '1.5px solid rgba(0,0,0,0.08)', borderRadius: '14px',
  background: '#fff', color: '#1a1a2e', fontSize: '15px',
  fontFamily: "'DM Sans', sans-serif", outline: 'none',
  boxSizing: 'border-box', transition: 'border 0.2s, box-shadow 0.2s',
};

export const labelStyle = {
  display: 'block', color: '#64748b', fontSize: '12px',
  fontWeight: '700', marginBottom: '6px', letterSpacing: '0.4px',
  textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif",
};

export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: '20px', padding: '20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.04), 0 4px 20px rgba(0,0,0,0.03)',
      border: '1px solid rgba(0,0,0,0.04)',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
      {children}
    </div>
  );
}

export function Bar({ value, max, color, height = 6 }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <div style={{ height, background: 'rgba(0,0,0,0.04)', borderRadius: height / 2, overflow: 'hidden' }}>
      <div style={{
        height: '100%', width: `${pct}%`, background: color,
        borderRadius: height / 2, transition: 'width 0.6s cubic-bezier(.4,0,.2,1)',
      }} />
    </div>
  );
}

export function Pill({ active, children, onClick, color = '#6A8EAE' }) {
  return (
    <button onClick={onClick} style={{
      padding: '10px 16px',
      border: active ? `2px solid ${color}` : '2px solid rgba(0,0,0,0.06)',
      borderRadius: '12px',
      background: active ? `${color}10` : '#fafafa',
      color: active ? color : '#64748b',
      cursor: 'pointer', fontSize: '13px',
      fontWeight: active ? '700' : '500',
      fontFamily: "'DM Sans', sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {children}
    </button>
  );
}

export function MemberAvatar({ member, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: member.color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontWeight: '800',
      fontSize: size * 0.4, flexShrink: 0,
    }}>
      {member.name.charAt(0).toUpperCase()}
    </div>
  );
}

export function EmptyState({ icon, message }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div style={{ fontSize: '40px', marginBottom: '10px' }}>{icon}</div>
      <div style={{ color: '#94a3b8', fontSize: '14px' }}>{message}</div>
    </div>
  );
}

export function FloatingButton({ onClick }) {
  return (
    <button onClick={onClick} style={{
      position: 'fixed', bottom: '28px', right: 'max(16px, calc(50% - 234px))',
      width: '58px', height: '58px', borderRadius: '50%',
      background: 'linear-gradient(135deg, #6A8EAE, #81B29A)',
      border: 'none', color: '#fff', fontSize: '26px', cursor: 'pointer',
      boxShadow: '0 6px 28px rgba(106,142,174,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 50, fontWeight: '300',
    }}>
      +
    </button>
  );
}

export function SectionLabel({ children }) {
  return (
    <div style={{
      color: '#64748b', fontSize: '11px', fontWeight: '700',
      textTransform: 'uppercase', letterSpacing: '0.5px',
    }}>
      {children}
    </div>
  );
}
