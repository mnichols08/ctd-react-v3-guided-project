import { useState } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel';
import './TodoListItem.styles.css';

function TodoListItem({ todo, onCompleteTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(todo.title);
  const handleCancel = () => {
    setWorkingTitle(todo.title);
    setIsEditing(false);
  };
  return isEditing ? (
    <>
      <TextInputWithLabel value={todo.title} />
      <input onClick={() => handleCancel()} type="button" value="Reset" />
    </>
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
