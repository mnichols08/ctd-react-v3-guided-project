import { useRef } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel';
import './TodoForm.styles.css';

function TodoForm({ onAddTodo, isSaving, workingTodoTitle, setWorkingTodoTitle, clearQueryString }) {
  const todoTitleInput = useRef(null);
  const handleAddTodo = event => {
    event.preventDefault();
    onAddTodo(workingTodoTitle);
    setWorkingTodoTitle('');
    todoTitleInput.current.focus();
  };
  const handleChangeQueryString = val => {
    clearQueryString();
    setWorkingTodoTitle(val)
  }
  return (
    <form className="todo-form" onSubmit={handleAddTodo}>
      <TextInputWithLabel
        ref={todoTitleInput}
        value={workingTodoTitle}
        onChange={e => handleChangeQueryString(e.target.value)}
        elementId='id'
        labelText="Todo"
      />
      <button disabled={workingTodoTitle.length < 1 || isSaving ? true : false}>
        {isSaving ? `Saving...` : `Add Todo`}
      </button>
    </form>
  );
}

export default TodoForm;
