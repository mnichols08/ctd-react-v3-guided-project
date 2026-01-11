import { useState } from 'react';

import TodoList from './features/TodoList/TodoList.component';
import TodoForm from './features/TodoForm/TodoForm.component';

function App() {
  const [todoList, setTodoList] = useState([]);
  const addTodo = title => {
    const newTodo = {
      title,
      id:
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      isCompleted: false,
    };
    setTodoList([...todoList, newTodo]);
  };
  const completeTodo = completedId => {
    const updatedTodoList = todoList.map(todo => {
      if (todo.id === completedId) {
        return { ...todo, isCompleted: true };
      }
      return todo;
    });
    setTodoList(updatedTodoList);
  };
  return (
    <div>
      <h1 className="todos-title">My Todos</h1>
      <TodoForm onAddTodo={addTodo} />
      <TodoList onCompleteTodo={completeTodo} todoList={todoList} />
    </div>
  );
}

export default App;
