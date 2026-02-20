export const CATEGORIES = [
  { id: "housing", label: "Vivienda", icon: "🏠", color: "#E07A5F" },
  { id: "transport", label: "Transporte", icon: "🚗", color: "#3D405B" },
  { id: "groceries", label: "Supermercado", icon: "🛒", color: "#81B29A" },
  { id: "restaurants", label: "Restaurantes", icon: "🍽️", color: "#D4A373" },
  { id: "utilities", label: "Servicios", icon: "💡", color: "#6A8EAE" },
  { id: "health", label: "Salud", icon: "🏥", color: "#E63946" },
  { id: "kids", label: "Hijos", icon: "👶", color: "#F2CC8F" },
  { id: "pets", label: "Mascotas", icon: "🐾", color: "#BC8A5F" },
  { id: "entertainment", label: "Entretenimiento", icon: "🎬", color: "#8338EC" },
  { id: "shopping", label: "Compras", icon: "🛍️", color: "#FF6B6B" },
  { id: "education", label: "Educación", icon: "📚", color: "#4ECDC4" },
  { id: "insurance", label: "Seguros", icon: "🛡️", color: "#556B2F" },
  { id: "subscriptions", label: "Suscripciones", icon: "📺", color: "#9C27B0" },
  { id: "savings", label: "Ahorro", icon: "🏦", color: "#2196F3" },
  { id: "personal", label: "Personal", icon: "💰", color: "#FF9800" },
  { id: "travel", label: "Viajes", icon: "✈️", color: "#00BCD4" },
  { id: "gifts", label: "Regalos", icon: "🎁", color: "#E91E63" },
  { id: "other", label: "Otro", icon: "📦", color: "#607D8B" },
];

export const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "MXN", symbol: "$", label: "Peso Mexicano" },
  { code: "COP", symbol: "$", label: "Peso Colombiano" },
  { code: "ARS", symbol: "$", label: "Peso Argentino" },
  { code: "BRL", symbol: "R$", label: "Real Brasileño" },
  { code: "VES", symbol: "Bs", label: "Bolívar" },
  { code: "PEN", symbol: "S/", label: "Sol Peruano" },
  { code: "CLP", symbol: "$", label: "Peso Chileno" },
  { code: "CAD", symbol: "C$", label: "Dólar Canadiense" },
];

export const MONTHS = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

export const MEMBER_COLORS = ['#6A8EAE', '#E07A5F', '#81B29A', '#8338EC', '#F2CC8F', '#4ECDC4'];

export const uid = () => Date.now().toString(36) + Math.random().toString(36).substr(2, 6);

export const mkey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}`;
};

export const fmt = (amount, currency = 'USD') => {
  const c = CURRENCIES.find(x => x.code === currency) || CURRENCIES[0];
  const abs = Math.abs(amount);
  return `${amount < 0 ? '-' : ''}${c.symbol}${abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const fmtDate = (d) => {
  const x = new Date(d + 'T12:00:00');
  return `${x.getDate()} ${MONTHS[x.getMonth()]}`;
};

export const fmtDateFull = (d) => {
  const x = new Date(d + 'T12:00:00');
  return `${x.getDate()} ${MONTHS[x.getMonth()]} ${x.getFullYear()}`;
};

export const defaultSettings = {
  currency: 'USD',
  members: [
    { id: 'p1', name: 'Persona 1', color: '#6A8EAE' },
    { id: 'p2', name: 'Persona 2', color: '#E07A5F' },
  ],
  monthlyBudget: 0,
  setupDone: false,
};

export const initialState = {
  settings: defaultSettings,
  expenses: [],
  fixedExpenses: [],
  incomes: [],
};
