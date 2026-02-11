import { useTodosContext } from '../../context/TodosContext';
import TodoList from '../../features/TodoList/TodoList.component';
import TodoForm from '../../features/TodoForm/TodoForm.component';
import TodosViewForm from '../../features/TodosViewForm/TodosViewForm.component';

// App composes the main features of the todos experience.
// It owns no business logic and delegates state management
// to TodosContext and feature-level components.
function TodosPage() {
  const {
    todosState: { todoList, isLoading },
    queryString,
  } = useTodosContext();
  return (
    <>
      {/* Create new todos */}
      <TodoForm />
      {/* Render current list based on view state */}
      <TodoList />
      {/*   Conditionally render controls for sorting and filtering  *
       *   If there is a queryString, regardless of results, or      *
       *   If todos are not loading and there are any todos, or      *
       *   If there is not a queryString and there are todos         *
       *   (i.e. show controls when there are todos,                 *
       *    even if they don't match the current search)             *
       */}
      {(queryString ||
        (!isLoading && todoList.length > 0) ||
        (!queryString && todoList.length > 0)) && <TodosViewForm />}
    </>
  );
}

export default TodosPage;
