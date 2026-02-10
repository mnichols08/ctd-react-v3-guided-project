import { useState, useRef, useEffect } from 'react';

import { useTodosContext } from '../../context/TodosContext';

import TextInputWithLabel from '../../shared/TextInputWithLabel';
import styles from './TodoListItem.module.css';

// TodoListItem component that displays a single todo with inline editing capability
// - todo = The todo object containing id, title, isCompleted, and isStillSaving
// - onCompleteTodo = Callback that handles marking a todo as complete/incomplete
// - onUpdateTodo = Callback that handles updating the todo's title
function TodoListItem({ todo }) {
  const { completeTodo, updateTodo } = useTodosContext();
  // Track whether the item is in edit mode
  const [isEditing, setIsEditing] = useState(false);
  // Local state for the title being edited
  const [workingTitle, setWorkingTitle] = useState(todo.title);
  // Ref to focus the input when entering edit mode
  const inputRef = useRef(null);
  // Tracks whether the todo was completed when edit mode was entered
  const wasCompletedRef = useRef(todo.isCompleted);

  // Cancel editing and revert to original title
  const handleCancel = () => {
    setWorkingTitle(todo.title);
    setIsEditing(false);

    // If the todo started as completed, revert it to completed on cancel
    if (wasCompletedRef.current && !todo.isCompleted) {
      completeTodo(todo.id);
    }
  };

  // Update the working title as user types
  const handleEdit = event => setWorkingTitle(event.target.value);

  // Toggle edit mode (disabled if todo is still saving)
  const startEditing = () => {
    if (todo.isStillSaving) return;

    wasCompletedRef.current = todo.isCompleted;

    // If the todo was completed, immediately mark it incomplete while editing
    if (todo.isCompleted) {
      completeTodo(todo.id);
    }

    setIsEditing(true);
  };

  // Submit the updated title
  const handleUpdate = event => {
    event.preventDefault();
    if (!isEditing) return;
    updateTodo({
      ...todo,
      title: workingTitle,
    });
    setIsEditing(false);
  };

  // Sync local working title with the todo prop when it changes (e.g., after save)
  useEffect(() => {
    setWorkingTitle(todo.title);
  }, [todo]);

  // Auto-focus the input field when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  // Sync workingTitle with todo.title when idle
  useEffect(() => {
  if (!isEditing) {
    setWorkingTitle(todo.title);
  }
}, [todo.title, isEditing]);

  return (
    <li>
      <form onSubmit={handleUpdate}>
        {isEditing ? (
          // Edit mode: show input field with Cancel and Update functionality
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
          // Display mode: show checkbox and title (click title to edit)
          <div className={styles.labelContainer}>
            <input
              type="checkbox"
              checked={todo.isCompleted}
              onChange={() => completeTodo(todo.id)}
              disabled={todo.isStillSaving}
              className={styles.checkbox}
              id={`todo-${todo.id}-checkbox`}
            />
            <label
              htmlFor={`todo-${todo.id}-checkbox`}
              className={styles.checkboxButton}
            />
            <span
              role="button"
              tabIndex={0}
              onClick={startEditing}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  if (e.key === ' ') {
                    e.preventDefault();
                  }
                  startEditing();
                }
              }}
            >
              {todo.title}
            </span>
          </div>
        )}
      </form>
    </li>
  );
}

export default TodoListItem;
