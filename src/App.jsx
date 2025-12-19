import { useState } from 'react';

import TodoList from './components/TodoList/TodoList.component';
import TodoForm from './components/TodoForm/TodoForm.component';

function App() {
  const [todoList, setTodoList] = useState([]);
  const addTodo = title => {
    const newTodo = {
      title,
      id: Date.now(),
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
