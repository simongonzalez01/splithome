export function reducer(state, action) {
  switch (action.type) {
    case 'LOAD':
      return action.payload;
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] };
    case 'EDIT_EXPENSE':
      return { ...state, expenses: state.expenses.map(e => e.id === action.payload.id ? action.payload : e) };
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case 'ADD_FIXED':
      return { ...state, fixedExpenses: [...state.fixedExpenses, action.payload] };
    case 'DELETE_FIXED':
      return { ...state, fixedExpenses: state.fixedExpenses.filter(e => e.id !== action.payload) };
    case 'ADD_INCOME':
      return { ...state, incomes: [...state.incomes, action.payload] };
    case 'DELETE_INCOME':
      return { ...state, incomes: state.incomes.filter(e => e.id !== action.payload) };
    case 'RESET':
      return action.payload; // pass initialState
    default:
      return state;
  }
}
