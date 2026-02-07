import { createContext, useContext } from 'react';
import useTodos from '../hooks/useTodos';

// Single source of truth for todos state and actions
const TodosContext = createContext(null);

export const TodosProvider = ({ children }) => {
  // Custom hook encapsulates fetching, mutations, and local state for todos
  const todos = useTodos();
  // Expose todos state/actions to the component tree
  return <TodosContext.Provider value={todos}>{children}</TodosContext.Provider>;
};

// Custom hook to read the TodosContext; throws if used outside provider
/* eslint-disable react-refresh/only-export-components */
export const useTodosContext = () => {
  const ctx = useContext(TodosContext);
  // Fail fast to catch missing provider usage during development
  if (!ctx) throw new Error('useTodosContext must be used within TodosProvider');
  return ctx;
};
