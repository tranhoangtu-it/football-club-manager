import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  members: [],
  payments: [],
  teams: [],
  matches: [],
  loading: false,
  error: null,
  currentMonth: new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }).replace('/', '-')
};

// Action types
export const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_MEMBERS: 'SET_MEMBERS',
  SET_PAYMENTS: 'SET_PAYMENTS',
  SET_TEAMS: 'SET_TEAMS',
  SET_MATCHES: 'SET_MATCHES',
  ADD_MEMBER: 'ADD_MEMBER',
  UPDATE_MEMBER: 'UPDATE_MEMBER',
  DELETE_MEMBER: 'DELETE_MEMBER',
  UPDATE_PAYMENT_STATUS: 'UPDATE_PAYMENT_STATUS',
  ADD_PAYMENT: 'ADD_PAYMENT',
  UPDATE_MATCH_SCORE: 'UPDATE_MATCH_SCORE',
  ADD_MATCH: 'ADD_MATCH'
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_MEMBERS:
      return { ...state, members: action.payload, loading: false };
    
    case ACTIONS.SET_PAYMENTS:
      return { ...state, payments: action.payload, loading: false };
    
    case ACTIONS.SET_TEAMS:
      return { ...state, teams: action.payload, loading: false };
    
    case ACTIONS.SET_MATCHES:
      return { ...state, matches: action.payload, loading: false };
    
    case ACTIONS.ADD_MEMBER:
      return { ...state, members: [...state.members, action.payload] };
    
    case ACTIONS.UPDATE_MEMBER:
      return {
        ...state,
        members: state.members.map(member =>
          member.memberId === action.payload.memberId ? action.payload : member
        )
      };
    
    case ACTIONS.DELETE_MEMBER:
      return {
        ...state,
        members: state.members.filter(member => member.memberId !== action.payload)
      };
    
    case ACTIONS.UPDATE_PAYMENT_STATUS:
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.paymentId === action.payload.paymentId
            ? { ...payment, status: action.payload.status }
            : payment
        )
      };
    
    case ACTIONS.ADD_PAYMENT:
      return { ...state, payments: [...state.payments, action.payload] };
    
    case ACTIONS.UPDATE_MATCH_SCORE:
      return {
        ...state,
        matches: state.matches.map(match =>
          match.matchId === action.payload.matchId
            ? { ...match, homeScore: action.payload.homeScore, awayScore: action.payload.awayScore }
            : match
        )
      };
    
    case ACTIONS.ADD_MATCH:
      return { ...state, matches: [...state.matches, action.payload] };
    
    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = {
    state,
    dispatch
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

