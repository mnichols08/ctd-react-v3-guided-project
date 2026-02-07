import styled from 'styled-components';

import { useTodosContext } from './context/TodosContext';

import TodoList from './features/TodoList/TodoList.component';
import TodoForm from './features/TodoForm/TodoForm.component';
import TodosViewForm from './features/TodosViewForm/TodosViewForm.component';
import Header from './features/Header/Header.component';
import ErrorMessage from './features/ErrorMessage/ErrorMessage.component';

const StyledAppWrapper = styled.div`
  display: grid;
  justify-content: center;
`;

// App orchestrates global todo state and UI composition.
// Responsibilities:
// - Read/write todos via TodosContext (optimistic updates)
// - Pass down sorting/searching/filtering state
// - Surface loading/saving/error status to children
function App() {
  // Destructure context values for clarity and to document usage
  const {
    todosState: { todoList, errorMessage, isLoading, isSaving },
    addTodo,
    updateTodo,
    completeTodo,
    queryString,
    setQueryString,
    sortField,
    setSortField,
    sortDirection,
    setSortDirection,
    setWorkingTodoTitle,
    workingTodoTitle,
    clearError,
  } = useTodosContext();
  return (
    <StyledAppWrapper>
      <Header displayedText="Todos" />
      <main>
        <TodoForm
          onAddTodo={addTodo}
          isSaving={isSaving}
          workingTodoTitle={workingTodoTitle}
          setWorkingTodoTitle={setWorkingTodoTitle}
          clearQueryString={() => setQueryString('')}
        />
        <TodoList
          onCompleteTodo={completeTodo}
          todoList={todoList}
          onUpdateTodo={updateTodo}
          isLoading={isLoading}
          workingTodoTitle={workingTodoTitle}
          sortField={sortField}
          sortDirection={sortDirection}
        />

        <TodosViewForm
          sortField={sortField}
          setSortField={setSortField}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          queryString={queryString}
          setQueryString={setQueryString}
        />

        {errorMessage && (
          <ErrorMessage errorMessage={errorMessage} clearError={clearError} />
        )}
      </main>
    </StyledAppWrapper>
  );
}

export default App;
