import styled from 'styled-components';

import useTodos from './hooks/useTodos';

import TodoList from './features/TodoList/TodoList.component';
import TodoForm from './features/TodoForm/TodoForm.component';
import TodosViewForm from './features/TodosViewForm/TodosViewForm.component';
import Header from './features/Header/Header.component';
import ErrorMessage from './features/ErrorMessage/ErrorMessage.component';

const StyledAppWrapper = styled.div`
  display: grid;
  justify-content: center;
`;

// App is the primary logic layer for all todos
// - It handles fetching and caching todos from Airtable
// - It manages an optimistic UI for mutations
// - It coordinates sorting, searching, and filtering state
// - It centralizes loading/saving and error handling

function App() {
  const {
    todoList,
    isLoading,
    isSaving,
    errorMessage,
    setErrorMessage,
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
    workingTodoTitle
  } = useTodos();
  return (
    <StyledAppWrapper>
      <Header displayedText="Todos" />
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
        <ErrorMessage
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
    </StyledAppWrapper>
  );
}

export default App;
