import TodoList from '../../features/TodoList/TodoList.component';
import TodoForm from '../../features/TodoForm/TodoForm.component';
import TodosViewForm from '../../features/TodosViewForm/TodosViewForm.component';

// App composes the main features of the todos experience.
// It owns no business logic and delegates state management
// to TodosContext and feature-level components.
function TodosPage() {
  return (
    <>
      {/* Create new todos */}
      <TodoForm />
      {/* Render current list based on view state */}
      <TodoList />
      {/* Controls for sorting and filtering */}
      <TodosViewForm />
    </>
  );
}

export default TodosPage;
