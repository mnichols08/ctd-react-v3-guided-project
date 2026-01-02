import { useState } from 'react';

import TodoList from './components/TodoList/TodoList.component';
import TodoForm from './components/TodoForm/TodoForm.component';

function App() {
  const [todoList, setTodoList] = useState([]);
  const addTodo = title => {
    const newTodo = {
      title,
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`
    };
    setTodoList([...todoList, newTodo]);
  };
  return (
    <div>
      <h1 className="todos-title">My Todos</h1>
      <TodoForm onAddTodo={addTodo} />
      <TodoList todoList={todoList} />
    </div>
  );
}

export default App;
