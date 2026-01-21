import './TodoList.styles.css';
import TodoListItem from '../../features/TodoListItem/TodoListItem.component';

function TodoList({
  todoList,
  onCompleteTodo,
  onUpdateTodo,
  isLoading
}) {
  const filteredTodoList = todoList.filter(todo => !todo.isCompleted);
  return (
    <ul className="todo-list">
      {filteredTodoList.length < 1 ? (
        !isLoading ? (
          <p>Add todo above to get started</p>
        ) : (
          <p>Todo list loading...</p>
        )
      ) : (
        filteredTodoList.map(todo => (
          <TodoListItem
            key={todo.id}
            todo={todo}
            onCompleteTodo={onCompleteTodo}
            onUpdateTodo={onUpdateTodo}
          />
        ))
      )}
    </ul>
  );
}

export default TodoList;