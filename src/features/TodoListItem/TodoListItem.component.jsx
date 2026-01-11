import { useState } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel';
import './TodoListItem.styles.css';

function TodoListItem({ todo, onCompleteTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  return isEditing ? (
    <TextInputWithLabel value={todo.title} />
  ) : (
    <li>
      <label>
        <input
          type="checkbox"
          checked={todo.isCompleted}
          onChange={() => onCompleteTodo(todo.id)}
        />
        <span onClick={() => setIsEditing(true)}>{todo.title}</span>
      </label>
    </li>
  );
}

export default TodoListItem;
