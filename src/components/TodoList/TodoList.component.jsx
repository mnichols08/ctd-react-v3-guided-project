import './TodoList.styles.css';
import TodoListItem from '../TodoListItem/TodoListItem.component';

function TodoList({ todoList, onCompleteTodo }) {
  return (
    <ul className="todo-list">
      {todoList.length < 1 ? (
        <p>Add todo above to get started</p>
      ) : (
        todoList.map(todo => <TodoListItem onCompleteTodo={onCompleteTodo} key={todo.id} todo={todo} />)
      )}
    </ul>
  );
}

export default TodoList;
