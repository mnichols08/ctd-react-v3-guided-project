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
            title: newTodoTitle,
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
  const updateTodo = async editedTodo => {
    const originalTodo = todoList.find(todo => todo.id === editedTodo.id);
    const payload = {
      records: [
        {
          id: editedTodo.id,
          fields: {
            title: editedTodo.title,
            isCompleted: editedTodo.isCompleted,
          },
        },
      ],
    };
    const options = {
      method: 'PATCH',
      headers: { Authorization: token, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    };
    try {
      setIsSaving(true);
      const resp = await fetch(url, options);
      const { records } = await resp.json();
      if (!resp.ok) throw new Error();
      console.log(records)
      const updatedTodo = {
        id: records[0].id,
        ...records[0].fields,
      };
      setTodoList([...todoList, updatedTodo]);
    } catch (err) {
      console.error(err);
      setErrorMessage(`${err.message}. Reverting todo...`);
      const revertedTodos = [...todoList, originalTodo];
      setTodoList([...revertedTodos]);
    } finally {
      setIsSaving(false);
    }

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
