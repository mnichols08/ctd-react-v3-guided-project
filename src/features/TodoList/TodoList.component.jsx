import './TodoList.styles.css';
import TodoListItem from '../../features/TodoListItem/TodoListItem.component';

function TodoList({ todoList, onCompleteTodo }) {
  const filteredTodoList = todoList.filter(todo => !todo.isCompleted);
  return (
    <ul className="todo-list">
      {filteredTodoList.length < 1 ? (
        <p>Add todo above to get started</p>
      ) : (
        filteredTodoList.map(todo => (
          <TodoListItem
            key={todo.id}
            todo={todo}
            onCompleteTodo={onCompleteTodo}
          />
        ))
      )}
    </ul>
  );
}

export default TodoList;
