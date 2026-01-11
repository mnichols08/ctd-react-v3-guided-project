import { useState } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel';
import './TodoListItem.styles.css';

function TodoListItem({ todo, onCompleteTodo, onUpdateTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(todo.title);
  const handleCancel = () => {
    setWorkingTitle(todo.title);
    setIsEditing(false);
  };
  const handleEdit = event => setWorkingTitle(event.target.value);
  const handleUpdate = event => {
    event.preventDefault();
    if (!isEditing) return;
    onUpdateTodo({
      ...todo,
      title: workingTitle,
      id: todo.id
    });
    setIsEditing(false);
  };

  return (
    <form onSubmit={handleUpdate}>
      {isEditing ? (
        <>
          <TextInputWithLabel
            value={workingTitle}
            onChange={e => handleEdit(e)}
          />
          <input onClick={e => handleCancel(e)} type="button" value="Cancel" />
          <input onClick={e => handleUpdate(e)} type="button" value="Update" />
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
      )}
    </form>
  );
}

export default TodoListItem;
