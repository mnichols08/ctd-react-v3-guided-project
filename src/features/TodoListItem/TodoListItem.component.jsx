import { useState, useRef, useEffect } from 'react';

import TextInputWithLabel from '../../shared/TextInputWithLabel';
import styles from './TodoListItem.module.css';

function TodoListItem({ todo, onCompleteTodo, onUpdateTodo }) {
  const [isEditing, setIsEditing] = useState(false);
  const [workingTitle, setWorkingTitle] = useState(todo.title);
  const inputRef = useRef(null);
  const handleCancel = () => {
    setWorkingTitle(todo.title);
    setIsEditing(false);
  };
  const handleEdit = event => setWorkingTitle(event.target.value);

  const toggleIsEditing = () => !todo.isStillSaving && setIsEditing(!isEditing);

  const handleUpdate = event => {
    event.preventDefault();
    if (!isEditing) return;
    onUpdateTodo({
      ...todo,
      title: workingTitle,
    });
    setIsEditing(false);
  };

  useEffect(() => {
    setWorkingTitle(todo.title);
  }, [todo]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);
  return (
    <form onSubmit={handleUpdate}>
      {isEditing ? (
        <>
          <TextInputWithLabel
            elementId={`todo-${todo.id}-title`}
            labelText="Todo title"
            value={workingTitle}
            onChange={handleEdit}
            ref={inputRef}
          />
          <input onClick={handleCancel} type="button" value="Cancel" />
          <input type="submit" value="Update" />
        </>
      ) : (
        <li>
          <div className={styles.labelContainer}>
            <input
              type="checkbox"
              checked={todo.isCompleted}
              onChange={() => onCompleteTodo(todo.id)}
              disabled={todo.isStillSaving}
              className={styles.checkbox}
              id={`todo-${todo.id}-checkbox`}
            />
            <label
              htmlFor={`todo-${todo.id}-checkbox`}
              className={styles.checkboxButton}
            >
              <span className={styles.checkboxIcon}>&nbsp;</span>
            </label>
            <span onClick={toggleIsEditing}>{todo.title}</span>
          </div>
        </li>
      )}
    </form>
  );
}

export default TodoListItem;
