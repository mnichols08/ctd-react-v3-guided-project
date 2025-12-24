import { useRef, useState } from 'react';
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
      <label htmlFor="todoTitle">Todo</label>
      <input
        name="title"
        id="todoTitle"
        placeholder="Enter Todo Title"
        type="text"
        ref={todoTitleInput}
        value={workingTodoTitle}
        onChange={e => setWorkingTodoTitle(e.target.value)}
      />
      <button disabled={workingTodoTitle.length < 1 ? true : false}>
        Add Todo
      </button>
    </form>
  );
}

export default TodoForm;
