import './ToDoList.styles.css';
import TodoListItem from '../TodoListItem/TodoListItem.component';

function TodoList({ todoList }) {
  return (
    <ul className="todo-list">
      {todoList.map(todo => (
        <TodoListItem key={todo.id} todo={todo} />
      ))}
    </ul>
  );
}

export default TodoList;
