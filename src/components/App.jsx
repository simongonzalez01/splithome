import React, { useState, useEffect, useReducer, useCallback } from 'react';
import { Card, Bar, Pill, MemberAvatar, EmptyState, FloatingButton, SectionLabel, inputStyle, labelStyle } from './UI';
import { ExpenseForm, FixedForm, IncomeForm } from './Forms';
import SetupWizard from './SetupWizard';
import AuthScreen from './AuthScreen';
import HouseholdScreen from './HouseholdScreen';
import { reducer } from '../lib/reducer';
import { calcSplit, calcBalance, getCategoryBreakdown } from '../lib/calc';
import {
  saveLocal, loadLocal, saveHouseholdLocal, loadHouseholdLocal,
  saveCloud, loadCloud, getUser, onAuthChange, signOut,
  getUserHousehold, getHouseholdMembers, subscribeToHousehold,
} from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  CATEGORIES, CURRENCIES, MONTHS, MEMBER_COLORS,
  mkey, fmt, fmtDate, initialState,
} from '../lib/constants';

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [tab, setTab] = useState('home');
  const [month, setMonth] = useState(mkey(new Date()));
  const [showExpForm, setShowExpForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [user, setUser] = useState(null);
  const [authScreen, setAuthScreen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [household, setHousehold] = useState(null); // { id, name, join_code, members }
  const [needsHousehold, setNeedsHousehold] = useState(false);
  const [realtimeSub, setRealtimeSub] = useState(null);

  // Auth listener
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoaded(true);
      return;
    }
    const { data: { subscription } } = onAuthChange(async (event, session) => {
      const u = session?.user || null;
      setUser(u);
      if (u) {
        // Check if user has a household
        const hh = await getUserHousehold(u.id);
        if (hh) {
          setHousehold(hh);
          saveHouseholdLocal(hh);
          // Load shared data
          const cloudData = await loadCloud(hh.id);
          if (cloudData && cloudData.settings) {
            // Sync members from household_members table into settings
            const members = hh.members.map(m => ({
              id: m.user_id,
              name: m.display_name,
              color: m.color,
            }));
            const merged = { ...cloudData, settings: { ...cloudData.settings, members, setupDone: true } };
            dispatch({ type: 'LOAD', payload: merged });
            saveLocal(merged);
          }
          setNeedsHousehold(false);
        } else {
          setNeedsHousehold(true);
        }
      }
      setLoaded(true);
    });
    return () => subscription?.unsubscribe();
  }, []);

  // Real-time sync: listen for changes from other household members
  useEffect(() => {
    if (!household?.id) return;
    const sub = subscribeToHousehold(household.id, (newData) => {
      if (newData && newData.settings) {
        // Keep current members from household
        const members = household.members.map(m => ({
          id: m.user_id,
          name: m.display_name,
          color: m.color,
        }));
        const merged = { ...newData, settings: { ...newData.settings, members } };
        dispatch({ type: 'LOAD', payload: merged });
        saveLocal(merged);
      }
    });
    setRealtimeSub(sub);
    return () => sub?.unsubscribe();
  }, [household?.id]);

  // Load local data on mount
  useEffect(() => {
    const local = loadLocal();
    if (local && local.settings?.setupDone) {
      dispatch({ type: 'LOAD', payload: local });
    }
    if (!isSupabaseConfigured()) setLoaded(true);
  }, []);

  // Auto-save
  useEffect(() => {
    if (!state.settings.setupDone) return;
    saveLocal(state);
    if (household?.id) saveCloud(household.id, state);
  }, [state, household?.id]);

  const s = state.settings;
  const me = s.members;

  // Filtered data
  const monthExp = state.expenses.filter(e => mkey(e.date) === month);
  const monthInc = state.incomes.filter(e => mkey(e.date) === month);
  const totalVar = monthExp.reduce((a, e) => a + e.amount, 0);
  const totalFix = state.fixedExpenses.reduce((a, e) => a + e.amount, 0);
  const totalAll = totalVar + totalFix;
  const totalIncome = monthInc.reduce((a, e) => a + e.amount, 0);

  const allForBalance = [
    ...monthExp,
    ...state.fixedExpenses.map(f => ({ ...f, date: month + '-01' })),
  ];
  const balance = calcBalance(allForBalance, me);
  const cats = getCategoryBreakdown([...monthExp, ...state.fixedExpenses]);
  const maxCat = Math.max(...Object.values(cats), 1);

  // Month navigation
  const months = [];
  for (let i = -6; i <= 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() + i);
    months.push(mkey(d));
  }

  // Loading
  if (!loaded) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f0f4f8', fontFamily: "'DM Sans', sans-serif",
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💰</div>
          <div style={{ color: '#94a3b8', fontSize: '14px' }}>Cargando...</div>
        </div>
      </div>
    );
  }

  // Auth screen (only if supabase configured and user wants to log in)
  if (authScreen && !user) {
    return <AuthScreen onSkip={() => setAuthScreen(false)} />;
  }

  // Household setup (after login, before app)
  if (user && needsHousehold && isSupabaseConfigured()) {
    return <HouseholdScreen user={user} onComplete={async (hh) => {
      const fullHH = await getUserHousehold(user.id);
      setHousehold(fullHH);
      saveHouseholdLocal(fullHH);
      setNeedsHousehold(false);
      // Initialize settings with members
      if (fullHH) {
        const members = fullHH.members.map(m => ({
          id: m.user_id,
          name: m.display_name,
          color: m.color,
        }));
        const newSettings = { ...state.settings, members, setupDone: true };
        dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
      }
    }} />;
  }

  // Setup wizard
  if (!s.setupDone) {
    return <SetupWizard onComplete={(cfg) => dispatch({ type: 'UPDATE_SETTINGS', payload: cfg })} />;
  }

  // Settings panel
  if (showSettings) {
    return (
      <div style={{
        minHeight: '100vh', background: '#f0f4f8',
        fontFamily: "'DM Sans', sans-serif", maxWidth: '500px',
        margin: '0 auto', padding: '20px 16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: '#1a1a2e' }}>⚙️ Configuración</h2>
          <button onClick={() => setShowSettings(false)} style={{
            padding: '10px 18px', border: 'none', borderRadius: '12px',
            background: '#6A8EAE', color: '#fff', fontWeight: '700', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>← Volver</button>
        </div>

        {/* Account */}
        <Card style={{ marginBottom: '14px' }}>
          <SectionLabel>Cuenta</SectionLabel>
          {user ? (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontSize: '14px', color: '#1a1a2e', fontWeight: '600' }}>✅ {user.email}</div>
              {household && (
                <div style={{
                  marginTop: '10px', padding: '14px', background: '#f0f4f8',
                  borderRadius: '12px',
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginBottom: '4px' }}>
                    🏠 {household.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>Código para invitar:</span>
                    <span style={{
                      fontSize: '18px', fontWeight: '800', color: '#6A8EAE',
                      letterSpacing: '2px', fontFamily: 'monospace',
                    }}>{household.join_code}</span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>
                    Comparte este código para que tu pareja/familia se una
                  </p>
                  <div style={{ marginTop: '10px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginBottom: '6px' }}>
                      Miembros ({household.members?.length || 0}):
                    </div>
                    {household.members?.map(m => (
                      <div key={m.id} style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '6px 0',
                      }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: m.color, display: 'flex', alignItems: 'center',
                          justifyContent: 'center', color: '#fff', fontSize: '11px',
                          fontWeight: '800',
                        }}>{m.display_name.charAt(0)}</div>
                        <span style={{ fontSize: '13px', fontWeight: '600' }}>{m.display_name}</span>
                        {m.role === 'owner' && (
                          <span style={{ fontSize: '10px', color: '#F2CC8F', fontWeight: '700' }}>👑</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <button onClick={async () => { await signOut(); setUser(null); setHousehold(null); }} style={{
                padding: '10px 16px', border: '1.5px solid rgba(0,0,0,0.08)',
                borderRadius: '10px', background: '#fff', color: '#64748b',
                cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif",
                marginTop: '10px',
              }}>Cerrar sesión</button>
            </div>
          ) : (
            <div style={{ marginTop: '8px' }}>
              <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 10px' }}>
                {isSupabaseConfigured()
                  ? '🔗 Inicia sesión para compartir gastos con tu pareja'
                  : '📱 Datos guardados en este dispositivo'}
              </p>
              {isSupabaseConfigured() && (
                <button onClick={() => { setShowSettings(false); setAuthScreen(true); }} style={{
                  padding: '10px 16px', border: 'none', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6A8EAE, #81B29A)', color: '#fff',
                  cursor: 'pointer', fontSize: '13px', fontWeight: '600',
                  fontFamily: "'DM Sans', sans-serif",
                }}>Iniciar sesión / Crear cuenta</button>
              )}
            </div>
          )}
        </Card>

        <Card style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Moneda</label>
          <select style={{ ...inputStyle, cursor: 'pointer' }} value={s.currency}
            onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { currency: e.target.value } })}>
            {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>)}
          </select>
        </Card>

        <Card style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Presupuesto mensual</label>
          <input style={inputStyle} type="number" value={s.monthlyBudget || ''}
            onChange={e => dispatch({ type: 'UPDATE_SETTINGS', payload: { monthlyBudget: parseFloat(e.target.value) || 0 } })}
            placeholder="0.00" />
        </Card>

        <Card style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Miembros</label>
          {s.members.map((m, i) => (
            <div key={m.id} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <MemberAvatar member={m} size={32} />
              <input style={{ ...inputStyle, padding: '10px 12px' }} value={m.name}
                onChange={e => {
                  const updated = [...s.members];
                  updated[i] = { ...m, name: e.target.value };
                  dispatch({ type: 'UPDATE_SETTINGS', payload: { members: updated } });
                }} />
            </div>
          ))}
        </Card>

        <Card style={{ background: '#FEF3F2' }}>
          <p style={{ color: '#E07A5F', fontSize: '13px', fontWeight: '600', margin: '0 0 12px' }}>⚠️ Zona de peligro</p>
          <button onClick={() => {
            if (confirm('¿Borrar TODOS los datos? Esta acción no se puede deshacer.')) {
              dispatch({ type: 'RESET', payload: initialState });
              saveLocal(initialState);
              setShowSettings(false);
            }
          }} style={{
            padding: '12px 20px', border: '2px solid #E07A5F', borderRadius: '12px',
            background: 'transparent', color: '#E07A5F', fontWeight: '700', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", fontSize: '13px',
          }}>🗑️ Borrar todos los datos</button>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'home', icon: '📊', label: 'Inicio' },
    { id: 'expenses', icon: '💸', label: 'Gastos' },
    { id: 'fixed', icon: '📌', label: 'Fijos' },
    { id: 'income', icon: '💵', label: 'Ingresos' },
    { id: 'balance', icon: '⚖️', label: 'Balance' },
  ];

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f4f8',
      fontFamily: "'DM Sans', sans-serif",
      maxWidth: '500px', margin: '0 auto',
      padding: '16px 16px 120px',
    }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif", fontSize: '24px',
            fontWeight: '800', color: '#1a1a2e', margin: 0,
          }}>SplitHome</h1>
          <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
            {household ? `🏠 ${household.name}` : me.map(m => m.name).join(' & ')}
            {user && household && <span style={{ color: '#81B29A' }}> · ☁️ sincronizado</span>}
          </p>
        </div>
        <button onClick={() => setShowSettings(true)} style={{
          width: '40px', height: '40px', borderRadius: '12px', border: 'none',
          background: '#fff', cursor: 'pointer', fontSize: '18px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>⚙️</button>
      </div>

      {/* MONTH PICKER */}
      <div style={{
        display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '16px',
        padding: '2px 0', scrollbarWidth: 'none',
      }}>
        {months.map(m => {
          const [y, mo] = m.split('-');
          const isActive = m === month;
          return (
            <button key={m} onClick={() => setMonth(m)} style={{
              padding: '8px 14px', border: 'none', borderRadius: '10px',
              background: isActive ? '#1a1a2e' : '#fff',
              color: isActive ? '#fff' : '#94a3b8',
              fontWeight: isActive ? '700' : '500', fontSize: '12px', cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif", flexShrink: 0,
              boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              {MONTHS[parseInt(mo) - 1]} {y.slice(2)}
            </button>
          );
        })}
      </div>

      {/* TABS */}
      <div style={{
        display: 'flex', gap: '2px', background: '#fff',
        borderRadius: '16px', padding: '4px', marginBottom: '20px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '10px 4px', border: 'none', borderRadius: '14px',
            background: tab === t.id ? '#1a1a2e' : 'transparent',
            color: tab === t.id ? '#fff' : '#94a3b8',
            fontWeight: tab === t.id ? '700' : '500',
            fontSize: '11px', cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <span style={{ display: 'block', fontSize: '16px', marginBottom: '1px' }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ===== HOME ===== */}
      {tab === 'home' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Card>
              <SectionLabel>Ingresos</SectionLabel>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', marginTop: '2px' }}>{fmt(totalIncome, s.currency)}</div>
            </Card>
            <Card>
              <SectionLabel>Gastos</SectionLabel>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#1a1a2e', marginTop: '2px' }}>{fmt(totalAll, s.currency)}</div>
            </Card>
          </div>

          <Card style={{
            background: (totalIncome - totalAll) >= 0
              ? 'linear-gradient(135deg, #f0faf4, #e8f5ee)'
              : 'linear-gradient(135deg, #fef3f0, #fde8e4)',
          }}>
            <SectionLabel>Disponible este mes</SectionLabel>
            <div style={{
              fontSize: '34px', fontWeight: '800', fontFamily: "'Playfair Display', serif",
              color: (totalIncome - totalAll) >= 0 ? '#2d6a4f' : '#c1121f', marginTop: '4px',
            }}>
              {fmt(totalIncome - totalAll, s.currency)}
            </div>
            {s.monthlyBudget > 0 && (
              <div style={{ marginTop: '10px' }}>
                <Bar value={totalAll} max={s.monthlyBudget} color={totalAll > s.monthlyBudget ? '#E07A5F' : '#81B29A'} height={8} />
                <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px' }}>
                  {Math.round((totalAll / s.monthlyBudget) * 100)}% del presupuesto ({fmt(s.monthlyBudget, s.currency)})
                </div>
              </div>
            )}
          </Card>

          <Card>
            <SectionLabel>⚖️ Deudas entre ustedes</SectionLabel>
            <div style={{ marginTop: '10px' }}>
              {balance.debts.length === 0 ? (
                <div style={{ color: '#81B29A', fontWeight: '700', fontSize: '16px' }}>✅ ¡Todo cuadrado!</div>
              ) : (
                balance.debts.map((d, i) => {
                  const from = me.find(m => m.id === d.from);
                  const to = me.find(m => m.id === d.to);
                  return (
                    <div key={i} style={{
                      padding: '12px', background: '#fef9f4', borderRadius: '12px',
                      border: '1px solid rgba(224,122,95,0.1)', marginBottom: '8px',
                    }}>
                      <span style={{ color: from?.color, fontWeight: '700' }}>{from?.name}</span>
                      <span style={{ color: '#94a3b8' }}> le debe a </span>
                      <span style={{ color: to?.color, fontWeight: '700' }}>{to?.name}</span>
                      <div style={{ fontSize: '24px', fontWeight: '800', color: '#E07A5F', fontFamily: "'Playfair Display', serif", marginTop: '4px' }}>
                        {fmt(d.amount, s.currency)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {Object.keys(cats).length > 0 && (
            <Card>
              <SectionLabel>Gastos por categoría</SectionLabel>
              <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
                {Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([id, amt]) => {
                  const c = CATEGORIES.find(x => x.id === id);
                  return (
                    <div key={id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', color: '#1a1a2e' }}>{c?.icon} {c?.label}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: c?.color }}>{fmt(amt, s.currency)}</span>
                      </div>
                      <Bar value={amt} max={maxCat} color={c?.color || '#6A8EAE'} />
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          <Card>
            <SectionLabel>Gasto por persona</SectionLabel>
            <div style={{ display: 'grid', gap: '10px', marginTop: '12px' }}>
              {me.map(m => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MemberAvatar member={m} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600' }}>{m.name}</span>
                      <span style={{ fontSize: '14px', fontWeight: '700', color: m.color }}>{fmt(balance.owes[m.id] || 0, s.currency)}</span>
                    </div>
                    <Bar value={balance.owes[m.id] || 0} max={totalAll || 1} color={m.color} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <FloatingButton onClick={() => { setTab('expenses'); setShowExpForm(true); }} />
        </div>
      )}

      {/* ===== EXPENSES ===== */}
      {tab === 'expenses' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          {showExpForm ? (
            <Card>
              <h3 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: '700', color: '#1a1a2e' }}>Nuevo Gasto</h3>
              <ExpenseForm settings={s} onSubmit={exp => { dispatch({ type: 'ADD_EXPENSE', payload: exp }); setShowExpForm(false); }} onCancel={() => setShowExpForm(false)} />
            </Card>
          ) : (
            <button onClick={() => setShowExpForm(true)} style={{
              padding: '16px', border: '2px dashed rgba(0,0,0,0.08)', borderRadius: '16px',
              background: '#fff', color: '#6A8EAE', fontWeight: '700', fontSize: '15px',
              cursor: 'pointer', fontFamily: "'DM Sans', sans-serif",
            }}>+ Agregar Gasto</button>
          )}

          {monthExp.length === 0 ? (
            <Card><EmptyState icon="📭" message="No hay gastos este mes" /></Card>
          ) : (
            <Card>
              <SectionLabel>{monthExp.length} gastos · {fmt(totalVar, s.currency)}</SectionLabel>
              <div style={{ display: 'grid', gap: '6px', marginTop: '12px' }}>
                {[...monthExp].reverse().map(exp => {
                  const c = CATEGORIES.find(x => x.id === exp.category);
                  const payer = me.find(m => m.id === exp.paidBy);
                  const shares = calcSplit(exp, me);
                  return (
                    <div key={exp.id} style={{
                      padding: '12px', background: '#fafafa', borderRadius: '14px',
                      borderLeft: `3px solid ${c?.color || '#6A8EAE'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{exp.description}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            {c?.icon} {c?.label} · {fmtDate(exp.date)}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                            <span style={{ color: payer?.color, fontWeight: '600' }}>{payer?.name}</span> pagó
                            {me.length <= 3 && me.map(m => (
                              <span key={m.id}> · {m.name.split(' ')[0]}: {fmt(shares[m.id], s.currency)}</span>
                            ))}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '800' }}>{fmt(exp.amount, s.currency)}</div>
                          <button onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: exp.id })}
                            style={{ background: 'none', border: 'none', color: '#E07A5F', cursor: 'pointer', fontSize: '11px', fontFamily: "'DM Sans', sans-serif", marginTop: '4px' }}>
                            eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ===== FIXED ===== */}
      {tab === 'fixed' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: '700', color: '#1a1a2e' }}>📌 Gastos Fijos Mensuales</h3>
            <FixedForm settings={s} onSubmit={exp => dispatch({ type: 'ADD_FIXED', payload: exp })} />
          </Card>
          <Card>
            <SectionLabel>Total fijos mensual</SectionLabel>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#E07A5F', fontFamily: "'Playfair Display', serif", margin: '4px 0 16px' }}>
              {fmt(totalFix, s.currency)}
            </div>
            {state.fixedExpenses.length === 0 ? (
              <EmptyState icon="📋" message="Agrega alquiler, carro, seguros..." />
            ) : (
              <div style={{ display: 'grid', gap: '6px' }}>
                {state.fixedExpenses.map(exp => {
                  const c = CATEGORIES.find(x => x.id === exp.category);
                  const payer = me.find(m => m.id === exp.paidBy);
                  return (
                    <div key={exp.id} style={{
                      padding: '12px', background: '#fafafa', borderRadius: '14px',
                      borderLeft: `3px solid ${c?.color || '#607D8B'}`,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: '600' }}>{exp.description}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                            {c?.icon} {c?.label} · Día {exp.dueDay} · <span style={{ color: payer?.color }}>{payer?.name}</span>
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '16px', fontWeight: '800' }}>{fmt(exp.amount, s.currency)}</div>
                          <button onClick={() => dispatch({ type: 'DELETE_FIXED', payload: exp.id })}
                            style={{ background: 'none', border: 'none', color: '#E07A5F', cursor: 'pointer', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>
                            eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ===== INCOME ===== */}
      {tab === 'income' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          <Card>
            <h3 style={{ margin: '0 0 14px', fontSize: '17px', fontWeight: '700', color: '#1a1a2e' }}>💵 Registrar Ingreso</h3>
            <IncomeForm settings={s} onSubmit={inc => dispatch({ type: 'ADD_INCOME', payload: inc })} />
          </Card>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(me.length, 2)}, 1fr)`, gap: '10px' }}>
            {me.map(m => {
              const total = monthInc.filter(i => i.person === m.id).reduce((a, i) => a + i.amount, 0);
              return (
                <Card key={m.id}>
                  <div style={{ fontSize: '11px', color: m.color, fontWeight: '700', textTransform: 'uppercase' }}>{m.name}</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', marginTop: '2px' }}>{fmt(total, s.currency)}</div>
                </Card>
              );
            })}
          </div>
          <Card>
            <SectionLabel>Historial</SectionLabel>
            {monthInc.length === 0 ? (
              <EmptyState icon="💵" message="Sin ingresos este mes" />
            ) : (
              <div style={{ display: 'grid', gap: '6px', marginTop: '12px' }}>
                {[...monthInc].reverse().map(inc => {
                  const person = me.find(m => m.id === inc.person);
                  return (
                    <div key={inc.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 12px', background: '#fafafa', borderRadius: '12px',
                    }}>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600' }}>{inc.description}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          <span style={{ color: person?.color }}>{person?.name}</span> · {fmtDate(inc.date)}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '15px', fontWeight: '700', color: '#81B29A' }}>{fmt(inc.amount, s.currency)}</div>
                        <button onClick={() => dispatch({ type: 'DELETE_INCOME', payload: inc.id })}
                          style={{ background: 'none', border: 'none', color: '#E07A5F', cursor: 'pointer', fontSize: '11px', fontFamily: "'DM Sans', sans-serif" }}>🗑</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ===== BALANCE ===== */}
      {tab === 'balance' && (
        <div style={{ display: 'grid', gap: '14px' }}>
          <Card style={{
            textAlign: 'center', padding: '30px 20px',
            background: balance.debts.length === 0
              ? 'linear-gradient(135deg, #f0faf4, #e8f5ee)'
              : 'linear-gradient(135deg, #fef9f4, #fef3f0)',
          }}>
            <div style={{ fontSize: '42px', marginBottom: '6px' }}>⚖️</div>
            <SectionLabel>Balance de cuentas</SectionLabel>
            <div style={{ marginTop: '14px' }}>
              {balance.debts.length === 0 ? (
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#2d6a4f' }}>✅ Nadie debe nada</div>
              ) : (
                balance.debts.map((d, i) => {
                  const from = me.find(m => m.id === d.from);
                  const to = me.find(m => m.id === d.to);
                  return (
                    <div key={i} style={{ marginBottom: '12px' }}>
                      <div style={{ fontSize: '15px' }}>
                        <span style={{ color: from?.color, fontWeight: '700' }}>{from?.name}</span>
                        <span style={{ color: '#94a3b8' }}> → </span>
                        <span style={{ color: to?.color, fontWeight: '700' }}>{to?.name}</span>
                      </div>
                      <div style={{ fontSize: '38px', fontWeight: '800', fontFamily: "'Playfair Display', serif", color: '#E07A5F' }}>
                        {fmt(d.amount, s.currency)}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(me.length, 2)}, 1fr)`, gap: '10px' }}>
            {me.map(m => (
              <Card key={m.id}>
                <MemberAvatar member={m} size={40} />
                <div style={{ fontSize: '14px', fontWeight: '700', margin: '8px 0' }}>{m.name}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Pagó:</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#81B29A' }}>{fmt(balance.paid[m.id] || 0, s.currency)}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '6px' }}>Le toca:</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#E07A5F' }}>{fmt(balance.owes[m.id] || 0, s.currency)}</div>
              </Card>
            ))}
          </div>

          <Card>
            <SectionLabel>Detalle por gasto</SectionLabel>
            {allForBalance.length === 0 ? (
              <EmptyState icon="📋" message="No hay gastos para dividir" />
            ) : (
              <div style={{ display: 'grid', gap: '5px', marginTop: '12px' }}>
                {allForBalance.map(exp => {
                  const c = CATEGORIES.find(x => x.id === exp.category);
                  const payer = me.find(m => m.id === exp.paidBy);
                  const shares = calcSplit(exp, me);
                  return (
                    <div key={exp.id} style={{ padding: '10px', background: '#fafafa', borderRadius: '10px', fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                        <span style={{ fontWeight: '600' }}>{exp.description}</span>
                        <span style={{ fontWeight: '700', color: c?.color }}>{fmt(exp.amount, s.currency)}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '11px' }}>
                        <span style={{ color: payer?.color }}>{payer?.name}</span> pagó · {me.map(m =>
                          <span key={m.id}>{m.name.split(' ')[0]}: {fmt(shares[m.id], s.currency)} </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
