import styled from 'styled-components';

import { useTodosContext } from './context/TodosContext';

import TodoList from './features/TodoList/TodoList.component';
import TodoForm from './features/TodoForm/TodoForm.component';
import TodosViewForm from './features/TodosViewForm/TodosViewForm.component';
import Header from './features/Header/Header.component';
import ErrorMessage from './features/ErrorMessage/ErrorMessage.component';

// Layout wrapper responsible only for centering the app.
// Visual styling is intentionally minimal.
const StyledAppWrapper = styled.div`
  display: grid;
  justify-content: center;
`;

// App composes the main features of the todos experience.
// It owns no business logic and delegates state management
// to TodosContext and feature-level components.
function App() {
  // Read only the global error state needed at this level.
  // Other state is consumed closer to where it’s used.
  const {
    todosState: { errorMessage },
  } = useTodosContext();

  return (
    <StyledAppWrapper>
      {/* Static application header */}
      <Header displayedText="Todo App" />

      <main>
        {/* Create new todos */}
        <TodoForm />

        {/* Render current list based on view state */}
        <TodoList />

        {/* Controls for sorting and filtering */}
        <TodosViewForm />

        {/* Global error surfaced consistently across the app */}
        {errorMessage && <ErrorMessage />}
      </main>
    </StyledAppWrapper>
  );
}

export default App;
