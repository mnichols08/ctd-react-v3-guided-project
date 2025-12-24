import './TodoListItem.styles.css';

function TodoListItem({ todo, onCompleteTodo }) {
  
  return (
    <li>
      <form>
        <label>
          <input
            type="checkbox"
            checked={todo.isCompleted}
            onChange={() => onCompleteTodo(todo.id)}
          />
          {todo.title}
        </label>
      </form>
    </li>
  );
}

export default TodoListItem;
