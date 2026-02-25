import { useTodosContext } from '../../context/TodosContext';
import TodoList from '../../features/TodoList/TodoList.component';
import TodoForm from '../../features/TodoForm/TodoForm.component';
import TodosViewForm from '../../features/TodosViewForm/TodosViewForm.component';

// This page is responsible for rendering the  todo list and related controls.
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
       *   if todos are finished loading and there are any todos,    *
       *   or if there is not a queryString and there are todos         *
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
