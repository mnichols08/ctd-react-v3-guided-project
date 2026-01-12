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
  const headers = {
    Authorization: token,
    'Content-Type': 'application/json',
  };

  const createPayload = (id, fields) => ({
    records: [
      {
        ...(id && { id }),
        fields,
      },
    ],
  });

  const createRequest = async (method, payload = null) => {
    const options = {
      method,
      headers: method === 'GET' ? { Authorization: token } : headers,
      ...(payload && { body: JSON.stringify(payload) }),
    };

    const resp = await fetch(url, options);
    if (!resp.ok) throw new Error(`Request failed with status ${resp.status}`);
    return resp.json();
  };

  const addTodo = async newTodoTitle => {
    const payload = createPayload(null, { title: newTodoTitle });
    try {
      setIsSaving(true);
      const { records } = await createRequest('POST', payload);

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
  const completeTodo = async completedId => {
    const originalTodo = todoList.find(todo => todo.id === completedId);
    const payload = createPayload(completedId, {
      title: originalTodo.title,
      isCompleted: !originalTodo.isCompleted,
    });
    try {
      setIsSaving(true);
      createRequest('PATCH', payload);
    } catch (err) {
      console.error(err.message);
      setErrorMessage(`${err.message}. Reverting todo. `);
      const revertedTodos = [...todoList, originalTodo];
      setTodoList([...revertedTodos]);
    } finally {
      setIsSaving(false);
    }
    const updatedTodoList = todoList.map(todo => {
      if (todo.id === completedId) return { ...todo, isCompleted: true };
      return todo;
    });
    setTodoList(updatedTodoList);
  };
  const updateTodo = async editedTodo => {
    const originalTodo = todoList.find(todo => todo.id === editedTodo.id);
    const payload = createPayload(editedTodo.id, {
      title: editedTodo.title,
      isCompleted: editedTodo.isCompleted,
    });
    try {
      setIsSaving(true);
      const { records } = await createRequest('PATCH', payload);
      const updatedTodo = {
        id: records[0].id,
        ...records[0].fields,
      };
      const updatedTodoList = todoList.map(todo => {
        if (todo.id === records[0].id) return updatedTodo;
        return todo;
      });
      setTodoList([...updatedTodoList]);
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
      try {
        const { records } = await createRequest('GET');
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
