import { useState } from 'react';

import TodoList from './components/TodoList/TodoList.component';
import TodoForm from './components/TodoForm/TodoForm.component';

function App() {
  const [newTodo, setNewTodo] = useState('newTodo');

  return (
    <div>
      <h1 className="todos-title">My Todos</h1>
      <TodoForm />
      <p>{ newTodo }</p>
      <TodoList />
    </div>
  );
}

export default App;
