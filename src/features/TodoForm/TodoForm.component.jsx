import { useRef, useState } from 'react';
import TextInputWithLabel from '../../shared/TextInputWithLabel';
import './TodoForm.styles.css';

function TodoForm({ onAddTodo }) {
  const todoTitleInput = useRef(null);
  const [workingTodoTitle, setWorkingTodoTitle] = useState('');
  const handleAddTodo = event => {
    event.preventDefault();
    onAddTodo(workingTodoTitle);
    setWorkingTodoTitle('');
    todoTitleInput.current.focus();
  };
  return (
    <form className="todo-form" onSubmit={handleAddTodo}>
      <TextInputWithLabel ref={todoTitleInput}
        value={workingTodoTitle}
        onChange={e => setWorkingTodoTitle(e.target.value)} elementId={'id'} labelText="Todo" />
      <button disabled={workingTodoTitle.length < 1 ? true : false}>
        Add Todo
      </button>
    </form>
  );
}

export default TodoForm;
