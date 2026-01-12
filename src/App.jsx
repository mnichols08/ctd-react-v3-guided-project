import { useState, useEffect } from 'react';

import TodoList from './features/TodoList/TodoList.component';
import TodoForm from './features/TodoForm/TodoForm.component';

function App() {
  const [todoList, setTodoList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const url = `https://api.airtable.com/v0/${import.meta.env.VITE_BASE_ID}/${import.meta.env.VITE_TABLE_NAME}`;
  const token = `Bearer ${import.meta.env.VITE_PAT}`;

  const addTodo = async newTodoTitle => {
    const payload = {
      records: [
        {
          fields: {
            title: newTodo.title,
            isCompleted: newTodo.isCompleted,
          },
        },
      ],
    };
    const options = {
      method: 'POST',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
    try {
      setIsSaving(true);
      const resp = await fetch(url, options);
      if (!resp.ok) throw new Error();
      const { records } = await resp.json();

      const savedTodo = {
        id: records[0].id,
        title: newTodoTitle,
        ...records[0].fields,
      };
      if (!records[0].fields.isCompleted) savedTodo.isCompleted = false;
      setTodoList([...todoList, savedTodo]);
    } catch (err) {
      console.error(err.message);
      setErrorMessage(err.message);
    } finally {
      setIsSaving(false);
    }
  };
  const completeTodo = completedId => {
    const updatedTodoList = todoList.map(todo => {
      if (todo.id === completedId) return { ...todo, isCompleted: true };
      return todo;
    });
    setTodoList(updatedTodoList);
  };
  const updateTodo = editedTodo => {
    const updatedTodoList = todoList.map(todo => {
      if (todo.id === editedTodo.id) return editedTodo;
      return todo;
    });
    setTodoList(updatedTodoList);
  };

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      const options = {
        method: 'GET',
        headers: { Authorization: token },
      };
      try {
        const resp = await fetch(url, options);
        if (!resp.ok) throw new Error(resp.message);

        const { records } = await resp.json();
        const todos = records.map(record => {
          const todo = {
            id: record.id,
            ...record.fields,
          };
          if (!todo.isCompleted) {
            todo.isCompleted = false;
          }
          console.log(todo);
          return todo;
        });
        setTodoList([...todos]);
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTodos();
  }, []);
  return (
    <div>
      <h1 className="todos-title">My Todos</h1>
      <TodoForm onAddTodo={addTodo} isSaving={isSaving} />
      <TodoList
        onCompleteTodo={completeTodo}
        todoList={todoList}
        onUpdateTodo={updateTodo}
        isLoading={isLoading}
      />
      {errorMessage ? (
        <div>
          <hr />
          <p>{errorMessage}</p>
          <input
            type="button"
            onClick={() => setErrorMessage(undefined)}
            value="Dismiss"
          ></input>
        </div>
      ) : (
        ``
      )}
    </div>
  );
}

export default App;
